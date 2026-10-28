import {
  BAD_TOKEN_PROTOCOL_RE,
  BLOCKED_ATTRS,
  PROTOCOL_RE,
  SAFE_DATA_IMAGE_RE,
  SAFE_PROTOCOLS,
  STYLE_ALIGN_RE,
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
      const sanitized = sanitizeStyle
        ? sanitizeStyle(value, token)
        : (token.type === 'th_open' || token.type === 'td_open') && STYLE_ALIGN_RE.test(value)
          ? value.trim()
          : null

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
