// ========================================
// Service WebSocket - Temps réel avec Socket.io
// ========================================

const SocketService = {
    socket: null,
    connected: false,
    listeners: new Map(),

    // Initialiser la connexion
    connect(token) {
        if (this.socket && this.connected) {
            console.log('Socket déjà connecté');
            return;
        }

        this.socket = io(CONFIG.WEBSOCKET_URL, {
            ...CONFIG.SOCKET_OPTIONS,
            auth: { token }
        });

        this.setupListeners();
    },

    // Déconnecter
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
            this.connected = false;
        }
    },

    // Configurer les écouteurs de base
    setupListeners() {
        this.socket.on('connect', () => {
            console.log('Socket connecté');
            this.connected = true;
            this.emit('status', { connected: true });
        });

        this.socket.on('disconnect', (reason) => {
            console.log('Socket déconnecté:', reason);
            this.connected = false;
            this.emit('status', { connected: false, reason });
        });

        this.socket.on('connect_error', (error) => {
            console.error('Erreur connexion socket:', error);
            this.emit('error', error);
        });

        // Écouter les nouveaux messages
        this.socket.on('message:new', (data) => {
            this.emit('message:new', data);
        });

        // Écouter les messages lus
        this.socket.on('message:read', (data) => {
            this.emit('message:read', data);
        });

        // Écouter les indicateurs de frappe
        this.socket.on('typing:user', (data) => {
            this.emit('typing:user', data);
        });

        // Écouter le statut des utilisateurs
        this.socket.on('user:online', (data) => {
            this.emit('user:online', data);
        });

        this.socket.on('user:offline', (data) => {
            this.emit('user:offline', data);
        });

        // Appels WebRTC
        this.socket.on('call:offer', (data) => {
            this.emit('call:offer', data);
        });

        this.socket.on('call:answer', (data) => {
            this.emit('call:answer', data);
        });

        this.socket.on('call:ice-candidate', (data) => {
            this.emit('call:ice-candidate', data);
        });

        this.socket.on('call:end', (data) => {
            this.emit('call:end', data);
        });

        // Erreurs
        this.socket.on('error', (data) => {
            console.error('Socket error:', data);
            this.emit('error', data);
        });
    },

    // Rejoindre un chat (room)
    joinChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('chat:join', { chatId });
        }
    },

    // Quitter un chat
    leaveChat(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('chat:leave', { chatId });
        }
    },

    // Envoyer un message via socket (temps réel)
    sendMessage(chatId, content, type = 'text', metadata = {}) {
        if (this.socket && this.connected) {
            this.socket.emit('message:send', {
                chatId,
                content,
                type,
                metadata
            });
        }
    },

    // Indiquer qu'on est en train de taper
    startTyping(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('typing:start', { chatId });
        }
    },

    // Arrêter l'indicateur de frappe
    stopTyping(chatId) {
        if (this.socket && this.connected) {
            this.socket.emit('typing:stop', { chatId });
        }
    },

    // Initier un appel
    callOffer(toUserId, offer, callType = 'audio') {
        if (this.socket && this.connected) {
            this.socket.emit('call:offer', {
                to: toUserId,
                offer,
                callType
            });
        }
    },

    // Répondre à un appel
    callAnswer(toUserId, answer) {
        if (this.socket && this.connected) {
            this.socket.emit('call:answer', {
                to: toUserId,
                answer
            });
        }
    },

    // Envoyer un candidat ICE
    sendIceCandidate(toUserId, candidate) {
        if (this.socket && this.connected) {
            this.socket.emit('call:ice-candidate', {
                to: toUserId,
                candidate
            });
        }
    },

    // Terminer un appel
    endCall(toUserId) {
        if (this.socket && this.connected) {
            this.socket.emit('call:end', { to: toUserId });
        }
    },

    // Système d'événements interne
    on(event, callback) {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event).push(callback);
    },

    off(event, callback) {
        if (this.listeners.has(event)) {
            const callbacks = this.listeners.get(event);
            const index = callbacks.indexOf(callback);
            if (index > -1) {
                callbacks.splice(index, 1);
            }
        }
    },

    emit(event, data) {
        if (this.listeners.has(event)) {
            this.listeners.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    console.error(`Erreur dans listener ${event}:`, error);
                }
            });
        }
    }
};

// Exposer globalement
window.SocketService = SocketService;
