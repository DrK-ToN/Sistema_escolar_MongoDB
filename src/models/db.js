const { MongoClient } = require("mongodb");

// 1. Carrega as variáveis do arquivo .env para a memória
require("dotenv").config();

// 2. Lê a string de conexão segura do process.env
const uri = process.env.MONGO_URI;

// Validação para garantir que a variável foi carregada
if (!uri) {
    throw new Error(
        "A variável de ambiente MONGO_URI não foi definida no arquivo .env"
    );
}

// Cria uma única instância do cliente para ser usada em toda a aplicação
const client = new MongoClient(uri);

let db; // Variável para armazenar a instância do banco de dados

async function connectToDatabase() {
    if (db) {
        return db; // Se já estiver conectado, retorna a instância existente
    }

    try {
        // Conecta o cliente ao servidor
        await client.connect();
        console.log("✅ Conectado com sucesso ao MongoDB Atlas!");

        // Troque "meuPrimeiroDB" pelo nome do seu banco
        db = client.db("sistema_escolar");

        return db;
    } catch (error) {
        console.error("❌ Falha ao conectar ao MongoDB", error);
        // Encerra o processo da aplicação se não conseguir conectar ao DB
        process.exit(1);
    }
}

// Exporta a função para que outros arquivos possam usá-la
module.exports = { connectToDatabase };
