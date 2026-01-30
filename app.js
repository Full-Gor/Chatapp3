// ========================================
// Chatapp3 - Application JavaScript
// Intégration avec Cloud1 Backend
// ========================================

// État de l'application
const state = {
    currentUser: null,
    currentChat: null,
    chats: [],
    invitations: [],
    onlineUsers: new Set(),
    settings: {
        darkMode: false,
        theme: 'lavender',
        sound: true
    },
    typingUsers: new Map(),
    isLoading: false
};

// Liste d'emojis
const emojis = [
    '😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊',
    '😇', '🙂', '😉', '😌', '😍', '🥰', '😘', '😗',
    '😋', '😛', '😜', '🤪', '😝', '🤗', '🤭', '🤫',
    '🤔', '🤐', '🤨', '😐', '😑', '😶', '😏', '😒',
    '🙄', '😬', '😮', '🤯', '😴', '🥳', '🤠', '🥺',
    '😢', '😭', '😤', '😠', '😡', '🤬', '😈', '👿',
    '💀', '☠️', '💩', '🤡', '👹', '👺', '👻', '👽',
    '👍', '👎', '👏', '🙌', '🤝', '❤️', '💔', '💯'
];

// Seeds pour les avatars
const avatarSeeds = ['alice', 'bob', 'charlie', 'david', 'emma', 'frank', 'grace', 'henry'];

// ========================================
// Éléments DOM
// ========================================
const elements = {
    chatList: document.getElementById('chatList'),
    searchInput: document.getElementById('searchInput'),
    newChatBtn: document.getElementById('newChatBtn'),
    settingsBtn: document.getElementById('settingsBtn'),

    chatArea: document.getElementById('chatArea'),
    emptyState: document.getElementById('emptyState'),
    chatHeader: document.getElementById('chatHeader'),
    messagesContainer: document.getElementById('messagesContainer'),
    messages: document.getElementById('messages'),
    inputArea: document.getElementById('inputArea'),

    contactAvatar: document.getElementById('contactAvatar'),
    contactName: document.getElementById('contactName'),
    contactStatus: document.getElementById('contactStatus'),
    typingIndicator: document.getElementById('typingIndicator'),
    backBtn: document.getElementById('backBtn'),

    messageInput: document.getElementById('messageInput'),
    sendBtn: document.getElementById('sendBtn'),
    emojiBtn: document.getElementById('emojiBtn'),
    voiceBtn: document.getElementById('voiceBtn'),
    attachBtn: document.getElementById('attachBtn'),

    newChatModal: document.getElementById('newChatModal'),
    closeModalBtn: document.getElementById('closeModalBtn'),
    newContactName: document.getElementById('newContactName'),
    avatarOptions: document.getElementById('avatarOptions'),
    cancelNewChat: document.getElementById('cancelNewChat'),
    confirmNewChat: document.getElementById('confirmNewChat'),

    settingsModal: document.getElementById('settingsModal'),
    closeSettingsBtn: document.getElementById('closeSettingsBtn'),
    darkModeToggle: document.getElementById('darkModeToggle'),
    soundToggle: document.getElementById('soundToggle'),

    emojiPicker: document.getElementById('emojiPicker'),
    sidebar: document.querySelector('.sidebar'),

    // Auth elements
    authModal: document.getElementById('authModal'),
    loginForm: document.getElementById('loginForm'),
    registerForm: document.getElementById('registerForm'),
    loginError: document.getElementById('loginError'),
    registerError: document.getElementById('registerError'),

    // Search user modal
    searchUserModal: document.getElementById('searchUserModal'),
    closeSearchUserBtn: document.getElementById('closeSearchUserBtn'),
    searchUserInput: document.getElementById('searchUserInput'),
    searchResults: document.getElementById('searchResults'),

    // Profile modal
    profileModal: document.getElementById('profileModal'),
    closeProfileBtn: document.getElementById('closeProfileBtn'),
    userProfileBtn: document.getElementById('userProfileBtn'),
    profileAvatar: document.getElementById('profileAvatar'),
    profileUsername: document.getElementById('profileUsername'),
    profileUserId: document.getElementById('profileUserId'),
    profileLogoutBtn: document.getElementById('profileLogoutBtn'),

    // Logout button in header
    logoutBtn: document.getElementById('logoutBtn'),

    // Loading & Toast
    loadingOverlay: document.getElementById('loadingOverlay'),
    toastContainer: document.getElementById('toastContainer')
};

// ========================================
// Fonctions Utilitaires
// ========================================
function formatTime(date) {
    if (typeof date === 'string') date = new Date(date);
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(date) {
    if (typeof date === 'string') date = new Date(date);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'À l\'instant';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}j`;
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function playSound(type) {
    if (!state.settings.sound) return;

    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    if (type === 'send') {
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
    } else if (type === 'receive') {
        oscillator.frequency.value = 600;
        oscillator.type = 'sine';
    }

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.1);
}

function generateId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

function showLoading(show = true) {
    state.isLoading = show;
    elements.loadingOverlay.classList.toggle('hidden', !show);
}

function showToast(message, type = 'info') {
    const icons = {
        success: 'fa-check-circle',
        error: 'fa-exclamation-circle',
        info: 'fa-info-circle'
    };

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
        <i class="fas ${icons[type]}"></i>
        <span>${message}</span>
    `;

    elements.toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'toastIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

function getAvatarUrl(seed) {
    return `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`;
}

function isToday(date) {
    if (typeof date === 'string') date = new Date(date);
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isYesterday(date) {
    if (typeof date === 'string') date = new Date(date);
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
}

// ========================================
// Auth Functions
// ========================================
function showAuthModal() {
    elements.authModal.classList.add('active');
    document.querySelector('.app-container').style.display = 'none';
}

function hideAuthModal() {
    elements.authModal.classList.remove('active');
    document.querySelector('.app-container').style.display = 'flex';
}

function switchAuthTab(tab) {
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');

    elements.loginForm.classList.toggle('hidden', tab !== 'login');
    elements.registerForm.classList.toggle('hidden', tab !== 'register');

    elements.loginError.textContent = '';
    elements.registerError.textContent = '';
}

async function handleLogin(e) {
    e.preventDefault();

    const userId = document.getElementById('loginUserId').value.trim();
    const password = document.getElementById('loginPassword').value;

    if (!userId || !password) {
        elements.loginError.textContent = 'Veuillez remplir tous les champs';
        return;
    }

    showLoading(true);
    elements.loginError.textContent = '';

    const result = await AuthService.login(userId, password);

    showLoading(false);

    if (result.success) {
        state.currentUser = result.user;
        hideAuthModal();
        await initApp();
        showToast('Connexion réussie !', 'success');
    } else {
        elements.loginError.textContent = result.error || 'Erreur de connexion';
    }
}

async function handleRegister(e) {
    e.preventDefault();

    const userId = document.getElementById('registerUserId').value.trim();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirm = document.getElementById('registerConfirm').value;

    if (!userId || !password) {
        elements.registerError.textContent = 'Veuillez remplir les champs obligatoires';
        return;
    }

    if (password !== confirm) {
        elements.registerError.textContent = 'Les mots de passe ne correspondent pas';
        return;
    }

    if (password.length < 6) {
        elements.registerError.textContent = 'Le mot de passe doit contenir au moins 6 caractères';
        return;
    }

    showLoading(true);
    elements.registerError.textContent = '';

    const result = await AuthService.register(userId, password, username || null);

    showLoading(false);

    if (result.success) {
        state.currentUser = result.user;
        hideAuthModal();
        await initApp();
        showToast('Inscription réussie !', 'success');
    } else {
        elements.registerError.textContent = result.error || 'Erreur d\'inscription';
    }
}

function logout() {
    AuthService.logout();
    state.currentUser = null;
    state.chats = [];
    state.currentChat = null;
    state.invitations = [];
    state.onlineUsers.clear();

    // Réinitialiser l'interface
    elements.chatList.innerHTML = '';
    elements.messagesContainer.innerHTML = '';

    // Réinitialiser les formulaires de connexion
    document.getElementById('loginUserId').value = '';
    document.getElementById('loginPassword').value = '';
    document.getElementById('registerUserId').value = '';
    document.getElementById('registerUsername').value = '';
    document.getElementById('registerPassword').value = '';
    document.getElementById('registerConfirm').value = '';
    elements.loginError.textContent = '';
    elements.registerError.textContent = '';

    // Revenir sur l'onglet connexion
    switchAuthTab('login');

    showAuthModal();
    showToast('Déconnexion réussie', 'info');
}

// ========================================
// Data Loading
// ========================================
async function loadChats() {
    try {
        const response = await ChatsAPI.getAll();
        if (response.success && response.data) {
            state.chats = response.data.chats.map(chat => ({
                id: chat.id,
                name: chat.name || getParticipantName(chat),
                avatar: chat.metadata?.avatar || getAvatarUrl(chat.name || chat.id),
                online: isUserOnline(getOtherParticipant(chat)),
                lastMessage: chat.lastMessage || 'Nouvelle conversation',
                lastMessageTime: chat.lastMessageTime ? new Date(chat.lastMessageTime) : new Date(),
                unread: 0,
                messages: [],
                participants: chat.participants,
                type: chat.type
            }));
            renderChatList();
        }
    } catch (error) {
        console.error('Erreur chargement chats:', error);
        showToast('Erreur de chargement des conversations', 'error');
    }
}

async function loadMessages(chatId) {
    try {
        const response = await ChatsAPI.getMessages(chatId);
        if (response.success && response.data) {
            const chat = state.chats.find(c => c.id === chatId);
            if (chat) {
                chat.messages = response.data.messages.map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    sent: msg.senderId === state.currentUser.id,
                    time: new Date(msg.createdAt),
                    type: msg.type,
                    senderId: msg.senderId
                }));
                if (state.currentChat?.id === chatId) {
                    renderMessages();
                }
            }
        }
    } catch (error) {
        console.error('Erreur chargement messages:', error);
    }
}

async function loadInvitations() {
    try {
        const response = await InvitationsAPI.getAll();
        if (response.success && response.data) {
            state.invitations = response.data.invitations || [];
            renderInvitations();
        }
    } catch (error) {
        console.error('Erreur chargement invitations:', error);
    }
}

function getParticipantName(chat) {
    if (chat.type === 'group') return chat.name || 'Groupe';
    const otherParticipant = getOtherParticipant(chat);
    if (chat.participantNames && chat.participantNames[otherParticipant]) {
        return chat.participantNames[otherParticipant];
    }
    return otherParticipant || 'Utilisateur';
}

function getOtherParticipant(chat) {
    if (!chat.participants || !state.currentUser) return null;
    return chat.participants.find(p => p !== state.currentUser.id);
}

function isUserOnline(userId) {
    return state.onlineUsers.has(userId);
}

// ========================================
// Rendu de l'interface
// ========================================
function renderUserProfile() {
    const user = state.currentUser;
    if (!user) return;

    const avatarUrl = user.profilePicture || getAvatarUrl(user.username || user.userId);
    const displayName = user.username || user.userId;

    // Mettre à jour le profil dans la sidebar
    const profileContainer = document.querySelector('.user-profile');
    if (profileContainer) {
        profileContainer.innerHTML = `
            <div class="avatar avatar-neu">
                <img src="${avatarUrl}" alt="Mon avatar">
                <span class="status-indicator online"></span>
            </div>
            <div class="user-info">
                <h3>${displayName}</h3>
                <span class="status-text">En ligne</span>
            </div>
        `;
    }

    // Mettre à jour la modal profil
    if (elements.profileAvatar) {
        elements.profileAvatar.src = avatarUrl;
    }
    if (elements.profileUsername) {
        elements.profileUsername.textContent = displayName;
    }
    if (elements.profileUserId) {
        elements.profileUserId.textContent = '@' + user.userId;
    }
}

function showProfileModal() {
    renderUserProfile();
    openModal(elements.profileModal);
}

function renderInvitations() {
    if (state.invitations.length === 0) return;

    let html = '<div class="invitations-section">';
    state.invitations.forEach(inv => {
        html += `
            <div class="invitation-item" data-invitation-id="${inv.id}">
                <div class="avatar avatar-neu">
                    <img src="${getAvatarUrl(inv.fromUserId)}" alt="Avatar">
                </div>
                <div class="info">
                    <span class="name">${inv.fromUsername || inv.fromUserId}</span>
                    <span class="message">Veut discuter avec vous</span>
                </div>
                <div class="invitation-actions">
                    <button class="btn-neu btn-icon btn-accept" onclick="acceptInvitation('${inv.id}')">
                        <i class="fas fa-check"></i>
                    </button>
                    <button class="btn-neu btn-icon btn-decline" onclick="declineInvitation('${inv.id}')">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            </div>
        `;
    });
    html += '</div>';

    const invitationsContainer = document.querySelector('.invitations-section');
    if (invitationsContainer) {
        invitationsContainer.outerHTML = html;
    } else {
        elements.chatList.insertAdjacentHTML('beforebegin', html);
    }
}

function renderChatList(filter = '') {
    const filteredChats = state.chats.filter(chat =>
        chat.name.toLowerCase().includes(filter.toLowerCase())
    );

    elements.chatList.innerHTML = filteredChats.map(chat => `
        <div class="chat-item ${state.currentChat?.id === chat.id ? 'active' : ''}" data-chat-id="${chat.id}">
            <div class="avatar avatar-neu">
                <img src="${chat.avatar}" alt="${chat.name}">
                <span class="status-indicator ${chat.online ? 'online' : ''}"></span>
            </div>
            <div class="chat-details">
                <div class="chat-header-row">
                    <span class="chat-name">${chat.name}</span>
                    <span class="chat-time">${formatRelativeTime(chat.lastMessageTime)}</span>
                </div>
                <div class="chat-preview-row">
                    <span class="chat-preview">${chat.lastMessage}</span>
                    ${chat.unread > 0 ? `<span class="unread-badge">${chat.unread}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    document.querySelectorAll('.chat-item').forEach(item => {
        item.addEventListener('click', () => {
            const chatId = item.dataset.chatId;
            selectChat(chatId);
        });
    });
}

function renderMessages() {
    if (!state.currentChat) return;

    let lastDate = null;
    let html = '';

    state.currentChat.messages.forEach(msg => {
        const msgDate = msg.time.toDateString();

        if (msgDate !== lastDate) {
            const dateLabel = isToday(msg.time) ? 'Aujourd\'hui' :
                             isYesterday(msg.time) ? 'Hier' :
                             msg.time.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
            html += `
                <div class="date-separator">
                    <span>${dateLabel}</span>
                </div>
            `;
            lastDate = msgDate;
        }

        const avatarSrc = msg.sent ?
            (state.currentUser.profilePicture || getAvatarUrl(state.currentUser.username || state.currentUser.userId)) :
            state.currentChat.avatar;

        html += `
            <div class="message ${msg.sent ? 'sent' : 'received'}">
                <div class="avatar avatar-neu">
                    <img src="${avatarSrc}" alt="Avatar">
                </div>
                <div class="message-content">
                    <div class="message-bubble">${msg.text}</div>
                    <span class="message-time">${formatTime(msg.time)}</span>
                </div>
            </div>
        `;
    });

    elements.messages.innerHTML = html;
    scrollToBottom();
}

function scrollToBottom() {
    elements.messagesContainer.scrollTop = elements.messagesContainer.scrollHeight;
}

function renderEmojiPicker() {
    const emojiGrid = elements.emojiPicker.querySelector('.emoji-grid');
    emojiGrid.innerHTML = emojis.map(emoji =>
        `<button class="emoji-btn" data-emoji="${emoji}">${emoji}</button>`
    ).join('');

    emojiGrid.querySelectorAll('.emoji-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            elements.messageInput.value += btn.dataset.emoji;
            elements.messageInput.focus();
            elements.emojiPicker.classList.remove('active');
        });
    });
}

function renderAvatarOptions() {
    elements.avatarOptions.innerHTML = avatarSeeds.map((seed, index) => `
        <div class="avatar-option ${index === 0 ? 'selected' : ''}" data-seed="${seed}">
            <img src="${getAvatarUrl(seed)}" alt="Avatar ${seed}">
        </div>
    `).join('');

    elements.avatarOptions.querySelectorAll('.avatar-option').forEach(option => {
        option.addEventListener('click', () => {
            elements.avatarOptions.querySelectorAll('.avatar-option').forEach(o => o.classList.remove('selected'));
            option.classList.add('selected');
        });
    });
}

// ========================================
// Actions
// ========================================
async function selectChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    // Quitter l'ancien chat
    if (state.currentChat) {
        SocketService.leaveChat(state.currentChat.id);
    }

    state.currentChat = chat;
    chat.unread = 0;

    // Rejoindre le nouveau chat
    SocketService.joinChat(chatId);

    // Charger les messages
    await loadMessages(chatId);

    // Mettre à jour l'interface
    elements.emptyState.style.display = 'none';
    elements.chatHeader.style.display = 'flex';
    elements.messagesContainer.style.display = 'block';
    elements.inputArea.style.display = 'flex';

    elements.contactAvatar.src = chat.avatar;
    elements.contactName.textContent = chat.name;
    elements.contactStatus.className = `status-indicator ${chat.online ? 'online' : ''}`;

    renderMessages();
    renderChatList();

    if (window.innerWidth <= 900) {
        elements.sidebar.classList.add('hidden');
    }
}

async function sendMessage() {
    const text = elements.messageInput.value.trim();
    if (!text || !state.currentChat) return;

    // Envoyer via socket pour temps réel
    SocketService.sendMessage(state.currentChat.id, text, 'text');

    // Aussi envoyer via API pour persistence
    try {
        await ChatsAPI.sendMessage(state.currentChat.id, text);
    } catch (error) {
        console.error('Erreur envoi message:', error);
    }

    // Ajouter localement le message
    const message = {
        id: generateId(),
        text: text,
        sent: true,
        time: new Date()
    };

    state.currentChat.messages.push(message);
    state.currentChat.lastMessage = text;
    state.currentChat.lastMessageTime = new Date();

    elements.messageInput.value = '';
    renderMessages();
    renderChatList();
    playSound('send');

    // Arrêter l'indicateur de frappe
    SocketService.stopTyping(state.currentChat.id);
}

async function acceptInvitation(invitationId) {
    try {
        const response = await InvitationsAPI.accept(invitationId);
        if (response.success) {
            state.invitations = state.invitations.filter(i => i.id !== invitationId);
            renderInvitations();
            await loadChats();
            showToast('Invitation acceptée !', 'success');
        }
    } catch (error) {
        showToast('Erreur lors de l\'acceptation', 'error');
    }
}

async function declineInvitation(invitationId) {
    try {
        const response = await InvitationsAPI.decline(invitationId);
        if (response.success) {
            state.invitations = state.invitations.filter(i => i.id !== invitationId);
            renderInvitations();
            showToast('Invitation déclinée', 'info');
        }
    } catch (error) {
        showToast('Erreur lors du refus', 'error');
    }
}

async function searchUsers(query) {
    if (!query || query.length < 2) {
        elements.searchResults.innerHTML = '<p class="no-results">Tapez au moins 2 caractères</p>';
        return;
    }

    elements.searchResults.innerHTML = '<p class="no-results"><i class="fas fa-spinner fa-spin"></i> Recherche...</p>';

    try {
        // Utilise la nouvelle méthode qui cherche par username ET userId
        const response = await AuthAPI.searchUser(query);
        if (response.success && response.data?.user) {
            const user = response.data.user;
            if (user.id === state.currentUser.id) {
                elements.searchResults.innerHTML = '<p class="no-results">C\'est vous !</p>';
                return;
            }
            elements.searchResults.innerHTML = `
                <div class="search-result-item" data-user-id="${user.id}">
                    <div class="avatar avatar-neu">
                        <img src="${user.profilePicture || getAvatarUrl(user.username || user.userId)}" alt="Avatar">
                    </div>
                    <div class="user-info">
                        <span class="username">${user.username || user.userId}</span>
                        <span class="user-id">@${user.userId}</span>
                    </div>
                    <button class="btn-neu btn-add" onclick="sendInvitation('${user.id}')">
                        <i class="fas fa-plus"></i> Inviter
                    </button>
                </div>
            `;
        } else {
            elements.searchResults.innerHTML = '<p class="no-results">Aucun utilisateur trouvé</p>';
        }
    } catch (error) {
        elements.searchResults.innerHTML = '<p class="no-results">Aucun utilisateur trouvé</p>';
    }
}

async function sendInvitation(userId) {
    try {
        const response = await InvitationsAPI.send(userId);
        if (response.success) {
            closeModal(elements.searchUserModal);
            showToast('Invitation envoyée !', 'success');
        }
    } catch (error) {
        showToast(error.message || 'Erreur d\'envoi', 'error');
    }
}

// ========================================
// Gestion des modals
// ========================================
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

// ========================================
// Gestion des thèmes
// ========================================
function setTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    state.settings.theme = theme;

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });

    saveSettings();
}

function toggleDarkMode(enabled) {
    document.body.setAttribute('data-mode', enabled ? 'dark' : 'light');
    state.settings.darkMode = enabled;
    saveSettings();
}

function saveSettings() {
    localStorage.setItem('chatapp3-settings', JSON.stringify(state.settings));
}

function loadSettings() {
    const saved = localStorage.getItem('chatapp3-settings');
    if (saved) {
        state.settings = { ...state.settings, ...JSON.parse(saved) };
        setTheme(state.settings.theme);
        toggleDarkMode(state.settings.darkMode);
        elements.darkModeToggle.checked = state.settings.darkMode;
        elements.soundToggle.checked = state.settings.sound;
    }
}

// ========================================
// Socket Events
// ========================================
function setupSocketListeners() {
    // Nouveau message reçu
    SocketService.on('message:new', (data) => {
        const { message, chatId } = data;
        const chat = state.chats.find(c => c.id === chatId);

        if (chat && message.senderId !== state.currentUser.id) {
            const newMessage = {
                id: message.id,
                text: message.content,
                sent: false,
                time: new Date(message.createdAt),
                senderId: message.senderId
            };

            chat.messages.push(newMessage);
            chat.lastMessage = message.content;
            chat.lastMessageTime = new Date();

            if (state.currentChat?.id === chatId) {
                renderMessages();
            } else {
                chat.unread++;
            }

            renderChatList();
            playSound('receive');
        }
    });

    // Indicateur de frappe
    SocketService.on('typing:user', (data) => {
        const { chatId, userId, isTyping } = data;

        if (state.currentChat?.id === chatId && userId !== state.currentUser.id) {
            elements.typingIndicator.classList.toggle('visible', isTyping);
        }
    });

    // Utilisateur en ligne
    SocketService.on('user:online', (data) => {
        state.onlineUsers.add(data.userId);
        updateOnlineStatus();
    });

    // Utilisateur hors ligne
    SocketService.on('user:offline', (data) => {
        state.onlineUsers.delete(data.userId);
        updateOnlineStatus();
    });

    // Statut de connexion
    SocketService.on('status', (data) => {
        if (data.connected) {
            showToast('Connecté au serveur', 'success');
        } else {
            showToast('Déconnecté du serveur', 'error');
        }
    });
}

function updateOnlineStatus() {
    state.chats.forEach(chat => {
        const otherUserId = getOtherParticipant(chat);
        chat.online = isUserOnline(otherUserId);
    });

    renderChatList();

    if (state.currentChat) {
        const online = state.currentChat.online;
        elements.contactStatus.className = `status-indicator ${online ? 'online' : ''}`;
    }
}

// ========================================
// Événements
// ========================================
function initEventListeners() {
    // Auth tabs
    document.querySelectorAll('.auth-tab').forEach(tab => {
        tab.addEventListener('click', () => switchAuthTab(tab.dataset.tab));
    });

    // Auth forms
    elements.loginForm.addEventListener('submit', handleLogin);
    elements.registerForm.addEventListener('submit', handleRegister);

    // Recherche
    elements.searchInput.addEventListener('input', (e) => {
        renderChatList(e.target.value);
    });

    // Envoi de message
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Indicateur de frappe
    let typingTimeout;
    elements.messageInput.addEventListener('input', () => {
        if (state.currentChat) {
            SocketService.startTyping(state.currentChat.id);

            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => {
                SocketService.stopTyping(state.currentChat.id);
            }, 2000);
        }
    });

    // Nouveau chat - ouvre la recherche d'utilisateur
    elements.newChatBtn.addEventListener('click', () => {
        elements.searchUserInput.value = '';
        elements.searchResults.innerHTML = '';
        openModal(elements.searchUserModal);
    });

    elements.closeSearchUserBtn.addEventListener('click', () => closeModal(elements.searchUserModal));

    // Recherche d'utilisateur
    let searchTimeout;
    elements.searchUserInput.addEventListener('input', (e) => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            searchUsers(e.target.value.trim());
        }, 300);
    });

    // Modal paramètres
    elements.settingsBtn.addEventListener('click', () => openModal(elements.settingsModal));
    elements.closeSettingsBtn.addEventListener('click', () => closeModal(elements.settingsModal));

    // Modal profil
    if (elements.userProfileBtn) {
        elements.userProfileBtn.addEventListener('click', showProfileModal);
    }
    if (elements.closeProfileBtn) {
        elements.closeProfileBtn.addEventListener('click', () => closeModal(elements.profileModal));
    }
    if (elements.profileLogoutBtn) {
        elements.profileLogoutBtn.addEventListener('click', () => {
            closeModal(elements.profileModal);
            logout();
        });
    }

    // Bouton déconnexion dans le header
    if (elements.logoutBtn) {
        elements.logoutBtn.addEventListener('click', logout);
    }

    // Thème et mode sombre
    elements.darkModeToggle.addEventListener('change', (e) => {
        toggleDarkMode(e.target.checked);
    });

    elements.soundToggle.addEventListener('change', (e) => {
        state.settings.sound = e.target.checked;
        saveSettings();
    });

    document.querySelectorAll('.color-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            setTheme(btn.dataset.theme);
        });
    });

    // Emoji picker
    elements.emojiBtn.addEventListener('click', () => {
        elements.emojiPicker.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
        if (!elements.emojiBtn.contains(e.target) && !elements.emojiPicker.contains(e.target)) {
            elements.emojiPicker.classList.remove('active');
        }
    });

    // Fermer modals
    [elements.searchUserModal, elements.settingsModal, elements.profileModal].forEach(modal => {
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) closeModal(modal);
            });
        }
    });

    // Bouton retour mobile
    elements.backBtn.addEventListener('click', () => {
        elements.sidebar.classList.remove('hidden');
        if (state.currentChat) {
            SocketService.leaveChat(state.currentChat.id);
        }
        state.currentChat = null;
        elements.emptyState.style.display = 'flex';
        elements.chatHeader.style.display = 'none';
        elements.messagesContainer.style.display = 'none';
        elements.inputArea.style.display = 'none';
        renderChatList();
    });

    // Message vocal (simulation)
    let isRecording = false;
    elements.voiceBtn.addEventListener('click', () => {
        isRecording = !isRecording;
        elements.voiceBtn.classList.toggle('recording', isRecording);

        if (!isRecording && state.currentChat) {
            const message = {
                id: generateId(),
                text: '🎤 Message vocal (0:03)',
                sent: true,
                time: new Date()
            };
            state.currentChat.messages.push(message);
            state.currentChat.lastMessage = '🎤 Message vocal';
            state.currentChat.lastMessageTime = new Date();
            renderMessages();
            renderChatList();
            playSound('send');

            // Envoyer via API
            ChatsAPI.sendMessage(state.currentChat.id, '🎤 Message vocal', 'voice');
        }
    });

    // Pièce jointe
    elements.attachBtn.addEventListener('click', () => {
        if (state.currentChat) {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = async (e) => {
                const file = e.target.files[0];
                if (file) {
                    try {
                        showLoading(true);
                        const response = await ApiService.uploadFile(file, 'image');
                        showLoading(false);

                        if (response.success) {
                            const message = {
                                id: generateId(),
                                text: `📎 ${file.name}`,
                                sent: true,
                                time: new Date()
                            };
                            state.currentChat.messages.push(message);
                            state.currentChat.lastMessage = '📎 Fichier joint';
                            state.currentChat.lastMessageTime = new Date();
                            renderMessages();
                            renderChatList();
                            playSound('send');

                            await ChatsAPI.sendMessage(state.currentChat.id, response.data.url, 'file');
                        }
                    } catch (error) {
                        showLoading(false);
                        showToast('Erreur d\'upload', 'error');
                    }
                }
            };
            input.click();
        }
    });
}

// ========================================
// Initialisation
// ========================================
async function initApp() {
    renderUserProfile();
    loadSettings();
    renderEmojiPicker();
    setupSocketListeners();

    await Promise.all([
        loadChats(),
        loadInvitations()
    ]);

    console.log('Chatapp3 initialisé avec succès !');
}

async function init() {
    initEventListeners();

    // Vérifier si l'utilisateur est déjà connecté
    if (AuthService.isAuthenticated()) {
        showLoading(true);
        const result = await AuthService.checkAuth();
        showLoading(false);

        if (result.success) {
            state.currentUser = result.user;
            hideAuthModal();
            await initApp();
        } else {
            showAuthModal();
        }
    } else {
        showAuthModal();
    }
}

// Exposer certaines fonctions globalement pour les onclick dans le HTML
window.acceptInvitation = acceptInvitation;
window.declineInvitation = declineInvitation;
window.sendInvitation = sendInvitation;
window.logout = logout;

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);
