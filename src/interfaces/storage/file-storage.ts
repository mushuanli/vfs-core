import type { OperationOptions } from '../core/operation';

export interface FileStat {
    kind: 'file' | 'directory' | 'symlink';
    size?: number;
    createdAt?: number;
    modifiedAt?: number;
    revision?: string;
    /** Opaque source identity, independent of client mount prefixes. */
    sourceIdentity?: string;
    /** Optional source-owned metadata, persisted beside the remote file tree. */
    metadata?: Record<string, unknown>;
}
export interface FileEntry { name: string; stat: FileStat; }
export interface FilePage { entries: FileEntry[]; nextCursor: string | null; warnings?: string[]; }
export interface FileListOptions extends OperationOptions { cursor?: string; fields?: 'entry' | 'stat'; }
export interface FileReadOptions extends OperationOptions { offset?: number; length?: number; ifRevision?: string; }
export interface FileReadResult { data: Uint8Array; revision?: string; }
export interface FileReader {
    stat(path: string, options?: OperationOptions): Promise<FileStat | null>;
    statType?(path: string, options?: OperationOptions): Promise<Pick<FileStat, 'kind'> | null>;
    list(path: string, options?: FileListOptions): Promise<FilePage>;
    read(path: string, options?: FileReadOptions): Promise<FileReadResult>;
}
export type ReplaceCondition = { kind: 'create-only' } | { kind: 'match'; revision: string };
export interface FileMutations {
    updateMetadata?(path: string, patch: Record<string, unknown>, options?: OperationOptions): Promise<void>;
    replace(path: string, data: Uint8Array, condition: ReplaceCondition, options?: OperationOptions): Promise<FileStat>;
    mkdir(path: string, options?: OperationOptions): Promise<FileStat>;
    rename(from: string, to: string, options?: OperationOptions): Promise<void>;
    remove(path: string, options?: OperationOptions & { recursive?: boolean }): Promise<void>;
}
/** File facts only. Virtual nodes and application metadata belong to the VFS adapter. */
export interface FileStorageBackend {
    readonly name: string;
    readonly files: FileReader;
    readonly mutations?: FileMutations;
    init(options?: OperationOptions): Promise<void>;
    close(): Promise<void>;
}
