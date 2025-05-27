document.addEventListener('DOMContentLoaded', function() {
            // Modal para adicionar amigo
            const addFriendBtn = document.getElementById('addFriendBtn');
            const addFriendModal = document.getElementById('addFriendModal');
            const closeModalBtns = document.querySelectorAll('.close-modal, .close-modal-btn');
            
            addFriendBtn.addEventListener('click', function() {
                addFriendModal.style.display = 'flex';
            });
            
            closeModalBtns.forEach(btn => {
                btn.addEventListener('click', function() {
                    addFriendModal.style.display = 'none';
                });
            });
            
            // Fechar modal ao clicar fora dele
            window.addEventListener('click', function(event) {
                if (event.target === addFriendModal) {
                    addFriendModal.style.display = 'none';
                }
            });
            
            // Prevenir envio do formulário (apenas para demonstração)
            document.querySelector('.modal-form').addEventListener('submit', function(e) {
                e.preventDefault();
                alert('Solicitação de amizade enviada com sucesso!');
                addFriendModal.style.display = 'none';
            });
            
            // Botões de aceitar/recusar solicitações
            const acceptButtons = document.querySelectorAll('.request-btn:not(.secondary)');
            const rejectButtons = document.querySelectorAll('.request-btn.secondary:not(.close-modal-btn)');
            
            acceptButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const requestCard = this.closest('.request-card');
                    if (requestCard) {
                        alert('Solicitação aceita!');
                        requestCard.style.display = 'none';
                    }
                });
            });
            
            rejectButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const requestCard = this.closest('.request-card');
                    if (requestCard) {
                        alert('Solicitação recusada.');
                        requestCard.style.display = 'none';
                    }
                });
            });
            
            // Botões de mensagem
            const messageButtons = document.querySelectorAll('.friend-btn');
            
            messageButtons.forEach(btn => {
                btn.addEventListener('click', function() {
                    const friendName = this.closest('.friend-info').querySelector('.friend-name').textContent;
                    window.location.href = '../mensagen/mensagens.html';
                });
            });
        });