import {type Config} from "@/adapters/adapter/types.ts";
import {FALLBACK_IMAGE_SRC} from '@/utils/config.ts'

// 仓库基类：仅描述公共展示属性，不负责实际读写
export class WikiRepo {
  // display
  id: string; // xx.xx.xx
  name: Record<string, string>; // lang -> localized name
  version: string | undefined;
  icon: string | undefined; // 配置文件内读取的
  iconPath: string = FALLBACK_IMAGE_SRC; // 实际的路径

  // todo:标记仓库是否损坏

  constructor(config: Config) {
    this.id = config.id;
    this.name = config.name as Record<string, string> ?? {};
    this.version = config.version ?? undefined;
    this.icon = config.icon ?? undefined;
  }

  // 是否为网络 URL
  isUrl(url: string): boolean {
    // 支持 http://, https://, data:, blob:
    return /^(https?:\/\/|data:|blob:)/i.test(url.trim());
  }
}
