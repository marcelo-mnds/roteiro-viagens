import { limparAtividadesDaTela, atualizarProximaAtividade, excluirAtividadeEditando } from './utils.js';

pegarAtividadesGeral();
atualizarProximaAtividade();

function pegarAtividadesGeral() {
    limparAtividadesDaTela();
    atualizarProximaAtividade();
    fetch("./atividades.json")
        .then(response => response.json())
        .then(atividades => {
            const tabelaGeral = document.getElementById("tabela-atividades");

            // Filtrar atividades que têm data
            const atividadesGeral = atividades.filter(item => item.data && item.hora);

            // Ordenar as atividades por data e, em seguida, por horário
            atividadesGeral.sort((a, b) => {
                const dataA = new Date(a.data).getTime();
                const dataB = new Date(b.data).getTime();

                // Se as datas forem iguais, ordena por horário
                if (dataA === dataB) {
                    const horaA = new Date(`1970-01-01T${a.hora}Z`).getTime();
                    const horaB = new Date(`1970-01-01T${b.hora}Z`).getTime();
                    return horaA - horaB;
                }
                return dataA - dataB;
            });

            // Verifica se há atividades
            if (atividadesGeral.length === 0) {
                const linhaNenhumaAtividade = document.createElement('tr');
                const celulaNenhumaAtividade = document.createElement('td');
                celulaNenhumaAtividade.setAttribute('colspan', 3);
                celulaNenhumaAtividade.innerText = "Nenhuma atividade programada.";
                linhaNenhumaAtividade.appendChild(celulaNenhumaAtividade);
                tabelaGeral.appendChild(linhaNenhumaAtividade);
            } else {
                atividadesGeral.forEach((item, index) => {
                    // Criando a linha com Data, Hora e Botão Excluir (3 colunas)
                    const linha1 = document.createElement('tr');
                    linha1.className = "primeira-linha";

                    const celula1Data = document.createElement('td');
                    const celula1Hora = document.createElement('td');
                    const celula1Excluir = document.createElement('td');

                    celula1Data.innerText = `${item.data}`;
                    celula1Hora.innerText = `Hora: ${item.hora}`;

                    const botaoEditar = document.createElement('button');
                    botaoEditar.innerText = "Editar";
                    botaoEditar.className = "btn-editar"; // Classe para o estilo do botão
                    botaoEditar.addEventListener('click', () => editarAtividade(item.id)); // Passa o id da atividade
                    celula1Excluir.appendChild(botaoEditar);

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
                    celula2Atividade.style.fontWeight = 'bold';
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
                    celulaSeparadora.style.height = "10px"; // Define a altura do espaço em branco
                    linhaSeparadora.appendChild(celulaSeparadora);
                    linhaSeparadora.className = ("linha-invisivel");
                    celulaSeparadora.className = ("celula-invisivel");

                    // Adicionando as linhas à tabela
                    tabelaGeral.appendChild(linha1);
                    tabelaGeral.appendChild(linha2);
                    tabelaGeral.appendChild(linha3);
                    tabelaGeral.appendChild(linhaSeparadora);
                });
            }
        })
        .catch(error => {
            console.error("Erro ao carregar o JSON:", error);
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
                            pegarAtividadesGeral(); // Recarregar atividades
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

function editarAtividade(id) {
    // Pega os dados do modal no HTML
    const modalEdicao = document.getElementById('modal-edicao');
    const closeModalEdicaoButton = document.querySelector('.close-edicao');
    const dataEdicaoInput = document.getElementById('data-edicao');
    const horarioEdicaoInput = document.getElementById('horario-edicao');
    const atividadeEdicaoInput = document.getElementById('atividade-edicao');
    const mapsEdicaoInput = document.getElementById('maps-edicao');
    const atividadeFormEdicao = document.getElementById('atividade-form-edicao');

    // Abre o modal
    modalEdicao.style.display = 'block';

    // Remove event listeners antigos para evitar duplicações
    closeModalEdicaoButton.removeEventListener('click', closeModal);
    window.removeEventListener('click', closeOnOutsideClick);
    atividadeFormEdicao.removeEventListener('submit', submitForm);

    // Função para fechar o modal
    function closeModal() {
        modalEdicao.style.display = 'none';
    }

    // Função para fechar o modal se clicar fora dele
    function closeOnOutsideClick(event) {
        if (event.target == modalEdicao) {
            modalEdicao.style.display = 'none';
        }
    }

    // Adiciona os event listeners corretamente
    closeModalEdicaoButton.addEventListener('click', closeModal);
    window.addEventListener('click', closeOnOutsideClick);

    // Carrega o arquivo atividades.json e encontra a atividade pelo ID
    fetch('atividades.json')
        .then(response => response.json())
        .then(atividades => {
            const atividade = atividades.find(item => item.id === id);

            if (atividade) {
                dataEdicaoInput.value = atividade.data;
                horarioEdicaoInput.value = atividade.hora;
                atividadeEdicaoInput.value = atividade.atividade;
                mapsEdicaoInput.value = atividade.linkMaps;
            } else {
                console.error('Atividade não encontrada!');
            }
        })
        .catch(error => console.error('Erro ao carregar atividades:', error));

    // Função para enviar o formulário de edição
    function submitForm(event) {
        event.preventDefault();

        const idAleatorio = Math.floor(Math.random() * (10000000000 - 1 + 1)) + 1;

        const formData = new FormData(atividadeFormEdicao);
        const data = {
            id: idAleatorio,
            data: formData.get('data'),
            horario: formData.get('horario'),
            atividade: formData.get('atividade'),
            maps: formData.get('maps')
        };

        fetch('/api/atividades-edicao', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
            .then(response => response.json())
            .then(result => {
                alert(result.message);
                modalEdicao.style.display = 'none';
                excluirAtividadeEditando(id);
                // Força o recarregamento da página após atualizar as atividades
                setTimeout(() => {
                    window.location.reload();  // Recarrega a página
                }, 100);
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao editar a atividade.');
            });
    }

    // Adiciona o event listener para o envio do formulário
    atividadeFormEdicao.addEventListener('submit', submitForm);
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
                pegarAtividadesGeral();
            })
            .catch(error => {
                console.error('Erro:', error);
                alert('Erro ao adicionar a atividade.');
            });
    });
});
