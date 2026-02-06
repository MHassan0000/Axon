// Query keys factory for consistent cache management
export const queryKeys = {
    // User queries
    user: {
        all: ["user"] as const,
        current: () => [...queryKeys.user.all, "current"] as const,
    },

    // Workspace queries
    workspaces: {
        all: ["workspaces"] as const,
        list: () => [...queryKeys.workspaces.all, "list"] as const,
        detail: (id: string) => [...queryKeys.workspaces.all, "detail", id] as const,
        members: (id: string) => [...queryKeys.workspaces.all, "members", id] as const,
    },

    // Board queries
    boards: {
        all: ["boards"] as const,
        byWorkspace: (workspaceId: string) => [...queryKeys.boards.all, "workspace", workspaceId] as const,
        detail: (id: string) => [...queryKeys.boards.all, "detail", id] as const,
        withLists: (id: string) => [...queryKeys.boards.all, "withLists", id] as const,
    },

    // List queries
    lists: {
        all: ["lists"] as const,
        byBoard: (boardId: string) => [...queryKeys.lists.all, "board", boardId] as const,
    },

    // Card queries
    cards: {
        all: ["cards"] as const,
        byList: (listId: string) => [...queryKeys.cards.all, "list", listId] as const,
        detail: (id: string) => [...queryKeys.cards.all, "detail", id] as const,
        comments: (id: string) => [...queryKeys.cards.all, "comments", id] as const,
        checklists: (id: string) => [...queryKeys.cards.all, "checklists", id] as const,
    },

    // Activity queries
    activity: {
        all: ["activity"] as const,
        recent: () => [...queryKeys.activity.all, "recent"] as const,
        byBoard: (boardId: string) => [...queryKeys.activity.all, "board", boardId] as const,
        byCard: (cardId: string) => [...queryKeys.activity.all, "card", cardId] as const,
    },

    // Notifications queries
    notifications: {
        all: ["notifications"] as const,
        unread: () => [...queryKeys.notifications.all, "unread"] as const,
    },
} as const;
