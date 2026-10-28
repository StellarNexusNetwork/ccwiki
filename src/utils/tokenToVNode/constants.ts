/** 可能引入 HTML/脚本执行的属性。 */
export const BLOCKED_ATTRS = new Set([
  'innerhtml', 'outerhtml', 'textcontent', 'srcdoc', 'srcset', 'formaction',
])

/** Vue 保留属性；token 和原始 HTML 都不能通过它们控制 VNode。 */
export const VUE_RESERVED_PROPS = new Set(['key', 'ref', 'ref_for', 'ref_key'])

/** safe 模式允许的常见、非主动内容标签；SVG、MathML 和自定义元素不在其中。 */
export const SAFE_ALLOWED_TAGS = [
  'a', 'abbr', 'article', 'aside', 'b', 'blockquote', 'br', 'caption', 'cite',
  'code', 'col', 'colgroup', 'dd', 'del', 'details', 'div', 'dl', 'dt', 'em',
  'figcaption', 'figure', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'header',
  'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark', 'nav', 'ol', 'p', 'pre',
  'q', 's', 'samp', 'section', 'small', 'span', 'strong', 'sub', 'summary', 'sup',
  'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u', 'ul', 'var', 'wbr',
]

/** safe 模式会连同内容一起丢弃的危险元素。 */
export const SAFE_DROP_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base',
  'applet', 'frame', 'frameset', 'portal',
])

/** safe 模式允许的属性；额外允许 aria-* 和 data-*。 */
export const SAFE_HTML_ATTRS = [
  'alt', 'aria-label', 'class', 'cite', 'colspan', 'datetime', 'dir', 'height',
  'headers', 'hidden', 'href', 'id', 'lang', 'loading', 'open', 'rel', 'role',
  'rowspan', 'scope', 'src', 'start', 'target', 'title', 'width',
]

/** 只创建一次，避免每个 HTML fragment 都复制配置。 */
export const SAFE_SANITIZE_CONFIG = {
  ALLOWED_TAGS: SAFE_ALLOWED_TAGS,
  ALLOWED_ATTR: SAFE_HTML_ATTRS,
  ALLOW_DATA_ATTR: true,
  ALLOW_ARIA_ATTR: true,
  FORBID_TAGS: [...SAFE_DROP_TAGS],
  RETURN_DOM_FRAGMENT: true,
}

export const HTML_NAMESPACE = 'http://www.w3.org/1999/xhtml'

export const URL_ATTRS = new Set([
  'href', 'src', 'xlink:href', 'action', 'poster', 'cite', 'background', 'data', 'manifest',
])

/** 原始 HTML 的 safe 模式使用严格协议白名单。 */
export const SAFE_PROTOCOLS = new Set(['http', 'https', 'mailto', 'tel', 'ftp'])

/** Markdown token 属性沿用 markdown-it 的协议黑名单。 */
export const BAD_TOKEN_PROTOCOL_RE = /^(?:vbscript|javascript|file|data):/i
export const SAFE_DATA_IMAGE_RE = /^data:image\/(?:gif|png|jpeg|webp);/i

export const STYLE_ALIGN_RE = /^\s*text-align\s*:\s*(?:left|right|center)\s*;?\s*$/i

export const WHITESPACE_RE = /\s+/
export const UNSAFE_URL_CHARS_RE = /[\u0000-\u0020\u007f-\u009f]/g
export const PROTOCOL_RE = /^([a-z][a-z\d+.-]*):/i

export const CLOSING_TAG_RE = /^\s*<\/\s*([a-zA-Z][\w:.-]*)\s*>\s*$/
export const OPENING_TAG_RE =
  /^\s*<([a-zA-Z][\w:.-]*)((?:\s+[^\s"'>/=]+(?:\s*=\s*(?:"[^"]*"|'[^']*'|[^\s"'=<>`]+))?)*)\s*\/?>\s*$/
export const SELF_CLOSING_RE = /\/\s*>$/

export const ESCAPED_CHAR_RE = /\\([!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~])/g
export const NUMERIC_ENTITY_RE = /&#(?:x([0-9a-f]+)|([0-9]+));/gi
export const NAMED_ENTITY_RE = /&(amp|lt|gt|quot|apos|nbsp);/g

export const NAMED_ENTITIES: Record<string, string> = {
  amp: '&', lt: '<', gt: '>', quot: '"', apos: "'", nbsp: '\u00a0',
}

export const VOID_HTML_TAGS = new Set([
  'area', 'base', 'br', 'col', 'embed', 'hr', 'img', 'input', 'link', 'meta',
  'param', 'source', 'track', 'wbr',
])
