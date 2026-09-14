const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST");
    next();
});

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { rejectUnauthorized: false }
});

app.get('/api/recados', async (req, res) => {
    try {
        const [recados] = await pool.query('SELECT * FROM recados ORDER BY id DESC');
        res.json(recados);
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao buscar recados: ' + erro.message });
    }
});

app.post('/api/recados', async (req, res) => {
    const { autor, mensagem, cor } = req.body;

    if (!autor || !mensagem) {
        return res.status(400).json({ erro: 'Eii, insira o seu nome e informe sua mensagem!' });
    }

    try {
        const corPostIt = cor || 'yellow';
        const [resultado] = await pool.query(
            'INSERT INTO recados (autor, mensagem, cor) VALUES (?, ?, ?)',
            [autor, mensagem, corPostIt]
        );

        res.status(201).json({
            id: resultado.insertId,
            autor,
            mensagem,
            cor: corPostIt
        });
    } catch (erro) {
        res.status(500).json({ erro: 'Erro ao salvar recado: ' + erro.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Servidor rodando na porta ${PORT}`));

module.exports = app;