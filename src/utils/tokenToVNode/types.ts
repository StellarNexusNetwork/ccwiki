import { Fragment } from 'vue'
import type { Component, VNodeChild } from 'vue'

/** markdown-it Token 的最小结构描述；避免绑定 markdown-it 内部类型路径。 */
export interface MarkdownTokenLike {
  type: string
  tag?: string
  nesting?: number
  attrs?: Array<[string, string]> | null
  children?: MarkdownTokenLike[] | null
  content?: string
  info?: string
  hidden?: boolean
  block?: boolean
  markup?: string
  meta?: unknown
  map?: [number, number] | null
  level?: number
}

export interface TokenToVNodeOptions {
  /**
   * 自定义组件映射；普通标签 token 先按 type 查找，再按 tag 查找。
   * text、softbreak、hardbreak、image、code_inline、fence、code_block
   * 等特殊 token 不走该映射，请使用 renderToken。
   */
  components?: Record<string, Component>

  /** 对应 markdown-it 的 breaks；开启后 softbreak 输出 <br>。 */
  breaks?: boolean

  /**
   * 原始 HTML 处理级别，默认 false：
   * - false：按文本输出；
   * - 'safe'：过滤危险标签、事件属性和危险 URL；
   * - 'all'：完全信任，可能执行脚本；
   * - true：等同于 'safe'。
   * 依赖浏览器 DOM；SSR 下原始 HTML 退回文本。
   */
  allowHtml?: boolean | 'safe' | 'all'

  /** 对应 markdown-it 的 langPrefix，默认 'language-'。 */
  langPrefix?: string

  /**
   * fence 高亮钩子，返回值放进 <code>；返回 undefined 时使用纯文本。
   * 这是 VNode 版本，不兼容 markdown-it 返回 HTML 字符串的约定。
   */
  highlight?: (
    code: string,
    lang: string,
    langAttrs: string,
  ) => VNodeChild | undefined

  /**
   * token style 过滤器；返回 undefined 使用内置表格 text-align 规则，
   * 返回 null 或空字符串表示丢弃。
   */
  sanitizeStyle?: (
    style: string,
    token: MarkdownTokenLike,
  ) => string | null | undefined

  /**
   * 自定义渲染钩子；返回 undefined 走默认逻辑，返回 null 跳过该 token。
   * 开始标签 token 在对应结束标签出现时调用，并拿到解析好的 children。
   */
  renderToken?: (
    token: MarkdownTokenLike,
    children: VNodeChild[],
  ) => VNodeChild | undefined
}

export type HtmlMode = 'text' | 'safe' | 'all'

export type RenderTag = string | Component | typeof Fragment

export interface RenderContext {
  options: TokenToVNodeOptions
  htmlMode: HtmlMode
}

export interface Frame {
  token: MarkdownTokenLike
  tag: RenderTag
  props: Record<string, unknown> | null
  children: VNodeChild[]
  /** markdown-it 在紧凑列表中会把部分 p 标签标记为 hidden。 */
  flatten: boolean
  /** 此 frame 来自 Markdown 原始 HTML。 */
  rawHtml: boolean
  /** safe 模式中用于丢弃危险 HTML 元素及其内部内容。 */
  drop: boolean
}
