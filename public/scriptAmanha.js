pegarAtividadesDeAmanha();
atualizarProximaAtividade();

// Função para obter a data atual no formato "YYYY-MM-DD"
function obterDataAtual() {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = String(hoje.getMonth() + 1).padStart(2, '0'); // Adiciona zero à esquerda para o mês
    const dia = String(hoje.getDate()).padStart(2, '0'); // Adiciona zero à esquerda para o dia
    return `${ano}-${mes}-${dia}`;
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

function obterHorarioAtual() {
    const agora = new Date();
    const horas = String(agora.getHours()).padStart(2, '0'); // Adiciona zero à esquerda para as horas
    const minutos = String(agora.getMinutes()).padStart(2, '0'); // Adiciona zero à esquerda para os minutos
    return `${horas}:${minutos}`;
}

function limparAtividadesDaTela() {
    const tabelaToda = document.getElementById("tabela-atividades");
    tabelaToda.innerHTML = '';
}


function pegarAtividadesDeAmanha() {
    limparAtividadesDaTela();
    atualizarProximaAtividade();
    fetch("./atividades.json")
        .then(response => response.json())
        .then(atividades => {
            const tabelaAmanha = document.getElementById("tabela-atividades");
            const dataAmanha = obterDataAmanha();

            // Filtrar atividades com a data de amanhã
            const atividadesAmanha = atividades.filter(item => item.data === dataAmanha);

            // Ordenar as atividades por horário
            atividadesAmanha.sort((a, b) => {
                const horaA = new Date(`1970-01-01T${a.hora}Z`).getTime();
                const horaB = new Date(`1970-01-01T${b.hora}Z`).getTime();
                return horaA - horaB;
            });

            // Verifica se há atividades para amanhã
            if (atividadesAmanha.length === 0) {
                const linhaNenhumaAtividade = document.createElement('tr');
                const celulaNenhumaAtividade = document.createElement('td');
                celulaNenhumaAtividade.setAttribute('colspan', 3);
                celulaNenhumaAtividade.innerText = "Nenhuma atividade programada para amanhã.";
                linhaNenhumaAtividade.appendChild(celulaNenhumaAtividade);
                tabelaAmanha.appendChild(linhaNenhumaAtividade);
            } else {
                atividadesAmanha.forEach((item, index) => {
                    // Criando a linha com Data, Hora e Botão Excluir (3 colunas)
                    const linha1 = document.createElement('tr');
                    linha1.className = "primeira-linha";

                    const celula1Data = document.createElement('td');
                    const celula1Hora = document.createElement('td');
                    const celula1Excluir = document.createElement('td');

                    celula1Data.innerText = `${item.data}`;
                    celula1Hora.innerText = `Hora: ${item.hora}`;

                    const botaoExcluir = document.createElement('button');
                    botaoExcluir.innerText = "Excluir";
                    botaoExcluir.className = "btn-excluir"; // Classe para o estilo do botão
                    botaoExcluir.addEventListener('click', () => excluirAtividade(item.id)); // Passa o id da atividade
                    celula1Excluir.appendChild(botaoExcluir);

                    linha1.appendChild(celula1Data);
                    linha1.appendChild(celula1Hora);
                    linha1.appendChild(celula1Excluir);

                    // Criando a linha com a Atividade
                    const linha2 = document.createElement('tr');
                    const celula2Atividade = document.createElement('td');
                    celula2Atividade.setAttribute('colspan', 3); // Ocupa todas as colunas
                    celula2Atividade.innerText = `${item.atividade}`;
                    linha2.appendChild(celula2Atividade);

                    // Criando a linha com o link do Google Maps
                    const linha3 = document.createElement('tr');
                    const celula3Maps = document.createElement('td');
                    celula3Maps.setAttribute('colspan', 3); // Ocupa todas as colunas
                    const link = document.createElement('a');
                    link.href = item.linkMaps;
                    link.innerText = "Ver no Maps";
                    link.target = "_blank"; // Abre o link em uma nova aba
                    celula3Maps.appendChild(link);
                    linha3.appendChild(celula3Maps);

                    // Inserir linha em branco após cada 3 linhas (separador)
                    const linhaSeparadora = document.createElement('tr');
                    const celulaSeparadora = document.createElement('td');
                    celulaSeparadora.setAttribute('colspan', 3);
                    celulaSeparadora.style.height = "20px"; // Define a altura do espaço em branco
                    linhaSeparadora.appendChild(celulaSeparadora);
                    linhaSeparadora.className=("linha-invisivel");
                    celulaSeparadora.className=("celula-invisivel");

                    // Adicionando as linhas à tabela
                    tabelaAmanha.appendChild(linha1);
                    tabelaAmanha.appendChild(linha2);
                    tabelaAmanha.appendChild(linha3);
                    tabelaAmanha.appendChild(linhaSeparadora);
                });
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o JSON:", error);
        });
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

function excluirAtividade(id) {
    // Exibir a pergunta de confirmação
    const confirmacao = confirm("Tem certeza que deseja excluir esta atividade?");

    if (confirmacao) {
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
                    .then(response => {
                        if (response.ok) {
                            alert("Atividade EXCLUÍDA!");
                            pegarAtividadesDeAmanha(); // Recarregar atividades
                        } else {
                            throw new Error("Erro ao excluir a atividade.");
                        }
                    })
                    .catch(error => {
                        console.error("Erro ao excluir a atividade:", error);
                        alert("Erro ao excluir a atividade.");
                    });
            })
            .catch(error => {
                console.error("Erro ao carregar o JSON:", error);
            });
    } else {
        // Caso o usuário clique em "Cancelar", nenhuma ação será realizada
        alert("Exclusão NÃO efetuada.");
    }
}

// Pega dados do modal no HTML
document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('modal');
    const closeModalButton = document.querySelector('.close');
    const btnIncluir = document.getElementById('btn-incluir');
    const atividadeForm = document.getElementById('atividade-form');

    // Função para abrir o modal
    btnIncluir.addEventListener('click', () => {
        modal.style.display = 'block';
    });

    // Função para fechar o modal
    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    // Função para enviar os dados do formulário
    atividadeForm.addEventListener('submit', (event) => {
        event.preventDefault();

        const idAleatorio = Math.floor(Math.random() * (10000000000 - 1 + 1)) + 1;

        const formData = new FormData(atividadeForm);
        const data = {
            id: idAleatorio,
            data: formData.get('data'),
            horario: formData.get('horario'),
            atividade: formData.get('atividade'),
            maps: formData.get('maps')
        };

        fetch('/api/atividades', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                modal.style.display = 'none';
                atividadeForm.reset(); // Limpa o formulário
                limparAtividadesDaTela();
                pegarAtividadesDeAmanha();
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao adicionar a atividade.');
            });
    });
});
