import type {ResolvedImage, ResolvedPath} from "@/adapters/adapter/types.ts";

// 获取图片信息
export function resolveImage(resolvedPath: ResolvedPath): ResolvedImage {
  return {
    type: "httpServer",
    src: resolvedPath.path,
    uid: crypto.randomUUID()
  };
}
