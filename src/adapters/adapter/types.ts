import {HttpWikiRepo} from "@/adapters/http/wiki-repo.ts";
import {LocalWikiRepo} from "@/adapters/local/wiki-repo.ts";

type RepoTypes = "local" | "httpServer" | "other";

export type WikiRepoInstance = HttpWikiRepo | LocalWikiRepo

export interface Config {
  id: string;       //id不是ulid而是xxx或xxx：xxx.xx
  icon?: string;
  name?: Record<string, string>;
  version?: string;
}

// export interface Config extends BaseConfig {
//   extra?: Record<string, unknown>
// }

interface WikiRepoStorage {
  config: Config;
}

export interface LocalWikiRepoStorage extends WikiRepoStorage {
  type: "local";
  rootHandle: FileSystemDirectoryHandle;
}

export interface HttpRepoStorage extends WikiRepoStorage {
  type: 'httpServer'
  address: string;
}

export type RepoContext = {
  repo: WikiRepoInstance;
  currentPath: string
};

export type ResolvedPath = {
  type: RepoTypes;
  repoId: string;
  path: string;
};

export type ResolvedImage = {
  type: RepoTypes;
  src: string;
  uid: string;
};
