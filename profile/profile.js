// Script para a página de edição de perfil
document.addEventListener('DOMContentLoaded', function() {
    // Referências aos elementos do DOM
    const profileForm = document.getElementById('profileEditForm');
    const photoInput = document.getElementById('profilePhoto');
    const photoPreview = document.getElementById('photoPreview');
    const customHobbyInput = document.getElementById('customHobby');
    const addCustomHobbyBtn = document.getElementById('addCustomHobby');
    const customHobbiesList = document.getElementById('customHobbiesList');
    
    // Carregar dados do perfil do localStorage (se existirem)
    loadProfileData();
    
    // Event listener para upload e preview de foto
    photoInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            // Verificar se é uma imagem
            if (!file.type.match('image.*')) {
                alert('Por favor, selecione uma imagem.');
                return;
            }
            
            // Criar um FileReader para ler o arquivo
            const reader = new FileReader();
            reader.onload = function(e) {
                // Atualizar a imagem de preview
                photoPreview.src = e.target.result;
                
                // Salvar a imagem no localStorage (como base64)
                localStorage.setItem('profilePhoto', e.target.result);
            };
            reader.readAsDataURL(file);
        }
    });
    
    // Event listener para adicionar hobby personalizado
    addCustomHobbyBtn.addEventListener('click', function() {
        addCustomHobby();
    });
    
    // Permitir adicionar hobby ao pressionar Enter
    customHobbyInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            addCustomHobby();
        }
    });
    
    // Event delegation para remover hobbies personalizados
    customHobbiesList.addEventListener('click', function(e) {
        if (e.target.classList.contains('remove-hobby') || e.target.parentElement.classList.contains('remove-hobby')) {
            const hobbyTag = e.target.closest('.hobby-tag');
            if (hobbyTag) {
                hobbyTag.remove();
                saveCustomHobbies();
            }
        }
    });
    
    // Event listener para salvar o formulário
    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        saveProfileData();
        
        // Mostrar mensagem de sucesso
        showSaveMessage();
    });
    
    // Função para adicionar hobby personalizado
    function addCustomHobby() {
        const hobbyText = customHobbyInput.value.trim();
        if (hobbyText) {
            // Criar elemento de hobby
            const hobbyTag = document.createElement('span');
            hobbyTag.className = 'hobby-tag';
            hobbyTag.innerHTML = `${hobbyText} <i class="fas fa-times remove-hobby"></i>`;
            
            // Adicionar à lista
            customHobbiesList.appendChild(hobbyTag);
            
            // Limpar o input
            customHobbyInput.value = '';
            
            // Salvar hobbies personalizados
            saveCustomHobbies();
        }
    }
    
    // Função para salvar hobbies personalizados
    function saveCustomHobbies() {
        const hobbies = [];
        const hobbyTags = customHobbiesList.querySelectorAll('.hobby-tag');
        
        hobbyTags.forEach(tag => {
            // Obter o texto do hobby (sem o ícone de remover)
            const hobbyText = tag.textContent.trim();
            hobbies.push(hobbyText);
        });
        
        // Salvar no localStorage
        localStorage.setItem('customHobbies', JSON.stringify(hobbies));
    }
    
    // Função para carregar hobbies personalizados
    function loadCustomHobbies() {
        const hobbies = JSON.parse(localStorage.getItem('customHobbies')) || [];
        
        // Limpar a lista atual
        customHobbiesList.innerHTML = '';
        
        // Adicionar cada hobby à lista
        hobbies.forEach(hobby => {
            const hobbyTag = document.createElement('span');
            hobbyTag.className = 'hobby-tag';
            hobbyTag.innerHTML = `${hobby} <i class="fas fa-times remove-hobby"></i>`;
            customHobbiesList.appendChild(hobbyTag);
        });
    }
    
    // Função para salvar todos os dados do perfil
    function saveProfileData() {
        // Coletar dados do formulário
        const nickname = document.getElementById('nickname').value;
        const bio = document.getElementById('bio').value;
        const school = document.getElementById('school').value;
        const grade = document.getElementById('grade').value;
        
        // Coletar hobbies selecionados
        const selectedHobbies = [];
        const hobbyCheckboxes = document.querySelectorAll('input[name="hobbies"]:checked');
        hobbyCheckboxes.forEach(checkbox => {
            selectedHobbies.push(checkbox.value);
        });
        
        // Coletar visibilidade
        const visibility = document.querySelector('input[name="visibility"]:checked').value;
        
        // Criar objeto de perfil
        const profileData = {
            nickname,
            bio,
            school,
            grade,
            hobbies: selectedHobbies,
            visibility
        };
        
        // Salvar no localStorage
        localStorage.setItem('profileData', JSON.stringify(profileData));
        
        // Também salvar hobbies personalizados
        saveCustomHobbies();
    }
    
    // Função para carregar dados do perfil
    function loadProfileData() {
        // Carregar foto do perfil
        const savedPhoto = localStorage.getItem('profilePhoto');
        if (savedPhoto) {
            photoPreview.src = savedPhoto;
        }
        
        // Carregar dados do perfil
        const profileData = JSON.parse(localStorage.getItem('profileData'));
        if (profileData) {
            // Preencher campos do formulário
            document.getElementById('nickname').value = profileData.nickname || 'Ana Silva';
            document.getElementById('bio').value = profileData.bio || 'Estudante de Desenvolvimento de Sistemas, apaixonada por tecnologia e música. Sempre em busca de novos desafios e aprendizados!';
            
            // Selecionar escola
            const schoolSelect = document.getElementById('school');
            if (profileData.school) {
                for (let i = 0; i < schoolSelect.options.length; i++) {
                    if (schoolSelect.options[i].value === profileData.school) {
                        schoolSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Selecionar série/ano
            const gradeSelect = document.getElementById('grade');
            if (profileData.grade) {
                for (let i = 0; i < gradeSelect.options.length; i++) {
                    if (gradeSelect.options[i].value === profileData.grade) {
                        gradeSelect.selectedIndex = i;
                        break;
                    }
                }
            }
            
            // Marcar hobbies
            if (profileData.hobbies && profileData.hobbies.length > 0) {
                const hobbyCheckboxes = document.querySelectorAll('input[name="hobbies"]');
                hobbyCheckboxes.forEach(checkbox => {
                    if (profileData.hobbies.includes(checkbox.value)) {
                        checkbox.checked = true;
                    } else {
                        checkbox.checked = false;
                    }
                });
            }
            
            // Definir visibilidade
            if (profileData.visibility) {
                const visibilityRadios = document.querySelectorAll('input[name="visibility"]');
                visibilityRadios.forEach(radio => {
                    radio.checked = (radio.value === profileData.visibility);
                });
            }
        }
        
        // Carregar hobbies personalizados
        loadCustomHobbies();
    }
    
    // Função para mostrar mensagem de sucesso ao salvar
    function showSaveMessage() {
        // Criar elemento de mensagem
        const messageElement = document.createElement('div');
        messageElement.className = 'save-message';
        messageElement.innerHTML = '<i class="fas fa-check-circle"></i> Perfil atualizado com sucesso!';
        
        // Estilizar a mensagem
        messageElement.style.position = 'fixed';
        messageElement.style.bottom = '20px';
        messageElement.style.right = '20px';
        messageElement.style.backgroundColor = 'var(--primary-color)';
        messageElement.style.color = 'white';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = 'var(--border-radius)';
        messageElement.style.boxShadow = 'var(--box-shadow)';
        messageElement.style.display = 'flex';
        messageElement.style.alignItems = 'center';
        messageElement.style.gap = '10px';
        messageElement.style.zIndex = '1000';
        
        // Adicionar ao corpo do documento
        document.body.appendChild(messageElement);
        
        // Remover após alguns segundos
        setTimeout(() => {
            messageElement.style.opacity = '0';
            messageElement.style.transition = 'opacity 0.5s';
            
            setTimeout(() => {
                document.body.removeChild(messageElement);
            }, 500);
        }, 3000);
    }
});
