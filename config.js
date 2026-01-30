// ========================================
// Configuration API - Cloud1 Backend
// ========================================

const CONFIG = {
    // URL de base de l'API Cloud1
    API_BASE_URL: 'https://nexuserv.duckdns.org/api',

    // URL WebSocket pour le temps réel
    WEBSOCKET_URL: 'https://nexuserv.duckdns.org',

    // Clé de stockage local pour le token
    TOKEN_KEY: 'chatapp3-token',
    USER_KEY: 'chatapp3-user',

    // App ID pour identifier cette application
    APP_ID: 'chatapp3',

    // Endpoints
    ENDPOINTS: {
        // Auth
        AUTH: {
            REGISTER: '/auth/register',
            LOGIN: '/auth/login',
            ME: '/auth/me',
            UPDATE_PROFILE: '/auth/profile',
            FIND_USER: '/auth/users/username',
            FIND_USER_BY_ID: '/auth/users/id'
        },
        // Chats
        CHATS: {
            LIST: '/chats',
            CREATE: '/chats',
            GET: (chatId) => `/chats/${chatId}`,
            MESSAGES: (chatId) => `/chats/${chatId}/messages`,
            READ: (messageId) => `/chats/messages/${messageId}/read`,
            DELETE_MESSAGE: (messageId) => `/chats/messages/${messageId}`
        },
        // Invitations
        INVITATIONS: {
            LIST: '/chats/invitations',
            SEND: '/chats/invitations',
            ACCEPT: (invitationId) => `/chats/invitations/${invitationId}/accept`,
            DECLINE: (invitationId) => `/chats/invitations/${invitationId}/decline`
        },
        // Upload
        UPLOAD: {
            IMAGE: '/upload/image',
            FILE: '/upload/file'
        }
    },

    // Configuration WebSocket
    SOCKET_OPTIONS: {
        transports: ['websocket', 'polling'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000
    }
};

// Rendre la config accessible globalement
window.CONFIG = CONFIG;
