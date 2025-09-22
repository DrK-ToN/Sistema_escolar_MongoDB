const express = require("express");
const { ObjectId } = require("mongodb");

function createAlunoRouter(db) {
    const router = express.Router();

    // ROTA PRINCIPAL: Listar todos os alunos (READ)
    // GET /rota_aluno/aluno
    router.get("/aluno", async (req, res) => {
        try {
            const alunos = await db
                .collection("alunos")
                .aggregate([
                    {
                        $lookup: {
                            from: "turmas",
                            localField: "turma_id",
                            foreignField: "_id",
                            as: "info_turma",
                        },
                    },
                    { $unwind: "$info_turma" },
                    // Projeta os campos para corresponder ao seu Handlebars
                    {
                        $project: {
                            _id: 0, // Não incluir o _id original
                            id_aluno: "$_id", // Renomeia _id para id_aluno
                            nome: "$nome",
                            matricula: "$matricula",
                            descricao: "$info_turma.descricao", // Extrai a descrição da turma
                        },
                    },
                ])
                .toArray();

            // Renderiza a view 'aluno.hbs' e passa a lista de alunos
            res.render("admin/aluno/aluno", { alunos: alunos });
        } catch (error) {
            res.status(500).json({ message: "Erro ao buscar alunos", error });
        }
    });

    // ROTA: Mostrar o formulário para adicionar um novo aluno
    // GET /rota_aluno/aluno/add
    router.get("/aluno/add", async (req, res) => {
        // Busca todas as turmas para popular o <select> no formulário
        const turmas = await db.collection("turmas").find({}).toArray();
        res.render("admin/aluno/addaluno", { turmas: turmas });
    });

    // ROTA: Salvar o novo aluno no banco (CREATE)
    // POST /rota_aluno/aluno/add
    router.post("/aluno/add", async (req, res) => {
        try {
            const { matricula, nome, id_turma } = req.body;
            const novoAluno = {
                matricula: parseInt(matricula),
                nome: nome,
                turma_id: new ObjectId(id_turma),
            };
            await db.collection("alunos").insertOne(novoAluno);
            res.redirect("/rota_aluno/aluno"); // Redireciona para a lista de alunos
        } catch (error) {
            res.status(500).send("Erro ao adicionar aluno.");
        }
    });

    // ROTA: Mostrar o formulário para EDITAR um aluno (GET)
    // GET /rota_aluno/editar_aluno/:id
    router.get("/editar_aluno/:id", async (req, res) => {
        try {
            const id = req.params.id;

            // 1. Busca o aluno específico que queremos editar
            const aluno = await db
                .collection("alunos")
                .findOne({ _id: new ObjectId(id) });
            if (!aluno) {
                return res.status(404).send("Aluno não encontrado.");
            }

            // 2. Busca todas as turmas para popular o <select> no formulário
            const turmas = await db.collection("turmas").find({}).toArray();

            // 3. Renderiza o formulário 'editaluno.hbs' e passa os dados do aluno e a lista de turmas
            res.render("admin/aluno/editaluno", {
                aluno: aluno,
                turmas: turmas,
            });
        } catch (error) {
            res.status(500).send("Erro ao carregar formulário de edição.");
        }
    });

    // ROTA: Salvar as alterações do aluno no banco (UPDATE)
    // POST /rota_aluno/editar_aluno
    router.post("/editar_aluno", async (req, res) => {
        try {
            // Pega os dados do corpo do formulário
            const { id_aluno, matricula, nome, id_turma } = req.body;

            // Monta o objeto com os dados atualizados
            const dadosAtualizados = {
                matricula: parseInt(matricula),
                nome: nome,
                turma_id: new ObjectId(id_turma),
            };

            // Encontra o aluno pelo ID e atualiza seus dados com $set
            await db
                .collection("alunos")
                .updateOne(
                    { _id: new ObjectId(id_aluno) },
                    { $set: dadosAtualizados }
                );

            // Redireciona de volta para a lista principal de alunos
            res.redirect("/rota_aluno/aluno");
        } catch (error) {
            res.status(500).send("Erro ao atualizar aluno.");
        }
    });

    // ROTA: Deletar um aluno (DELETE)
    // GET /rota_aluno/deletar_aluno/:id
    router.get("/deletar_aluno/:id", async (req, res) => {
        try {
            const id = req.params.id;
            await db.collection("alunos").deleteOne({ _id: new ObjectId(id) });
            res.redirect("/rota_aluno/aluno");
        } catch (error) {
            res.status(500).send("Erro ao deletar aluno.");
        }
        // NOTA DE SEGURANÇA: Em uma aplicação real, use o método POST para exclusões.
    });

    // ROTAS DE EDIÇÃO (precisam de mais um form 'editaluno.hbs')
    // ... (código para editar viria aqui)

    return router;
}

module.exports = createAlunoRouter;
