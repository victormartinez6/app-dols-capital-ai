// Script para aplicar configurações CORS ao Firebase Storage
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando aplicação de configurações CORS no Firebase Storage...');

try {
  // Verificar se o arquivo cors.json existe
  const corsFilePath = path.join(__dirname, 'cors.json');
  if (!fs.existsSync(corsFilePath)) {
    console.error('Erro: Arquivo cors.json não encontrado!');
    process.exit(1);
  }

  // Ler o arquivo .firebaserc para obter o ID do projeto
  const firebaseRcPath = path.join(__dirname, '.firebaserc');
  if (!fs.existsSync(firebaseRcPath)) {
    console.error('Erro: Arquivo .firebaserc não encontrado!');
    console.error('Execute "firebase init" para inicializar o projeto Firebase.');
    process.exit(1);
  }

  const firebaseRcContent = fs.readFileSync(firebaseRcPath, 'utf8');
  const projectIdMatch = firebaseRcContent.match(/"default":\s*"([^"]+)"/);
  
  if (!projectIdMatch || !projectIdMatch[1]) {
    console.error('Erro: Não foi possível encontrar o ID do projeto no arquivo .firebaserc');
    process.exit(1);
  }
  
  const projectId = projectIdMatch[1];
  console.log(`ID do projeto Firebase: ${projectId}`);
  
  // Construir o nome do bucket padrão do Firebase Storage
  const bucketName = `${projectId}.appspot.com`;
  console.log(`Nome do bucket do Firebase Storage: ${bucketName}`);
  
  // Verificar se o gsutil está disponível
  try {
    console.log('Verificando se o gsutil está instalado...');
    execSync('gsutil --version', { stdio: 'ignore' });
    console.log('gsutil está instalado!');
  } catch (error) {
    console.error('Erro: gsutil não está instalado ou não está no PATH.');
    console.error('Você pode instalar o gsutil como parte do Google Cloud SDK:');
    console.error('https://cloud.google.com/sdk/docs/install');
    
    // Tentar usar o Firebase CLI como alternativa
    console.log('Tentando usar o Firebase CLI como alternativa...');
    try {
      console.log('Verificando se o Firebase CLI está instalado...');
      execSync('firebase --version', { stdio: 'ignore' });
      console.log('Firebase CLI está instalado!');
      
      console.log('Aplicando configurações CORS usando Firebase CLI...');
      console.log('Isso pode levar alguns minutos...');
      
      // Fazer login no Firebase se necessário
      try {
        execSync('firebase login:ci --no-localhost', { stdio: 'inherit' });
      } catch (loginError) {
        console.log('Você já pode estar logado no Firebase CLI, continuando...');
      }
      
      // Aplicar configurações CORS usando o Firebase Storage:cors:set
      try {
        execSync(`firebase storage:cors:set cors.json --project ${projectId}`, { 
          stdio: 'inherit'
        });
        console.log('Configurações CORS aplicadas com sucesso usando Firebase CLI!');
        process.exit(0);
      } catch (firebaseError) {
        console.error('Erro ao aplicar configurações CORS usando Firebase CLI:', firebaseError.message);
        console.error('Por favor, tente aplicar manualmente usando o console do Firebase.');
        process.exit(1);
      }
    } catch (firebaseCliError) {
      console.error('Erro: Firebase CLI não está instalado.');
      console.error('Você pode instalar o Firebase CLI com: npm install -g firebase-tools');
      process.exit(1);
    }
  }
  
  // Se chegou aqui, o gsutil está disponível
  console.log('Aplicando configurações CORS usando gsutil...');
  execSync(`gsutil cors set cors.json gs://${bucketName}`, { 
    stdio: 'inherit'
  });
  
  console.log('Configurações CORS aplicadas com sucesso!');
  console.log('Agora os uploads para o Firebase Storage devem funcionar corretamente.');
  
} catch (error) {
  console.error('Erro ao aplicar configurações CORS:', error.message);
  process.exit(1);
}
