import type {ResolvedPath} from "@/adapters/adapter/types.ts";

// 处理路径
export function resolveParser(path: string): ResolvedPath {
  path = path.replace(/^local:\/\//, "");

  const [repoId, ...parts] = path.split(":");
  path = parts.join(":");

  return {
    type: "local",
    repoId,
    path,
  };
}
