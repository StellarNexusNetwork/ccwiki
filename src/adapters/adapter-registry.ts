import {resolveParser as localParser} from "@/adapters/local/base";
import type {RepoContext, ResolvedImage, ResolvedPath} from "@/adapters/adapter/types.ts";
import {resolveImage as httpImage} from "@/adapters/http/image";
import {resolveImage as localImage} from "@/adapters/local/image";

const directPrefixes = [
  "http://",
  "https://",
  "data:",
  "blob:",
] as const;

const parsers = [
  ["local://", localParser]
] as const;

// 处理路径
export function resolveParser(
  path: string,
  context: RepoContext
): ResolvedPath {
  // 浏览器可直接读取
  if (directPrefixes.some(prefix => path.startsWith(prefix))) {
    return {
      type: "other",
      repoId: "",
      path,
    };
  }

  const {repo, currentPath} = context;
  // ./xxx
  if (path.startsWith("./") || path.startsWith("/")) {
    return {
      type: repo.type,
      repoId: repo.id,
      path: repo.resolveAddress(currentPath, path)
    }
  }

  // 其他需要特殊处理的协议
  const match = parsers.find(
    ([prefix]) => path.startsWith(prefix)
  );

  if (match) {
    return match[1](path);
  }

  return {
    type: repo.type,
    repoId: repo.id,
    path: repo.resolveAddress(currentPath, path)
  }
}

// 获取图片信息
const imageResolvers = {
  httpServer: httpImage,
  local: localImage,
} as const

export async function resolveImage(
  path: ResolvedPath
): Promise<ResolvedImage> {
  if (path.type === 'other') {
    return {
      type: 'other',
      src: path.path,
      uid: 'u' + crypto.randomUUID()
    }
  }
  try {
    return imageResolvers[path.type](path)
  } catch (error) {
    throw new Error(`resolveImage 失败`, {
      cause: error,
    });
  }
}
