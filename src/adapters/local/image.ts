import type {ResolvedImage, ResolvedPath} from "@/adapters/adapter/types.ts";
import {useDataSourcesStore3} from "@/stores/dataSources3.ts";
import get from 'lodash/get';

// 获取图片信息
export async function resolveImage(resolvedPath: ResolvedPath): Promise<ResolvedImage> {
  const wikiRepos = useDataSourcesStore3().wikiRepos

  const wikiRepo: any = get(wikiRepos, resolvedPath.repoId)
  if (!wikiRepo) {
    throw new Error(`无法找到图片所在仓库 '${resolvedPath.repoId}'`);
  }
  if (wikiRepo.type !== "local") {
    throw new Error(`仓库 '${resolvedPath.repoId}' 类型不支持此格式`);
  }

  let imageURL
  try {
    const imageFile: File = await wikiRepo.getFileByPath("/", resolvedPath.path);
    imageURL = URL.createObjectURL(imageFile);
  } catch (e) {
    throw e;
  }

  return {
    type: "local",
    src: imageURL,
    uid: 'u' + crypto.randomUUID()
  }
}
