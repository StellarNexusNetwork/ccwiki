// View Transition 名称工具
// 名称必须是合法的 CSS <custom-ident>：不能包含空格、点号、加号等字符，
// 也不能以数字开头。因此这里用哈希代替原始标题文本，避免标题内容让名称失效。

// FNV-1a 32 位哈希，输出仅含 [0-9a-z]
function hashText(input: string): string {
  let hash = 2166136261;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(36);
}

/**
 * 生成标题的 view-transition-name。
 * 路径与标题共同参与哈希：标题文字不同 → 名称不同 → 不会触发共享元素动画。
 */
export function titleVTName(dirPath: string, title?: string): string {
  const normalizedTitle = (title ?? '').trim();
  return `item-name-${hashText(`${dirPath}\u0000${normalizedTitle}`)}`;
}
