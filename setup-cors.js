// Script para configurar CORS no Firebase Storage
const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Iniciando configuração de CORS para o Firebase Storage...');

// Verificar se o arquivo cors.json existe
const corsFilePath = path.join(__dirname, 'cors.json');
if (!fs.existsSync(corsFilePath)) {
  console.error('Arquivo cors.json não encontrado!');
  process.exit(1);
}

// Obter o nome do bucket do Firebase Storage
// Você pode substituir este comando por uma leitura do arquivo .firebaserc ou outro arquivo de configuração
exec('firebase storage:buckets:list', (error, stdout, stderr) => {
  if (error) {
    console.error(`Erro ao listar buckets: ${error.message}`);
    console.error('Certifique-se de que o Firebase CLI está instalado e que você está logado.');
    console.error('Para instalar: npm install -g firebase-tools');
    console.error('Para fazer login: firebase login');
    process.exit(1);
  }
  
  if (stderr) {
    console.error(`Erro: ${stderr}`);
    process.exit(1);
  }
  
  // Extrair o nome do bucket da saída
  const bucketMatch = stdout.match(/gs:\/\/([^\s]+)/);
  if (!bucketMatch || !bucketMatch[1]) {
    console.error('Não foi possível encontrar o bucket do Firebase Storage.');
    console.error('Saída do comando:', stdout);
    process.exit(1);
  }
  
  const bucketName = bucketMatch[1];
  console.log(`Bucket encontrado: ${bucketName}`);
  
  // Aplicar configurações CORS ao bucket
  const command = `gsutil cors set cors.json gs://${bucketName}`;
  console.log(`Executando comando: ${command}`);
  
  exec(command, (error, stdout, stderr) => {
    if (error) {
      console.error(`Erro ao aplicar configurações CORS: ${error.message}`);
      console.error('Certifique-se de que o gsutil está instalado e configurado.');
      console.error('Para instalar gsutil: https://cloud.google.com/storage/docs/gsutil_install');
      process.exit(1);
    }
    
    if (stderr && !stderr.includes('Setting CORS')) {
      console.error(`Erro: ${stderr}`);
      process.exit(1);
    }
    
    console.log('Configurações CORS aplicadas com sucesso!');
    console.log('Agora os uploads para o Firebase Storage devem funcionar corretamente.');
  });
});
