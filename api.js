// ========================================
// Service API - Appels HTTP vers Cloud1
// ========================================

const ApiService = {
    // Récupérer le token depuis le localStorage
    getToken() {
        return localStorage.getItem(CONFIG.TOKEN_KEY);
    },

    // Sauvegarder le token
    setToken(token) {
        localStorage.setItem(CONFIG.TOKEN_KEY, token);
    },

    // Supprimer le token
    removeToken() {
        localStorage.removeItem(CONFIG.TOKEN_KEY);
    },

    // Headers par défaut
    getHeaders(includeAuth = true) {
        const headers = {
            'Content-Type': 'application/json'
        };
        if (includeAuth) {
            const token = this.getToken();
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }
        }
        return headers;
    },

    // Méthode générique pour les requêtes
    async request(endpoint, options = {}) {
        const url = `${CONFIG.API_BASE_URL}${endpoint}`;
        const config = {
            ...options,
            headers: {
                ...this.getHeaders(options.auth !== false),
                ...options.headers
            }
        };

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || data.message || 'Erreur serveur');
            }

            return data;
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // GET
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        return this.request(url, { method: 'GET' });
    },

    // POST
    async post(endpoint, body = {}, options = {}) {
        return this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(body),
            ...options
        });
    },

    // PUT
    async put(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(body)
        });
    },

    // PATCH
    async patch(endpoint, body = {}) {
        return this.request(endpoint, {
            method: 'PATCH',
            body: JSON.stringify(body)
        });
    },

    // DELETE
    async delete(endpoint) {
        return this.request(endpoint, { method: 'DELETE' });
    },

    // Upload de fichier
    async uploadFile(file, type = 'image') {
        const formData = new FormData();
        formData.append('file', file);

        const url = `${CONFIG.API_BASE_URL}${type === 'image' ? CONFIG.ENDPOINTS.UPLOAD.IMAGE : CONFIG.ENDPOINTS.UPLOAD.FILE}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.getToken()}`
            },
            body: formData
        });

        const data = await response.json();
        if (!response.ok) {
            throw new Error(data.error || 'Erreur upload');
        }
        return data;
    }
};

// ========================================
// API Auth
// ========================================

const AuthAPI = {
    async register(userId, password, username = null) {
        const body = { userId, password, appId: CONFIG.APP_ID };
        if (username) body.username = username;
        return ApiService.post(CONFIG.ENDPOINTS.AUTH.REGISTER, body, { auth: false });
    },

    async login(userId, password) {
        return ApiService.post(CONFIG.ENDPOINTS.AUTH.LOGIN, {
            userId,
            password,
            appId: CONFIG.APP_ID
        }, { auth: false });
    },

    async getMe() {
        return ApiService.get(CONFIG.ENDPOINTS.AUTH.ME);
    },

    async updateProfile(data) {
        return ApiService.put(CONFIG.ENDPOINTS.AUTH.UPDATE_PROFILE, data);
    },

    async findUserByUsername(username) {
        return ApiService.get(`${CONFIG.ENDPOINTS.AUTH.FIND_USER}/${username}`);
    },

    // Recherche d'utilisateur par username
    async searchUserByUsername(query) {
        return ApiService.get(`${CONFIG.ENDPOINTS.AUTH.FIND_USER}/${query}`);
    },

    // Recherche d'utilisateur par ID
    async searchUserById(userId) {
        return ApiService.get(`${CONFIG.ENDPOINTS.AUTH.FIND_USER_BY_ID}/${userId}`);
    },

    // Recherche d'utilisateurs par username (recherche partielle)
    async searchUsers(query) {
        return ApiService.get(`${CONFIG.ENDPOINTS.AUTH.SEARCH_USERS}/${encodeURIComponent(query)}`);
    },

    // Recherche d'utilisateur par username ou userId exact (essaie les deux)
    async searchUser(query) {
        // Essayer d'abord par username
        const byUsername = await ApiService.get(`${CONFIG.ENDPOINTS.AUTH.FIND_USER}/${query}`);
        if (byUsername.success && byUsername.data?.user) {
            return byUsername;
        }

        // Si pas trouvé, essayer par userId
        const byId = await ApiService.get(`${CONFIG.ENDPOINTS.AUTH.FIND_USER_BY_ID}/${query}`);
        return byId;
    }
};

// ========================================
// API Chats
// ========================================

const ChatsAPI = {
    async getAll() {
        return ApiService.get(CONFIG.ENDPOINTS.CHATS.LIST);
    },

    async create(participantId, type = 'direct', name = null) {
        const body = { participantId, type };
        if (name) body.name = name;
        return ApiService.post(CONFIG.ENDPOINTS.CHATS.CREATE, body);
    },

    async get(chatId) {
        return ApiService.get(CONFIG.ENDPOINTS.CHATS.GET(chatId));
    },

    async getMessages(chatId, page = 1, limit = 50) {
        return ApiService.get(CONFIG.ENDPOINTS.CHATS.MESSAGES(chatId), { page, limit });
    },

    async sendMessage(chatId, content, type = 'text', metadata = {}) {
        return ApiService.post(CONFIG.ENDPOINTS.CHATS.MESSAGES(chatId), {
            content,
            type,
            metadata
        });
    },

    async markAsRead(messageId) {
        return ApiService.put(CONFIG.ENDPOINTS.CHATS.READ(messageId));
    },

    async deleteMessage(messageId) {
        return ApiService.delete(CONFIG.ENDPOINTS.CHATS.DELETE_MESSAGE(messageId));
    }
};

// ========================================
// API Invitations
// ========================================

const InvitationsAPI = {
    async getAll() {
        return ApiService.get(CONFIG.ENDPOINTS.INVITATIONS.LIST);
    },

    async send(toUserId) {
        return ApiService.post(CONFIG.ENDPOINTS.INVITATIONS.SEND, { toUserId });
    },

    async accept(invitationId) {
        return ApiService.post(CONFIG.ENDPOINTS.INVITATIONS.ACCEPT(invitationId));
    },

    async decline(invitationId) {
        return ApiService.post(CONFIG.ENDPOINTS.INVITATIONS.DECLINE(invitationId));
    }
};

// Exposer globalement
window.ApiService = ApiService;
window.AuthAPI = AuthAPI;
window.ChatsAPI = ChatsAPI;
window.InvitationsAPI = InvitationsAPI;
