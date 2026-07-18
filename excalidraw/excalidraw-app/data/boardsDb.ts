import { createStore, get, set, del } from "idb-keyval";

export interface BoardMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  isCollaboration?: boolean;
  roomId?: string;
  roomKey?: string;
  tags?: string[];
  folderId?: string;
  password?: string;
}

export interface Board {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  elements: readonly any[];
  appState: any;
  files: Record<string, any>;
  isCollaboration?: boolean;
  roomId?: string;
  roomKey?: string;
  tags?: string[];
  folderId?: string;
  password?: string;
}

const boardsStore = createStore("excalidraw-boards-db", "boards-store");
const METADATA_KEY = "boards_metadata_list";

export async function getBoardsMetadata(): Promise<BoardMetadata[]> {
  try {
    const list = await get<BoardMetadata[]>(METADATA_KEY, boardsStore);
    return list || [];
  } catch (error) {
    console.error("Error reading boards metadata:", error);
    return [];
  }
}

export async function saveBoardsMetadata(
  metadata: BoardMetadata[],
): Promise<void> {
  await set(METADATA_KEY, metadata, boardsStore);
}

export async function getBoard(id: string): Promise<Board | null> {
  try {
    const board = await get<Board>(`board_content_${id}`, boardsStore);
    return board || null;
  } catch (error) {
    console.error(`Error reading board ${id}:`, error);
    return null;
  }
}

export async function saveBoard(
  id: string,
  data: Partial<Omit<Board, "id">> & { name: string },
  elements?: readonly any[],
  appState?: any,
  files?: any,
): Promise<void> {
  const now = Date.now();
  const currentBoard = await getBoard(id);

  const updatedBoard: Board = {
    id,
    name: data.name,
    createdAt: currentBoard?.createdAt || now,
    updatedAt: now,
    elements: elements !== undefined ? elements : currentBoard?.elements || [],
    appState: appState !== undefined ? appState : currentBoard?.appState || {},
    files: files !== undefined ? files : currentBoard?.files || {},
    isCollaboration:
      data.isCollaboration !== undefined
        ? data.isCollaboration
        : currentBoard?.isCollaboration,
    roomId: data.roomId !== undefined ? data.roomId : currentBoard?.roomId,
    roomKey: data.roomKey !== undefined ? data.roomKey : currentBoard?.roomKey,
    tags: data.tags !== undefined ? data.tags : currentBoard?.tags || [],
    folderId:
      data.folderId !== undefined ? data.folderId : currentBoard?.folderId,
    password:
      data.password !== undefined ? data.password : currentBoard?.password,
  };

  await set(`board_content_${id}`, updatedBoard, boardsStore);

  if (elements !== undefined) {
    saveBoardVersion(id, elements, appState, files).catch((err) =>
      console.error("Error saving board version history:", err),
    );
  }

  // Update metadata list
  const metadataList = await getBoardsMetadata();
  const index = metadataList.findIndex((item) => item.id === id);
  const newMetadata: BoardMetadata = {
    id,
    name: updatedBoard.name,
    createdAt: updatedBoard.createdAt,
    updatedAt: updatedBoard.updatedAt,
    isCollaboration: updatedBoard.isCollaboration,
    roomId: updatedBoard.roomId,
    roomKey: updatedBoard.roomKey,
    tags: updatedBoard.tags,
    folderId: updatedBoard.folderId,
    password: updatedBoard.password,
  };

  if (index > -1) {
    metadataList[index] = newMetadata;
  } else {
    metadataList.push(newMetadata);
  }

  // Sort by updatedAt descending
  metadataList.sort((a, b) => b.updatedAt - a.updatedAt);
  await saveBoardsMetadata(metadataList);
}

export async function deleteBoard(id: string): Promise<void> {
  await del(`board_content_${id}`, boardsStore);
  const metadataList = await getBoardsMetadata();
  const filtered = metadataList.filter((item) => item.id !== id);
  await saveBoardsMetadata(filtered);
}

export async function duplicateBoard(
  id: string,
  newName: string,
): Promise<string> {
  const source = await getBoard(id);
  if (!source) {
    throw new Error("Source board not found");
  }
  const newId = `board_${Math.random().toString(36).substr(2, 9)}`;
  await saveBoard(
    newId,
    {
      name: newName,
      isCollaboration: false,
    },
    source.elements,
    source.appState,
    source.files,
  );
  return newId;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

const FOLDERS_KEY = "boards_folders_list";

export async function getFolders(): Promise<Folder[]> {
  try {
    const list = await get<Folder[]>(FOLDERS_KEY, boardsStore);
    return list || [];
  } catch (error) {
    console.error("Error reading folders:", error);
    return [];
  }
}

export async function saveFolders(folders: Folder[]): Promise<void> {
  await set(FOLDERS_KEY, folders, boardsStore);
}

export async function createFolder(name: string): Promise<Folder> {
  const id = `folder_${Math.random().toString(36).substr(2, 9)}`;
  const folder: Folder = {
    id,
    name,
    createdAt: Date.now(),
  };
  const folders = await getFolders();
  folders.push(folder);
  await saveFolders(folders);
  return folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const folders = await getFolders();
  const filtered = folders.filter((f) => f.id !== id);
  await saveFolders(filtered);

  // Also remove folderId from any board metadata that had it
  const metadataList = await getBoardsMetadata();
  let changed = false;
  metadataList.forEach((m) => {
    if (m.folderId === id) {
      m.folderId = undefined;
      changed = true;
    }
  });
  if (changed) {
    await saveBoardsMetadata(metadataList);
  }
}

export interface BoardVersion {
  id: string;
  timestamp: number;
  elementsCount: number;
}

export async function getBoardVersions(
  boardId: string,
): Promise<BoardVersion[]> {
  try {
    const list = await get<BoardVersion[]>(
      `board_history_${boardId}`,
      boardsStore,
    );
    return list || [];
  } catch (error) {
    console.error(`Error reading history for board ${boardId}:`, error);
    return [];
  }
}

export async function saveBoardVersion(
  boardId: string,
  elements: readonly any[],
  appState: any,
  files: any,
): Promise<void> {
  const versions = await getBoardVersions(boardId);
  const now = Date.now();

  // Rate limit snapshots to at least 15 seconds to prevent performance bottlenecks
  if (versions.length > 0) {
    const lastVersion = versions[versions.length - 1];
    if (now - lastVersion.timestamp < 15000) {
      return;
    }
  }

  const versionId = `ver_${now}`;
  const newVersion: BoardVersion = {
    id: versionId,
    timestamp: now,
    elementsCount: elements.length,
  };

  versions.push(newVersion);

  // Keep last 15 versions to save storage space
  if (versions.length > 15) {
    const removed = versions.shift();
    if (removed) {
      await del(`board_version_content_${boardId}_${removed.id}`, boardsStore);
    }
  }

  await set(`board_history_${boardId}`, versions, boardsStore);

  // Save the full content of this checkpoint
  await set(
    `board_version_content_${boardId}_${versionId}`,
    { elements, appState, files },
    boardsStore,
  );
}

export async function restoreBoardVersion(
  boardId: string,
  versionId: string,
): Promise<void> {
  const content = await get<{ elements: any[]; appState: any; files: any }>(
    `board_version_content_${boardId}_${versionId}`,
    boardsStore,
  );
  if (content) {
    const currentBoard = await getBoard(boardId);
    if (currentBoard) {
      await saveBoard(
        boardId,
        { name: currentBoard.name },
        content.elements,
        content.appState,
        content.files,
      );
    }
  }
}
