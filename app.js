const express = require('express');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser'); // Para parsear o corpo das requisições

const app = express();
const port = process.env.PORT || 3000;

// Configurar o diretório de views e o EJS como o motor de template
app.set('views', path.join(__dirname, 'views'));  // Diretório onde estão os arquivos EJS
app.set('view engine', 'ejs');  // Definir EJS como motor de visualização

// Configuração para servir arquivos estáticos (como HTML, CSS, JS)
app.use(express.static(path.join(__dirname, 'public')));

// Configuração do body-parser
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Rotas principais
app.get('/', (req, res) => {
    res.render('index');  // Renderiza o arquivo index.ejs
});

app.get('/amanha', (req, res) => {
    res.render('amanha');  // Renderiza a página amanha.ejs
});

app.get('/todos-os-dias', (req, res) => {
    res.render('todos-os-dias');  // Renderiza a página todos-os-dias.ejs
});

// Rota para obter as atividades
app.get('/api/atividades', (req, res) => {
    const filePath = path.join(__dirname, 'public', 'atividades.json');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao ler o arquivo de atividades' });
            return;
        }
        const atividades = JSON.parse(data);
        res.json(atividades);
    });
});

// Rota para adicionar uma nova atividade
app.post('/api/atividades', (req, res) => {
    const { id, data, horario, atividade, maps } = req.body;
    const filePath = path.join(__dirname, 'public', 'atividades.json');

    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao ler o arquivo de atividades' });
            return;
        }

        const atividades = JSON.parse(fileData);
        atividades.push({ id, data, hora: horario, atividade, linkMaps: maps });

        // Atualiza o arquivo atividades.json com as atividades modificadas
        fs.writeFile(filePath, JSON.stringify(atividades, null, 2), 'utf8', (err) => {
            if (err) {
                res.status(500).json({ error: 'Erro ao escrever no arquivo de atividades' });
                return;
            }
            res.status(201).json({ message: 'Atividade adicionada com sucesso!' });
        });
    });
});

// Rota para incluir uma atividade editada
app.post('/api/atividades-edicao', (req, res) => {
    const { id, data, horario, atividade, maps } = req.body;
    const filePath = path.join(__dirname, 'public', 'atividades.json');

    fs.readFile(filePath, 'utf8', (err, fileData) => {
        if (err) {
            res.status(500).json({ error: 'Erro ao ler o arquivo de atividades' });
            return;
        }

        const atividades = JSON.parse(fileData);
        atividades.push({ id, data, hora: horario, atividade, linkMaps: maps });

        // Atualiza o arquivo atividades.json com as atividades modificadas
        fs.writeFile(filePath, JSON.stringify(atividades, null, 2), 'utf8', (err) => {
            if (err) {
                res.status(500).json({ error: 'Erro ao escrever no arquivo de atividades' });
                return;
            }
            res.status(201).json({ message: 'Atividade editada com sucesso!' });
        });
    });
});

// Rota para excluir atividades
app.post('/api/excluir-atividade', express.json(), (req, res) => {
    const atividades = req.body;
    const filePath = path.join(__dirname, 'public', 'atividades.json'); // Caminho correto

    // Atualiza o arquivo atividades.json com as atividades modificadas
    fs.writeFile(filePath, JSON.stringify(atividades, null, 2), 'utf8', err => {
        if (err) {
            console.error("Erro ao excluir atividade:", err);
            return res.status(500).json({ message: "Erro ao excluir atividade." });
        }
        res.status(200).json({ message: "Atividade excluída com sucesso!" });
    });
});

// Iniciar o servidor
app.listen(port, () => {
    console.log(`Servidor rodando na porta ${port}`);
});


