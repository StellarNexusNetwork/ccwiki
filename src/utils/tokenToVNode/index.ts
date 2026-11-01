import {Fragment, h, type VNode, type VNodeChild} from 'vue'
import {getHtmlMode, renderTokens} from './render'
import {toVNode} from './stack'
import type {MarkdownTokenLike, RenderContext, TokenToVNodeOptions} from './types'
import type {RepoContext} from "@/adapters/adapter/types.ts";

export type {MarkdownTokenLike, TokenToVNodeOptions}

/** 转换为一个 Fragment VNode，适合在 Vue render 函数中直接返回。 */
export function tokensToVNode(
  tokens: readonly MarkdownTokenLike[] | null | undefined,
  repoContext: RepoContext,
  options: TokenToVNodeOptions = {}
): VNode {
  return h(Fragment, null, tokensToVNodes(tokens, repoContext, options))
}

/** 转换为 Vue VNode 数组；输入通常来自 md.parse(source, env)。 */
export function tokensToVNodes(
  tokens: readonly MarkdownTokenLike[] | null | undefined,
  repoContext: RepoContext,
  options: TokenToVNodeOptions = {}
): VNode[] {
  const ctx: RenderContext = {options, htmlMode: getHtmlMode(options)}
  const roots: VNodeChild[] = []
  renderTokens(tokens, roots, ctx, repoContext)
  return roots.map(toVNode)
}
