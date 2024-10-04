export { obterDataAtual, obterHorarioAtual, obterDataAmanha, limparAtividadesDaTela, atualizarProximaAtividade, excluirAtividadeEditando };

// Função para obter a data atual no formato "YYYY-MM-DD"
function obterDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda para o mês
    const dia = String(hoje.getDate()).padStart(2, '0'); // Adiciona zero à esquerda para o dia
    return `${ano}-${mes}-${dia}`;
}

function obterHorarioAtual() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0'); // Adiciona zero à esquerda para as horas
    const minutos = String(agora.getMinutes()).padStart(2, '0'); // Adiciona zero à esquerda para os minutos
    return `${horas}:${minutos}`;
}

// Função para obter a data de amanhã no formato "YYYY-MM-DD"
function obterDataAmanha() {
    const amanha = new Date();
    amanha.setDate(amanha.getDate() + 1); // Adiciona um dia à data atual
    const ano = amanha.getFullYear();
    const mes = String(amanha.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda para o mês
    const dia = String(amanha.getDate()).padStart(2, '0'); // Adiciona zero à esquerda para o dia
    return `${ano}-${mes}-${dia}`;
}

function limparAtividadesDaTela() {
    const tabelaToda = document.getElementById("tabela-atividades");
    tabelaToda.innerHTML = '';
}

function atualizarProximaAtividade() {
    fetch("./atividades.json")
        .then(response => response.json())
        .then(atividades => {
            const dataAtual = obterDataAtual();
            const horaAtual = obterHorarioAtual();

            // Filtrar atividades que sejam para hoje ou no futuro
            const atividadesFuturas = atividades.filter(item => item.data > dataAtual || (item.data === dataAtual && item.hora > horaAtual));

            // Ordenar as atividades por data e, em seguida, por horário
            atividadesFuturas.sort((a, b) => {
                const dataA = new Date(a.data).getTime();
                const dataB = new Date(b.data).getTime();

                if (dataA === dataB) {
                    // Se as datas forem iguais, ordena por horário
                    const horaA = new Date(`1970-01-01T${a.hora}Z`).getTime();
                    const horaB = new Date(`1970-01-01T${b.hora}Z`).getTime();
                    return horaA - horaB;
                }
                return dataA - dataB;
            });

            // Verificar se há atividades futuras
            if (atividadesFuturas.length === 0) {
                document.querySelector('.roteiro-notification p').innerText = "Próxima Atividade: Nenhuma atividade futura.";
            } else {
                const proximaAtividade = atividadesFuturas[0];
                const link = `<a href="${proximaAtividade.linkMaps}" target="_blank">Ver no Maps</a>`;
                document.querySelector('.roteiro-notification p').innerHTML = `Próxima Atividade: <strong>${proximaAtividade.atividade} 
                às ${proximaAtividade.hora} em ${proximaAtividade.data} - ${link}</strong>`;
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o JSON:", error);
            document.querySelector('.roteiro-notification p').innerText = "Erro ao carregar a próxima atividade.";
        });
}

function excluirAtividadeEditando(id) {
    fetch('./atividades.json')
        .then(response => response.json())
        .then(atividades => {
            const atividadesAtualizadas = atividades.filter(item => item.id !== id);

            fetch('/api/excluir-atividade', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(atividadesAtualizadas)
            })
        })
}