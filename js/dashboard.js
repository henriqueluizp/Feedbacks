document.addEventListener('DOMContentLoaded', async () => {

    let feedbacks = await api.getFeedbacks();

    // Conta quantos feedbacks foram enviados e recebidos
    let sentFeedbacks = feedbacks.filter(f => f.sender !== null).length;
    let receivedFeedbacks = feedbacks.filter(f => f.receiver !== null).length;


    // Atualiza os contadores na interface
    document.getElementById('sent-feedbacks').textContent = sentFeedbacks;
    document.getElementById('received-feedbacks').textContent = receivedFeedbacks;

    // Configura e cria o gráfico de satisfação (doughnut)
    let satisfactionCtx = document.getElementById('satisfaction-chart').getContext('2d');
    new Chart(satisfactionCtx, {
        type: 'doughnut',
        data: {
            labels: ['Positivo', 'Neutro', 'Negativo'],
            datasets: [{
                data: [60, 30, 10],
                backgroundColor: ['#4CAF50', '#FFC107', '#F44336'],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        padding: 20,
                        font: {
                            size: 12
                        }
                    }
                }
            },
            cutout: '70%'
        }
    });

    // Obtém o contexto do canvas para o gráfico de áreas
    let areasCtx = document.getElementById('areas-chart').getContext('2d');

    // Conta quantos feedbacks existem por área
    let areaCounts = feedbacks.reduce((acc, feedback) => {
        if (feedback.area) {
            acc[feedback.area] = (acc[feedback.area] || 0) + 1;
        }
        return acc;
    }, {});

    // Ordena as áreas por quantidade de feedbacks (do maior para o menor)
    let sortedAreas = Object.entries(areaCounts)
        .sort(([, a], [, b]) => b - a)
        .reduce((acc, [key, value]) => {
            acc.labels.push(key);
            acc.data.push(value);
            return acc;
        }, { labels: [], data: [] });

    new Chart(areasCtx, {
        type: 'bar',
        data: {
            labels: sortedAreas.labels,
            datasets: [{
                label: 'Feedbacks por Área',
                data: sortedAreas.data,
                backgroundColor: '#4a90e2',
                borderRadius: 5,
                barThickness: 'flex'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        display: false
                    }
                },
                x: {
                    grid: {
                        display: false
                    }
                }
            }
        }
    });
}); 