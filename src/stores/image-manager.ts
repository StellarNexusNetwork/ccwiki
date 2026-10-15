import {defineStore} from "pinia";
import type {RepoContext, ResolvedImage, ResolvedPath} from "@/adapters/adapter/types.ts";
import {resolveImage, resolveParser} from "@/adapters/adapter-registry"

type ImageId = string;

// 引用计数
class ImageRefManager {
  private readonly refs = new Map<ImageId, number>();
  private readonly pending = new Map<ImageId, number>();

  add(id: ImageId): void {
    this.change(id, 1);
  }

  remove(id: ImageId): void {
    this.change(id, -1);
  }

  private change(id: ImageId, delta: number): void {
    const next = (this.pending.get(id) ?? 0) + delta;

    if (next === 0) {
      this.pending.delete(id);
    } else {
      this.pending.set(id, next);
    }
  }

  flush(): ImageId[] {
    const unused: ImageId[] = [];

    for (const [id, delta] of this.pending) {
      const current = this.refs.get(id) ?? 0;
      const next = current + delta;

      if (next < 0) {
        throw new Error(
          `图片 ${id} 的引用数变成了负数：${next}`,
        );
      }

      if (next === 0) {
        this.refs.delete(id);
        unused.push(id);
      } else {
        this.refs.set(id, next);
      }
    }

    this.pending.clear();

    return unused;
  }

  get(id: ImageId): number {
    return (
      (this.refs.get(id) ?? 0) +
      (this.pending.get(id) ?? 0)
    );
  }
}

const browserReadableSchemes = new Set([
  'data:',
  'blob:',
]);

// 检查是否为合法的缓存地址
export function isBrowserReadablePath(path: string): boolean {
  // 任意合法 scheme://
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:\/\//.test(path)) {
    return true;
  }

  // 明确允许的浏览器资源 scheme
  for (const scheme of browserReadableSchemes) {
    if (path.startsWith(scheme)) {
      return true;
    }
  }

  return false;
}

// 合并信息为合法缓存地址
function getImageCachePath(path: ResolvedPath): string {
  if (isBrowserReadablePath(path.path)) {
    return path.path;
  }

  return (
    path.type +
    '://' +
    (path.repoId.length > 0 ? `${path.repoId}:` : '') +
    path.path
  );
}

export const useImageManager = defineStore(
  "ImageManager",
  () => {
    const imageRefs = new ImageRefManager();
    const imageCache = new Map<string, ResolvedImage>();
    const pendingImages = new Map<string, Promise<ResolvedImage>>();

    // 添加引用记录
    function addImageRef(id: ImageId): void {
      imageRefs.add(id);
    }

    // 释放引用记录
    function removeImageRef(id: ImageId): void {
      imageRefs.remove(id);
    }

    /**
     * 在一次 Vue 页面更新完成后调用。
     *
     * 负责结算图片引用，并清理已经没有引用的资源。
     */
    function flushImageRefs(): void {
      const unused = imageRefs.flush();

      if (unused.length === 0) {
        return;
      }

      cleanupImageCache(unused);
    }

    // 释放、清除缓存的信息
    function cleanupImageCache(ids: ImageId[]): void {
      for (const id of ids) {
        const cached = imageCache.get(id);
        if (cached) {
          const src = cached.src
          if (src.startsWith("blob:")) {
            URL.revokeObjectURL(src);
          }
          imageCache.delete(id);
        }
      }
    }

    // 请求图片信息
    async function requestImage(
      path: string,
      context: RepoContext,
      cache: boolean = true,
    ): Promise<[string, ResolvedImage]> {
      // 尝试处理原始路径
      let resolvedPath: ResolvedPath;

      try {
        resolvedPath = resolveParser(path, context);
      } catch (e) {
        throw new Error(`Failed to resolve image path: ${path}`, {
          cause: e,
        });
      }

      // 检查是否缓存
      const cachePath = getImageCachePath(resolvedPath);

      const cached = imageCache.get(cachePath);

      if (cached) {
        if (cache === true) {
          addImageRef(cachePath);
        }
        return [cachePath, cached];
      }

      // 防止并发重复缓存
      let pending = pendingImages.get(cachePath);

      if (!pending) {
        pending = resolveImage(resolvedPath).catch((e) => {
          throw new Error(`Failed to resolve image: ${resolvedPath.path}`, {
            cause: e,
          });
        });

        pendingImages.set(cachePath, pending);

        pending.finally(() => {
          pendingImages.delete(cachePath);
        });
      }

      // 尝试获取图片
      let resolvedImage: ResolvedImage;

      try {
        resolvedImage = await resolveImage(resolvedPath);
      } catch (e) {
        throw new Error(`Failed to resolve image: ${resolvedPath.path}`, {
          cause: e,
        });
      }

      if (cache === true) {
        addImageRef(cachePath);
        imageCache.set(cachePath, resolvedImage);
      }
      return [cachePath, resolvedImage];
    }

    return {
      requestImage,
      removeImageRef,
      flushImageRefs
    };
  },
);
