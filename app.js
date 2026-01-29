// ========================================
// Chatapp3 - Application JavaScript
// ========================================

// État de l'application
const state = {
    currentUser: {
        id: 'user-1',
        name: 'Mon Profil',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=user'
    },
    currentChat: null,
    chats: [],
    settings: {
        darkMode: false,
        theme: 'lavender',
        sound: true
    }
};

// Données de démonstration
const demoChats = [
    {
        id: 'chat-1',
        name: 'Marie Dupont',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=marie',
        online: true,
        lastMessage: 'Super, on se voit demain alors !',
        lastMessageTime: new Date(Date.now() - 5 * 60000),
        unread: 2,
        messages: [
            { id: 'm1', text: 'Salut ! Comment vas-tu ?', sent: false, time: new Date(Date.now() - 3600000) },
            { id: 'm2', text: 'Très bien merci ! Et toi ?', sent: true, time: new Date(Date.now() - 3500000) },
            { id: 'm3', text: 'Ça va ! Tu es libre demain soir ?', sent: false, time: new Date(Date.now() - 3400000) },
            { id: 'm4', text: 'Oui, pourquoi ?', sent: true, time: new Date(Date.now() - 3300000) },
            { id: 'm5', text: 'On pourrait aller au restaurant !', sent: false, time: new Date(Date.now() - 600000) },
            { id: 'm6', text: 'Super, on se voit demain alors !', sent: false, time: new Date(Date.now() - 5 * 60000) }
        ]
    },
    {
        id: 'chat-2',
        name: 'Équipe Projet',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=team',
        online: false,
        lastMessage: 'La réunion est à 14h',
        lastMessageTime: new Date(Date.now() - 30 * 60000),
        unread: 0,
        messages: [
            { id: 'm1', text: 'Bonjour à tous !', sent: false, time: new Date(Date.now() - 7200000) },
            { id: 'm2', text: 'On fait le point sur le projet ?', sent: true, time: new Date(Date.now() - 7100000) },
            { id: 'm3', text: 'Bonne idée, on se retrouve en visio ?', sent: false, time: new Date(Date.now() - 7000000) },
            { id: 'm4', text: 'La réunion est à 14h', sent: false, time: new Date(Date.now() - 30 * 60000) }
        ]
    },
    {
        id: 'chat-3',
        name: 'Lucas Martin',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lucas',
        online: true,
        lastMessage: 'As-tu regardé le match hier ?',
        lastMessageTime: new Date(Date.now() - 2 * 3600000),
        unread: 1,
        messages: [
            { id: 'm1', text: 'Hey !', sent: false, time: new Date(Date.now() - 3 * 3600000) },
            { id: 'm2', text: 'Salut Lucas !', sent: true, time: new Date(Date.now() - 2.9 * 3600000) },
            { id: 'm3', text: 'As-tu regardé le match hier ?', sent: false, time: new Date(Date.now() - 2 * 3600000) }
        ]
    },
    {
        id: 'chat-4',
        name: 'Sophie Bernard',
        avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sophie',
        online: false,
        lastMessage: 'Merci beaucoup pour ton aide !',
        lastMessageTime: new Date(Date.now() - 24 * 3600000),
        unread: 0,
        messages: [
            { id: 'm1', text: 'Tu peux m\'aider avec ce problème ?', sent: false, time: new Date(Date.now() - 25 * 3600000) },
            { id: 'm2', text: 'Bien sûr, envoie-moi les détails', sent: true, time: new Date(Date.now() - 24.5 * 3600000) },
            { id: 'm3', text: 'Merci beaucoup pour ton aide !', sent: false, time: new Date(Date.now() - 24 * 3600000) }
        ]
    }
];

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
    sidebar: document.querySelector('.sidebar')
};

// ========================================
// Fonctions Utilitaires
// ========================================
function formatTime(date) {
    return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
}

function formatRelativeTime(date) {
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

    // Créer un son simple avec l'API Web Audio
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

// ========================================
// Rendu de l'interface
// ========================================
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

    // Ajouter les événements de clic
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

        // Ajouter un séparateur de date si nécessaire
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

        const avatarSrc = msg.sent ? state.currentUser.avatar : state.currentChat.avatar;

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

function isToday(date) {
    const today = new Date();
    return date.toDateString() === today.toDateString();
}

function isYesterday(date) {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return date.toDateString() === yesterday.toDateString();
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
            <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}" alt="Avatar ${seed}">
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
function selectChat(chatId) {
    const chat = state.chats.find(c => c.id === chatId);
    if (!chat) return;

    state.currentChat = chat;
    chat.unread = 0; // Marquer comme lu

    // Mettre à jour l'interface
    elements.emptyState.style.display = 'none';
    elements.chatHeader.style.display = 'flex';
    elements.messagesContainer.style.display = 'block';
    elements.inputArea.style.display = 'flex';

    // Mettre à jour l'en-tête
    elements.contactAvatar.src = chat.avatar;
    elements.contactName.textContent = chat.name;
    elements.contactStatus.className = `status-indicator ${chat.online ? 'online' : ''}`;

    // Afficher les messages
    renderMessages();
    renderChatList();

    // Sur mobile, cacher la sidebar
    if (window.innerWidth <= 900) {
        elements.sidebar.classList.add('hidden');
    }
}

function sendMessage() {
    const text = elements.messageInput.value.trim();
    if (!text || !state.currentChat) return;

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

    // Simuler une réponse après un délai
    simulateTyping();
}

function simulateTyping() {
    elements.typingIndicator.classList.add('visible');

    setTimeout(() => {
        elements.typingIndicator.classList.remove('visible');
        receiveMessage();
    }, 1500 + Math.random() * 2000);
}

function receiveMessage() {
    if (!state.currentChat) return;

    const responses = [
        'D\'accord, je comprends !',
        'C\'est une bonne idée !',
        'Merci pour l\'info !',
        'Super, on fait comme ça !',
        'Je reviens vers toi rapidement.',
        'Parfait !',
        'Pas de problème !',
        'Je vais y réfléchir.',
        'Très intéressant !',
        'On en reparle bientôt !'
    ];

    const randomResponse = responses[Math.floor(Math.random() * responses.length)];

    const message = {
        id: generateId(),
        text: randomResponse,
        sent: false,
        time: new Date()
    };

    state.currentChat.messages.push(message);
    state.currentChat.lastMessage = randomResponse;
    state.currentChat.lastMessageTime = new Date();

    renderMessages();
    renderChatList();
    playSound('receive');
}

function createNewChat() {
    const name = elements.newContactName.value.trim();
    if (!name) return;

    const selectedAvatar = elements.avatarOptions.querySelector('.avatar-option.selected');
    const seed = selectedAvatar ? selectedAvatar.dataset.seed : avatarSeeds[0];

    const newChat = {
        id: generateId(),
        name: name,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${seed}`,
        online: Math.random() > 0.5,
        lastMessage: 'Nouvelle conversation',
        lastMessageTime: new Date(),
        unread: 0,
        messages: []
    };

    state.chats.unshift(newChat);
    renderChatList();
    closeModal(elements.newChatModal);
    selectChat(newChat.id);

    elements.newContactName.value = '';
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

        // Appliquer les paramètres
        setTheme(state.settings.theme);
        toggleDarkMode(state.settings.darkMode);
        elements.darkModeToggle.checked = state.settings.darkMode;
        elements.soundToggle.checked = state.settings.sound;
    }
}

// ========================================
// Événements
// ========================================
function initEventListeners() {
    // Recherche
    elements.searchInput.addEventListener('input', (e) => {
        renderChatList(e.target.value);
    });

    // Envoi de message
    elements.sendBtn.addEventListener('click', sendMessage);
    elements.messageInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendMessage();
    });

    // Modal nouveau chat
    elements.newChatBtn.addEventListener('click', () => {
        renderAvatarOptions();
        openModal(elements.newChatModal);
    });
    elements.closeModalBtn.addEventListener('click', () => closeModal(elements.newChatModal));
    elements.cancelNewChat.addEventListener('click', () => closeModal(elements.newChatModal));
    elements.confirmNewChat.addEventListener('click', createNewChat);

    // Modal paramètres
    elements.settingsBtn.addEventListener('click', () => openModal(elements.settingsModal));
    elements.closeSettingsBtn.addEventListener('click', () => closeModal(elements.settingsModal));

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

    // Fermer emoji picker en cliquant ailleurs
    document.addEventListener('click', (e) => {
        if (!elements.emojiBtn.contains(e.target) && !elements.emojiPicker.contains(e.target)) {
            elements.emojiPicker.classList.remove('active');
        }
    });

    // Fermer modals en cliquant en dehors
    [elements.newChatModal, elements.settingsModal].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal(modal);
        });
    });

    // Bouton retour mobile
    elements.backBtn.addEventListener('click', () => {
        elements.sidebar.classList.remove('hidden');
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
            // Simuler l'envoi d'un message vocal
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
        }
    });

    // Pièce jointe (simulation)
    elements.attachBtn.addEventListener('click', () => {
        if (state.currentChat) {
            const message = {
                id: generateId(),
                text: '📎 Fichier joint',
                sent: true,
                time: new Date()
            };
            state.currentChat.messages.push(message);
            state.currentChat.lastMessage = '📎 Fichier joint';
            state.currentChat.lastMessageTime = new Date();
            renderMessages();
            renderChatList();
            playSound('send');
        }
    });
}

// ========================================
// Initialisation
// ========================================
function init() {
    // Charger les données de démonstration
    state.chats = demoChats;

    // Charger les paramètres sauvegardés
    loadSettings();

    // Initialiser l'interface
    renderChatList();
    renderEmojiPicker();

    // Ajouter les écouteurs d'événements
    initEventListeners();

    console.log('Chatapp3 initialisé avec succès !');
}

// Démarrer l'application
document.addEventListener('DOMContentLoaded', init);
