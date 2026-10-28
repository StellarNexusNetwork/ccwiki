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
} from './security'
import { appendMany, closeTo, currentChildren } from './stack'
import type { Frame, HtmlMode, MarkdownTokenLike, RenderContext } from './types'

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
    appendMany(currentChildren(stack, target), parseHtmlFragment(content, ctx.htmlMode))
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
    appendMany(currentChildren(stack, target), parseHtmlFragment(content, ctx.htmlMode))
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
    appendMany(currentChildren(stack, target), parseHtmlFragment(content, ctx.htmlMode))
    return
  }

  const nodes = parseHtmlFragment(content, ctx.htmlMode)
  const element = nodes.length === 1 ? nodes[0] : null

  // safe 模式可能把不允许的开始标签整个移除，此时不建立 frame。
  if (!element || !isVNode(element) || typeof element.type !== 'string') {
    appendMany(currentChildren(stack, target), nodes)
    return
  }

  stack.push({
    token, tag: element.type, props: (element.props as Record<string, unknown> | null) ?? null,
    children: [], flatten: false, rawHtml: true, drop: false,
  })
}

function rawTag(frame: Frame): string {
  return typeof frame.tag === 'string' ? frame.tag.toLowerCase() : ''
}

/**
 * 将 HTML fragment 解析为 VNode，不增加包装元素。safe 模式由 DOMPurify
 * 消毒；all 模式保留原始 HTML；SSR 环境安全回退为文本。
 */
function parseHtmlFragment(html: string, mode: Exclude<HtmlMode, 'text'>): VNode[] {
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

  return convertHtmlNodes(root, mode)
}

function convertHtmlNodes(parent: Node, mode: Exclude<HtmlMode, 'text'>): VNode[] {
  const result: VNode[] = []
  const childNodes = parent.childNodes

  for (let i = 0; i < childNodes.length; i++) {
    const node = childNodes[i]
    if (!node) continue

    const converted = convertHtmlNode(node, mode)
    if (converted) result.push(converted)
  }

  return result
}

function convertHtmlNode(node: Node, mode: Exclude<HtmlMode, 'text'>): VNode | null {
  switch (node.nodeType) {
    case Node.TEXT_NODE:
      return createTextVNode(node.nodeValue ?? '')
    case Node.ELEMENT_NODE:
      return convertHtmlElement(node as Element, mode)
    case Node.COMMENT_NODE:
      // 注释不影响显示；只在完全信任的 all 模式保留。
      return mode === 'all' ? createCommentVNode(node.nodeValue ?? '') : null
    default:
      return null
  }
}

function convertHtmlElement(element: Element, mode: Exclude<HtmlMode, 'text'>): VNode | null {
  const tag = element.localName || element.tagName.toLowerCase()

  // 深度防御：safe 模式只转换 HTML namespace 中的元素。
  if (mode === 'safe' && element.namespaceURI !== HTML_NAMESPACE) return null

  let props: Record<string, unknown> | null = null
  const attributes = element.attributes

  for (let i = 0; i < attributes.length; i++) {
    const attr = attributes[i]
    if (!attr) continue

    const name = attr.name.toLowerCase()
    if (!name || isReservedProp(name)) continue

    if (mode === 'safe') {
      // DOMPurify 已完成 allow-list 消毒；这里再做一层深度防御。
      if (isBlockedAttr(name)) continue
      if (URL_ATTRS.has(name) && !isSafeHtmlUrl(attr.value)) continue
    }

    props ??= {}
    props[attr.name] = attr.value
  }

  if (mode === 'safe') applyRel(tag, props)

  const children = convertHtmlNodes(element, mode)
  return h(tag, props, children.length ? children : undefined)
}

function isVoidHtmlTag(tag: string): boolean {
  return VOID_HTML_TAGS.has(tag.toLowerCase())
}
