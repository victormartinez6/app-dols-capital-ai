const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Inicializar o Firebase Admin SDK
// Se já estiver inicializado em outro lugar, você pode remover esta parte
if (!admin.apps.length) {
  try {
    admin.initializeApp();
    console.log('Firebase Admin SDK inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar Firebase Admin SDK:', error);
    process.exit(1);
  }
}

async function setupCors() {
  try {
    console.log('Iniciando configuração de CORS para o Firebase Storage...');
    
    // Caminho para o arquivo cors.json
    const corsFilePath = path.join(__dirname, '../../cors.json');
    
    // Verificar se o arquivo cors.json existe
    if (!fs.existsSync(corsFilePath)) {
      console.error('Arquivo cors.json não encontrado!');
      process.exit(1);
    }
    
    // Ler configurações CORS do arquivo
    const corsConfig = JSON.parse(fs.readFileSync(corsFilePath, 'utf8'));
    console.log('Configurações CORS carregadas:', corsConfig);
    
    // Obter referência ao bucket padrão
    const bucket = admin.storage().bucket();
    console.log(`Configurando CORS para o bucket: ${bucket.name}`);
    
    // Aplicar configurações CORS
    await bucket.setCorsConfiguration(corsConfig);
    console.log('Configurações CORS aplicadas com sucesso!');
    
    // Verificar se as configurações foram aplicadas
    const [metadata] = await bucket.getMetadata();
    console.log('Configurações CORS atuais:', metadata.cors);
    
    console.log('Configuração de CORS concluída com sucesso!');
  } catch (error) {
    console.error('Erro ao configurar CORS:', error);
    process.exit(1);
  }
}

// Executar a função
setupCors();
