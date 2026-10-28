import {createTextVNode, Fragment, h, type VNode, type VNodeChild,} from 'vue'
import {ESCAPED_CHAR_RE, NAMED_ENTITIES, NAMED_ENTITY_RE, NUMERIC_ENTITY_RE,} from './constants'
import {renderHtmlToken} from './html'
import {tokenProps} from './security'
import {appendChild, closeTo, currentChildren, findMatchingFrame, hRenderTag,} from './stack'
import type {
  Frame,
  HtmlMode,
  MarkdownTokenLike,
  RenderContext,
  RenderTag,
  TokenToVNodeOptions,
} from './types'

import Image from '@/components/common/image.vue'
import type {RepoContext} from "@/adapters/adapter/types.ts";

/**
 * 将 token 直接写入 target，避免为每个嵌套层级创建临时数组。
 * inline 内容使用独立栈，但结果仍写入当前父节点的 children。
 */
export function renderTokens(
  tokens: readonly MarkdownTokenLike[] | null | undefined,
  target: VNodeChild[],
  ctx: RenderContext,
  repoContext: RepoContext
): void {
  const stack: Frame[] = []

  for (const token of tokens ?? []) {
    const type = token.type

    // inline token 自身不创建 DOM 节点，只渲染它的 children。
    if (type === 'inline') {
      renderTokens(token.children, currentChildren(stack, target), ctx, repoContext)
      continue
    }

    if (ctx.htmlMode !== 'text' && (type === 'html_inline' || type === 'html_block')) {
      renderHtmlToken(token, stack, target, ctx)
      continue
    }

    const nesting = token.nesting ?? 0

    if (nesting === 1) {
      stack.push({
        token, tag: resolveTag(token, ctx.options), props: tokenProps(token, ctx.options),
        children: [], flatten: token.hidden === true, rawHtml: false, drop: false,
      })
      continue
    }

    if (nesting === -1) {
      const index = findMatchingFrame(stack, token)
      // 遇到不匹配的结束 token 时跳过它，避免破坏整棵 VNode 树。
      if (index >= 0) closeTo(stack, target, ctx, index)
      continue
    }

    appendChild(currentChildren(stack, target), renderLeafToken(token, ctx, repoContext))
  }

  // 若 token 流不完整，仍将未闭合节点输出，避免内容丢失。
  closeTo(stack, target, ctx, 0)
}

export function getHtmlMode(options: TokenToVNodeOptions): HtmlMode {
  if (options.allowHtml === 'all') return 'all'
  if (options.allowHtml === true || options.allowHtml === 'safe') return 'safe'
  return 'text'
}

function resolveTag(
  token: MarkdownTokenLike,
  options: TokenToVNodeOptions,
): RenderTag {
  const mapped = options.components?.[token.type]
    ?? (token.tag ? options.components?.[token.tag] : undefined)

  return mapped ?? token.tag ?? Fragment
}

function renderLeafToken(
  token: MarkdownTokenLike,
  ctx: RenderContext,
  repoContext: RepoContext
): VNodeChild {
  const customVNode = ctx.options.renderToken?.(token, [])
  if (customVNode !== undefined) return customVNode

  switch (token.type) {
    case 'text':
    case 'text_special':
    case 'html_inline':
    case 'html_block':
      // 默认不执行 Markdown 中的原始 HTML，作为文本节点输出。
      return createTextVNode(token.content ?? '')

    case 'softbreak':
      return ctx.options.breaks ? h('br') : createTextVNode('\n')

    case 'hardbreak':
      return h('br')

    case 'code_inline':
      return h('code', tokenProps(token, ctx.options), createTextVNode(token.content ?? ''))

    case 'fence':
      return renderFence(token, ctx)

    case 'code_block':
      return renderCodeBlock(token, ctx)

    case 'image':
      return renderImage(token, ctx, repoContext)

    default: {
      const content = token.content ?? ''

      // markdown-it 的 renderToken 对 hidden token 不输出任何内容。
      if (token.hidden === true) return null

      // 兼容 hr、插件 token 等没有 nesting 的标签型 token。
      if (token.tag) {
        return hRenderTag(
          resolveTag(token, ctx.options),
          tokenProps(token, ctx.options),
          content ? [createTextVNode(content)] : [],
        )
      }

      // 不认识的自定义 token 至少保留 content，避免静默丢文。
      return content ? createTextVNode(content) : null
    }
  }
}

/** 对齐 markdown-it 的 fence 规则：信息字符串属性放在 <code> 上。 */
function renderFence(token: MarkdownTokenLike, ctx: RenderContext): VNode {
  const content = token.content ?? ''
  const info = token.info ? unescapeInfo(token.info).trim() : ''
  const [langName = '', , ...rest] = info.split(/(\s+)/)
  const langAttrs = rest.join('')

  let props = tokenProps(token, ctx.options)

  if (langName) {
    const langClass = `${ctx.options.langPrefix ?? 'language-'}${langName}`
    props ??= {}
    props.class = props.class ? `${String(props.class)} ${langClass}` : langClass
  }

  const highlighted = ctx.options.highlight?.(content, langName, langAttrs)
  const codeChildren = highlighted === undefined
    ? createTextVNode(content)
    : highlighted == null || typeof highlighted === 'boolean' ? undefined : highlighted

  return h('pre', null, h('code', props, codeChildren))
}

/** 对齐 markdown-it 的 code_block 规则：token 属性放在 <pre> 上。 */
function renderCodeBlock(token: MarkdownTokenLike, ctx: RenderContext): VNode {
  // markdown-it 的 highlight 只作用于 fence，缩进代码块保持纯文本。
  return h('pre', tokenProps(token, ctx.options), h('code', null, createTextVNode(token.content ?? '')))
}

/** 对齐 markdown-it：alt 使用剥离标记后的行内文本，而不是原始 content。 */
function renderImage(
  token: MarkdownTokenLike,
  ctx: RenderContext,
  repoContext: RepoContext,
): VNode {
  const props = tokenProps(token, ctx.options) ?? {}

  const src = typeof props.src === 'string' ? props.src : ''
  const alt = token.children?.length
    ? renderInlineAsText(token.children)
    : token.content ?? ''

  return h(Image, {
    path: src,
    alt,
    repo: repoContext.repo,
    cache: false,
    isLightbox: true,
    imgStyle: {width: 'revert'},
  })
}


/** markdown-it renderInlineAsText 的等价实现，用于 image 的 alt。 */
function renderInlineAsText(
  tokens: readonly MarkdownTokenLike[] | null | undefined,
): string {
  let result = ''

  for (const token of tokens ?? []) {
    if (token.type === 'image') result += renderInlineAsText(token.children)
    else if (token.type === 'softbreak' || token.type === 'hardbreak') result += '\n'
    else if (token.type === 'text' || token.type === 'html_inline' || token.type === 'html_block') {
      result += token.content ?? ''
    }
  }

  return result
}

/** fence info 的转义处理，对应 markdown-it 的 unescapeAll。 */
function unescapeInfo(info: string): string {
  let result = info.indexOf('\\') < 0 ? info : info.replace(ESCAPED_CHAR_RE, '$1')

  if (result.indexOf('&') >= 0) {
    result = result
      .replace(NUMERIC_ENTITY_RE, (match, hex: string | undefined, dec: string | undefined) => {
        const code = hex ? Number.parseInt(hex, 16) : Number.parseInt(dec ?? '', 10)
        return code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match
      })
      .replace(NAMED_ENTITY_RE, (match, name: string) => NAMED_ENTITIES[name] ?? match)
  }

  return result
}
