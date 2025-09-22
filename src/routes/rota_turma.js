const express = require("express");
const { ObjectId } = require("mongodb");

function createTurmaRouter(db) {
    const router = express.Router();

    // ROTA: Listar todas as Turmas
    router.get("/turma", async (req, res) => {
        try {
            const turmas = await db.collection("turmas").find({}).toArray();
            // Renderiza a view 'turma.hbs' e passa a lista de turmas
            res.render("admin/turma/turma", { turmas: turmas });
        } catch (error) {
            res.status(500).send("Erro ao buscar turmas");
        }
    });

    // ROTA: Mostrar formulário para adicionar turma
    router.get("/turma/add", (req, res) => {
        res.render("admin/turma/addturma");
    });

    // ROTA: Salvar nova turma
    router.post("/turma/add", async (req, res) => {
        try {
            const { descricao } = req.body;
            await db.collection("turmas").insertOne({ descricao });
            res.redirect("/rota_turma/turma");
        } catch (error) {
            res.status(500).send("Erro ao adicionar turma");
        }
    });

    // ROTA: Mostrar o formulário para EDITAR uma turma (GET)
    // GET /rota_turma/editar_turma/:id
    router.get("/editar_turma/:id", async (req, res) => {
        try {
            const id = req.params.id;

            // 1. Busca a turma específica que queremos editar pelo ID
            const turma = await db
                .collection("turmas")
                .findOne({ _id: new ObjectId(id) });
            if (!turma) {
                return res.status(404).send("Turma não encontrada.");
            }

            // 2. Renderiza o formulário 'editurma.hbs' e passa os dados da turma
            res.render("admin/turma/editturma", { turma: turma });
        } catch (error) {
            res.status(500).send(
                "Erro ao carregar formulário de edição de turma."
            );
        }
    });

    // ROTA: Salvar as alterações da turma no banco (UPDATE)
    // POST /rota_turma/editar_turma
    router.post("/editar_turma", async (req, res) => {
        try {
            // Pega os dados do corpo do formulário
            const { id_turma, descricao } = req.body;

            // Encontra a turma pelo ID e atualiza sua descrição
            await db
                .collection("turmas")
                .updateOne(
                    { _id: new ObjectId(id_turma) },
                    { $set: { descricao: descricao } }
                );

            // Redireciona de volta para a lista principal de turmas
            res.redirect("/rota_turma/turma");
        } catch (error) {
            res.status(500).send("Erro ao atualizar turma.");
        }
    });

    // ROTA: Deletar uma turma (e seus alunos associados)
    // GET /rota_turma/deletar_turma/:id
    router.get("/deletar_turma/:id", async (req, res) => {
        try {
            const id = req.params.id;
            const turmaObjectId = new ObjectId(id); // Converte a string do ID para o formato do MongoDB

            // 1. IMPORTANTE: Deleta todos os alunos que pertencem a esta turma (efeito cascata)
            // Acessa a coleção 'alunos' e deleta todos os documentos cujo 'turma_id' corresponde ao ID da turma
            await db
                .collection("alunos")
                .deleteMany({ turma_id: turmaObjectId });

            // 2. Deleta a própria turma
            // Acessa a coleção 'turmas' e deleta o documento com o ID correspondente
            await db.collection("turmas").deleteOne({ _id: turmaObjectId });

            // 3. Redireciona de volta para a lista de turmas atualizada
            res.redirect("/rota_turma/turma");
        } catch (error) {
            res.status(500).send("Erro ao deletar turma e seus alunos.");
        }
    });

    return router;
}

module.exports = createTurmaRouter;
