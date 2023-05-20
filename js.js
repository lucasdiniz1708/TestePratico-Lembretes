class LembreteManager {
    constructor(lembretesList, addForm, nomeInput, dataInput) {
        this.lembretesList = lembretesList;
        this.addForm = addForm;
        this.nomeInput = nomeInput;
        this.dataInput = dataInput;

        this.addForm.addEventListener('submit', this.adicionarLembrete.bind(this));
        this.carregarLembretes();
    }

    adicionarLembrete(event) {
        event.preventDefault(); // Impede o envio do formulário

        // Validação dos campos
        if (this.nomeInput.value === '') {
            alert('O campo "Nome" deve ser preenchido');
            return;
        }

        if (this.dataInput.value === '') {
            alert('O campo "Data" deve ser preenchido');
            return;
        }

        const dataAtual = new Date();
        const dataSelecionada = new Date(this.dataInput.value + 'T00:00:00Z');

        if (dataSelecionada < dataAtual) {
            alert('Só é possível adicionar datas futuras');
            return;
        }

        const novoLembrete = {
            nome: this.nomeInput.value,
            data: dataSelecionada.toISOString(), // Converte a data para o formato UTC
        };

        fetch('http://localhost:8080/lembretes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(novoLembrete),
        })
            .then((response) => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error('Erro ao adicionar lembrete');
                }
            })
            .then((lembrete) => {
                this.renderLembrete(lembrete);

                // Limpa os inputs após adicionar o lembrete
                this.nomeInput.value = '';
                this.dataInput.value = '';

                alert('O lembrete foi adicionado com sucesso.');
            })
            .catch((error) => {
                alert('Ocorreu um erro ao adicionar lembrete: ' + error.message);
                console.log('Ocorreu um erro:', error);
            });
    }

    carregarLembretes() {
        fetch('http://localhost:8080/lembretes')
            .then((response) => response.json())
            .then((data) => {
                const lembretesOrdenados = this.ordenarLembretesPorData(data);
                this.lembretesList.innerHTML = '';
                lembretesOrdenados.forEach((lembrete) => {
                    this.renderLembrete(lembrete);
                });
            })
            .catch((error) => {
                console.log('Ocorreu um erro:', error);
            });
    }

    renderLembrete(lembrete) {
        const li = document.createElement('li');
        const dataFormatada = new Date(lembrete.data).toLocaleDateString('pt-BR', {
            timeZone: 'UTC', // Define o fuso horário como UTC para exibição da data formatada
        });
        li.innerHTML =
            '<span class="nome">' +
            lembrete.nome +
            '</span><br>' +
            '</span>' +
            ' <button class="delete-button deletebtn" data-id="' +
            lembrete.id +
            '">Excluir</button>';

        // Verifica se o dia já existe na lista de lembretes
        let diaExistente = false;
        const listaDias = this.lembretesList.getElementsByClassName('dia');
        for (let i = 0; i < listaDias.length; i++) {
            const dia = listaDias[i];
            if (dia.getAttribute('data-date') === dataFormatada) {
                const lembretesDia = dia.getElementsByClassName('lembretes-dia')[0];
                lembretesDia.appendChild(li);
                diaExistente = true;
                break;
            }
        }

        // Se o dia não existe, cria um novo dia na lista de lembretes
        if (!diaExistente) {
            const novoDia = document.createElement('li');
            novoDia.classList.add('dia');
            novoDia.setAttribute('data-date', dataFormatada);
            novoDia.innerHTML =
                '<strong>' +
                dataFormatada +
                '</strong><ul class="lembretes-dia"></ul>';

            const lembretesDia = novoDia.getElementsByClassName('lembretes-dia')[0];
            lembretesDia.appendChild(li);

            // Insere o novo dia na ordem cronológica
            const dias = this.lembretesList.getElementsByClassName('dia');
            let inserido = false;
            for (let j = 0; j < dias.length; j++) {
                const dia = dias[j];
                const dataDia = new Date(dia.getAttribute('data-date'));
                if (new Date(lembrete.data) < dataDia) {
                    this.lembretesList.insertBefore(novoDia, dia);
                    inserido = true;
                    break;
                }
            }
            if (!inserido) {
                this.lembretesList.appendChild(novoDia);
            }
        }

        // Adiciona um evento de clique para excluir o lembrete
        const deleteButton = li.querySelector('.delete-button');
        deleteButton.addEventListener('click', () => {
            const lembreteId = deleteButton.getAttribute('data-id');
            this.excluirLembrete(lembreteId, li);
        });
    }

    excluirLembrete(id, li) {
        fetch(`http://localhost:8080/lembretes/${id}`, {
            method: 'DELETE',
        })
            .then((response) => {
                if (response.ok) {
                    // Remove o lembrete da lista após a exclusão
                    li.remove();
                    alert('O lembrete foi excluído com sucesso.');
                } else {
                    throw new Error('Erro ao excluir lembrete');
                }
            })
            .catch((error) => {
                console.log('Ocorreu um erro:', error);
            });
    }

    ordenarLembretesPorData(lembretes) {
        return lembretes.sort((a, b) => {
            const dataA = new Date(a.data);
            const dataB = new Date(b.data);
            return dataA - dataB;
        });
    }
}

// Função para inicializar o código quando a página é carregada
function iniciar() {
    const lembretesList = document.getElementById('uclass');
    const addForm = document.getElementById('search');
    const nomeInput = document.getElementById('nome-input');
    const dataInput = document.getElementById('data-input');

    const lembreteManager = new LembreteManager(lembretesList, addForm, nomeInput, dataInput);
}

// Adiciona o evento de carregar os lembretes ao carregar a página
window.addEventListener('load', iniciar);