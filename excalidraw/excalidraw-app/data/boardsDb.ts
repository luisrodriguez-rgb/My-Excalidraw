import { createStore, get, set, del } from "idb-keyval";

import { supabase } from "../supabaseClient";

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

  // Trigger remote save to Supabase asynchronously
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      supabase
        .from("boards")
        .upsert({
          id,
          user_id: session.user.id,
          name: updatedBoard.name,
          elements: updatedBoard.elements,
          app_state: updatedBoard.appState,
          files: updatedBoard.files,
          tags: updatedBoard.tags || [],
          folder_id: updatedBoard.folderId || null,
          password: updatedBoard.password || null,
          updated_at: new Date(updatedBoard.updatedAt).toISOString(),
        })
        .catch((err) =>
          console.error("Error upserting remote board to Supabase:", err),
        );
    }
  });

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

  // Trigger remote delete asynchronously
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      supabase
        .from("boards")
        .delete()
        .eq("id", id)
        .catch((err) =>
          console.error("Error deleting remote board from Supabase:", err),
        );
    }
  });
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

  // Sync to remote
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      supabase
        .from("folders")
        .insert({
          id,
          user_id: session.user.id,
          name,
          created_at: new Date(folder.createdAt).toISOString(),
        })
        .catch((err) => console.error("Error creating remote folder:", err));
    }
  });

  return folder;
}

export async function deleteFolder(id: string): Promise<void> {
  const folders = await getFolders();
  const filtered = folders.filter((f) => f.id !== id);
  await saveFolders(filtered);

  // Sync to remote
  supabase.auth.getSession().then(({ data: { session } }) => {
    if (session?.user) {
      supabase
        .from("folders")
        .delete()
        .eq("id", id)
        .catch((err) => console.error("Error deleting remote folder:", err));
    }
  });

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

export interface BoardComment {
  id: string;
  text: string;
  author: string;
  x: number;
  y: number;
  createdAt: number;
  resolved: boolean;
}

export async function getBoardComments(
  boardId: string,
): Promise<BoardComment[]> {
  try {
    const list = await get<BoardComment[]>(
      `board_comments_${boardId}`,
      boardsStore,
    );
    return list || [];
  } catch (error) {
    console.error(`Error reading comments for board ${boardId}:`, error);
    return [];
  }
}

export async function saveBoardComments(
  boardId: string,
  comments: BoardComment[],
): Promise<void> {
  await set(`board_comments_${boardId}`, comments, boardsStore);
}

export async function syncBoardsWithSupabase(): Promise<void> {
  try {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    if (!session?.user) {
      return;
    }

    // 1. Fetch remote folders
    const { data: remoteFolders } = await supabase.from("folders").select("*");
    if (remoteFolders) {
      const localFolders = await getFolders();
      const mergedFolders = [...localFolders];
      let foldersChanged = false;

      remoteFolders.forEach((rf) => {
        if (!mergedFolders.some((lf) => lf.id === rf.id)) {
          mergedFolders.push({
            id: rf.id,
            name: rf.name,
            createdAt: new Date(rf.created_at).getTime(),
          });
          foldersChanged = true;
        }
      });
      if (foldersChanged) {
        await saveFolders(mergedFolders);
      }
    }

    // 2. Fetch remote boards metadata
    const { data: remoteBoards } = await supabase
      .from("boards")
      .select("id, name, created_at, updated_at, tags, folder_id, password");
    if (remoteBoards) {
      const localMetadata = await getBoardsMetadata();
      let changed = false;
      const mergedMetadata = [...localMetadata];

      for (const rb of remoteBoards) {
        const index = mergedMetadata.findIndex((m) => m.id === rb.id);
        const remoteUpdated = new Date(rb.updated_at).getTime();
        const remoteMeta: BoardMetadata = {
          id: rb.id,
          name: rb.name,
          createdAt: new Date(rb.created_at).getTime(),
          updatedAt: remoteUpdated,
          tags: rb.tags || [],
          folderId: rb.folder_id || undefined,
          password: rb.password || undefined,
        };

        if (index === -1) {
          mergedMetadata.push(remoteMeta);
          changed = true;

          // Download board content
          const { data: boardContent } = await supabase
            .from("boards")
            .select("elements, app_state, files")
            .eq("id", rb.id)
            .single();
          if (boardContent) {
            await set(
              `board_content_${rb.id}`,
              {
                id: rb.id,
                name: rb.name,
                createdAt: remoteMeta.createdAt,
                updatedAt: remoteMeta.updatedAt,
                elements: boardContent.elements,
                appState: boardContent.app_state,
                files: boardContent.files,
                tags: remoteMeta.tags,
                folderId: remoteMeta.folderId,
                password: remoteMeta.password,
              },
              boardsStore,
            );
          }
        } else {
          const localMeta = mergedMetadata[index];
          if (remoteUpdated > localMeta.updatedAt) {
            mergedMetadata[index] = remoteMeta;
            changed = true;

            // Redownload newer content
            const { data: boardContent } = await supabase
              .from("boards")
              .select("elements, app_state, files")
              .eq("id", rb.id)
              .single();
            if (boardContent) {
              await set(
                `board_content_${rb.id}`,
                {
                  id: rb.id,
                  name: rb.name,
                  createdAt: remoteMeta.createdAt,
                  updatedAt: remoteMeta.updatedAt,
                  elements: boardContent.elements,
                  appState: boardContent.app_state,
                  files: boardContent.files,
                  tags: remoteMeta.tags,
                  folderId: remoteMeta.folderId,
                  password: remoteMeta.password,
                },
                boardsStore,
              );
            }
          } else if (localMeta.updatedAt > remoteUpdated) {
            // Local is newer, upload local to Supabase
            const content = await getBoard(rb.id);
            if (content) {
              await supabase.from("boards").upsert({
                id: rb.id,
                user_id: session.user.id,
                name: localMeta.name,
                elements: content.elements,
                app_state: content.appState,
                files: content.files,
                tags: localMeta.tags || [],
                folder_id: localMeta.folderId || null,
                password: localMeta.password || null,
                updated_at: new Date(localMeta.updatedAt).toISOString(),
              });
            }
          }
        }
      }

      if (changed) {
        mergedMetadata.sort((a, b) => b.updatedAt - a.updatedAt);
        await saveBoardsMetadata(mergedMetadata);
      }
    }
  } catch (error) {
    console.error("Error during Supabase synchronization:", error);
  }
}
