// Sistema de mensagens para o Crow-d
document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do DOM
    const conversationsList = document.querySelector('.conversations-list');
    const chatMessages = document.querySelector('.chat-messages');
    const chatInput = document.querySelector('.chat-input');
    const sendButton = document.querySelector('.chat-send-btn');
    const chatUserName = document.querySelector('.chat-user-name');
    const chatUserStatus = document.querySelector('.chat-user-status');
    const chatAvatar = document.querySelector('.chat-avatar');
    
    // ID da conversa ativa
    let activeConversationId = '1';
    
    // Carregar conversas e mensagens do localStorage
    loadConversations();
    loadMessages(activeConversationId);
    
    // Event listener para o botão de enviar mensagem
    sendButton.addEventListener('click', function() {
        sendMessage();
    });
    
    // Event listener para o input de mensagem (Enter)
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
    
    // Event delegation para cliques nas conversas
    conversationsList.addEventListener('click', function(e) {
        const conversationItem = e.target.closest('.conversation-item');
        if (conversationItem) {
            const conversationId = conversationItem.dataset.conversation;
            changeActiveConversation(conversationId);
        }
    });
    
    // Função para enviar uma mensagem
    function sendMessage() {
        const content = chatInput.value.trim();
        
        if (content) {
            // Criar objeto de mensagem
            const message = {
                id: Date.now().toString(),
                conversationId: activeConversationId,
                sender: 'me', // 'me' para mensagens enviadas pelo usuário
                content: content,
                timestamp: new Date().toISOString()
            };
            
            // Adicionar mensagem ao localStorage
            const messages = getMessages();
            messages.push(message);
            localStorage.setItem('messages', JSON.stringify(messages));
            
            // Adicionar mensagem ao DOM
            addMessageToDOM(message);
            
            // Atualizar última mensagem na conversa
            updateConversationLastMessage(activeConversationId, content);
            
            // Limpar input
            chatInput.value = '';
            
            // Rolar para o final da conversa
            scrollToBottom();
        }
    }
    
    // Função para carregar conversas do localStorage
    function loadConversations() {
        const conversations = getConversations();
        
        // Limpar lista de conversas
        conversationsList.innerHTML = '';
        
        // Adicionar conversas ao DOM
        conversations.forEach(conversation => {
            addConversationToDOM(conversation);
        });
        
        // Marcar a conversa ativa
        const activeConversation = conversationsList.querySelector(`[data-conversation="${activeConversationId}"]`);
        if (activeConversation) {
            activeConversation.classList.add('active');
            
            // Atualizar cabeçalho do chat
            updateChatHeader(activeConversationId);
        }
    }
    
    // Função para carregar mensagens de uma conversa
    function loadMessages(conversationId) {
        const messages = getMessages().filter(m => m.conversationId === conversationId);
        
        // Limpar área de mensagens
        chatMessages.innerHTML = '';
        
        // Adicionar mensagens ao DOM
        messages.forEach(message => {
            addMessageToDOM(message);
        });
        
        // Rolar para o final da conversa
        scrollToBottom();
        
        // Marcar mensagens como lidas
        markConversationAsRead(conversationId);
    }
    
    // Função para adicionar uma conversa ao DOM
    function addConversationToDOM(conversation) {
        // Formatar hora da última mensagem
        const time = formatMessageTime(new Date(conversation.lastMessageTime));
        
        // Criar HTML para a conversa
        const conversationHTML = `
            <div class="conversation-item ${conversation.id === activeConversationId ? 'active' : ''}" data-conversation="${conversation.id}">
                <img src="${conversation.avatar}" alt="Avatar" class="conversation-avatar">
                <div class="conversation-info">
                    <div class="conversation-header">
                        <h3 class="conversation-name">${conversation.name}</h3>
                        <span class="conversation-time">${time}</span>
                    </div>
                    <p class="conversation-preview">${conversation.lastMessage}</p>
                </div>
                ${conversation.unreadCount > 0 ? `
                <div class="conversation-status">
                    <span class="unread-count">${conversation.unreadCount}</span>
                </div>
                ` : ''}
            </div>
        `;
        
        // Adicionar à lista de conversas
        conversationsList.insertAdjacentHTML('beforeend', conversationHTML);
    }
    
    // Função para adicionar uma mensagem ao DOM
    function addMessageToDOM(message) {
        // Formatar hora da mensagem
        const time = formatMessageTime(new Date(message.timestamp));
        
        // Determinar classe da mensagem (enviada ou recebida)
        const messageClass = message.sender === 'me' ? 'sent' : 'received';
        
        // Criar HTML para a mensagem
        const messageHTML = `
            <div class="message ${messageClass}" data-message-id="${message.id}">
                <div class="message-content">
                    <p class="message-text">${formatMessageContent(message.content)}</p>
                    <div class="message-time">${time}</div>
                </div>
            </div>
        `;
        
        // Adicionar à área de mensagens
        chatMessages.insertAdjacentHTML('beforeend', messageHTML);
    }
    
    // Função para mudar a conversa ativa
    function changeActiveConversation(conversationId) {
        if (conversationId === activeConversationId) return;
        
        // Atualizar ID da conversa ativa
        activeConversationId = conversationId;
        
        // Remover classe 'active' de todas as conversas
        const conversationItems = conversationsList.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            item.classList.remove('active');
        });
        
        // Adicionar classe 'active' à conversa selecionada
        const selectedConversation = conversationsList.querySelector(`[data-conversation="${conversationId}"]`);
        if (selectedConversation) {
            selectedConversation.classList.add('active');
        }
        
        // Carregar mensagens da conversa selecionada
        loadMessages(conversationId);
        
        // Atualizar cabeçalho do chat
        updateChatHeader(conversationId);
    }
    
    // Função para atualizar o cabeçalho do chat
    function updateChatHeader(conversationId) {
        const conversations = getConversations();
        const conversation = conversations.find(c => c.id === conversationId);
        
        if (conversation) {
            chatUserName.textContent = conversation.name;
            chatAvatar.src = conversation.avatar;
            
            // Atualizar status (online/offline)
            const statusBadge = chatUserStatus.querySelector('.status-badge');
            if (statusBadge) {
                statusBadge.className = 'status-badge';
                statusBadge.classList.add(conversation.online ? 'online' : 'offline');
            }
            
            chatUserStatus.querySelector('span:not(.status-badge)').textContent = 
                conversation.online ? 'Online' : 'Offline';
        }
    }
    
    // Função para atualizar a última mensagem de uma conversa
    function updateConversationLastMessage(conversationId, content) {
        const conversations = getConversations();
        const conversationIndex = conversations.findIndex(c => c.id === conversationId);
        
        if (conversationIndex !== -1) {
            conversations[conversationIndex].lastMessage = content;
            conversations[conversationIndex].lastMessageTime = new Date().toISOString();
            
            // Se a mensagem for enviada pelo usuário atual, não incrementar contador de não lidas
            
            localStorage.setItem('conversations', JSON.stringify(conversations));
            
            // Atualizar DOM
            const conversationItem = conversationsList.querySelector(`[data-conversation="${conversationId}"]`);
            if (conversationItem) {
                const previewElement = conversationItem.querySelector('.conversation-preview');
                const timeElement = conversationItem.querySelector('.conversation-time');
                
                if (previewElement) {
                    previewElement.textContent = content;
                }
                
                if (timeElement) {
                    timeElement.textContent = formatMessageTime(new Date());
                }
            }
        }
    }
    
    // Função para marcar uma conversa como lida
    function markConversationAsRead(conversationId) {
        const conversations = getConversations();
        const conversationIndex = conversations.findIndex(c => c.id === conversationId);
        
        if (conversationIndex !== -1 && conversations[conversationIndex].unreadCount > 0) {
            conversations[conversationIndex].unreadCount = 0;
            localStorage.setItem('conversations', JSON.stringify(conversations));
            
            // Atualizar DOM
            const conversationItem = conversationsList.querySelector(`[data-conversation="${conversationId}"]`);
            if (conversationItem) {
                const unreadElement = conversationItem.querySelector('.conversation-status');
                if (unreadElement) {
                    unreadElement.remove();
                }
            }
        }
    }
    
    // Função para formatar o conteúdo da mensagem
    function formatMessageContent(content) {
        // Substituir URLs por links clicáveis
        content = content.replace(
            /(https?:\/\/[^\s]+)/g, 
            '<a href="$1" target="_blank">$1</a>'
        );
        
        // Substituir emojis (exemplo simples)
        content = content.replace(/:\)/g, '😊');
        content = content.replace(/:\(/g, '😢');
        content = content.replace(/:D/g, '😃');
        content = content.replace(/:P/g, '😛');
        
        // Substituir quebras de linha por <br>
        content = content.replace(/\n/g, '<br>');
        
        return content;
    }
    
    // Função para formatar a hora da mensagem
    function formatMessageTime(date) {
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        
        // Se for hoje, mostrar apenas a hora
        if (date >= today) {
            return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        }
        
        // Se for ontem, mostrar "Ontem"
        if (date >= yesterday && date < today) {
            return 'Ontem';
        }
        
        // Se for esta semana, mostrar o dia da semana
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay());
        
        if (date >= weekStart) {
            const days = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
            return days[date.getDay()];
        }
        
        // Caso contrário, mostrar a data
        return date.toLocaleDateString();
    }
    
    // Função para rolar para o final da conversa
    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }
    
    // Função para obter conversas do localStorage
    function getConversations() {
        const conversationsJSON = localStorage.getItem('conversations');
        return conversationsJSON ? JSON.parse(conversationsJSON) : [];
    }
    
    // Função para obter mensagens do localStorage
    function getMessages() {
        const messagesJSON = localStorage.getItem('messages');
        return messagesJSON ? JSON.parse(messagesJSON) : [];
    }
    
    // Inicializar com conversas e mensagens de exemplo se não houver
    function initializeExampleData() {
        // Verificar se já existem conversas
        const conversations = getConversations();
        
        if (conversations.length === 0) {
            // Criar conversas de exemplo
            const exampleConversations = [
                {
                    id: '1',
                    name: 'Ana Silva',
                    avatar: '../img/Design sem nome2.png',
                    lastMessage: 'Você vai participar do grupo de estudos hoje?',
                    lastMessageTime: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 minutos atrás
                    unreadCount: 2,
                    online: true
                },
                {
                    id: '2',
                    name: 'Pedro Almeida',
                    avatar: '../img/Design sem nome2.png',
                    lastMessage: 'Não esqueça do treino de basquete às 15h!',
                    lastMessageTime: new Date(Date.now() - 45 * 60 * 1000).toISOString(), // 45 minutos atrás
                    unreadCount: 0,
                    online: false
                },
                {
                    id: '3',
                    name: 'Grupo de Estudos',
                    avatar: '../img/Design sem nome2.png',
                    lastMessage: 'Carlos: Alguém tem o material de matemática?',
                    lastMessageTime: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // 1 dia atrás
                    unreadCount: 5,
                    online: false
                },
                {
                    id: '4',
                    name: 'Mariana Costa',
                    avatar: '../img/Design sem nome2.png',
                    lastMessage: 'Adorei suas fotos do festival de música!',
                    lastMessageTime: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(), // 1 dia e 1 hora atrás
                    unreadCount: 0,
                    online: true
                },
                {
                    id: '5',
                    name: 'Lucas Oliveira',
                    avatar: '../img/Design sem nome2.png',
                    lastMessage: 'Vamos jogar online mais tarde?',
                    lastMessageTime: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 dias atrás
                    unreadCount: 0,
                    online: false
                }
            ];
            
            localStorage.setItem('conversations', JSON.stringify(exampleConversations));
            
            // Criar mensagens de exemplo
            const exampleMessages = [
                {
                    id: '101',
                    conversationId: '1',
                    sender: 'other',
                    content: 'Oi! Tudo bem?',
                    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString() // 15 minutos atrás
                },
                {
                    id: '102',
                    conversationId: '1',
                    sender: 'me',
                    content: 'Oi Ana! Tudo ótimo, e você?',
                    timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString() // 13 minutos atrás
                },
                {
                    id: '103',
                    conversationId: '1',
                    sender: 'other',
                    content: 'Estou bem também! Você vai participar do grupo de estudos hoje?',
                    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString() // 10 minutos atrás
                },
                {
                    id: '104',
                    conversationId: '1',
                    sender: 'other',
                    content: 'Vamos nos reunir na biblioteca depois da aula para revisar matemática.',
                    timestamp: new Date(Date.now() - 9 * 60 * 1000).toISOString() // 9 minutos atrás
                },
                {
                    id: '201',
                    conversationId: '2',
                    sender: 'other',
                    content: 'E aí, preparado para o treino de hoje?',
                    timestamp: new Date(Date.now() - 50 * 60 * 1000).toISOString() // 50 minutos atrás
                },
                {
                    id: '202',
                    conversationId: '2',
                    sender: 'me',
                    content: 'Sim, já separei o uniforme!',
                    timestamp: new Date(Date.now() - 48 * 60 * 1000).toISOString() // 48 minutos atrás
                },
                {
                    id: '203',
                    conversationId: '2',
                    sender: 'other',
                    content: 'Não esqueça do treino de basquete às 15h!',
                    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString() // 45 minutos atrás
                }
            ];
            
            localStorage.setItem('messages', JSON.stringify(exampleMessages));
            
            return { conversations: exampleConversations, messages: exampleMessages };
        }
        
        return { conversations, messages: getMessages() };
    }
    
    // Inicializar dados de exemplo
    initializeExampleData();
});
