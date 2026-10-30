import { describe, expect, it } from 'vitest'
import MarkdownIt from 'markdown-it'
import type { VNode } from 'vue'

import { UNSAFE_STYLE_VALUE_RE } from '../constants'
import { isSafeStyleValue, resolveInlineStyle, sanitizeInlineStyle } from '../security'
import { tokensToVNode } from '..'
import type { RepoContext } from '@/adapters/adapter/types.ts'

const md = new MarkdownIt({ html: true })
const repoContext = { repo: {} as RepoContext['repo'], currentPath: '' }

function renderHtml(source: string, allowStyle?: boolean) {
  const vnode = tokensToVNode(md.parse(source, {}), repoContext, {
    allowHtml: 'safe',
    allowStyle,
  })
  return vnode.children as VNode[]
}

/** 取 VNode 的纯文本内容，便于断言标签包裹的文字。 */
function textOf(vnode: VNode | undefined): string {
  const children = vnode?.children
  if (typeof children === 'string') return children
  if (!Array.isArray(children)) return ''
  return children.map((child) => textOf(child as VNode)).join('')
}

describe('sanitizeInlineStyle', () => {
  it('keeps whitelisted declarations', () => {
    expect(sanitizeInlineStyle('color: red; text-align: center'))
      .toBe('color: red; text-align: center')
  })

  it('drops non-whitelisted declarations', () => {
    expect(sanitizeInlineStyle('color: red; position: fixed; z-index: 9999'))
      .toBe('color: red')
  })

  it('drops layout properties that could break the page', () => {
    expect(sanitizeInlineStyle('margin: 8px 4px')).toBe('')
    expect(sanitizeInlineStyle('float: left')).toBe('')
    expect(sanitizeInlineStyle('display: none')).toBe('')
  })

  it('normalizes colors through CSSOM', () => {
    expect(sanitizeInlineStyle('background-color: #FF0000'))
      .toBe('background-color: rgb(255, 0, 0)')
  })

  it('drops values that load external resources', () => {
    expect(sanitizeInlineStyle('background-image: url(https://example.com/a.png)')).toBe('')
    expect(sanitizeInlineStyle('background: url("https://example.com/a.png") red')).toBe('')
  })

  it('drops escaped url() even when the value regex misses it', () => {
    const escaped = String.raw`background: \75 rl(https://example.com/a.png) red`
    // 正则被转义绕过，真正拦住它的是属性白名单。
    expect(UNSAFE_STYLE_VALUE_RE.test(escaped)).toBe(false)
    expect(sanitizeInlineStyle(escaped)).toBe('')
  })

  it('drops declarations that rely on var()', () => {
    expect(sanitizeInlineStyle('color: var(--brand)')).toBe('')
  })

  it('drops overly long styles', () => {
    expect(sanitizeInlineStyle(`color: red;${'x'.repeat(2000)}`)).toBe('')
  })

  it('keeps max-width on images only', () => {
    expect(sanitizeInlineStyle('max-width: 100%', 'img')).toBe('max-width: 100%')
    expect(sanitizeInlineStyle('max-width: 12.5rem', 'img')).toBe('max-width: 12.5rem')
    expect(sanitizeInlineStyle('max-width: 100%', 'div')).toBe('')
    expect(sanitizeInlineStyle('max-width: calc(100% - 1px)', 'img')).toBe('')
  })

  it('drops !important instead of propagating it', () => {
    expect(sanitizeInlineStyle('color: red !important')).toBe('color: red')
  })

  it('does not leak declarations between calls', () => {
    // 复用同一个 CSSOM 探针，每次都必须整段覆盖。
    expect(sanitizeInlineStyle('color: red')).toBe('color: red')
    expect(sanitizeInlineStyle('font-weight: bold')).toBe('font-weight: bold')
    expect(sanitizeInlineStyle('')).toBe('')
  })
})

describe('isSafeStyleValue', () => {
  it('accepts whitelisted keywords', () => {
    expect(isSafeStyleValue('text-align', 'center')).toBe(true)
    expect(isSafeStyleValue('font-weight', '700')).toBe(true)
    expect(isSafeStyleValue('text-decoration-line', 'underline overline')).toBe(true)
  })

  it('rejects keywords outside the whitelist', () => {
    expect(isSafeStyleValue('text-align', 'inherit')).toBe(false)
    expect(isSafeStyleValue('font-weight', '450')).toBe(false)
    expect(isSafeStyleValue('vertical-align', 'text-top')).toBe(false)
    expect(isSafeStyleValue('text-decoration-line', 'underline wavy')).toBe(false)
  })

  it('rejects url() in normalized values', () => {
    expect(isSafeStyleValue('color', 'url(https://example.com/a.png)')).toBe(false)
  })

  it('bounds font-size by unit', () => {
    expect(isSafeStyleValue('font-size', '14px')).toBe(true)
    expect(isSafeStyleValue('font-size', '1.2em')).toBe(true)
    expect(isSafeStyleValue('font-size', '120%')).toBe(true)

    // 0 字号是隐藏文字的常见手法，CSSOM 会把它序列化成 0px。
    expect(isSafeStyleValue('font-size', '0px')).toBe(false)
    expect(isSafeStyleValue('font-size', '4px')).toBe(false)
    expect(isSafeStyleValue('font-size', '9999px')).toBe(false)
    expect(isSafeStyleValue('font-size', '10em')).toBe(false)
    expect(isSafeStyleValue('font-size', 'calc(10px + 1em)')).toBe(false)
  })

  it('restricts font-family to a plain family list', () => {
    expect(isSafeStyleValue('font-family', 'Arial')).toBe(true)
    expect(isSafeStyleValue('font-family', 'Arial Black')).toBe(true)
    expect(isSafeStyleValue('font-family', '宋体')).toBe(true)

    expect(isSafeStyleValue('font-family', 'url(https://example.com/a.woff)')).toBe(false)
    expect(isSafeStyleValue('font-family', 'a'.repeat(80))).toBe(false)
  })
})

describe('resolveInlineStyle', () => {
  it('returns null unless allowStyle is enabled', () => {
    expect(resolveInlineStyle('color: red', {})).toBeNull()
  })

  it('uses the built-in whitelist when allowStyle is true', () => {
    expect(resolveInlineStyle('color: red; position: fixed', { allowStyle: true }))
      .toBe('color: red')
  })

  it('passes the tag to a custom sanitizer', () => {
    const seen: Array<string | undefined> = []
    const result = resolveInlineStyle('max-width: 100%', {
      allowStyle: (value, tag) => {
        seen.push(tag)
        return value
      },
    }, 'img')

    expect(result).toBe('max-width: 100%')
    expect(seen).toEqual(['img'])
  })

  it('treats an empty custom result as dropped', () => {
    expect(resolveInlineStyle('color: red', { allowStyle: () => '' })).toBeNull()
  })
})

describe('safe HTML style rendering', () => {
  it('keeps safe styles when enabled', () => {
    const [div] = renderHtml('<div style="color: red; position: fixed">hi</div>', true)
    expect(div?.props?.style).toBe('color: red')
  })

  it('renders <span style="color:red"> as styled text', () => {
    const [paragraph] = renderHtml('<span style="color:red">hi</span>', true)
    const [span] = paragraph?.children as VNode[]
    expect(span?.props?.style).toBe('color: red')
  })

  it('drops the style attribute by default', () => {
    const [div] = renderHtml('<div style="color: red">hi</div>')
    expect(div?.props?.style).toBeUndefined()
  })

  it('drops styles containing url()', () => {
    const [div] = renderHtml('<div style="background-image: url(https://example.com/a.png)">hi</div>', true)
    expect(div?.props?.style).toBeUndefined()
  })

  it('keeps max-width on <img> but not on <div>', () => {
    const [img] = renderHtml('<img src="a.png" alt="" style="max-width: 100%">', true)
    expect(img?.props?.style).toBe('max-width: 100%')

    const [div] = renderHtml('<div style="max-width: 100%">hi</div>', true)
    expect(div?.props?.style).toBeUndefined()
  })

  it('drops the whole style attribute when nothing survives', () => {
    const [div] = renderHtml('<div style="position: fixed; z-index: 9">hi</div>', true)
    expect(div?.props?.style).toBeUndefined()
  })
})

describe('legacy <font> rendering', () => {
  it('renders <font color> as a styled span', () => {
    const [paragraph] = renderHtml('<font color="#d83931">NADPH</font>', true)
    const [span] = paragraph?.children as VNode[]

    expect(span?.type).toBe('span')
    expect(span?.props?.style).toBe('color: rgb(216, 57, 49)')
    expect(textOf(span)).toBe('NADPH')
  })

  it('keeps the text but drops the color when allowStyle is off', () => {
    const [paragraph] = renderHtml('<font color="#d83931">NADPH</font>')
    const [span] = paragraph?.children as VNode[]

    expect(span?.type).toBe('span')
    expect(span?.props).toBeNull()
    expect(textOf(span)).toBe('NADPH')
  })

  it('drops a color value that smuggles in url()', () => {
    const [paragraph] = renderHtml('<font color="red; background: url(https://example.com/a.png)">x</font>', true)
    const [span] = paragraph?.children as VNode[]

    expect(span?.type).toBe('span')
    expect(span?.props?.style).toBeUndefined()
  })

  it('strips the other presentational attributes of <font>', () => {
    const [paragraph] = renderHtml('<font color="red" face="Arial" size="5">x</font>', true)
    const [span] = paragraph?.children as VNode[]

    // face/size 会被翻译成内联样式，不再作为属性输出。
    expect(span?.props).toEqual({
      style: 'color: red; font-family: Arial; font-size: 24px',
    })
  })

  it('maps <font size> levels to font-size', () => {
    const px = (size: string) => {
      const [paragraph] = renderHtml(`<font size="${size}">x</font>`, true)
      const [span] = paragraph?.children as VNode[]
      return span?.props?.style
    }

    expect(px('1')).toBe('font-size: 10px')
    expect(px('4')).toBe('font-size: 18px')
    expect(px('7')).toBe('font-size: 48px')
    // 相对档位以默认档 3 为基准。
    expect(px('+1')).toBe('font-size: 18px')
    expect(px('-1')).toBe('font-size: 13px')
    expect(px('+9')).toBe('font-size: 48px')
  })

  it('drops <font size> values that are not a level', () => {
    const [paragraph] = renderHtml('<font size="huge">x</font>', true)
    const [span] = paragraph?.children as VNode[]

    expect(span?.props?.style).toBeUndefined()
  })

  it('drops presentational attributes on non-font elements', () => {
    const [div] = renderHtml('<div size="5" face="Arial" color="red">x</div>', true)

    expect(div?.props).toBeNull()
  })

  it('merges font color with the style attribute', () => {
    const [paragraph] = renderHtml('<font color="red" style="font-weight: bold">x</font>', true)
    const [span] = paragraph?.children as VNode[]

    expect(span?.props?.style).toBe('color: red; font-weight: bold')
  })

  it('closes <font> at the right position inside a paragraph', () => {
    const [paragraph] = renderHtml('前 <font color="red">NADPH</font> 后', true)
    const children = paragraph?.children as VNode[]

    // 结束标签必须命中开标签建立的 frame，否则后面的文字会被吞进 span。
    expect(children).toHaveLength(3)
    expect(children[1]?.type).toBe('span')
    expect(children[1]?.props?.style).toBe('color: red')
    expect(textOf(children[2])).toBe(' 后')
  })

  it('lets the style attribute win over the color attribute', () => {
    // HTML 里 style 优先于表现属性，与属性书写顺序无关。
    const [paragraph] = renderHtml('<font style="color: blue" color="red">x</font>', true)
    const [span] = paragraph?.children as VNode[]
    const style = span?.props?.style as string

    expect(style.startsWith('color: red')).toBe(true)
    expect(style.endsWith('color: blue')).toBe(true)
  })
})
