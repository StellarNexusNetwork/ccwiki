import DOMPurify from 'dompurify'
import {
  createCommentVNode,
  createTextVNode,
  h,
  isVNode,
  type VNode,
  type VNodeChild,
} from 'vue'
import {
  CLOSING_TAG_RE,
  HTML_NAMESPACE,
  LEGACY_FONT_SIZE_PX,
  LEGACY_PRESENTATION_ATTRS,
  LEGACY_TAG_MAP,
  OPENING_TAG_RE,
  SAFE_DROP_TAGS,
  SAFE_SANITIZE_CONFIG,
  SELF_CLOSING_RE,
  URL_ATTRS,
  VOID_HTML_TAGS,
} from './constants'
import {
  applyRel,
  isBlockedAttr,
  isReservedProp,
  isSafeHtmlUrl,
  resolveInlineStyle,
} from './security'
import { appendMany, closeTo, currentChildren } from './stack'
import type { Frame, HtmlMode, MarkdownTokenLike, RenderContext, TokenToVNodeOptions } from './types'

type HtmlTagMatch =
  | { kind: 'close'; tag: string }
  | { kind: 'open'; tag: string; selfClosing: boolean }

export function matchHtmlTag(content: string): HtmlTagMatch | null {
  const closing = CLOSING_TAG_RE.exec(content)
  if (closing) return { kind: 'close', tag: (closing[1] ?? '').toLowerCase() }

  const opening = OPENING_TAG_RE.exec(content)
  if (!opening) return null

  return {
    kind: 'open',
    tag: (opening[1] ?? '').toLowerCase(),
    selfClosing: SELF_CLOSING_RE.test(content),
  }
}

/**
 * 处理 Markdown 原始 HTML token。markdown-it 可能把 <div>、Markdown
 * 内容和 </div> 拆成多个 token，因此开始标签需要进入同一个栈。
 */
export function renderHtmlToken(token: MarkdownTokenLike, stack: Frame[], target: VNodeChild[], ctx: RenderContext): void {
  // 调用方已经排除了 text 模式；这里的收窄也让后续调用类型安全。
  if (ctx.htmlMode === 'text') return

  const content = token.content ?? ''
  const match = matchHtmlTag(content)

  if (!match) {
    appendMany(currentChildren(stack, target), parseHtmlFragment(content, ctx.htmlMode, ctx.options))
    return
  }

  if (match.kind === 'close') {
    for (let i = stack.length - 1; i >= 0; i--) {
      const frame = stack[i]
      if (frame && frame.rawHtml && rawTag(frame) === match.tag) {
        closeTo(stack, target, ctx, i)
        return
      }
    }
    // 忽略孤立的结束标签；SSR 下 parseHtmlFragment 会回退为文本。
    appendMany(currentChildren(stack, target), parseHtmlFragment(content, ctx.htmlMode, ctx.options))
    return
  }

  const { tag, selfClosing } = match

  if (ctx.htmlMode === 'safe' && SAFE_DROP_TAGS.has(tag)) {
    // html_inline 会把危险标签的内部内容拆成独立 token，需要整段丢弃。
    if (!selfClosing) {
      stack.push({ token, tag, props: null, children: [], flatten: false, rawHtml: true, drop: true })
    }
    return
  }

  if (selfClosing || isVoidHtmlTag(tag)) {
    appendMany(currentChildren(stack, target), parseHtmlFragment(content, ctx.htmlMode, ctx.options))
    return
  }

  const nodes = parseHtmlFragment(content, ctx.htmlMode, ctx.options)
  const element = nodes.length === 1 ? nodes[0] : null

  // safe 模式可能把不允许的开始标签整个移除，此时不建立 frame。
  if (!element || !isVNode(element) || typeof element.type !== 'string') {
    appendMany(currentChildren(stack, target), nodes)
    return
  }

  stack.push({
    token, tag: element.type, sourceTag: tag,
    props: (element.props as Record<string, unknown> | null) ?? null,
    children: [], flatten: false, rawHtml: true, drop: false,
  })
}

/** 用原始标签名匹配结束标签；渲染标签可能被替换（font → span）。 */
function rawTag(frame: Frame): string {
  if (frame.sourceTag) return frame.sourceTag.toLowerCase()
  return typeof frame.tag === 'string' ? frame.tag.toLowerCase() : ''
}

/**
 * 将 HTML fragment 解析为 VNode，不增加包装元素。safe 模式由 DOMPurify
 * 消毒；all 模式保留原始 HTML；SSR 环境安全回退为文本。
 */
function parseHtmlFragment(
  html: string,
  mode: Exclude<HtmlMode, 'text'>,
  options: TokenToVNodeOptions,
): VNode[] {
  if (typeof document === 'undefined' || typeof DOMPurify.sanitize !== 'function') {
    return [createTextVNode(html)]
  }

  let root: Node
  if (mode === 'safe') {
    // 不开启 SANITIZE_NAMED_PROPS，避免改写用户指定的 id。
    root = DOMPurify.sanitize(html, SAFE_SANITIZE_CONFIG) as unknown as DocumentFragment
  } else {
    // 'all' 是显式信任原始 HTML 的危险模式，不执行任何消毒。
    const template = document.createElement('template')
    template.innerHTML = html
    root = template.content
  }

  return convertHtmlNodes(root, mode, options)
}

function convertHtmlNodes(
  parent: Node,
  mode: Exclude<HtmlMode, 'text'>,
  options: TokenToVNodeOptions,
): VNode[] {
  const result: VNode[] = []
  const childNodes = parent.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i]
    if (!node) continue

    const converted = convertHtmlNode(node, mode, options)
    if (converted) result.push(converted)
  }

  return result
}

function convertHtmlNode(
  node: Node,
  mode: Exclude<HtmlMode, 'text'>,
  options: TokenToVNodeOptions,
): VNode | null {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return createTextVNode(node.nodeValue ?? '')
    case Node.ELEMENT_NODE:
      return convertHtmlElement(node as Element, mode, options)
    case Node.COMMENT_NODE:
      // 注释不影响显示；只在完全信任的 all 模式保留。
      return mode === 'all' ? createCommentVNode(node.nodeValue ?? '') : null
    default:
      return null
  }
}

function convertHtmlElement(
  element: Element,
  mode: Exclude<HtmlMode, 'text'>,
  options: TokenToVNodeOptions,
): VNode | null {
  const tag = element.localName || element.tagName.toLowerCase()

  // 深度防御：safe 模式只转换 HTML namespace 中的元素。
  if (mode === 'safe' && element.namespaceURI !== HTML_NAMESPACE) return null

  let props: Record<string, unknown> | null = null
  // 表现属性（font color）作为兜底，style 属性必须排在它后面才能覆盖它，
  // 与 HTML 中 style 优先于表现属性的语义保持一致。
  let styleFromAttr = ''
  let styleFromLegacy = ''
  const attributes = element.attributes

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i]
    if (!attr) continue

    const name = attr.name.toLowerCase()
    if (!name || isReservedProp(name)) continue

    if (mode === 'safe') {
      // DOMPurify 已完成 allow-list 消毒；这里再做一层深度防御。
      if (isBlockedAttr(name)) continue

      if (name === 'style') {
        // DOMPurify 不处理 CSS，样式过滤由这里的属性 + 值白名单完成。
        styleFromAttr = mergeStyle(styleFromAttr, resolveInlineStyle(attr.value, options, tag))
        continue
      }

      // <font color|size|face> 这类表现属性翻译成等价的内联样式。
      const legacy = legacyDeclaration(tag, name, attr.value)
      if (legacy) {
        styleFromLegacy = mergeStyle(styleFromLegacy, resolveInlineStyle(legacy, options, tag))
        continue
      }

      // 其余元素上的表现属性没有意义，直接丢弃。
      if (LEGACY_PRESENTATION_ATTRS.has(name)) continue

      if (URL_ATTRS.has(name) && !isSafeHtmlUrl(attr.value)) continue
    }

    props ??= {}
    props[attr.name] = attr.value
  }

  const style = mergeStyle(styleFromLegacy, styleFromAttr || null)
  if (style) {
    props ??= {}
    props.style = style
  }

  if (mode === 'safe') applyRel(tag, props)

  const children = convertHtmlNodes(element, mode, options)
  const renderTag = (mode === 'safe' && LEGACY_TAG_MAP[tag]) || tag
  return h(renderTag, props, children.length ? children : undefined)
}

function mergeStyle(current: string, next: string | null): string {
  if (!next) return current
  return current ? `${current}; ${next}` : next
}

/**
 * 把 <font> 的表现属性翻译成等价的内联样式声明。
 * 翻译结果仍然要过 CSSOM + 白名单，不会绕过样式校验。
 */
function legacyDeclaration(tag: string, name: string, value: string): string | null {
  if (tag !== 'font') return null

  switch (name) {
    case 'color':
      return `color: ${value}`
    case 'face':
      return `font-family: ${value}`
    case 'size': {
      const px = legacyFontSizePx(value)
      return px === null ? null : `font-size: ${px}px`
    }
    default:
      return null
  }
}

/** size 是 1–7 的刻度，+/- 表示相对默认档位 3 的偏移；越界按浏览器行为夹取。 */
function legacyFontSizePx(value: string): number | null {
  const match = /^([+-])?(\d+)$/.exec(value.trim())
  if (!match) return null

  const sign = match[1]
  const amount = Number(match[2] ?? '0')
  const level = sign ? 3 + (sign === '+' ? amount : -amount) : amount

  return LEGACY_FONT_SIZE_PX[String(clamp(level, 1, 7))] ?? null
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

function isVoidHtmlTag(tag: string): boolean {
  return VOID_HTML_TAGS.has(tag.toLowerCase())
}
