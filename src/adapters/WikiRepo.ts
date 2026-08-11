import {type Config} from "@/adapters/types";
import {FALLBACK_IMAGE_SRC} from '@/utils/config'

// 仓库基类：仅描述公共展示属性，不负责实际读写
export class WikiRepo {
  // display
  name: Record<string, string>; // lang -> localized name
  icon: string | undefined; // 存储的相对路径或链接
  iconURL: string = FALLBACK_IMAGE_SRC; // 处理后的资源路径（不存储）

  // todo:标记仓库是否损坏

  constructor(config: Config) {
    this.name = config.name as Record<string, string> ?? {};
    this.icon = config.icon ?? undefined;
  }

  // 是否为网络 URL
  isUrl(url: string): boolean {
    // 支持 http://, https://, data:, blob:
    return /^(https?:\/\/|data:|blob:)/i.test(url.trim());
  }
}
