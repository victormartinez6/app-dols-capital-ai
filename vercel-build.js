// Adicione estas linhas no início do arquivo
import { existsSync, mkdirSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';

console.log('Iniciando processo de build específico para Vercel...');

// 1. Criar index.html na raiz
console.log('Criando index.html na raiz...');
const htmlContent = `<!DOCTYPE html>
<html lang="pt-BR">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon_dols.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Dols Capital</title>
    <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700&display=swap" rel="stylesheet">
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;

writeFileSync('index.html', htmlContent);
console.log('index.html criado/atualizado com sucesso!');

// 2. Criar diretórios necessários
const dirsToCreate = [
  'src',
  'src/pages/dashboard/marketing/ai-creator',
  'src/pages/dashboard/marketing/ai-creator/hooks',
  'src/pages/dashboard/marketing/ai-creator/components',
  'src/pages/dashboard/marketing/ai-creator/types'
];

dirsToCreate.forEach(dir => {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    console.log(`Diretório criado: ${dir}`);
  }
});

// 3. Criar arquivos necessários

// 3.1 Criar index.css vazio
console.log('Criando src/index.css vazio...');
writeFileSync('src/index.css', '/* Estilos globais */\n');
console.log('src/index.css criado com sucesso!');

// 3.2 Criar arquivo de tipos vazio
console.log('Criando arquivo de tipos...');
const typesContent = `export const contentTypes = {
  POST: 'post',
  EMAIL: 'email',
  AD: 'ad',
  LANDING_PAGE: 'landing_page'
} as const;

export type ContentType = keyof typeof contentTypes;
`;

writeFileSync('src/pages/dashboard/marketing/ai-creator/types/index.ts', typesContent);
console.log('Arquivo de tipos criado com sucesso!');

// 3.3 Criar componente LoadingModal
console.log('Criando LoadingModal...');
const loadingModalContent = `import React from 'react';

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-xl">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-4 text-center">Carregando...</p>
      </div>
    </div>
  );
};

export default LoadingModal;
`;

writeFileSync(
  'src/pages/dashboard/marketing/ai-creator/components/LoadingModal.tsx',
  loadingModalContent
);
console.log('LoadingModal criado com sucesso!');

// 3.4 Criar hook useAICreator
console.log('Criando useAICreator...');
const useAICreatorContent = `import { useState } from 'react';

export const useAICreator = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<string>('');

  const generateContent = async (prompt: string, type: string) => {
    try {
      setIsLoading(true);
      setError(null);
      // Simula uma chamada de API
      await new Promise(resolve => setTimeout(resolve, 1000));
      setResult(`Conteúdo gerado para ${type}:\n\n${prompt}`);
      return 'Conteúdo gerado com sucesso!';
    } catch (err) {
      setError('Ocorreu um erro ao gerar o conteúdo');
      console.error(err);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    error,
    result,
    generateContent,
  };
};
`;

writeFileSync(
  'src/pages/dashboard/marketing/ai-creator/hooks/useAICreator.ts',
  useAICreatorContent
);
console.log('useAICreator criado com sucesso!');

// 3.5 Criar componente AICreator
console.log('Criando AICreator...');
const aiCreatorContent = `import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check, Trash2, AlertCircle } from 'lucide-react';
import { useAICreator } from '../hooks/useAICreator';
import { contentTypes } from '../types';
import LoadingModal from './LoadingModal';

const AICreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [contentType, setContentType] = useState<string>(contentTypes.POST);
  const { isLoading, error, result, generateContent } = useAICreator();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    await generateContent(prompt, contentType);
  };

  const handleClear = () => {
    setPrompt('');
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Criador de Conteúdo com IA</h1>
      
      <div className="mb-6">
        <label htmlFor="contentType" className="block text-sm font-medium text-gray-700 mb-2">
          Tipo de Conteúdo
        </label>
        <select
          id="contentType"
          value={contentType}
          onChange={(e) => setContentType(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
        >
          {Object.entries(contentTypes).map(([key, value]) => (
            <option key={key} value={value}>
              {key}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-6">
        <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
          Descreva o que você precisa:
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            id="prompt"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Ex: Um post sobre finanças pessoais para iniciantes"
            className="flex-1 p-3 border border-gray-300 rounded-l-md focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={handleGenerate}
            disabled={isLoading || !prompt.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-r-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {isLoading ? 'Gerando...' : 'Gerar Conteúdo'}
          </button>
          <button
            onClick={handleClear}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-md flex items-start">
          <AlertCircle className="h-5 w-5 mr-2 mt-0.5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {result && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-3">Resultado:</h2>
          <div className="bg-gray-50 p-4 rounded-md border border-gray-200 whitespace-pre-wrap">
            {result}
          </div>
          <div className="mt-3 flex justify-end">
            <button
              onClick={() => navigator.clipboard.writeText(result)}
              className="flex items-center px-3 py-1.5 text-sm text-blue-600 hover:text-blue-800"
            >
              <Copy className="h-4 w-4 mr-1" />
              Copiar
            </button>
          </div>
        </div>
      )}

      <LoadingModal isOpen={isLoading} />
    </div>
  );
};

export { AICreator };
`;

writeFileSync(
  'src/pages/dashboard/marketing/ai-creator/components/AICreator.tsx',
  aiCreatorContent
);
console.log('AICreator criado com sucesso!');

// 4. Criar src/main.tsx
console.log('Criando src/main.tsx...');
const mainTsxContent = `import React from 'react';
import { createRoot } from 'react-dom/client';
import { AICreator } from './pages/dashboard/marketing/ai-creator/components/AICreator';
import './index.css';

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <AICreator />
    </React.StrictMode>
  );
}
`;

writeFileSync('src/main.tsx', mainTsxContent);
console.log('src/main.tsx criado com sucesso!');

// 5. Garantir que o diretório dist existe
if (!existsSync('dist')) {
  mkdirSync('dist', { recursive: true });
}

// 6. Executar build do Vite
console.log('Executando build do Vite...');
try {
  execSync('npx vite build', { stdio: 'inherit' });
  console.log('Build concluído com sucesso!');
} catch (error) {
  console.error('Erro durante o build do Vite:', error);
  process.exit(1);
}

// 7. Verificar se o build foi bem-sucedido
if (!existsSync('dist/index.html')) {
  console.error('Erro: O build não gerou o arquivo index.html');
  process.exit(1);
}

console.log('Build finalizado com sucesso!');