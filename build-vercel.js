// Script simplificado para criar uma página estática na Vercel
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('Iniciando build estático para Vercel...');

// Garantir que o diretório dist existe
if (!fs.existsSync('dist')) {
  fs.mkdirSync('dist', { recursive: true });
}

// Criar uma página estática simples
console.log('Criando página estática...');
const staticHtml = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dols Capital</title>
  <style>
    body {
      font-family: 'Montserrat', sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background-color: #0f172a;
      color: white;
    }
    .container {
      text-align: center;
      padding: 2rem;
      max-width: 800px;
    }
    .logo {
      margin-bottom: 2rem;
      width: 200px;
    }
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
    }
    p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      line-height: 1.6;
    }
    .button {
      display: inline-block;
      background: linear-gradient(to right, #3b82f6, #4f46e5);
      color: white;
      text-decoration: none;
      padding: 0.75rem 1.5rem;
      border-radius: 0.5rem;
      font-weight: 600;
      transition: transform 0.3s, box-shadow 0.3s;
    }
    .button:hover {
      transform: translateY(-3px);
      box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
    }
  </style>
  <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
</head>
<body>
  <div class="container">
    <h1>Dols Capital</h1>
    <p>Bem-vindo à Dols Capital. Estamos trabalhando para melhorar nossa plataforma. Por favor, acesse nossa aplicação principal para continuar.</p>
    <a href="https://app.dolscapital.com" class="button">Ir para a aplicação</a>
  </div>
</body>
</html>`;

// Escrever o arquivo HTML no diretório dist
fs.writeFileSync(path.join('dist', 'index.html'), staticHtml);

console.log('Página estática criada com sucesso!');

// Criar um arquivo vazio para evitar erros de assets não encontrados
fs.writeFileSync(path.join('dist', 'index.js'), '// Placeholder');

console.log('Build estático concluído com sucesso!');

