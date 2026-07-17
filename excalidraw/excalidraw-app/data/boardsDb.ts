import { createStore, get, set, del } from "idb-keyval";

export interface BoardMetadata {
  id: string;
  name: string;
  createdAt: number;
  updatedAt: number;
  isCollaboration?: boolean;
  roomId?: string;
  roomKey?: string;
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
  };

  await set(`board_content_${id}`, updatedBoard, boardsStore);

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
