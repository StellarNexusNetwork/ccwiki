import {type Config} from "@/adapters/types";
import {WikiRepo} from "@/adapters/WikiRepo.ts";
import axios from "axios";

// 本地仓库
export class LocalWikiRepo extends WikiRepo {
  readonly type = "local";
  // 仓库根目录
  rootHandle: FileSystemDirectoryHandle;

  constructor(config: Config, rootHandle: FileSystemDirectoryHandle) {
    super(config);
    this.rootHandle = rootHandle;
  }

  // 处理路径（currentAddress是path 不是fullPath）
  private resolveAddress(currentAddress: string, targetPath: string): string {
    // // http:// / https://
    // if (/^https?:\/\//i.test(targetPath)) {
    //   return targetPath;
    // }
    //
    // // Base64 / Data URL
    // if (/^data:/i.test(targetPath)) {
    //   return targetPath;
    // }

    // 处理路径
    const base = currentAddress.endsWith("/")
      ? currentAddress
      : `${currentAddress}/`;

    // /a -> /a
    if (targetPath.startsWith("/")) {
      return targetPath;
    }

    // ./b、../b、b
    return new URL(targetPath, `http://dummy${base}`).pathname;
  }

  // 将路径字符串解析为标准的路径片段数组
  splitPath = (path: string): string[] =>
    path.split("/").map(p => p.trim()).filter(Boolean);

  // 初始化本地仓库：仅依赖 rootHandle 做最小化初始化
  // 从根目录中探测并设置仓库图标（优先 svg/avif/png/jpg）
  async init() {
    if (this.icon) {
      const iconAddress = this.resolveAddress("/", this.icon);
      // 外部 URL / Data URL
      if (this.isUrl(iconAddress)) {
        this.icon = iconAddress;
        return;
      }
      // 本地文件
      try {
        const iconFile = await this.getFileByPath("/", this.icon);
        this.iconURL = URL.createObjectURL(iconFile);
        this.icon = this.iconURL;
        return;
      } catch (e) {
        console.error("图标加载失败", e);
      }
    }
    // 未指定图标时，自动探测
    const iconExts = ['.svg', '.avif', '.png', '.jpg'];
    for (const ext of iconExts) {
      try {
        const iconFile = await this.getFileByPath("/", `icon${ext}`);
        this.iconURL = URL.createObjectURL(iconFile);
        this.icon = this.iconURL;
        return;
      } catch {
        // 文件不存在，继续尝试下一个格式
      }
    }
  }

  // 通过目录路径解析到目标目录句柄
  private async resolveDirectoryHandle(
    path: string[]
  ): Promise<FileSystemDirectoryHandle> {
    let current = this.rootHandle;
    for (const segmentRaw of path) {
      const segment = segmentRaw.trim();
      if (!segment) {
        continue;
      }
      try {
        current = await current.getDirectoryHandle(segment);
      } catch (e) {
        console.error(e);
      }
    }
    return current;
  }

  // 获取文件
  private async getFileHandle(
    path: string[]
  ): Promise<FileSystemFileHandle> {
    if (path.length === 0) {
      throw new Error("File path is empty");
    }
    const fileName = path.pop();
    if (!fileName || fileName === ".") {
      throw new Error(`Invalid file path: ${path}`);
    }
    const dir = await this.resolveDirectoryHandle(path);
    return dir.getFileHandle(fileName);
  }

  async getFileByPath(currentAddress: string, path: string): Promise<File> {
    if (
      /^https?:\/\//i.test(path) ||
      /^data:/i.test(path)
    ) {
      try {
        return (await axios.get(path)).data;
      } catch (e) {
        throw new Error(`获取在线文件失败`, {cause: e});
      }
    }

    const fullPath = this.resolveAddress(currentAddress, path);
    const pathSegments = this.splitPath(fullPath);
    try {
      const fileHandle = await this.getFileHandle(pathSegments);
      return await fileHandle.getFile();
    } catch (e) {
      throw new Error(`获取本地文件失败`, {cause: e});
    }
  }


  // 将本地文件地址加载为可渲染图片并写入缓存
  private async loadImageIntoCache(address: string, entry: LocalImageCacheEntry): Promise<void> {
    let objectUrl: string | undefined;
    let info = createFallbackImageInfo();

    try {
      const pathArray = address.split('/').filter(Boolean);
      const handle = await this.getFile(pathArray);

      if (handle) {
        objectUrl = URL.createObjectURL(await handle.getFile());
        info = await probeImageInfo(objectUrl);
        if (info.src !== objectUrl) {
          URL.revokeObjectURL(objectUrl);
          objectUrl = undefined;
        }
      } else {
        console.log('cacheImage失败！', address);
      }
    } catch (err) {
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
        objectUrl = undefined;
      }
      logDataSourceError('LocalWikiRepo.loadImageIntoCache', err, {address});
    }

    const current = this.imageCache.get(address);
    if (!current || current !== entry) {
      // 条目已被替换/删除：当前临时 URL 直接释放，防止泄漏
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
      return;
    }

    current.info = info;
    current.objectUrl = objectUrl;
    current.pending = undefined;
    this.touchCacheEntry(address, current);
    this.trimImageCache();
  }

  // 获取图片信息（带缓存、并发去重、引用计数）
  async getImage(url: string[], src: string): Promise<ImageInfo> {
    const address: string = this.makeAddress(url, src);
    if (!address) {
      return createFallbackImageInfo();
    }

    let entry = this.imageCache.get(address);
    if (!entry) {
      entry = {
        refCount: 0
      };
      this.imageCache.set(address, entry);
      entry.pending = this.loadImageIntoCache(address, entry);
    }

    if (entry.pending) {
      await entry.pending;
      entry = this.imageCache.get(address);
    }

    if (!entry?.info) {
      return createFallbackImageInfo();
    }

    entry.refCount += 1;
    this.touchCacheEntry(address, entry);
    return entry.info;
  }

  // 释放一次图片引用，供组件卸载时调用
  releaseImage(url: string[], src: string) {
    const address = this.makeAddress(url, src);
    if (!address) {
      return;
    }

    const entry = this.imageCache.get(address);
    if (!entry) {
      return;
    }

    entry.refCount = Math.max(0, entry.refCount - 1);
    // 释放引用后尝试裁剪缓存，控制内存占用
    this.trimImageCache();
  }

  private touchCacheEntry(address: string, entry: LocalImageCacheEntry) {
    this.imageCache.delete(address);
    this.imageCache.set(address, entry);
  }

  private revokeCacheEntry(address: string, entry: LocalImageCacheEntry) {
    if (entry.objectUrl) {
      URL.revokeObjectURL(entry.objectUrl);
      entry.objectUrl = undefined;
    }
    this.imageCache.delete(address);
  }

  private trimImageCache() {
    if (this.imageCache.size <= LOCAL_IMAGE_CACHE_LIMIT) {
      return;
    }

    // 只清理“未被引用且不在加载中”的条目，避免误回收正在使用的图片
    for (const [address, entry] of this.imageCache) {
      if (this.imageCache.size <= LOCAL_IMAGE_CACHE_LIMIT) {
        break;
      }
      if (entry.refCount > 0 || entry.pending) {
        continue;
      }

      this.revokeCacheEntry(address, entry);
    }
  }
}
