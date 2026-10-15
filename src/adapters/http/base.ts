import type {ResolvedPath} from "@/adapters/adapter/types.ts";

// 处理路径

export function resolveParser(path: string): ResolvedPath {
  // path = path.replace(/^https?:\/\//, "");

  return {
    type: "httpServer",
    repoId: "",
    path,
  };
}
