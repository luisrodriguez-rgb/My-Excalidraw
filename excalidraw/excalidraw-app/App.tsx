import {
  Excalidraw,
  LiveCollaborationTrigger,
  TTDDialogTrigger,
  CaptureUpdateAction,
  reconcileElements,
  useEditorInterface,
  ExcalidrawAPIProvider,
  useExcalidrawAPI,
  exportToCanvas,
} from "@excalidraw/excalidraw";
import { trackEvent } from "@excalidraw/excalidraw/analytics";
import { getDefaultAppState } from "@excalidraw/excalidraw/appState";
import {
  CommandPalette,
  DEFAULT_CATEGORIES,
} from "@excalidraw/excalidraw/components/CommandPalette/CommandPalette";
import { ErrorDialog } from "@excalidraw/excalidraw/components/ErrorDialog";
import { OverwriteConfirmDialog } from "@excalidraw/excalidraw/components/OverwriteConfirm/OverwriteConfirm";
import { openConfirmModal } from "@excalidraw/excalidraw/components/OverwriteConfirm/OverwriteConfirmState";
import { ShareableLinkDialog } from "@excalidraw/excalidraw/components/ShareableLinkDialog";
import Trans from "@excalidraw/excalidraw/components/Trans";
import {
  APP_NAME,
  EVENT,
  VERSION_TIMEOUT,
  debounce,
  getVersion,
  getFrame,
  isTestEnv,
  preventUnload,
  resolvablePromise,
  isRunningInIframe,
  isDevEnv,
} from "@excalidraw/common";
import polyfill from "@excalidraw/excalidraw/polyfill";
import { useCallback, useEffect, useRef, useState } from "react";
import { loadFromBlob } from "@excalidraw/excalidraw/data/blob";
import { t } from "@excalidraw/excalidraw/i18n";
import throttle from "lodash.throttle";

import {
  GithubIcon,
  XBrandIcon,
  DiscordIcon,
  ExcalLogo,
  usersIcon,
  exportToPlus,
  share,
  youtubeIcon,
} from "@excalidraw/excalidraw/components/icons";
import { isElementLink } from "@excalidraw/element";
import {
  bumpElementVersions,
  restoreAppState,
  restoreElements,
} from "@excalidraw/excalidraw/data/restore";
import { newElementWith } from "@excalidraw/element";
import { isInitializedImageElement } from "@excalidraw/element";
import clsx from "clsx";
import {
  parseLibraryTokensFromUrl,
  useHandleLibrary,
} from "@excalidraw/excalidraw/data/library";

import type { RemoteExcalidrawElement } from "@excalidraw/excalidraw/data/reconcile";
import type { RestoredDataState } from "@excalidraw/excalidraw/data/restore";
import type {
  FileId,
  NonDeletedExcalidrawElement,
  OrderedExcalidrawElement,
} from "@excalidraw/element/types";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  ExcalidrawProps,
} from "@excalidraw/excalidraw/types";
import type { ResolutionType } from "@excalidraw/common/utility-types";
import type { ResolvablePromise } from "@excalidraw/common/utils";

import CustomStats from "./CustomStats";
import {
  Provider,
  useAtom,
  useAtomValue,
  useAtomWithInitialValue,
  appJotaiStore,
} from "./app-jotai";
import {
  FIREBASE_STORAGE_PREFIXES,
  isExcalidrawPlusSignedUser,
  STORAGE_KEYS,
  SYNC_BROWSER_TABS_TIMEOUT,
} from "./app_constants";
import Collab, {
  collabAPIAtom,
  isCollaboratingAtom,
  isOfflineAtom,
} from "./collab/Collab";
import { AppFooter } from "./components/AppFooter";
import { AppMainMenu } from "./components/AppMainMenu";
import { AppWelcomeScreen } from "./components/AppWelcomeScreen";
import { exportToExcalidrawPlus } from "./components/ExportToExcalidrawPlus";
import { TopErrorBoundary } from "./components/TopErrorBoundary";

import {
  exportToBackend,
  getCollaborationLinkData,
  importFromBackend,
  isCollaborationLink,
} from "./data";

import { updateStaleImageStatuses } from "./data/FileManager";
import { FileStatusStore } from "./data/fileStatusStore";
import {
  importFromLocalStorage,
  importUsernameFromLocalStorage,
} from "./data/localStorage";

import { loadFilesFromFirebase } from "./data/firebase";
import {
  LibraryIndexedDBAdapter,
  LibraryLocalStorageMigrationAdapter,
  LocalData,
  localStorageQuotaExceededAtom,
} from "./data/LocalData";
import { supabase } from "./data/supabaseClient";
import { isBrowserStorageStateNewer } from "./data/tabSync";
import { ShareDialog, shareDialogStateAtom } from "./share/ShareDialog";
import CollabError, { collabErrorIndicatorAtom } from "./collab/CollabError";
import { useHandleAppTheme } from "./useHandleAppTheme";
import { getPreferredLanguage } from "./app-language/language-detector";
import { useAppLangCode } from "./app-language/language-state";
import DebugCanvas, {
  debugRenderer,
  isVisualDebuggerEnabled,
  loadSavedDebugState,
} from "./components/DebugCanvas";
import { AIComponents } from "./components/AI";
import { ExcalidrawPlusIframeExport } from "./ExcalidrawPlusIframeExport";

import "./index.scss";

import { AppSidebar } from "./components/AppSidebar";
import { Dashboard } from "./components/Dashboard";
import { CollabChat } from "./components/CollabChat";
import { NotificationManager } from "./components/NotificationManager";
import { Minimap } from "./components/Minimap";
import { PresenceBar } from "./components/PresenceBar";
import { AuthModal } from "./components/AuthModal";

import {
  getBoard,
  saveBoard,
  getBoardComments,
  saveBoardComments,
  syncBoardsWithSupabase,
} from "./data/boardsDb";

import type { BoardComment } from "./data/boardsDb";

import type { CollabAPI } from "./collab/Collab";

polyfill();

window.EXCALIDRAW_THROTTLE_RENDER = true;

declare global {
  interface BeforeInstallPromptEventChoiceResult {
    outcome: "accepted" | "dismissed";
  }

  interface BeforeInstallPromptEvent extends Event {
    prompt(): Promise<void>;
    userChoice: Promise<BeforeInstallPromptEventChoiceResult>;
  }

  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent;
  }
}

let pwaEvent: BeforeInstallPromptEvent | null = null;

// Adding a listener outside of the component as it may (?) need to be
// subscribed early to catch the event.
//
// Also note that it will fire only if certain heuristics are met (user has
// used the app for some time, etc.)
window.addEventListener(
  "beforeinstallprompt",
  (event: BeforeInstallPromptEvent) => {
    // prevent Chrome <= 67 from automatically showing the prompt
    event.preventDefault();
    // cache for later use
    pwaEvent = event;
  },
);

let isSelfEmbedding = false;

if (window.self !== window.top) {
  try {
    const parentUrl = new URL(document.referrer);
    const currentUrl = new URL(window.location.href);
    if (parentUrl.origin === currentUrl.origin) {
      isSelfEmbedding = true;
    }
  } catch (error) {
    // ignore
  }
}

const shareableLinkConfirmDialog = {
  title: t("overwriteConfirm.modal.shareableLink.title"),
  description: (
    <Trans
      i18nKey="overwriteConfirm.modal.shareableLink.description"
      bold={(text) => <strong>{text}</strong>}
      br={() => <br />}
    />
  ),
  actionLabel: t("overwriteConfirm.modal.shareableLink.button"),
  color: "danger",
} as const;

const initializeScene = async (opts: {
  collabAPI: CollabAPI | null;
  excalidrawAPI: ExcalidrawImperativeAPI;
  activeBoardId: string | null;
}): Promise<
  { scene: ExcalidrawInitialDataState | null } & (
    | { isExternalScene: true; id: string; key: string }
    | { isExternalScene: false; id?: null; key?: null }
  )
> => {
  const searchParams = new URLSearchParams(window.location.search);
  const id = searchParams.get("id");
  const jsonBackendMatch = window.location.hash.match(
    /^#json=([a-zA-Z0-9_-]+),([a-zA-Z0-9_-]+)$/,
  );
  const externalUrlMatch = window.location.hash.match(/^#url=(.*)$/);

  let localDataState = null;
  if (opts.activeBoardId && opts.activeBoardId !== "collab_room") {
    const board = await getBoard(opts.activeBoardId);
    if (board) {
      localDataState = {
        elements: board.elements,
        appState: {
          ...(board.appState || {}),
          name: board.name,
        },
      };
    }
  }

  if (!localDataState) {
    localDataState = importFromLocalStorage();
  }

  let scene: Omit<
    RestoredDataState,
    // we're not storing files in the scene database/localStorage, and instead
    // fetch them async from a different store
    "files"
  > & {
    scrollToContent?: boolean;
  } = {
    elements: restoreElements(localDataState?.elements, null, {
      repairBindings: true,
      deleteInvisibleElements: true,
    }),
    appState: restoreAppState(localDataState?.appState, null),
  };

  let roomLinkData = getCollaborationLinkData(window.location.href);
  const isExternalScene = !!(id || jsonBackendMatch || roomLinkData);
  if (isExternalScene) {
    if (
      // don't prompt if scene is empty
      !scene.elements.length ||
      // don't prompt for collab scenes because we don't override local storage
      roomLinkData ||
      // otherwise, prompt whether user wants to override current scene
      (await openConfirmModal(shareableLinkConfirmDialog))
    ) {
      if (jsonBackendMatch) {
        const imported = await importFromBackend(
          jsonBackendMatch[1],
          jsonBackendMatch[2],
        );

        scene = {
          elements: bumpElementVersions(
            restoreElements(imported.elements, null, {
              repairBindings: true,
              deleteInvisibleElements: true,
            }),
            localDataState?.elements,
          ),
          appState: restoreAppState(
            imported.appState,
            // local appState when importing from backend to ensure we restore
            // localStorage user settings which we do not persist on server.
            localDataState?.appState,
          ),
        };
      }
      scene.scrollToContent = true;
      if (!roomLinkData) {
        window.history.replaceState({}, APP_NAME, window.location.origin);
      }
    } else {
      // https://github.com/excalidraw/excalidraw/issues/1919
      if (document.hidden) {
        return new Promise((resolve, reject) => {
          window.addEventListener(
            "focus",
            () => initializeScene(opts).then(resolve).catch(reject),
            {
              once: true,
            },
          );
        });
      }

      roomLinkData = null;
      window.history.replaceState({}, APP_NAME, window.location.origin);
    }
  } else if (externalUrlMatch) {
    window.history.replaceState({}, APP_NAME, window.location.origin);

    const url = externalUrlMatch[1];
    try {
      const request = await fetch(window.decodeURIComponent(url));
      const data = await loadFromBlob(await request.blob(), null, null);
      if (
        !scene.elements.length ||
        (await openConfirmModal(shareableLinkConfirmDialog))
      ) {
        return { scene: data, isExternalScene };
      }
    } catch (error: any) {
      return {
        scene: {
          appState: {
            errorMessage: t("alerts.invalidSceneUrl"),
          },
        },
        isExternalScene,
      };
    }
  }

  if (roomLinkData && opts.collabAPI) {
    const { excalidrawAPI } = opts;

    const scene = await opts.collabAPI.startCollaboration(roomLinkData);

    return {
      // when collaborating, the state may have already been updated at this
      // point (we may have received updates from other clients), so reconcile
      // elements and appState with existing state
      scene: {
        ...scene,
        appState: {
          ...restoreAppState(
            {
              ...scene?.appState,
              theme: localDataState?.appState?.theme || scene?.appState?.theme,
            },
            excalidrawAPI.getAppState(),
          ),
          // necessary if we're invoking from a hashchange handler which doesn't
          // go through App.initializeScene() that resets this flag
          isLoading: false,
        },
        elements: reconcileElements(
          scene?.elements || [],
          excalidrawAPI.getSceneElementsIncludingDeleted() as RemoteExcalidrawElement[],
          excalidrawAPI.getAppState(),
        ),
      },
      isExternalScene: true,
      id: roomLinkData.roomId,
      key: roomLinkData.roomKey,
    };
  } else if (scene) {
    return isExternalScene && jsonBackendMatch
      ? {
          scene,
          isExternalScene,
          id: jsonBackendMatch[1],
          key: jsonBackendMatch[2],
        }
      : { scene, isExternalScene: false };
  }
  return { scene: null, isExternalScene: false };
};

/** Generates a stable, visually-distinct color from a username string */
const usernameToColor = (username: string): string => {
  const PALETTE = [
    "#e03131", "#c2255c", "#9c36b5", "#3b5bdb", "#1971c2",
    "#0c8599", "#2f9e44", "#e67700", "#d9480f", "#5c7cfa",
    "#f03e3e", "#ae3ec9", "#4c6ef5", "#1c7ed6", "#12b886",
    "#40c057", "#fab005", "#fd7e14", "#7950f2", "#e64980",
  ];
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
    hash = hash & hash;
  }
  return PALETTE[Math.abs(hash) % PALETTE.length];
};

const ExcalidrawWrapper = () => {

  const excalidrawAPI = useExcalidrawAPI();

  const [errorMessage, setErrorMessage] = useState("");
  const isCollabDisabled = isRunningInIframe();

  const { editorTheme, appTheme, setAppTheme } = useHandleAppTheme();

  const [langCode, setLangCode] = useAppLangCode();

  const editorInterface = useEditorInterface();

  // Workspace Dashboard states
  const [activeBoardId, setActiveBoardId] = useState<string | null>(() => {
    return isCollaborationLink(window.location.href) ? "collab_room" : null;
  });
  const [activeBoardName, setActiveBoardName] = useState("");
  const presenceChannelRef = useRef<any>(null);
  const broadcastChannelRef = useRef<any>(null);
  const lastUsernameRef = useRef<string>("Usuario");
  const lastBroadcastElementsRef = useRef<string>("");
  const [presenceUsers, setPresenceUsers] = useState<
    Array<{ username: string; color: string }>
  >([]);
  const [userSession, setUserSession] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // initial state
  // ---------------------------------------------------------------------------

  const initialStatePromiseRef = useRef<{
    promise: ResolvablePromise<ExcalidrawInitialDataState | null>;
  }>({ promise: null! });
  if (!initialStatePromiseRef.current.promise) {
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const prevActiveBoardIdRef = useRef<string | null>(activeBoardId);
  if (prevActiveBoardIdRef.current !== activeBoardId) {
    prevActiveBoardIdRef.current = activeBoardId;
    initialStatePromiseRef.current.promise =
      resolvablePromise<ExcalidrawInitialDataState | null>();
  }

  const debugCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    trackEvent("load", "frame", getFrame());
    // Delayed so that the app has a time to load the latest SW
    setTimeout(() => {
      trackEvent("load", "version", getVersion());
    }, VERSION_TIMEOUT);
  }, []);

  const [, setShareDialogState] = useAtom(shareDialogStateAtom);
  const [collabAPI] = useAtom(collabAPIAtom);
  const [isCollaborating] = useAtomWithInitialValue(isCollaboratingAtom, () => {
    return isCollaborationLink(window.location.href);
  });
  const collabError = useAtomValue(collabErrorIndicatorAtom);

  useHandleLibrary({
    excalidrawAPI,
    adapter: LibraryIndexedDBAdapter,
    // TODO maybe remove this in several months (shipped: 24-03-11)
    migrationAdapter: LibraryLocalStorageMigrationAdapter,
  });

  const [, forceRefresh] = useState(false);

  const [comments, setComments] = useState<BoardComment[]>([]);
  const [commentModeActive, setCommentModeActive] = useState(false);
  const [activeCommentPopupId, setActiveCommentPopupId] = useState<
    string | null
  >(null);
  const [showAddCommentModal, setShowAddCommentModal] = useState(false);
  const [newCommentCoords, setNewCommentCoords] = useState<{
    x: number;
    y: number;
  } | null>(null);
  const [newCommentText, setNewCommentText] = useState("");
  const [newCommentAuthor, setNewCommentAuthor] = useState("");
  const [replyText, setReplyText] = useState("");
  const minimapElementsRef = useRef<readonly any[]>([]);
  const minimapAppStateRef = useRef<any>(null);
  const [minimapTick, setMinimapTick] = useState(0);
  // Throttle minimap updates to at most once per 200ms to avoid re-renders every frame
  const throttledMinimapRefresh = useRef(
    debounce(() => setMinimapTick((t) => t + 1), 200),
  ).current;

  useEffect(() => {
    if (!excalidrawAPI) {
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserSession(session);
      if (session?.user?.email) {
        const namePart = session.user.email.split("@")[0];
        const displayName =
          namePart.charAt(0).toUpperCase() + namePart.slice(1);
        localStorage.setItem("comment-author", displayName);
        setNewCommentAuthor(displayName);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setUserSession(session);
      if (session?.user) {
        if (session.user.email) {
          const namePart = session.user.email.split("@")[0];
          const displayName =
            namePart.charAt(0).toUpperCase() + namePart.slice(1);
          localStorage.setItem("comment-author", displayName);
          setNewCommentAuthor(displayName);
        }
        try {
          const { data: remoteLib } = await supabase
            .from("libraries")
            .select("items")
            .maybeSingle();

          if (remoteLib?.items) {
            await LibraryIndexedDBAdapter.save(remoteLib.items);
            excalidrawAPI.updateLibrary({
              libraryItems: remoteLib.items.libraryItems || [],
              merge: false,
            });
          }
        } catch (err) {
          console.error("Error loading remote library from Supabase:", err);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [excalidrawAPI]);

  const lastLocalSaveTimeRef = useRef<number>(0);

  // ---------------------------------------------------------------------------
  // Supabase Realtime: sync canvas & live cursors in real time for workspaces
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!excalidrawAPI || !activeBoardId || activeBoardId === "collab_room") {
      return;
    }

    const socketId = `user_${Math.random().toString(36).substring(2, 9)}`;
    const currentUser =
      localStorage.getItem("comment-author") || newCommentAuthor || "Usuario";
    const collaboratorsMap = new Map();
    let isSubscribed = false;

    // Generate a deterministic color for this user (same color every session)
    const userColor = usernameToColor(currentUser);
    let isBroadcastSubscribed = false;

    // 1. Broadcast channel — receives canvas changes from other users instantly
    //    (replaces postgres_changes which is blocked by RLS for non-owners)
    const broadcastChannel = supabase.channel(
      `board-canvas-${activeBoardId}`,
    );
    broadcastChannelRef.current = broadcastChannel;

    broadcastChannel
      .on("broadcast", { event: "canvas" }, ({ payload }) => {
        if (payload && payload.senderId !== socketId) {
          const now = Date.now();
          // Skip if we ourselves just saved (avoid echo)
          if (now - lastLocalSaveTimeRef.current > 500) {
            const elements = restoreElements(payload.elements, null);
            excalidrawAPI.updateScene({
              elements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
            if (payload.files && Object.keys(payload.files).length > 0) {
              excalidrawAPI.addFiles(Object.values(payload.files));
            }
          }
        }
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED") {
          isBroadcastSubscribed = true;
        }
      });

    // Expose subscription state and socketId so onChange can check it
    (broadcastChannelRef.current as any).__subscribed = () => isBroadcastSubscribed;
    (broadcastChannelRef.current as any).__socketId = socketId;

    // 2. Presence & Live Cursor Broadcast Channel
    const presenceChannel = supabase.channel(
      `board-presence-${activeBoardId}`,
      {
        config: {
          presence: {
            key: socketId,
          },
        },
      },
    );
    presenceChannelRef.current = presenceChannel;

    // Ask for Notification permission
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        const collaborators = new Map();
        // Build online users list for PresenceBar
        const online: Array<{ username: string; color: string }> = [];
        Object.keys(state).forEach((key) => {
          const presences = state[key] as any[];
          if (presences.length > 0) {
            const p = presences[0];
            const uColor = usernameToColor(p.username || "Usuario");
            online.push({ username: p.username || "Usuario", color: uColor });
            if (key !== socketId) {
              collaborators.set(key, {
                username: p.username || "Usuario",
                isCurrentUser: false,
                pointer: p.pointer || { x: 0, y: 0 },
                color: { background: uColor, stroke: uColor },
              });
            }
          }
        });
        setPresenceUsers(online);
        excalidrawAPI.updateScene({ collaborators });
      })
      .on("presence", { event: "join" }, ({ key, newPresences }) => {
        if (key !== socketId && newPresences.length > 0) {
          const user = newPresences[0].username || "Alguien";
          excalidrawAPI.setToast({ message: `👋 ${user} se unió a la sala`, duration: 3000 });
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Nueva conexión", { body: `${user} se unió a la sala colaborativa.` });
          }
        }
      })
      .on("presence", { event: "leave" }, ({ key, leftPresences }) => {
        if (key !== socketId && leftPresences.length > 0) {
          const user = leftPresences[0].username || "Alguien";
          excalidrawAPI.setToast({ message: `👋 ${user} abandonó la sala`, duration: 3000 });
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("Desconexión", { body: `${user} abandonó la sala colaborativa.` });
          }
        }
      })
      .on("broadcast", { event: "pointer" }, ({ payload }) => {
        if (payload && payload.socketId !== socketId) {
          const uColor = usernameToColor(payload.username || "Usuario");
          collaboratorsMap.set(payload.socketId, {
            username: payload.username || "Usuario",
            isCurrentUser: false,
            pointer: payload.pointer,
            button: "up" as const,
            selectedElementIds: {},
            color: { background: uColor, stroke: uColor },
          });
          excalidrawAPI.updateScene({
            collaborators: new Map(collaboratorsMap),
          });
        }
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          isSubscribed = true;
          await presenceChannel.track({
            username: currentUser,
            onlineAt: new Date().toISOString(),
          });
        }
      });

    const handlePointerMove = throttle((e: MouseEvent) => {
      if (!isSubscribed) return;
      const appState = excalidrawAPI.getAppState();
      const sceneX =
        (e.clientX - appState.offsetLeft) / appState.zoom.value -
        appState.scrollX;
      const sceneY =
        (e.clientY - appState.offsetTop) / appState.zoom.value -
        appState.scrollY;

      presenceChannel.send({
        type: "broadcast",
        event: "pointer",
        payload: {
          socketId,
          username: currentUser,
          pointer: { x: sceneX, y: sceneY },
        },
      });
    }, 120);

    window.addEventListener("pointermove", handlePointerMove);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      supabase.removeChannel(broadcastChannel);
      supabase.removeChannel(presenceChannel);
    };
  }, [excalidrawAPI, activeBoardId, newCommentAuthor]);

  useEffect(() => {
    if (isDevEnv()) {
      const debugState = loadSavedDebugState();

      if (debugState.enabled && !window.visualDebug) {
        window.visualDebug = {
          data: [],
        };
      } else {
        delete window.visualDebug;
      }
      forceRefresh((prev) => !prev);
    }
  }, [excalidrawAPI]);

  // ---------------------------------------------------------------------------
  // Sync Comment Pins position without React re-render lag
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!excalidrawAPI) return;

    const unsub = excalidrawAPI.onScrollChange(() => {
      const appState = excalidrawAPI.getAppState();
      const pins = document.querySelectorAll(".comment-pin, .comment-popup");
      pins.forEach((pin: any) => {
        const originalX = parseFloat(pin.dataset.x);
        const originalY = parseFloat(pin.dataset.y);
        if (!isNaN(originalX) && !isNaN(originalY)) {
          const viewportX = (originalX + appState.scrollX) * appState.zoom.value + appState.offsetLeft;
          const viewportY = (originalY + appState.scrollY) * appState.zoom.value + appState.offsetTop;
          pin.style.left = `${viewportX}px`;
          
          if (pin.classList.contains("comment-popup")) {
            pin.style.top = `${viewportY - 10}px`;
          } else {
            pin.style.top = `${viewportY}px`;
          }
        }
      });
    });

    return () => unsub();
  }, [excalidrawAPI]);

  // ---------------------------------------------------------------------------
  // Hoisted loadImages
  // ---------------------------------------------------------------------------
  const loadImages = useCallback(
    (data: ResolutionType<typeof initializeScene>, isInitialLoad = false) => {
      if (!data.scene || !excalidrawAPI) {
        return;
      }

      if (collabAPI?.isCollaborating()) {
        if (data.scene.elements) {
          collabAPI
            .fetchImageFilesFromFirebase({
              elements: data.scene.elements,
              forceFetchFiles: true,
            })
            .then(({ loadedFiles, erroredFiles }) => {
              excalidrawAPI.addFiles(loadedFiles);
              updateStaleImageStatuses({
                excalidrawAPI,
                erroredFiles,
                elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
              });
            });
        }
      } else {
        const fileIds =
          data.scene.elements?.reduce((acc, element) => {
            if (isInitializedImageElement(element)) {
              return acc.concat(element.fileId);
            }
            return acc;
          }, [] as FileId[]) || [];

        if (data.isExternalScene) {
          if (fileIds.length) {
            // Direct Firebase call (not through FileManager), so track manually
            FileStatusStore.updateStatuses(
              fileIds.map((id) => [id, "loading"]),
            );
          }
          loadFilesFromFirebase(
            `${FIREBASE_STORAGE_PREFIXES.shareLinkFiles}/${data.id}`,
            data.key,
            fileIds,
          ).then(({ loadedFiles, erroredFiles }) => {
            excalidrawAPI.addFiles(loadedFiles);
            updateStaleImageStatuses({
              excalidrawAPI,
              erroredFiles,
              elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
            });
            FileStatusStore.updateStatuses([
              ...loadedFiles.map((f) => [f.id, "loaded"] as [FileId, "loaded"]),
              ...[...erroredFiles.keys()].map(
                (id) => [id, "error"] as [FileId, "error"],
              ),
            ]);
          });
        } else if (isInitialLoad) {
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(async ({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
          // on fresh load, clear unused files from IDB (from previous
          // session)
          LocalData.fileStorage.clearObsoleteFiles({
            currentFileIds: fileIds,
          });
        }
      }
    },
    [collabAPI, excalidrawAPI],
  );

  useEffect(() => {
    if (activeBoardId) {
      getBoardComments(activeBoardId).then((list) => {
        setComments(list);
      });
    } else {
      setComments([]);
    }
    setCommentModeActive(false);
    setActiveCommentPopupId(null);
  }, [activeBoardId]);

  useEffect(() => {
    const handleCollabCreate = (e: any) => {
      const newComment = e.detail;
      setComments((prev) => {
        const index = prev.findIndex((c) => c.id === newComment.id);
        if (index > -1) {
          const updated = [...prev];
          updated[index] = newComment;
          return updated;
        }
        return [...prev, newComment];
      });
    };

    const handleCollabResolve = (e: any) => {
      const id = e.detail;
      setComments((prev) => prev.filter((c) => c.id !== id));
    };

    window.addEventListener("collab-comment-create" as any, handleCollabCreate);
    window.addEventListener(
      "collab-comment-resolve" as any,
      handleCollabResolve,
    );

    return () => {
      window.removeEventListener(
        "collab-comment-create" as any,
        handleCollabCreate,
      );
      window.removeEventListener(
        "collab-comment-resolve" as any,
        handleCollabResolve,
      );
    };
  }, [collabAPI]);

  const handleResolveComment = async (commentId: string) => {
    const updated = comments.filter((c) => c.id !== commentId);
    setComments(updated);
    if (activeBoardId) {
      await saveBoardComments(activeBoardId, updated);
    }
    setActiveCommentPopupId(null);
    if (collabAPI && collabAPI.sendCommentResolve) {
      collabAPI.sendCommentResolve(commentId);
    }
  };

  const handleReplyComment = async (commentId: string) => {
    if (!replyText.trim() || !activeBoardId) {
      return;
    }
    const author =
      collabAPI?.getUsername() ||
      localStorage.getItem("comment-author") ||
      "Anónimo";

    const newReply = {
      id: `reply_${Math.random().toString(36).substr(2, 9)}`,
      author,
      text: replyText.trim(),
      createdAt: Date.now(),
    };

    const targetComment = comments.find((c) => c.id === commentId);
    if (!targetComment) {
      return;
    }

    const updatedComment = {
      ...targetComment,
      replies: [...(targetComment.replies || []), newReply],
    };

    const updated = comments.map((c) => {
      if (c.id === commentId) {
        return updatedComment;
      }
      return c;
    });

    setComments(updated);
    await saveBoardComments(activeBoardId, updated);
    setReplyText("");

    if (collabAPI && collabAPI.sendCommentCreate) {
      collabAPI.sendCommentCreate(updatedComment);
    }
  };

  const handleCreateCommentConfirm = async () => {
    if (newCommentText.trim() && newCommentCoords && activeBoardId) {
      const author = newCommentAuthor.trim() || "Anónimo";
      localStorage.setItem("comment-author", author);

      const newComment: BoardComment = {
        id: `comment_${Math.random().toString(36).substr(2, 9)}`,
        text: newCommentText.trim(),
        author,
        x: newCommentCoords.x,
        y: newCommentCoords.y,
        createdAt: Date.now(),
        resolved: false,
      };

      const updated = [...comments, newComment];
      setComments(updated);
      await saveBoardComments(activeBoardId, updated);
      setShowAddCommentModal(false);
      setNewCommentCoords(null);
      setNewCommentText("");

      if (collabAPI && collabAPI.sendCommentCreate) {
        collabAPI.sendCommentCreate(newComment);
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (!excalidrawAPI) {
      return;
    }

    const clientX = e.clientX;
    const clientY = e.clientY;

    const appState = excalidrawAPI.getAppState();
    const zoom = appState.zoom.value;
    const scrollX = appState.scrollX;
    const scrollY = appState.scrollY;

    const x = clientX / zoom - scrollX;
    const y = clientY / zoom - scrollY;

    setNewCommentCoords({ x, y });
    setNewCommentText("");
    setNewCommentAuthor(
      collabAPI?.getUsername() || localStorage.getItem("comment-author") || "",
    );
    setShowAddCommentModal(true);
    setCommentModeActive(false);
  };

  useEffect(() => {
    if (!excalidrawAPI || (!isCollabDisabled && !collabAPI)) {
      return;
    }

    initializeScene({ collabAPI, excalidrawAPI, activeBoardId }).then(
      async (data) => {
        loadImages(data, /* isInitialLoad */ true);
        if (activeBoardId && activeBoardId !== "collab_room") {
          getBoard(activeBoardId).then((board) => {
            if (board?.files) {
              excalidrawAPI.addFiles(Object.values(board.files));
            }
          });
        }
        initialStatePromiseRef.current.promise.resolve(data.scene);
      },
    );

    const onHashChange = async (event: HashChangeEvent) => {
      event.preventDefault();
      const libraryUrlTokens = parseLibraryTokensFromUrl();
      if (!libraryUrlTokens) {
        if (
          collabAPI?.isCollaborating() &&
          !isCollaborationLink(window.location.href)
        ) {
          collabAPI.stopCollaboration(false);
        }
        excalidrawAPI.updateScene({ appState: { isLoading: true } });

        initializeScene({ collabAPI, excalidrawAPI, activeBoardId }).then(
          async (data) => {
            loadImages(data);
            if (activeBoardId && activeBoardId !== "collab_room") {
              const board = await getBoard(activeBoardId);
              if (board?.files) {
                excalidrawAPI.addFiles(Object.values(board.files));
              }
            }
            if (data.scene) {
              excalidrawAPI.updateScene({
                elements: restoreElements(data.scene.elements, null, {
                  repairBindings: true,
                }),
                appState: restoreAppState(data.scene.appState, null),
                captureUpdate: CaptureUpdateAction.IMMEDIATELY,
              });
            }
          },
        );
      }
    };

    const syncData = debounce(() => {
      if (isTestEnv()) {
        return;
      }
      if (
        !document.hidden &&
        ((collabAPI && !collabAPI.isCollaborating()) || isCollabDisabled)
      ) {
        // don't sync if local state is newer or identical to browser state
        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_DATA_STATE)) {
          const localDataState = importFromLocalStorage();
          const username = importUsernameFromLocalStorage();
          setLangCode(getPreferredLanguage());
          excalidrawAPI.updateScene({
            ...localDataState,
            captureUpdate: CaptureUpdateAction.NEVER,
          });
          LibraryIndexedDBAdapter.load().then((data) => {
            if (data) {
              excalidrawAPI.updateLibrary({
                libraryItems: data.libraryItems,
              });
            }
          });
          collabAPI?.setUsername(username || "");
        }

        if (isBrowserStorageStateNewer(STORAGE_KEYS.VERSION_FILES)) {
          const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
          const currFiles = excalidrawAPI.getFiles();
          const fileIds =
            elements?.reduce((acc, element) => {
              if (
                isInitializedImageElement(element) &&
                // only load and update images that aren't already loaded
                !currFiles[element.fileId]
              ) {
                return acc.concat(element.fileId);
              }
              return acc;
            }, [] as FileId[]) || [];
          if (fileIds.length) {
            LocalData.fileStorage
              .getFiles(fileIds)
              .then(({ loadedFiles, erroredFiles }) => {
                if (loadedFiles.length) {
                  excalidrawAPI.addFiles(loadedFiles);
                }
                updateStaleImageStatuses({
                  excalidrawAPI,
                  erroredFiles,
                  elements: excalidrawAPI.getSceneElementsIncludingDeleted(),
                });
              });
          }
        }
      }
    }, SYNC_BROWSER_TABS_TIMEOUT);

    const onUnload = () => {
      LocalData.flushSave();
    };

    const visibilityChange = (event: FocusEvent | Event) => {
      if (event.type === EVENT.BLUR || document.hidden) {
        LocalData.flushSave();
      }
      if (
        event.type === EVENT.VISIBILITY_CHANGE ||
        event.type === EVENT.FOCUS
      ) {
        syncData();
      }
    };

    window.addEventListener(EVENT.HASHCHANGE, onHashChange, false);
    window.addEventListener(EVENT.UNLOAD, onUnload, false);
    window.addEventListener(EVENT.BLUR, visibilityChange, false);
    document.addEventListener(EVENT.VISIBILITY_CHANGE, visibilityChange, false);
    window.addEventListener(EVENT.FOCUS, visibilityChange, false);
    return () => {
      window.removeEventListener(EVENT.HASHCHANGE, onHashChange, false);
      window.removeEventListener(EVENT.UNLOAD, onUnload, false);
      window.removeEventListener(EVENT.BLUR, visibilityChange, false);
      window.removeEventListener(EVENT.FOCUS, visibilityChange, false);
      document.removeEventListener(
        EVENT.VISIBILITY_CHANGE,
        visibilityChange,
        false,
      );
    };
  }, [
    isCollabDisabled,
    collabAPI,
    excalidrawAPI,
    setLangCode,
    loadImages,
    activeBoardId,
  ]);

  useEffect(() => {
    const unloadHandler = (event: BeforeUnloadEvent) => {
      LocalData.flushSave();

      if (
        excalidrawAPI &&
        LocalData.fileStorage.shouldPreventUnload(
          excalidrawAPI.getSceneElements(),
        )
      ) {
        if (import.meta.env.VITE_APP_DISABLE_PREVENT_UNLOAD !== "true") {
          preventUnload(event);
        } else {
          console.warn(
            "preventing unload disabled (VITE_APP_DISABLE_PREVENT_UNLOAD)",
          );
        }
      }
    };
    window.addEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    return () => {
      window.removeEventListener(EVENT.BEFORE_UNLOAD, unloadHandler);
    };
  }, [excalidrawAPI]);

  // Debounced board save - only writes to DB after 1.5s of inactivity
  const debouncedSaveBoard = useRef(
    debounce(
      (
        boardId: string,
        boardName: string,
        els: readonly OrderedExcalidrawElement[],
        state: AppState,
        fs: BinaryFiles,
      ) => {
        lastLocalSaveTimeRef.current = Date.now();
        saveBoard(boardId, { name: boardName }, els, state, fs);
      },
      1500,
    ),
  ).current;

  const onChange = (
    elements: readonly OrderedExcalidrawElement[],
    appState: AppState,
    files: BinaryFiles,
  ) => {
    // Update refs without triggering React re-renders on every frame
    minimapElementsRef.current = elements;
    minimapAppStateRef.current = appState;
    throttledMinimapRefresh();

    // Sync username changes to realtime presence
    const currentUsername = collabAPI?.getUsername();
    if (currentUsername && currentUsername !== lastUsernameRef.current) {
      lastUsernameRef.current = currentUsername;
      localStorage.setItem("comment-author", currentUsername); // Fallback memory
      if (presenceChannelRef.current) {
        presenceChannelRef.current.track({
          username: currentUsername,
          onlineAt: new Date().toISOString(),
        });
      }
    }

    if (collabAPI?.isCollaborating()) {
      collabAPI.syncElements(elements);
    }

    if (activeBoardId && activeBoardId !== "collab_room") {
      const boardName = activeBoardName || appState.name || "Workspace";
      // Debounced: write to IndexedDB/Supabase only after user pauses 1.5s
      debouncedSaveBoard(activeBoardId, boardName, elements, appState, files);

      // Instant broadcast for real-time collaboration (bypasses RLS)
      if (
        broadcastChannelRef.current &&
        typeof broadcastChannelRef.current.__subscribed === "function" &&
        broadcastChannelRef.current.__subscribed()
      ) {
        const elementsJson = JSON.stringify(elements.map((el) => el.id));
        if (elementsJson !== lastBroadcastElementsRef.current) {
          lastBroadcastElementsRef.current = elementsJson;
          // Use httpSend to avoid REST fallback warnings
          broadcastChannelRef.current.send({
            type: "broadcast",
            event: "canvas",
            payload: {
              senderId: (broadcastChannelRef.current as any).__socketId ?? "anon",
              elements,
              files,
            },
          });
        }
      }
    }

    // this check is redundant, but since this is a hot path, it's best
    // not to evaludate the nested expression every time
    if (!LocalData.isSavePaused()) {
      LocalData.save(elements, appState, files, () => {
        if (excalidrawAPI) {
          let didChange = false;

          const elements = excalidrawAPI
            .getSceneElementsIncludingDeleted()
            .map((element) => {
              if (
                LocalData.fileStorage.shouldUpdateImageElementStatus(element)
              ) {
                const newElement = newElementWith(element, { status: "saved" });
                if (newElement !== element) {
                  didChange = true;
                }
                return newElement;
              }
              return element;
            });

          if (didChange) {
            excalidrawAPI.updateScene({
              elements,
              captureUpdate: CaptureUpdateAction.NEVER,
            });
          }
        }
      });
    }

    // Render the debug scene if the debug canvas is available
    if (debugCanvasRef.current && excalidrawAPI) {
      debugRenderer(
        debugCanvasRef.current,
        appState,
        elements,
        window.devicePixelRatio,
      );
    }
  };

  const [latestShareableLink, setLatestShareableLink] = useState<string | null>(
    null,
  );

  const onExportToBackend = async (
    exportedElements: readonly NonDeletedExcalidrawElement[],
    appState: Partial<AppState>,
    files: BinaryFiles,
  ) => {
    if (exportedElements.length === 0) {
      throw new Error(t("alerts.cannotExportEmptyCanvas"));
    }
    try {
      const { url, errorMessage } = await exportToBackend(
        exportedElements,
        {
          ...appState,
          viewBackgroundColor: appState.exportBackground
            ? appState.viewBackgroundColor
            : getDefaultAppState().viewBackgroundColor,
        },
        files,
      );

      if (errorMessage) {
        throw new Error(errorMessage);
      }

      if (url) {
        setLatestShareableLink(url);
      }
    } catch (error: any) {
      if (error.name !== "AbortError") {
        const { width, height } = appState;
        console.error(error, {
          width,
          height,
          devicePixelRatio: window.devicePixelRatio,
        });
        throw new Error(error.message);
      }
    }
  };

  const renderCustomStats = (
    elements: readonly NonDeletedExcalidrawElement[],
    appState: UIAppState,
  ) => {
    return (
      <CustomStats
        setToast={(message) => excalidrawAPI!.setToast({ message })}
        appState={appState}
        elements={elements}
      />
    );
  };

  const isOffline = useAtomValue(isOfflineAtom);

  const handleAITextSubmit = useCallback(
    async (props: {
      messages: { role: string; content: string }[];
      onStreamCreated: () => void;
      onChunk: (chunk: string) => void;
      signal?: AbortController["signal"];
    }) => {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        return {
          error: new Error(
            "API Key de Gemini no configurada. Por favor, añade VITE_GEMINI_API_KEY en tu archivo .env.",
          ),
        };
      }

      try {
        const systemInstruction =
          "Eres un experto en diagramación. Tu tarea es generar código Mermaid válido basado en la descripción del usuario. " +
          "Reglas importantes:\n" +
          "1. Retorna SOLAMENTE código Mermaid válido.\n" +
          "2. NO envuelvas tu respuesta con explicaciones, textos de introducción/conclusión ni marcas de bloque de código como ```mermaid. Retorna el texto plano directo de Mermaid.\n" +
          "3. Si el usuario te pide modificaciones, adapta el diagrama Mermaid existente.";

        const formattedPrompt = `${systemInstruction}\n\nHistorial y petición:\n${props.messages
          .map(
            (m) =>
              `${m.role === "user" ? "Usuario" : "Asistente"}: ${m.content}`,
          )
          .join("\n")}\n\nAsistente:`;

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:streamGenerateContent?key=${apiKey}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [{ text: formattedPrompt }],
                },
              ],
            }),
            signal: props.signal,
          },
        );

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(
            errData.error?.message || `HTTP error! status: ${response.status}`,
          );
        }

        props.onStreamCreated();

        const reader = response.body?.getReader();
        const decoder = new TextDecoder("utf-8");
        let done = false;
        let buffer = "";
        let fullResponse = "";
        let accumulatedText = "";

        while (!done && reader) {
          const { value, done: readerDone } = await reader.read();
          done = readerDone;
          if (value) {
            buffer += decoder.decode(value, { stream: true });

            let currentText = "";
            let match;
            const regex = /"text"\s*:\s*"((?:[^"\\]|\\.)*)"/g;
            while ((match = regex.exec(buffer)) !== null) {
              try {
                currentText += JSON.parse(`"${match[1]}"`);
              } catch (e) {}
            }

            if (currentText.length > accumulatedText.length) {
              const delta = currentText.substring(accumulatedText.length);
              accumulatedText = currentText;
              props.onChunk(delta);
              fullResponse = currentText;
            }
          }
        }

        let cleaned = fullResponse.trim();
        if (cleaned.startsWith("```")) {
          cleaned = cleaned.replace(/^```[a-zA-Z]*\n/, "");
        }
        if (cleaned.endsWith("```")) {
          cleaned = cleaned.substring(0, cleaned.length - 3);
        }
        cleaned = cleaned.trim();

        return {
          generatedResponse: cleaned,
          rateLimit: 100,
          rateLimitRemaining: 99,
        };
      } catch (err: any) {
        return {
          error: err,
        };
      }
    },
    [],
  );

  const handleExportToPPTX = useCallback(async () => {
    if (!excalidrawAPI) {
      return;
    }

    try {
      excalidrawAPI.setToast({ message: "Preparando exportación a PPTX..." });

      const { default: pptxgen } = await import("pptxgenjs");
      const pres = new pptxgen();
      pres.layout = "LAYOUT_16x9";

      const elements = excalidrawAPI.getSceneElements();
      const appState = excalidrawAPI.getAppState();
      const files = excalidrawAPI.getFiles();

      const frames = elements.filter(
        (el) => el.type === "frame" && !el.isDeleted,
      );

      if (frames.length > 0) {
        const sortedFrames = [...frames].sort((a, b) => a.x - b.x);

        for (const frame of sortedFrames) {
          const frameElements = elements.filter(
            (el) =>
              (el.frameId === frame.id || el.id === frame.id) && !el.isDeleted,
          );

          const canvas = await exportToCanvas({
            elements: frameElements,
            appState: { ...appState, exportBackground: true },
            files,
          });

          const slide = pres.addSlide();

          if ((frame as any).name) {
            slide.addText((frame as any).name, {
              x: 0.5,
              y: 0.2,
              w: "90%",
              h: 0.5,
              fontSize: 20,
              bold: true,
              color: appState.theme === "dark" ? "FFFFFF" : "333333",
            });
          }

          const dataUrl = canvas.toDataURL("image/png");
          slide.addImage({
            data: dataUrl,
            x: 0.5,
            y: 0.8,
            w: 9.0,
            h: 5.0,
            sizing: { type: "contain", w: 9.0, h: 5.0 },
          });
        }
      } else {
        const canvas = await exportToCanvas({
          elements: elements.filter((el) => !el.isDeleted),
          appState: { ...appState, exportBackground: true },
          files,
        });

        const slide = pres.addSlide();
        const dataUrl = canvas.toDataURL("image/png");
        slide.addImage({
          data: dataUrl,
          x: 0.5,
          y: 0.5,
          w: 9.0,
          h: 4.625,
          sizing: { type: "contain", w: 9.0, h: 4.625 },
        });
      }

      const boardName = excalidrawAPI.getName() || "presentacion";
      await pres.writeFile({ fileName: `${boardName}.pptx` });
      excalidrawAPI.setToast({ message: "¡Exportación a PPTX completada!" });
    } catch (error: any) {
      console.error("Error exporting to PPTX:", error);
      excalidrawAPI.setToast({
        message: `Error al exportar a PPTX: ${error.message}`,
      });
    }
  }, [excalidrawAPI]);

  const localStorageQuotaExceeded = useAtomValue(localStorageQuotaExceededAtom);

  const onCollabDialogOpen = useCallback(
    () => setShareDialogState({ isOpen: true, type: "collaborationOnly" }),
    [setShareDialogState],
  );

  // ---------------------------------------------------------------------------
  // onExport — intercepts file save to wait for pending image loads
  // ---------------------------------------------------------------------------
  const onExport: Required<ExcalidrawProps>["onExport"] = useCallback(
    async function* () {
      let snapshot = FileStatusStore.getSnapshot();
      const { pending, total } = FileStatusStore.getPendingCount(
        snapshot.value,
      );
      if (pending === 0) {
        return;
      }

      // Yield initial progress
      yield {
        type: "progress",
        progress: (total - pending) / total,
        message: `Loading images (${total - pending}/${total})...`,
      };

      // Wait for all pending images to finish
      while (true) {
        snapshot = await FileStatusStore.pull(snapshot.version);
        const { pending: nowPending, total: nowTotal } =
          FileStatusStore.getPendingCount(snapshot.value);

        yield {
          type: "progress",
          progress: (nowTotal - nowPending) / nowTotal,
          message: `Loading images (${nowTotal - nowPending}/${nowTotal})...`,
        };

        if (nowPending === 0) {
          await new Promise((r) => setTimeout(r, 500));
          yield {
            type: "progress",
            message: `Preparing export...`,
          };
          return;
        }
      }
    },
    [],
  );

  // const onExport = () => {
  //   return new Promise((r) => setTimeout(r, 2500));
  //   // console.log("onExport");
  // };

  // browsers generally prevent infinite self-embedding, there are
  // cases where it still happens, and while we disallow self-embedding
  // by not whitelisting our own origin, this serves as an additional guard
  if (isSelfEmbedding) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          height: "100%",
        }}
      >
        <h1>I'm not a pretzel!</h1>
      </div>
    );
  }

  const ExcalidrawPlusCommand = {
    label: "Excalidraw+",
    category: DEFAULT_CATEGORIES.links,
    predicate: true,
    icon: <div style={{ width: 14 }}>{ExcalLogo}</div>,
    keywords: ["plus", "cloud", "server"],
    perform: () => {
      window.open(
        `${
          import.meta.env.VITE_APP_PLUS_LP
        }/plus?utm_source=excalidraw&utm_medium=app&utm_content=command_palette`,
        "_blank",
      );
    },
  };
  const ExcalidrawPlusAppCommand = {
    label: "Sign up",
    category: DEFAULT_CATEGORIES.links,
    predicate: true,
    icon: <div style={{ width: 14 }}>{ExcalLogo}</div>,
    keywords: [
      "excalidraw",
      "plus",
      "cloud",
      "server",
      "signin",
      "login",
      "signup",
    ],
    perform: () => {
      window.open(
        `${
          import.meta.env.VITE_APP_PLUS_APP
        }?utm_source=excalidraw&utm_medium=app&utm_content=command_palette`,
        "_blank",
      );
    },
  };

  if (activeBoardId === null) {
    return (
      <Dashboard
        onSelectBoard={async (id) => {
          const board = await getBoard(id);
          setActiveBoardName(board?.name || "Workspace");
          setActiveBoardId(id);
        }}
        onJoinRoom={(roomUrl) => {
          let hash = roomUrl;
          if (roomUrl.includes("#")) {
            hash = roomUrl.substring(roomUrl.indexOf("#"));
          }
          window.location.hash = hash;
          setActiveBoardName("Sala Colaborativa");
          setActiveBoardId("collab_room");
        }}
      />
    );
  }

  return (
    <div
      style={{ height: "100%" }}
      className={clsx("excalidraw-app", {
        "is-collaborating": isCollaborating,
      })}
    >
      <Excalidraw
        onChange={onChange}
        onExport={onExport}
        initialData={initialStatePromiseRef.current.promise}
        isCollaborating={isCollaborating}
        onPointerUpdate={collabAPI?.onPointerUpdate}
        aiEnabled={true}
        onTextSubmit={handleAITextSubmit}
        UIOptions={{
          canvasActions: {
            toggleTheme: true,
            export: {
              onExportToBackend,
              renderCustomUI: excalidrawAPI
                ? () => {
                    return (
                      <div
                        className="Card"
                        style={{
                          background: "var(--color-primary)",
                          color: "white",
                          borderRadius: "8px",
                          padding: "16px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          gap: "8px",
                          cursor: "pointer",
                          minWidth: "160px",
                          textAlign: "center",
                        }}
                        onClick={handleExportToPPTX}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            handleExportToPPTX();
                          }
                        }}
                      >
                        <div
                          style={{
                            width: "3.2rem",
                            height: "3.2rem",
                            borderRadius: "50%",
                            backgroundColor: "rgba(255,255,255,0.2)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <svg
                            width="28"
                            height="28"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="white"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <rect
                              x="2"
                              y="3"
                              width="20"
                              height="14"
                              rx="2"
                              ry="2"
                            />
                            <line x1="8" y1="21" x2="16" y2="21" />
                            <line x1="12" y1="17" x2="12" y2="21" />
                          </svg>
                        </div>
                        <h2 style={{ margin: 0, fontSize: "1rem" }}>
                          PowerPoint
                        </h2>
                        <div style={{ fontSize: "0.8rem", opacity: 0.9 }}>
                          Exporta como presentación .pptx
                        </div>
                        <button
                          className="Card-button"
                          style={{
                            marginTop: "4px",
                            background: "white",
                            color: "var(--color-primary)",
                            border: "none",
                            borderRadius: "6px",
                            padding: "6px 16px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          Exportar
                        </button>
                      </div>
                    );
                  }
                : undefined,
            },
          },
        }}
        langCode={langCode}
        renderCustomStats={renderCustomStats}
        detectScroll={false}
        handleKeyboardGlobally={true}
        autoFocus={true}
        theme={editorTheme}
        onThemeChange={setAppTheme}
        renderTopRightUI={(isMobile) => {
          if (isMobile || !collabAPI || isCollabDisabled) {
            return null;
          }

          return (
            <div className="excalidraw-ui-top-right">
              {collabError.message && <CollabError collabError={collabError} />}
              <LiveCollaborationTrigger
                isCollaborating={isCollaborating}
                onSelect={() =>
                  setShareDialogState({ isOpen: true, type: "share" })
                }
                editorInterface={editorInterface}
              />
            </div>
          );
        }}
        onLinkOpen={(element, event) => {
          if (element.link && isElementLink(element.link)) {
            event.preventDefault();
            excalidrawAPI?.setViewport({
              target: element.link,
              fit: "scale-down",
              animation: true,
            });
          }
        }}
      >
        <AppMainMenu
          onCollabDialogOpen={onCollabDialogOpen}
          isCollaborating={isCollaborating}
          isCollabEnabled={!isCollabDisabled}
          theme={appTheme}
          refresh={() => forceRefresh((prev) => !prev)}
          onBackToWorkspaces={() => {
            if (
              activeBoardId &&
              activeBoardId !== "collab_room" &&
              excalidrawAPI
            ) {
              const elements = excalidrawAPI.getSceneElementsIncludingDeleted();
              const appState = excalidrawAPI.getAppState();
              const files = excalidrawAPI.getFiles();
              saveBoard(
                activeBoardId,
                { name: appState.name || activeBoardName || "Workspace" },
                elements,
                appState,
                files,
              ).then(() => {
                window.history.replaceState(
                  {},
                  APP_NAME,
                  window.location.origin,
                );
                setActiveBoardId(null);
              });
            } else {
              window.history.replaceState({}, APP_NAME, window.location.origin);
              setActiveBoardId(null);
            }
          }}
        />
        <AppWelcomeScreen
          onCollabDialogOpen={onCollabDialogOpen}
          isCollabEnabled={!isCollabDisabled}
        />
        <OverwriteConfirmDialog>
          <OverwriteConfirmDialog.Actions.ExportToImage />
          <OverwriteConfirmDialog.Actions.SaveToDisk />
          {excalidrawAPI && (
            <OverwriteConfirmDialog.Action
              title={t("overwriteConfirm.action.excalidrawPlus.title")}
              actionLabel={t("overwriteConfirm.action.excalidrawPlus.button")}
              onClick={() => {
                exportToExcalidrawPlus(
                  excalidrawAPI.getSceneElements(),
                  excalidrawAPI.getAppState(),
                  excalidrawAPI.getFiles(),
                  excalidrawAPI.getName(),
                );
              }}
            >
              {t("overwriteConfirm.action.excalidrawPlus.description")}
            </OverwriteConfirmDialog.Action>
          )}
        </OverwriteConfirmDialog>
        <AppFooter onChange={() => excalidrawAPI?.refresh()} />
        {excalidrawAPI && <AIComponents excalidrawAPI={excalidrawAPI} />}

        <TTDDialogTrigger />
        {isCollaborating && isOffline && (
          <div className="alertalert--warning">
            {t("alerts.collabOfflineWarning")}
          </div>
        )}
        {localStorageQuotaExceeded && (
          <div className="alert alert--danger">
            {t("alerts.localStorageQuotaExceeded")}
          </div>
        )}
        {latestShareableLink && (
          <ShareableLinkDialog
            link={latestShareableLink}
            onCloseRequest={() => setLatestShareableLink(null)}
            setErrorMessage={setErrorMessage}
          />
        )}
        {excalidrawAPI && !isCollabDisabled && (
          <Collab excalidrawAPI={excalidrawAPI} />
        )}

        <ShareDialog
          collabAPI={collabAPI}
          onExportToBackend={async () => {
            if (excalidrawAPI) {
              try {
                await onExportToBackend(
                  excalidrawAPI.getSceneElements(),
                  excalidrawAPI.getAppState(),
                  excalidrawAPI.getFiles(),
                );
              } catch (error: any) {
                setErrorMessage(error.message);
              }
            }
          }}
        />

        <AppSidebar
          comments={comments}
          setComments={setComments}
          activeBoardId={activeBoardId}
          excalidrawAPI={excalidrawAPI}
          onResolveComment={handleResolveComment}
        />

        {errorMessage && (
          <ErrorDialog onClose={() => setErrorMessage("")}>
            {errorMessage}
          </ErrorDialog>
        )}

        <CommandPalette
          customCommandPaletteItems={[
            {
              label: t("labels.liveCollaboration"),
              category: DEFAULT_CATEGORIES.app,
              keywords: [
                "team",
                "multiplayer",
                "share",
                "public",
                "session",
                "invite",
              ],
              icon: usersIcon,
              perform: () => {
                setShareDialogState({
                  isOpen: true,
                  type: "collaborationOnly",
                });
              },
            },
            {
              label: t("roomDialog.button_stopSession"),
              category: DEFAULT_CATEGORIES.app,
              predicate: () => !!collabAPI?.isCollaborating(),
              keywords: [
                "stop",
                "session",
                "end",
                "leave",
                "close",
                "exit",
                "collaboration",
              ],
              perform: () => {
                if (collabAPI) {
                  collabAPI.stopCollaboration();
                  if (!collabAPI.isCollaborating()) {
                    setShareDialogState({ isOpen: false });
                  }
                }
              },
            },
            {
              label: t("labels.share"),
              category: DEFAULT_CATEGORIES.app,
              predicate: true,
              icon: share,
              keywords: [
                "link",
                "shareable",
                "readonly",
                "export",
                "publish",
                "snapshot",
                "url",
                "collaborate",
                "invite",
              ],
              perform: async () => {
                setShareDialogState({ isOpen: true, type: "share" });
              },
            },
            {
              label: "GitHub",
              icon: GithubIcon,
              category: DEFAULT_CATEGORIES.links,
              predicate: true,
              keywords: [
                "issues",
                "bugs",
                "requests",
                "report",
                "features",
                "social",
                "community",
              ],
              perform: () => {
                window.open(
                  "https://github.com/excalidraw/excalidraw",
                  "_blank",
                  "noopener noreferrer",
                );
              },
            },
            {
              label: t("labels.followUs"),
              icon: XBrandIcon,
              category: DEFAULT_CATEGORIES.links,
              predicate: true,
              keywords: ["twitter", "contact", "social", "community"],
              perform: () => {
                window.open(
                  "https://x.com/excalidraw",
                  "_blank",
                  "noopener noreferrer",
                );
              },
            },
            {
              label: t("labels.discordChat"),
              category: DEFAULT_CATEGORIES.links,
              predicate: true,
              icon: DiscordIcon,
              keywords: [
                "chat",
                "talk",
                "contact",
                "bugs",
                "requests",
                "report",
                "feedback",
                "suggestions",
                "social",
                "community",
              ],
              perform: () => {
                window.open(
                  "https://discord.gg/UexuTaE",
                  "_blank",
                  "noopener noreferrer",
                );
              },
            },
            {
              label: "YouTube",
              icon: youtubeIcon,
              category: DEFAULT_CATEGORIES.links,
              predicate: true,
              keywords: ["features", "tutorials", "howto", "help", "community"],
              perform: () => {
                window.open(
                  "https://youtube.com/@excalidraw",
                  "_blank",
                  "noopener noreferrer",
                );
              },
            },
            ...(isExcalidrawPlusSignedUser
              ? [
                  {
                    ...ExcalidrawPlusAppCommand,
                    label: "Sign in / Go to Excalidraw+",
                  },
                ]
              : [ExcalidrawPlusCommand, ExcalidrawPlusAppCommand]),

            {
              label: t("overwriteConfirm.action.excalidrawPlus.button"),
              category: DEFAULT_CATEGORIES.export,
              icon: exportToPlus,
              predicate: true,
              keywords: ["plus", "export", "save", "backup"],
              perform: () => {
                if (excalidrawAPI) {
                  exportToExcalidrawPlus(
                    excalidrawAPI.getSceneElements(),
                    excalidrawAPI.getAppState(),
                    excalidrawAPI.getFiles(),
                    excalidrawAPI.getName(),
                  );
                }
              },
            },
            {
              label: t("labels.installPWA"),
              category: DEFAULT_CATEGORIES.app,
              predicate: () => !!pwaEvent,
              perform: () => {
                if (pwaEvent) {
                  pwaEvent.prompt();
                  pwaEvent.userChoice.then(() => {
                    // event cannot be reused, but we'll hopefully
                    // grab new one as the event should be fired again
                    pwaEvent = null;
                  });
                }
              },
            },
          ]}
        />
        {isVisualDebuggerEnabled() && excalidrawAPI && (
          <DebugCanvas
            appState={excalidrawAPI.getAppState()}
            scale={window.devicePixelRatio}
            ref={debugCanvasRef}
          />
        )}
      </Excalidraw>
      {isCollaborating && (
        <CollabChat
          sendChatMessage={collabAPI?.sendChatMessage}
          username={collabAPI?.getUsername() || "Invitado"}
        />
      )}
      <NotificationManager isCollaborating={isCollaborating} />

      {activeBoardId && excalidrawAPI && minimapAppStateRef.current && (
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        <Minimap
          key="minimap"
          elements={minimapElementsRef.current}
          appState={minimapAppStateRef.current}
          excalidrawAPI={excalidrawAPI}
          tick={minimapTick}
        />
      )}

      {activeBoardId && activeBoardId !== "collab_room" && presenceUsers.length > 0 && (
        <PresenceBar users={presenceUsers} />
      )}

      {/* Guest Mode Banner: Local Board & Save to Cloud Call to Action */}
      {activeBoardId && activeBoardId !== "collab_room" && !userSession && (
        <div
          className="guest-mode-banner"
          style={{
            position: "fixed",
            top: "12px",
            left: "50%",
            transform: "translateX(-50%)",
            backgroundColor: "rgba(30, 41, 59, 0.92)",
            backdropFilter: "blur(8px)",
            color: "#f8fafc",
            padding: "6px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: "500",
            boxShadow: "0 4px 14px rgba(0,0,0,0.2)",
            zIndex: 9999,
            display: "flex",
            alignItems: "center",
            gap: "10px",
            border: "1px solid rgba(255, 255, 255, 0.1)",
          }}
        >
          <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
            <span>💾</span> Pizarra local (guardada en este navegador)
          </span>
          <button
            onClick={() => setShowAuthModal(true)}
            style={{
              backgroundColor: "#6366f1",
              color: "white",
              border: "none",
              padding: "4px 10px",
              borderRadius: "12px",
              fontSize: "11px",
              fontWeight: "600",
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            ☁️ Guardar en la Nube
          </button>
        </div>
      )}

      {activeBoardId && activeBoardId !== "collab_room" && (
        <button
          className={`floating-comment-mode-btn ${
            commentModeActive ? "active" : ""
          }`}
          onClick={() => setCommentModeActive(!commentModeActive)}
          title={
            commentModeActive
              ? "Desactivar modo comentarios"
              : "Activar modo comentarios"
          }
          style={{
            position: "fixed",
            bottom: "80px",
            right: "20px",
            width: "50px",
            height: "50px",
            borderRadius: "50%",
            backgroundColor: commentModeActive
              ? "var(--accent-color)"
              : "white",
            color: commentModeActive ? "white" : "black",
            border: "1px solid var(--border-color)",
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 999999,
            transition: "all 0.2s ease",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </button>
      )}

      {/* Comment Overlay to Capture Click */}
      {commentModeActive && (
        <>
          <div
            className="comment-mode-overlay"
            onClick={handleOverlayClick}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100vw",
              height: "100vh",
              zIndex: 9999,
              cursor: "crosshair",
              backgroundColor: "transparent",
            }}
          />
          <div
            style={{
              position: "fixed",
              top: "20px",
              left: "50%",
              transform: "translateX(-50%)",
              backgroundColor: "rgba(168, 85, 247, 0.95)",
              color: "white",
              padding: "8px 16px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "600",
              boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
              zIndex: 999999,
              pointerEvents: "none",
            }}
          >
            📌 Modo Comentarios: Haz clic en el lienzo para anclar una nota
          </div>
        </>
      )}

      {/* Render Comment Pins */}
      {activeBoardId &&
        comments.map((comment) => {
          if (comment.resolved || !excalidrawAPI) {
            return null;
          }

          const appState = excalidrawAPI.getAppState();
          const viewportX =
            (comment.x + appState.scrollX) * appState.zoom.value + appState.offsetLeft;
          const viewportY =
            (comment.y + appState.scrollY) * appState.zoom.value + appState.offsetTop;

          return (
            <div
              key={comment.id}
              className="comment-pin"
              data-x={comment.x}
              data-y={comment.y}
              onClick={(e) => {
                e.stopPropagation();
                setActiveCommentPopupId(comment.id);
              }}
              style={{
                position: "fixed",
                left: `${viewportX}px`,
                top: `${viewportY}px`,
                width: "28px",
                height: "28px",
                transform: "translate(-50%, -100%)",
                backgroundColor: "#a855f7",
                border: "2px solid white",
                borderRadius: "50% 50% 50% 0",
                boxShadow: "0 4px 10px rgba(0,0,0,0.25)",
                color: "white",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                fontWeight: "bold",
                cursor: "pointer",
                zIndex: 4,
                transition: "background-color 0.1s ease, box-shadow 0.1s ease, transform 0.1s ease",
              }}
              title={`Comentario de ${comment.author}`}
            >
              💬
            </div>
          );
        })}

      {/* Render Comment Popup */}
      {activeCommentPopupId &&
        (() => {
          const comment = comments.find((c) => c.id === activeCommentPopupId);
          if (!comment || !excalidrawAPI) {
            return null;
          }

          const appState = excalidrawAPI.getAppState();
          const viewportX =
            (comment.x + appState.scrollX) * appState.zoom.value + appState.offsetLeft;
          const viewportY =
            (comment.y + appState.scrollY) * appState.zoom.value + appState.offsetTop;

          return (
            <div
              className="comment-popup"
              data-x={comment.x}
              data-y={comment.y}
              style={{
                position: "fixed",
                left: `${viewportX}px`,
                top: `${viewportY - 10}px`,
                transform: "translate(-50%, -100%)",
                backgroundColor: "white",
                border: "1px solid var(--border-color)",
                borderRadius: "8px",
                boxShadow: "0 6px 20px rgba(0,0,0,0.2)",
                padding: "12px",
                width: "240px",
                zIndex: 100,
                color: "black",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: "8px",
                }}
              >
                <span
                  style={{
                    fontWeight: "700",
                    fontSize: "12px",
                    color: "#a855f7",
                  }}
                >
                  {comment.author}
                </span>
                <span style={{ fontSize: "10px", color: "#888" }}>
                  {new Date(comment.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div
                style={{
                  fontSize: "13px",
                  color: "#333",
                  lineHeight: "1.4",
                  marginBottom: "8px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {comment.text}
              </div>

              {/* Replies Thread */}
              <div
                style={{
                  maxHeight: "150px",
                  overflowY: "auto",
                  borderTop: "1px solid #eee",
                  paddingTop: "8px",
                  marginTop: "8px",
                  marginBottom: "8px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "6px",
                }}
              >
                {(comment.replies || []).map((reply: any) => (
                  <div
                    key={reply.id}
                    style={{ fontSize: "11px", lineHeight: "1.3" }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        marginBottom: "2px",
                      }}
                    >
                      <span style={{ fontWeight: "700", color: "#a855f7" }}>
                        {reply.author}
                      </span>
                      <span style={{ fontSize: "9px", color: "#999" }}>
                        {new Date(reply.createdAt).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                    <div style={{ color: "#444", whiteSpace: "pre-wrap" }}>
                      {reply.text}
                    </div>
                  </div>
                ))}
              </div>

              {/* Add Reply Input */}
              <div
                style={{ display: "flex", gap: "6px", marginBottom: "12px" }}
              >
                <textarea
                  placeholder="Responder..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleReplyComment(comment.id);
                    }
                  }}
                  style={{
                    flex: 1,
                    fontSize: "11px",
                    padding: "4px 6px",
                    borderRadius: "4px",
                    border: "1px solid #ccc",
                    resize: "none",
                    height: "28px",
                    boxSizing: "border-box",
                  }}
                />
                <button
                  onClick={() => handleReplyComment(comment.id)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "11px",
                    backgroundColor: "#a855f7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  ↑
                </button>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: "8px",
                }}
              >
                <button
                  onClick={() => setActiveCommentPopupId(null)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "11px",
                    backgroundColor: "#eee",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleResolveComment(comment.id)}
                  style={{
                    padding: "4px 8px",
                    fontSize: "11px",
                    backgroundColor: "#a855f7",
                    color: "white",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Resolver
                </button>
              </div>
            </div>
          );
        })()}

      {/* Add Comment Dialog Modal */}
      {showAddCommentModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999999,
          }}
        >
          <div
            style={{
              backgroundColor: "white",
              padding: "20px",
              borderRadius: "12px",
              width: "360px",
              boxShadow: "0 10px 25px rgba(0,0,0,0.3)",
              color: "black",
            }}
          >
            <h3
              style={{
                margin: "0 0 15px 0",
                fontSize: "16px",
                fontWeight: "700",
              }}
            >
              Dejar un Comentario
            </h3>

            <div style={{ marginBottom: "12px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                }}
              >
                Tu Nombre:
              </label>
              <input
                type="text"
                placeholder="Nombre..."
                value={newCommentAuthor}
                onChange={(e) => setNewCommentAuthor(e.target.value)}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  fontSize: "12px",
                  color: "#666",
                  marginBottom: "4px",
                }}
              >
                Comentario:
              </label>
              <textarea
                placeholder="Escribe tu comentario aquí..."
                value={newCommentText}
                onChange={(e) => setNewCommentText(e.target.value)}
                rows={4}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  border: "1px solid #ccc",
                  borderRadius: "6px",
                  fontSize: "13px",
                  outline: "none",
                  resize: "none",
                }}
                autoFocus
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "flex-end",
                gap: "10px",
              }}
            >
              <button
                onClick={() => {
                  setShowAddCommentModal(false);
                  setNewCommentCoords(null);
                }}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  backgroundColor: "#eee",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateCommentConfirm}
                style={{
                  padding: "8px 16px",
                  fontSize: "13px",
                  backgroundColor: "#a855f7",
                  color: "white",
                  border: "none",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontWeight: "600",
                }}
              >
                Comentar
              </button>
            </div>
          </div>
        </div>
      )}

      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => {
            setShowAuthModal(false);
            syncBoardsWithSupabase();
          }}
        />
      )}
    </div>
  );
};

const ExcalidrawApp = () => {
  const isCloudExportWindow =
    window.location.pathname === "/excalidraw-plus-export";
  if (isCloudExportWindow) {
    return <ExcalidrawPlusIframeExport />;
  }

  return (
    <TopErrorBoundary>
      <Provider store={appJotaiStore}>
        <ExcalidrawAPIProvider>
          <ExcalidrawWrapper />
        </ExcalidrawAPIProvider>
      </Provider>
    </TopErrorBoundary>
  );
};

export default ExcalidrawApp;
