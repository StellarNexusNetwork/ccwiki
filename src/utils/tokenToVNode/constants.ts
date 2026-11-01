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
  'figcaption', 'figure', 'font', 'footer', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
  'header', 'hr', 'i', 'img', 'ins', 'kbd', 'li', 'main', 'mark', 'nav', 'ol',
  'p', 'pre', 'q', 's', 'samp', 'section', 'small', 'span', 'strong', 'sub',
  'summary', 'sup', 'table', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr', 'u',
  'ul', 'var', 'wbr',
]

/**
 * 废弃但仍大量出现在历史文档中的标签。
 * 渲染时替换成等价的现代标签，只保留能映射到内联样式的表现属性。
 */
export const LEGACY_TAG_MAP: Record<string, string> = {
  font: 'span',
}

/** 会连同内容一起丢弃的危险元素。 */
export const SAFE_DROP_TAGS = new Set([
  'script', 'style', 'iframe', 'object', 'embed', 'link', 'meta', 'base',
  'applet', 'frame', 'frameset', 'portal',
])

/** safe 模式允许的属性；额外允许 aria-* 和 data-*。 */
export const SAFE_HTML_ATTRS = [
  'alt', 'aria-label', 'class', 'cite', 'color', 'colspan', 'datetime', 'dir',
  'face', 'height', 'headers', 'hidden', 'href', 'id', 'lang', 'loading', 'open',
  'rel', 'role', 'rowspan', 'scope', 'size', 'src', 'start', 'style', 'target',
  'title', 'width',
]

/**
 * 废弃标签的表现属性。只有 <font> 上的这些属性有意义，
 * 会翻译成等价的内联样式，其他元素上一律丢弃。
 */
export const LEGACY_PRESENTATION_ATTRS = new Set(['color', 'face', 'size'])

/** <font size> 的 1–7 刻度对应字号，与浏览器对废弃属性的实现一致。 */
export const LEGACY_FONT_SIZE_PX: Record<string, number> = {
  '1': 10, '2': 13, '3': 16, '4': 18, '5': 24, '6': 32, '7': 48,
}

/** font-size 只接受带单位的数字，再按单位限制区间。 */
export const FONT_SIZE_RE = /^(\d+(?:\.\d+)?)(px|em|rem|%)$/
export const FONT_SIZE_RANGE: Record<string, readonly [number, number]> = {
  // 下限排除 0 字号：那是隐藏文字的常见手法。
  px: [8, 200],
  em: [0.5, 5],
  rem: [0.5, 5],
  '%': [50, 500],
}

/** font-family 的语法已由 CSSOM 校验，这里再限制字符集和长度。 */
export const FONT_FAMILY_RE = /^[\w\u4e00-\u9fa5 ,'"-]+$/
export const MAX_FONT_FAMILY_LENGTH = 64

/**
 * allowStyle 开启时允许的内联样式属性。
 * 只收录影响文字呈现的属性；定位、层叠、盒模型尺寸一律不开放，
 * 避免用 position、z-index 等覆盖页面自身的交互层。
 * font-size 是唯一的尺寸类属性，值由 FONT_SIZE_RANGE 限制区间。
 * 按 CSSOM 序列化后的名称匹配：浏览器可能把 shorthand 展开成 longhand，
 * 因此 text-decoration 与 text-decoration-line 需要同时收录。
 */
export const SAFE_STYLE_PROPS = new Set([
  'background-color',
  'color',
  'font-family',
  'font-size',
  'font-style',
  'font-weight',
  'max-width',
  'text-align',
  'text-decoration',
  'text-decoration-line',
  'vertical-align',
])

/** 值被限制为固定关键字的属性；多个关键字用空格组合。 */
export const SAFE_STYLE_KEYWORDS: Record<string, ReadonlySet<string>> = {
  'font-style': new Set(['normal', 'italic', 'oblique']),
  'font-weight': new Set([
    'normal', 'bold', 'bolder', 'lighter',
    '100', '200', '300', '400', '500', '600', '700', '800', '900',
  ]),
  'text-align': new Set(['left', 'right', 'center', 'justify', 'start', 'end']),
  'text-decoration': new Set(['none', 'underline', 'line-through', 'overline']),
  'text-decoration-line': new Set(['none', 'underline', 'line-through', 'overline']),
  'vertical-align': new Set(['top', 'middle', 'bottom', 'baseline', 'sub', 'super']),
}

/** max-width 只对图片开放，值限定为简单的长度或百分比。 */
export const MAX_WIDTH_VALUE_RE = /^(?:0|\d+(?:\.\d+)?(?:px|%|em|rem))$/i

/** 内联样式中会引入外部资源或脚本的值特征。 */
export const UNSAFE_STYLE_VALUE_RE =
  /url\s*\(|expression\s*\(|javascript:|var\s*\(|attr\s*\(|@import/i

/** 单条 style 的长度上限，避免异常长的输入。 */
export const MAX_INLINE_STYLE_LENGTH = 512

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
