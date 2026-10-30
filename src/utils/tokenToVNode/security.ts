import {
  BAD_TOKEN_PROTOCOL_RE,
  BLOCKED_ATTRS,
  FONT_FAMILY_RE,
  FONT_SIZE_RANGE,
  FONT_SIZE_RE,
  MAX_FONT_FAMILY_LENGTH,
  MAX_INLINE_STYLE_LENGTH,
  MAX_WIDTH_VALUE_RE,
  PROTOCOL_RE,
  SAFE_DATA_IMAGE_RE,
  SAFE_PROTOCOLS,
  SAFE_STYLE_KEYWORDS,
  SAFE_STYLE_PROPS,
  STYLE_ALIGN_RE,
  UNSAFE_STYLE_VALUE_RE,
  UNSAFE_URL_CHARS_RE,
  URL_ATTRS,
  VUE_RESERVED_PROPS,
  WHITESPACE_RE,
} from './constants'
import type { MarkdownTokenLike, TokenToVNodeOptions } from './types'

/** Vue 保留属性；token 和原始 HTML 都不能通过它们控制 VNode。 */
export function isReservedProp(name: string): boolean {
  return VUE_RESERVED_PROPS.has(name)
}

/** 事件属性及可能引入 HTML/脚本执行的属性。 */
export function isBlockedAttr(name: string): boolean {
  return name.startsWith('on') || BLOCKED_ATTRS.has(name)
}

/**
 * 复用一个游离元素的 CSSOM 做解析，避免每个 style 属性都创建 DOM 节点。
 * 每次使用前都会整段覆盖 cssText，不会残留上一次的声明。
 */
let styleProbe: CSSStyleDeclaration | null = null

function getStyleProbe(): CSSStyleDeclaration | null {
  if (typeof document === 'undefined') return null
  styleProbe ??= document.createElement('div').style
  return styleProbe
}

/**
 * 用 CSSOM 解析内联样式，再按属性白名单 + 值白名单逐条保留。
 * 不按正则切分声明：CSS 转义（\75 rl(）、大小写、注释在正则里都能绕过，
 * 而 CSSOM 会先把转义规范化再给出属性名和值。
 * tag 用于限制 max-width 只作用于图片。
 */
export function sanitizeInlineStyle(value: string, tag?: string): string {
  if (value.length > MAX_INLINE_STYLE_LENGTH) return ''
  if (UNSAFE_STYLE_VALUE_RE.test(value)) return ''

  const style = getStyleProbe()
  if (!style) return ''

  style.cssText = value

  const declarations: string[] = []
  for (let i = 0; i < style.length; i++) {
    const prop = style.item(i)
    if (!SAFE_STYLE_PROPS.has(prop)) continue

    // max-width 只用于限制图片尺寸，其他元素上会被用来挤压布局。
    if (prop === 'max-width' && tag !== 'img') continue

    const propValue = style.getPropertyValue(prop).trim()
    if (!propValue || !isSafeStyleValue(prop, propValue)) continue

    // 不输出 !important，避免正文样式覆盖页面自身规则。
    declarations.push(`${prop}: ${propValue}`)
  }

  return declarations.join('; ')
}

/** 判断 CSSOM 规范化后的值是否在白名单内。 */
export function isSafeStyleValue(prop: string, value: string): boolean {
  // 兜底再查一次，防止将来把接受 url() 的属性加进白名单。
  if (UNSAFE_STYLE_VALUE_RE.test(value)) return false

  if (prop === 'max-width') return MAX_WIDTH_VALUE_RE.test(value)
  if (prop === 'font-size') return isSafeFontSize(value)
  if (prop === 'font-family') return isSafeFontFamily(value)

  const keywords = SAFE_STYLE_KEYWORDS[prop]
  // color / background-color 的语法合法性由 CSSOM 保证，无需额外枚举。
  if (!keywords) return true

  return value.toLowerCase().split(WHITESPACE_RE).every((part) => keywords.has(part))
}

/** 字号按单位限制区间；CSSOM 会把 0 序列化成 0px，这里一并拦掉。 */
function isSafeFontSize(value: string): boolean {
  const match = FONT_SIZE_RE.exec(value)
  if (!match) return false

  const range = FONT_SIZE_RANGE[(match[2] ?? '').toLowerCase()]
  if (!range) return false

  const size = Number(match[1])
  return size >= range[0] && size <= range[1]
}

/** 字体名列表的语法已由 CSSOM 保证，这里只限制字符集和长度。 */
function isSafeFontFamily(value: string): boolean {
  return value.length <= MAX_FONT_FAMILY_LENGTH && FONT_FAMILY_RE.test(value)
}

/** 按 allowStyle 选项处理内联样式；未开启时返回 null。 */
export function resolveInlineStyle(
  value: string,
  options: TokenToVNodeOptions,
  tag?: string,
): string | null {
  const allowStyle = options.allowStyle
  if (!allowStyle) return null

  const sanitized = typeof allowStyle === 'function'
    ? allowStyle(value, tag)
    : sanitizeInlineStyle(value, tag)

  return sanitized == null || sanitized.trim() === '' ? null : sanitized
}

export function tokenProps(
  token: MarkdownTokenLike,
  options: TokenToVNodeOptions,
): Record<string, unknown> | null {
  const attrs = token.attrs
  if (!attrs || attrs.length === 0) return null

  let props: Record<string, unknown> | null = null

  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i]
    if (!attr) continue

    const rawName = attr[0]
    if (!rawName) continue

    const name = rawName.toLowerCase()
    if (isReservedProp(name) || isBlockedAttr(name)) continue

    const value = attr[1] ?? ''

    if (name === 'style') {
      const sanitizeStyle = options.sanitizeStyle
      let sanitized: string | null | undefined

      if (sanitizeStyle) {
        sanitized = sanitizeStyle(value, token)
      } else if (options.allowStyle) {
        sanitized = resolveInlineStyle(value, options, token.tag?.toLowerCase())
      } else {
        sanitized = (token.type === 'th_open' || token.type === 'td_open') && STYLE_ALIGN_RE.test(value)
          ? value.trim()
          : null
      }

      if (sanitized == null || sanitized === '') continue
      props ??= {}
      props.style = sanitized
      continue
    }

    if (URL_ATTRS.has(name) && !isSafeTokenUrl(value)) continue

    props ??= {}
    props[rawName] = value
  }

  applyRel(token.tag, props)
  return props
}

/** 外链在新窗口打开时，避免通过 window.opener 操控来源页面。 */
export function applyRel(
  tag: string | undefined,
  props: Record<string, unknown> | null,
): void {
  if (tag === 'a' && props?.target === '_blank') {
    props.rel = mergeRel(props.rel)
  }
}

/** Markdown token 属性沿用 markdown-it 黑名单；相对地址直接放行。 */
export function isSafeTokenUrl(rawUrl: string): boolean {
  const url = normalizeUrl(rawUrl)
  return BAD_TOKEN_PROTOCOL_RE.test(url) ? SAFE_DATA_IMAGE_RE.test(url) : true
}

/** 原始 HTML 的 safe 模式使用严格协议白名单。 */
export function isSafeHtmlUrl(rawUrl: string): boolean {
  const url = normalizeUrl(rawUrl)
  const protocol = PROTOCOL_RE.exec(url)
  return !protocol || SAFE_PROTOCOLS.has((protocol[1] ?? '').toLowerCase())
}

/** 去除控制字符再检查协议，避免通过换行等字符混淆协议判断。 */
export function normalizeUrl(rawUrl: string): string {
  return rawUrl.trim().replace(UNSAFE_URL_CHARS_RE, '')
}

export function mergeRel(value: unknown): string {
  const rel = String(value ?? '').split(WHITESPACE_RE).filter(Boolean)
  return Array.from(new Set([...rel, 'noopener', 'noreferrer'])).join(' ')
}
