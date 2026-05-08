type LangMap = Record<string, string> | string | undefined;

export function getLocalizedText(
  texts: LangMap,
  lang: string,
): string | undefined {
  // 直接字符串
  if (typeof texts === "string") {
    return texts;
  }

  // 必须是有效对象
  if (texts && !Array.isArray(texts) && typeof texts === "object") {
    // 当前语言
    if (texts[lang]) {
      return texts[lang];
    }

    // 英文回退
    if (texts.en_us) {
      return texts.en_us;
    }

    // 第一个可用项
    const firstAvailable = Object.values(texts).find(
      (value) => value.trim() !== ""
    );

    if (firstAvailable) {
      return firstAvailable;
    }
  }

  // 最终兜底
  return undefined;
}
