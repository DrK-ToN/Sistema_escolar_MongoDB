# Dockerfile

# 1. Imagem base: Comece com uma imagem oficial do Node.js (versão 20, slim para ser leve)
FROM node:20-slim

# 2. Diretório de trabalho: Crie e defina o diretório de trabalho dentro do contêiner
WORKDIR /app

# 3. Copiar dependências: Copie o package.json e package-lock.json para o contêiner
# Usamos o wildcard (*) para copiar ambos os arquivos.
COPY package*.json ./

# 4. Instalar dependências: Execute o npm install para baixar as dependências do projeto
RUN npm install

# 5. Copiar código-fonte: Copie o restante dos arquivos da sua aplicação para o diretório /app
COPY . .

# 6. Expor a porta: Informe ao Docker que o contêiner escutará na porta 3000
EXPOSE 3000

# 7. Comando de inicialização: O comando que será executado quando o contêiner iniciar
CMD [ "node", "src/index.js" ]