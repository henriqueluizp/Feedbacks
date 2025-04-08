document.addEventListener('DOMContentLoaded', async () => {

    let feedbacks = await api.getFeedbacks();
    let feedbacksList = document.getElementById('feedbacks-list');
    let modalContent = document.getElementById('modal-feedback-content');

    let currentFeedback = null;
    let clearFiltersButton = document.querySelector('.clear-filters');

    let modal = document.querySelector('.feedback-modal');
    let modalClose = modal.querySelector('.modal-close');
    let respondButton = modal.querySelector('.btn-respond');

    let responseForm = modal.querySelector('.response-form');
    let sendResponseButton = responseForm.querySelector('.btn-respond');
    let cancelButton = responseForm.querySelector('.btn-archive');

    let dateFilter = document.querySelector('.date-filter');
    let typeFilter = document.querySelector('.type-filter');
    let statusFilter = document.querySelector('.status-filter');

    let archiveButton = modal.querySelector('.btn-archive');


    // manipular filtros
    dateFilter.addEventListener('change', applyFilters);
    typeFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);

    // Limpar filtros 
    clearFiltersButton.addEventListener('click', () => {
        dateFilter.value = '';
        typeFilter.value = '';
        statusFilter.value = '';
        renderFeedbacks();
    })

    // // Event Listeners
    modalClose.addEventListener('click', () => {
        modal.classList.remove('active');
        responseForm.classList.remove('active');
    });

    //clicar fora do modal para fechar;
    modal.addEventListener('click', (event) => {
        if (event.target === modal) {
            modal.classList.remove('active');
            responseForm.classList.remove('active');
        }
    });

    respondButton.addEventListener('click', () => {
        responseForm.classList.add('active');
    });

    cancelButton.addEventListener('click', () => {
        responseForm.classList.remove('active');
    });

    sendResponseButton.addEventListener('click', async () => {
        const responseText = responseForm.querySelector('textarea').value;
        if (!responseText.trim()) {
            notifications.error('Por favor, digite uma resposta.');
            return;
        }

        try {
            await api.sendResponse(currentFeedback.id, responseText);
            currentFeedback.status = 'respondido';
            modal.classList.remove('active');
            responseForm.classList.remove('active');
            responseForm.querySelector('textarea').value = '';
            renderFeedbacks();
            notifications.success('Resposta enviada com sucesso!');
        } catch (error) {
            notifications.error('Erro ao enviar resposta. Tente novamente.');
        }
    });

    archiveButton.addEventListener('click', async () => {
        if (confirm('Tem certeza que deseja arquivar este feedback?')) {
            try {
                await api.archiveFeedback(currentFeedback.id);
                modal.classList.remove('active');
                feedbacks = await api.getFeedbacks(); // Atualiza a lista de feedbacks
                renderFeedbacks();
                notifications.success('Feedback arquivado com sucesso!');
            } catch (error) {
                notifications.error('Erro ao arquivar feedback. Tente novamente.');
            }
        }
    });

    renderFeedbacks();

    function renderFeedbacks(filteredFeedbacks = feedbacks) {
        feedbacksList.innerHTML = '';

        if (filteredFeedbacks.length === 0) {
            feedbacksList.innerHTML = '<p class="no-feedbacks">Nenhum feedback encontrado</p>';
            return;
        }

        // pega feedback por feedback e cria um card para cada um
        for (let feedback of filteredFeedbacks) {
            let feedbackCard = document.createElement('div');
            feedbackCard.className = 'card feedback-card';
            feedbackCard.innerHTML = `
                <div class="feedback-header">
                    <h3>${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</h3>
                    <span class="status ${feedback.status}">${feedback.status}</span>
                </div>
                <p><strong>De:</strong> ${feedback.sender || 'Anônimo'}</p>
                <p><strong>Para:</strong> ${feedback.receiver || 'Não especificado'}</p>
                <p><strong>Data:</strong> ${formatDate(feedback.date)}</p>
                <p><strong>Área:</strong> ${feedback.area || 'Não especificada'}</p>
                <p><strong>Mensagem:</strong> ${feedback.message}</p>
            `;

            feedbackCard.addEventListener('click', () => showFeedbackDetails(feedback));
            feedbacksList.appendChild(feedbackCard);
        }
    }

    // aplica os filtros
    function applyFilters() {
        const date = dateFilter.value;
        const type = typeFilter.value;
        const status = statusFilter.value;

        const filteredFeedbacks = feedbacks.filter(feedback => {
            const dateMatch = !date || feedback.date === date;
            const typeMatch = !type || feedback.type === type;
            const statusMatch = !status || feedback.status === status;

            return dateMatch && typeMatch && statusMatch;
        });

        renderFeedbacks(filteredFeedbacks);
    }

    // mostra os detalhes do feedback - Caso tenha sido respondido, mostra a resposta
    function showFeedbackDetails(feedback) {
        currentFeedback = feedback;
        modalContent.innerHTML = `
            <div class="feedback-header">
                <h3>${feedback.type.charAt(0).toUpperCase() + feedback.type.slice(1)}</h3>
                <span class="status ${feedback.status}">${feedback.status}</span>
            </div>
            <p><strong>De:</strong> ${feedback.sender || 'Anônimo'}</p>
            <p><strong>Para:</strong> ${feedback.receiver || 'Não especificado'}</p>
            <p><strong>Data:</strong> ${formatDate(feedback.date)}</p>
            <p><strong>Área:</strong> ${feedback.area || 'Não especificada'}</p>
            <p><strong>Mensagem:</strong> ${feedback.message}</p>
            ${feedback.response ? `
                <div class="feedback-response">
                    <h4>Resposta:</h4>
                    <p>${feedback.response}</p>
                </div>
            ` : ''}
        `;

        // Atualiza a visibilidade dos botões de ação baseado no status
        let respondButton = modal.querySelector('.btn-respond');
        let archiveButton = modal.querySelector('.btn-archive');

        if (feedback.status === 'respondido' || feedback.status === 'arquivado') {
            respondButton.style.display = 'none';
        } else {
            respondButton.style.display = 'block';
        }

        if (feedback.status === 'arquivado') {
            archiveButton.style.display = 'none';
        } else {
            archiveButton.style.display = 'block';
        }

        modal.classList.add('active');
    }

}); 