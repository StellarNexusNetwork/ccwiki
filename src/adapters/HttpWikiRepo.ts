import axios from "axios";

import {type Config} from "@/adapters/types";
import {WikiRepo} from "@/adapters/WikiRepo.ts";

// 在线仓库
export class HttpWikiRepo extends WikiRepo {
  readonly type = 'httpServer';
  // 仓库根地址
  address: string;

  constructor(config: Config, address: string) {
    super(config);
    this.address = address;
  }

  // 处理路径（currentAddress是path 不是fullPath）
  private resolveAddress(currentAddress: string, targetPath: string): string {

    // http:// / https:// Base64 / Data URL
    if (this.isUrl(targetPath)) {
      return targetPath;
    }

    // 处理路径
    currentAddress = this.address + currentAddress;
    const base = currentAddress.endsWith("/")
      ? currentAddress
      : `${currentAddress}/`;
    const currentUrl = new URL(base);

    // /a -> https://xxx.xxx/a
    if (targetPath.startsWith("/")) {
      return new URL(targetPath, currentUrl.origin).toString();
    }

    // ./b、../b、b -> 相对于当前目录
    return new URL(targetPath, currentUrl).toString();
  }

  // 初始化远程仓库：探测 icon 是否可访问
  async init() {
    if (this.icon) {
      const iconAddress = this.resolveAddress("/", this.icon);
      this.icon = iconAddress;
    }
    // 未指定图标时，自动探测
    const iconExts = ['.svg', '.avif', '.png', '.jpg'];
    for (const ext of iconExts) {
      try {
        const iconAddress = this.resolveAddress("/", `icon${ext}`);
        await axios.get(iconAddress);
        this.icon = iconAddress;
      } catch {
        // 文件不存在，继续尝试下一个格式
      }
    }
  }

  // 读取远程文件内容
  async getFileByPath(currentAddress: string, path: string): Promise<any> {
    // 尝试获取文件
    try {
      return (await axios.get(this.resolveAddress(currentAddress, path))).data;
    } catch (e) {
      throw new Error(`获取在线文件失败`, {cause: e});
    }
  }
}
