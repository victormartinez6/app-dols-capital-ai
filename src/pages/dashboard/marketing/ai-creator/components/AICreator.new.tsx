import React, { useState } from 'react';
import { Sparkles, Send, Copy, Check } from 'lucide-react';

const AICreator: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const handleSubmit = () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    setResponse('Gerando conteúdo com IA...');
    
    // Simulação de resposta da API
    setTimeout(() => {
      setResponse(`Resposta gerada para: "${prompt}"

Aqui está o conteúdo gerado pela IA baseado no seu prompt. Este é um exemplo simplificado do Criador com IA.

Você pode personalizar este texto, copiar para a área de transferência ou salvar no histórico.`);
      setLoading(false);
    }, 2000);
  };
  
  const copyToClipboard = () => {
    if (response) {
      navigator.clipboard.writeText(response);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">
          Criador com IA
        </h1>
        <p className="text-gray-400 mt-2">
          Crie conteúdos de marketing personalizados com a ajuda da inteligência artificial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área principal - Coluna da direita */}
        <div className="lg:col-span-3">
          <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800 mb-6">
            <div className="p-4 bg-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Novo Conteúdo
              </h2>
            </div>
            
            <div className="p-4">
              {/* Área do prompt */}
              <div className="mb-4">
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-400 mb-1">
                  O que você deseja criar?
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Descreva o conteúdo que você deseja criar..."
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                />
              </div>

              {/* Botão de gerar */}
              <div className="flex justify-end">
                <button
                  onClick={handleSubmit}
                  disabled={loading || !prompt.trim()}
                  className={`flex items-center px-6 py-3 rounded-lg transition-all duration-300 ${
                    loading || !prompt.trim()
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-blue-600 to-indigo-700 text-white hover:from-blue-700 hover:to-indigo-800 shadow-lg hover:shadow-xl transform hover:-translate-y-1'
                  }`}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                      <span>Gerando...</span>
                    </>
                  ) : (
                    <>
                      <Send className="h-5 w-5 mr-2" />
                      <span>Gerar Conteúdo</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Área de resposta */}
          {response && (
            <div className="bg-gray-900 rounded-lg shadow-lg overflow-hidden border border-gray-800">
              <div className="p-4 bg-gray-800 flex justify-between items-center">
                <h2 className="text-xl font-semibold text-white">Conteúdo Gerado</h2>
                <button
                  onClick={copyToClipboard}
                  className="flex items-center px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded-md text-white transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      <span>Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-4">
                <div className="bg-gray-800 rounded-lg p-4 text-white whitespace-pre-line">
                  {response}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AICreator;
