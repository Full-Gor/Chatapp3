// ========================================
// Service d'Authentification
// ========================================

const AuthService = {
    currentUser: null,

    // Vérifier si l'utilisateur est connecté
    isAuthenticated() {
        return !!ApiService.getToken();
    },

    // Récupérer l'utilisateur actuel depuis le localStorage
    getCurrentUser() {
        if (this.currentUser) return this.currentUser;

        const userData = localStorage.getItem(CONFIG.USER_KEY);
        if (userData) {
            this.currentUser = JSON.parse(userData);
        }
        return this.currentUser;
    },

    // Sauvegarder l'utilisateur
    setCurrentUser(user) {
        this.currentUser = user;
        localStorage.setItem(CONFIG.USER_KEY, JSON.stringify(user));
    },

    // Inscription
    async register(userId, password, username = null) {
        try {
            const response = await AuthAPI.register(userId, password, username);

            if (response.success && response.data) {
                ApiService.setToken(response.data.token);
                this.setCurrentUser(response.data.user);

                // Connecter le socket
                SocketService.connect(response.data.token);

                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.error || 'Erreur inscription' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Connexion
    async login(userId, password) {
        try {
            const response = await AuthAPI.login(userId, password);

            if (response.success && response.data) {
                ApiService.setToken(response.data.token);
                this.setCurrentUser(response.data.user);

                // Connecter le socket
                SocketService.connect(response.data.token);

                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.error || 'Erreur connexion' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    },

    // Déconnexion
    logout() {
        ApiService.removeToken();
        localStorage.removeItem(CONFIG.USER_KEY);
        this.currentUser = null;
        SocketService.disconnect();
    },

    // Vérifier le token et récupérer l'utilisateur
    async checkAuth() {
        if (!this.isAuthenticated()) {
            return { success: false, error: 'Non authentifié' };
        }

        try {
            const response = await AuthAPI.getMe();

            if (response.success && response.data) {
                this.setCurrentUser(response.data.user);

                // Connecter le socket
                SocketService.connect(ApiService.getToken());

                return { success: true, user: response.data.user };
            }

            // Token invalide, déconnecter
            this.logout();
            return { success: false, error: 'Session expirée' };
        } catch (error) {
            this.logout();
            return { success: false, error: error.message };
        }
    },

    // Mettre à jour le profil
    async updateProfile(data) {
        try {
            const response = await AuthAPI.updateProfile(data);

            if (response.success && response.data) {
                this.setCurrentUser(response.data.user);
                return { success: true, user: response.data.user };
            }

            return { success: false, error: response.error || 'Erreur mise à jour' };
        } catch (error) {
            return { success: false, error: error.message };
        }
    }
};

// Exposer globalement
window.AuthService = AuthService;
