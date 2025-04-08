document.addEventListener('DOMContentLoaded', async () => {

    let getUsers = await api.getUsers();
    let receiverSelect = document.querySelector('.select-receiver');
    let form = document.querySelector('.feedback-form');
   
    getUsers.forEach(user => {
        const option = document.createElement('option');
        option.value = user.id;
        option.textContent = `${user.name} (${user.department})`;
        receiverSelect.appendChild(option);
    });

    // pega o form e adiciona um evento de submit - Simular um success ou error da API
    form.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        let feedback = {
            receiver: document.querySelector('.select-receiver').value,
            type: document.querySelector('.select-type').value,
            message: document.querySelector('.textarea-message').value
        };

        let result = await api.sendFeedback(feedback);

        if (result.success) {
            notifications.success(result.message);
            form.reset();
        } else {
            notifications.error(result.message);
        }
    });
}); 