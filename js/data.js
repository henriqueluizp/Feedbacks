// Sistema de Popups de Notificação
const notifications = {
    show(message, type = 'success') {
        let container = document.getElementById('notifications-container');
        if (!container) {
            container = document.createElement('div');
            container.id = 'notifications-container';
            document.body.appendChild(container);
        }

        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;

        container.appendChild(notification);

        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => {
                notification.remove();
                if (container.children.length === 0) {
                    container.remove();
                }
            }, 300);
        }, 3000);
    },

    success(message) {
        this.show(message, 'success');
    },

    error(message) {
        this.show(message, 'error');
    }
};

// Sistema de Notificações Dropdown
class NotificationsManager {
    constructor() {
        this.notifications = [];
        this.dropdownElement = null;
        this.bellButton = null;
        this.menu = null;
        this.countElement = null;
    }

    async initialize() {
        try {
            // Carregar notificações
            this.notifications = await api.getNotifications();

            // Criar e adicionar o dropdown
            this.createDropdown();

            // Adicionar event listeners
            this.setupEventListeners();

            // Renderização inicial
            this.renderNotifications();
        } catch (error) {
            console.error('Erro ao inicializar notificações:', error);
            notifications.error('Erro ao carregar notificações');
        }
    }

    createDropdown() {
        const menuWrapper = document.querySelector('.menu-wrapper');
        if (!menuWrapper) return;

        this.dropdownElement = document.createElement('div');
        this.dropdownElement.className = 'notifications-dropdown';
        this.dropdownElement.innerHTML = `
            <button class="notifications-bell">
                <i class="fas fa-bell"></i>
                <span class="notifications-count">0</span>
            </button>
            <div class="notifications-menu">
                <div class="notifications-header">
                    <h3>Notificações</h3>
                    <button class="mark-all-read">
                        <i class="fas fa-check-double"></i>
                        Marcar como lidas
                    </button>
                </div>
                <ul class="notifications-list"></ul>
            </div>
        `;

        menuWrapper.appendChild(this.dropdownElement);

        // Guardar referências aos elementos
        this.bellButton = this.dropdownElement.querySelector('.notifications-bell');
        this.menu = this.dropdownElement.querySelector('.notifications-menu');
        this.countElement = this.dropdownElement.querySelector('.notifications-count');
    }

    setupEventListeners() {
        if (!this.dropdownElement) return;

        // Toggle da notificação
        this.bellButton.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleMenu();
        });

        // Fechar ao clicar fora
        document.addEventListener('click', (e) => {
            if (this.menu && !this.menu.contains(e.target)) {
                this.closeMenu();
            }
        });

        // Marcar notificação como lida
        this.dropdownElement.querySelector('.notifications-list').addEventListener('click', async (e) => {
            const item = e.target.closest('.notification-item');
            if (!item || !item.classList.contains('unread')) return;

            try {
                const notificationId = item.dataset.id;
                await api.markNotificationAsRead(notificationId);
                const notification = this.notifications.find(n => n.id === parseInt(notificationId));
                if (notification) {
                    notification.read = true;
                    this.renderNotifications();
                    notifications.success('Notificação marcada como lida');
                }
            } catch (error) {
                notifications.error('Erro ao marcar notificação como lida');
            }
        });

        // Marcar todas como lidas - Simulando success ou error da api
        this.dropdownElement.querySelector('.mark-all-read').addEventListener('click', async () => {
            try {
                await api.markAllNotificationsAsRead();
                this.notifications = this.notifications.map(n => ({ ...n, read: true }));
                this.renderNotifications();
                notifications.success('Todas as notificações foram marcadas como lidas');
            } catch (error) {
                notifications.error('Erro ao marcar notificações como lidas');
            }
        });
    }

    toggleMenu() {
        this.menu.classList.toggle('active');
    }

    closeMenu() {
        this.menu.classList.remove('active');
    }

    formatTimeAgo(date) {
        const now = new Date();
        const notifDate = new Date(date);
        const diff = now - notifDate;

        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);

        if (minutes < 1) return 'Agora mesmo';
        if (minutes < 60) return `${minutes} min atrás`;
        if (hours < 24) return `${hours}h atrás`;
        if (days < 7) return `${days} dias atrás`;

        return notifDate.toLocaleDateString('pt-BR');
    }


    renderNotifications() {
        if (!this.dropdownElement) return;

        const notificationsList = this.dropdownElement.querySelector('.notifications-list');
        const unreadCount = this.notifications.filter(n => !n.read).length;

        // Atualizar contador
        this.countElement.textContent = unreadCount;
        this.countElement.style.display = unreadCount > 0 ? 'block' : 'none';

        // Renderizar lista
        if (this.notifications.length === 0) {
            notificationsList.innerHTML = `
                <div class="notifications-empty">
                    <i class="fas fa-bell-slash"></i>
                    Nenhuma notificação no momento
                </div>
            `;
            return;
        }

        notificationsList.innerHTML = this.notifications
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map(notification => `
                <li class="notification-item ${notification.read ? '' : 'unread'}" data-id="${notification.id}">
                    <div class="notification-title">
                      
                        ${notification.type.charAt(0).toUpperCase() + notification.type.slice(1)}
                    </div>
                    <div class="notification-sender">
                    <div class="notification-message">${notification.message}</div>
                    <div class="notification-time">
                        <i class="far fa-clock"></i>
                        ${this.formatTimeAgo(notification.date)}
                    </div>    
                    </div>
                </li>
            `).join('');
    }
}

const mockData = {
    feedbacks: [
        {
            id: 1,
            sender: "João Silva",
            receiver: "Maria Santos",
            type: "elogio",
            area: "Desenvolvimento",
            message: "Excelente trabalho no último projeto!",
            date: "2025-04-05",
            status: "pendente"
        },
        {
            id: 2,
            sender: "Pedro Oliveira",
            receiver: "Ana Costa",
            type: "sugestão",
            area: "Design",
            message: "Sugiro melhorar a interface do usuário",
            date: "2025-04-05",
            response: "Certo, obrigado pelo seu feedback!",
            status: "respondido"
        },
        {
            id: 3,
            sender: "Carlos Lima",
            receiver: "Paulo Souza",
            type: "crítica",
            area: "Marketing",
            message: "Precisamos melhorar a comunicação",
            date: "2025-04-04",
            status: "enviado"
        },
        {
            id: 4,
            sender: "João Silva",
            receiver: "Maria Santos",
            type: "elogio",
            area: "Desenvolvimento",
            message: "Excelente trabalho no último projeto!",
            date: "2025-04-05",
            status: "pendente"
        },
        {
            id: 5,
            sender: "Carlos Lima",
            receiver: "Paulo Souza",
            type: "crítica",
            area: "Marketing",
            message: "Precisamos melhorar a comunicação",
            date: "2025-04-04",
            status: "enviado"
        },
        {
            id: 6,
            sender: "João Silva",
            receiver: "Maria Santos",
            type: "elogio",
            area: "Desenvolvimento",
            message: "Excelente trabalho no último projeto!",
            date: "2025-04-05",
            status: "pendente"
        },
    ],
    users: [
        { id: 1, name: "João Silva", department: "Desenvolvimento" },
        { id: 2, name: "Maria Santos", department: "Design" },
        { id: 3, name: "Pedro Oliveira", department: "Marketing" },
        { id: 4, name: "Ana Costa", department: "RH" },
        { id: 5, name: "Carlos Lima", department: "Financeiro" }
    ],
    notifications: [
        {
            id: 1,
            type: "elogio",
            message: "Você recebeu um novo elogio de João Silva",
            date: new Date().toISOString(),
            read: false
        },
        {
            id: 2,
            type: "sugestao",
            message: "Nova sugestão recebida do departamento de Design",
            date: new Date(Date.now() - 3600000).toISOString(), // 1 hora atrás
            read: false
        },
        {
            id: 3,
            type: "critica",
            message: "Feedback crítico requer sua atenção",
            date: new Date(Date.now() - 86400000).toISOString(), // 1 dia atrás
            read: true
        }
    ]
};

// Função para simular uma API
const api = {
    getFeedbacks: () => new Promise(resolve => setTimeout(() => resolve(mockData.feedbacks), 500)),
    getUsers: () => new Promise(resolve => setTimeout(() => resolve(mockData.users), 500)),

    // Método para obter notificações
    getNotifications: () => new Promise(resolve => setTimeout(() => resolve(mockData.notifications), 500)),

    sendFeedback: (feedback) => new Promise(resolve => {
        const random = Math.floor(Math.random() * 10);
        setTimeout(() => {
            if ([3, 5, 9].includes(random)) {
                resolve({ success: false, message: "Erro ao enviar feedback" });
            } else {
                mockData.feedbacks.push({
                    ...feedback,
                    id: mockData.feedbacks.length + 1,
                    date: new Date().toISOString().split('T')[0],
                    status: "enviado"
                });

                // Adicionar notificação
                const newNotification = {
                    id: Date.now(),
                    type: feedback.type,
                    message: `Novo feedback do tipo ${feedback.type} enviado`,
                    date: new Date().toISOString(),
                    read: false
                };

                mockData.notifications.unshift(newNotification);
                resolve({ success: true, message: "Feedback enviado com sucesso!" });
            }
        }, 1000);
    }),

    sendResponse: (feedbackId, response) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const feedbackIndex = mockData.feedbacks.findIndex(f => f.id === feedbackId);
            if (feedbackIndex === -1) {
                reject(new Error('Feedback não encontrado'));
                return;
            }

            mockData.feedbacks[feedbackIndex].status = 'respondido';
            mockData.feedbacks[feedbackIndex].response = response;

            // Adicionar notificação
            const newNotification = {
                id: Date.now(),
                type: 'resposta',
                message: `Seu feedback recebeu uma resposta`,
                date: new Date().toISOString(),
                read: false
            };

            mockData.notifications.unshift(newNotification);
            resolve({ success: true, message: 'Resposta enviada com sucesso!' });
        }, 500);
    }),

    archiveFeedback: (feedbackId) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const feedbackIndex = mockData.feedbacks.findIndex(f => f.id === feedbackId);
            if (feedbackIndex === -1) {
                reject(new Error('Feedback não encontrado'));
                return;
            }

            mockData.feedbacks[feedbackIndex].status = 'arquivado';
            resolve({ success: true, message: 'Feedback arquivado com sucesso!' });
        }, 500);
    }),

    markNotificationAsRead: (notificationId) => new Promise((resolve, reject) => {
        setTimeout(() => {
            const notificationIndex = mockData.notifications.findIndex(n => n.id === parseInt(notificationId));
            if (notificationIndex !== -1) {
                mockData.notifications[notificationIndex].read = true;
                resolve(true);
            } else {
                resolve(false);
            }
        }, 300);
    }),

    markAllNotificationsAsRead: () => new Promise((resolve) => {
        setTimeout(() => {
            mockData.notifications = mockData.notifications.map(n => ({ ...n, read: true }));
            resolve(true);
        }, 300);
    }),

    deleteNotification: (notificationId) => new Promise((resolve) => {
        setTimeout(() => {
            mockData.notifications = mockData.notifications.filter(n => n.id !== parseInt(notificationId));
            resolve(true);
        }, 300);
    })
};

// Exportar o objeto notifications para uso global
window.notifications = notifications;

// Inicializar o gerenciador de notificações quando o DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    const notificationsManager = new NotificationsManager();
    notificationsManager.initialize();
}); 