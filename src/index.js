const express = require("express");
const path = require("path");
const exphbs = require("express-handlebars");
const bodyParser = require("body-parser");

// --- Nossos módulos customizados ---
const { connectToDatabase } = require("./models/db");
const createTurmaRouter = require("./routes/rota_turma");
const createAlunoRouter = require("./routes/rota_aluno");
// --- Configuração inicial ---
const app = express();
const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Servidor rodando em 0.0.0.0:${PORT}`);
});

// --- Função Principal para Iniciar a Aplicação ---
async function startServer() {
    // 1. ESPERA a conexão com o MongoDB ser bem-sucedida
    const db = await connectToDatabase();
    console.log("Banco de dados conectado e pronto para uso.");

    // 2. CONFIGURA o Express (middleware e view engine)
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(bodyParser.json());
    app.engine(
        ".hbs",

        exphbs.engine({
            defaultLayout: "main",
            extname: ".hbs",
            helpers: {
                eq: function (a, b) {
                    return a.toString() === b.toString();
                },
            },
        })
    );
    app.set("view engine", ".hbs");
    app.set("views", path.join(__dirname, "views"));

    // --- Rotas ---

    // Rota principal (Home)
    app.get("/", (req, res) => {
        res.render("home", { pageTitle: "Página Inicial" });
    });

    // 3. CRIA os roteadores passando a conexão 'db' para eles
    const rotasTurma = createTurmaRouter(db);
    const rotasAluno = createAlunoRouter(db);

    // 4. USA os roteadores na aplicação
    app.use("/rota_turma", rotasTurma);
    app.use("/rota_aluno", rotasAluno);

    // 5. INICIA o servidor, que agora está pronto para receber requisições
    app.listen(PORT, () => {
        console.log(
            `🚀 Servidor Rodando! Acesse as rotas de teste:\n` +
                `Turmas: http://localhost:${PORT}/rota_turma/turma\n` +
                `Alunos: http://localhost:${PORT}/rota_aluno/aluno`
        );
    });
}

// --- Ponto de Entrada: Chama a função principal para iniciar tudo ---
startServer();
