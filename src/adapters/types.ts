export interface Config {
  id: string;       //id不是ulid而是xxx或xxx：xxx.xx
  icon?: string;
  name?: Record<string, string>;
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
