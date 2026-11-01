import {
  Fragment,
  createCommentVNode,
  createTextVNode,
  h,
  isVNode,
  type Component,
  type VNode,
  type VNodeChild,
} from 'vue'
import type { Frame, MarkdownTokenLike, RenderContext, RenderTag } from './types'

/** 把 renderToken 可能返回的字符串、数组、null 统一成公开 VNode 类型。 */
export function toVNode(child: VNodeChild): VNode {
  if (isVNode(child)) return child
  if (Array.isArray(child)) return h(Fragment, null, child.map(toVNode))
  if (child == null || typeof child === 'boolean') return createCommentVNode('')
  return createTextVNode(String(child))
}

/** h() 的公开重载不接受 Fragment，这里统一包装。 */
export function hRenderTag(
  tag: RenderTag,
  props: Record<string, unknown> | null,
  children: VNodeChild[],
): VNode {
  return tag === Fragment ? h(Fragment, null, children) : h(tag as string | Component, props, children)
}

function renderFrame(frame: Frame, ctx: RenderContext): VNodeChild {
  // 只有使用自定义 renderToken 时才做这次映射。
  const renderToken = ctx.options.renderToken
  if (renderToken) {
    const customVNode = renderToken(frame.token, frame.children.map(toVNode))
    if (customVNode !== undefined) return customVNode
  }

  return hRenderTag(frame.tag, frame.props, frame.children)
}

export function currentChildren(stack: Frame[], target: VNodeChild[]): VNodeChild[] {
  return stack[stack.length - 1]?.children ?? target
}

/** 关闭栈顶 frame，并追加到新的栈顶（或根目标）中。 */
export function closeTop(
  stack: Frame[],
  target: VNodeChild[],
  ctx: RenderContext,
): void {
  const frame = stack.pop()
  if (!frame || frame.drop) return

  const parent = currentChildren(stack, target)
  if (frame.flatten) {
    appendMany(parent, frame.children)
    return
  }

  appendChild(
    parent,
    frame.rawHtml
      ? hRenderTag(frame.tag, frame.props, frame.children)
      : renderFrame(frame, ctx),
  )
}

export function closeTo(
  stack: Frame[],
  target: VNodeChild[],
  ctx: RenderContext,
  index: number,
): void {
  while (stack.length > index) closeTop(stack, target, ctx)
}

export function findMatchingFrame(
  stack: Frame[],
  closingToken: MarkdownTokenLike,
): number {
  const closingTag = closingToken.tag
  if (!closingTag) return -1

  for (let i = stack.length - 1; i >= 0; i--) {
    const frame = stack[i]
    if (frame && !frame.rawHtml && (frame.token.tag ?? '') === closingTag) return i
  }

  return -1
}

export function appendChild(target: VNodeChild[], child: VNodeChild): void {
  if (child === null || child === undefined || typeof child === 'boolean') return

  if (Array.isArray(child)) {
    appendMany(target, child)
    return
  }

  target.push(child)
}

export function appendMany(
  target: VNodeChild[],
  children: readonly VNodeChild[],
): void {
  for (const child of children) appendChild(target, child)
}
