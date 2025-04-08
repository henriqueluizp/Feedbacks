// função para abrir/fechar o sidebar quando clicar fora dele
let menuToggle = document.querySelector('.menu-toggle');
let sidebar = document.querySelector('.sidebar');

document.addEventListener('click', function (event) {
    let clickedOutsideSidebar = !sidebar.contains(event.target);
    let clickedOutsideToggle = !menuToggle.contains(event.target);

    if (window.innerWidth < 768 && sidebar.classList.contains('active') && clickedOutsideSidebar && clickedOutsideToggle) {
        sidebar.classList.remove('active');
    }
});

menuToggle.addEventListener('click', function () {
    sidebar.classList.toggle('active');
});

// formatação de data vindo do data.js
function formatDate(dateString) {
    if (!dateString) return 'Data não especificada';

    if (dateString.includes('-')) {
        const [year, month, day] = dateString.split('-');
        return `${day}/${month}/${year}`;
    }

    return dateString;
}