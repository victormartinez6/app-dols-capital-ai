import React, { useState, useEffect } from 'react';
import { Sparkles, Send, Copy, Check, Clock, ChevronDown, ChevronUp, Trash2, AlertCircle, Eye } from 'lucide-react';
import { useAICreator } from '../hooks/useAICreator';
import { contentTypes } from '../types';
import LoadingModal from './LoadingModal';

const AICreator: React.FC = () => {
  // Log para debug
  console.log('AICreator component rendered');
  
  const {
    prompt,
    setPrompt,
    response,
    setResponse,
    loading,
    error,
    title,
    setTitle,
    selectedType,
    setSelectedType,
    history,
    generateContent,
    loadHistory,
    deleteHistoryItem,
    copyResponse,
    loadHistoryItem
  } = useAICreator();
  
  const [showHistory, setShowHistory] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  
  // Carregar histórico do usuário ao iniciar e mantê-lo sempre visível
  useEffect(() => {
    loadHistory();
    // Garantir que o histórico sempre esteja visível
    setShowHistory(true);
  }, [loadHistory]);
  
  const copyToClipboard = () => {
    if (response) {
      copyResponse();
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim() || !title.trim()) return;
    
    // Limpar resposta anterior e mostrar loading modal
    setResponse('');
    setShowLoadingModal(true);
    
    try {
      // Gerar conteúdo e salvar automaticamente no histórico
      await generateContent();
      
      // Mostrar o histórico após gerar o conteúdo
      setShowHistory(true);
      
      // Limpar os campos de preenchimento após gerar o conteúdo
      setPrompt('');
      setTitle('');
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
    } finally {
      // Fechar o modal de carregamento após concluir
      setShowLoadingModal(false);
    }
  };

  return (
    <>
      {/* Modal de carregamento */}
      <LoadingModal isOpen={showLoadingModal} />
      <div className="container mx-auto px-4 py-8 max-w-7xl text-white">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">
          Criador com IA
        </h1>
        <p className="text-gray-400 mt-2">
          Crie conteúdos de marketing personalizados com a ajuda da inteligência artificial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Área principal - Coluna da direita */}
        {/* Painel de histórico - Coluna da esquerda */}
        <div className="lg:col-span-1">
          <div className="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800 h-full">
            <div className="p-4 bg-black flex justify-between items-center cursor-pointer border-b border-gray-800" 
                 onClick={() => setShowHistory(!showHistory)}>
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Clock className="h-5 w-5 mr-2" />
                Histórico
              </h2>
              <button className="text-gray-400 hover:text-white">
                {showHistory ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
              </button>
            </div>
            
            {showHistory && (
              <div className="p-4 max-h-[600px] overflow-y-auto bg-black">
                {history.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <p>Nenhum histórico encontrado</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {history.map((item) => (
                      <div key={item.id} className="bg-gray-900 p-3 rounded-lg hover:bg-gray-800 transition-colors border border-gray-800">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-medium text-white truncate flex-1">{item.title}</h3>
                          <div className="flex space-x-1">
                            <button 
                              onClick={() => loadHistoryItem(item)}
                              className="text-blue-400 hover:text-blue-300 p-1 rounded-full hover:bg-gray-700"
                              title="Visualizar este item"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button 
                              onClick={() => deleteHistoryItem(item.id)}
                              className="text-red-400 hover:text-red-300 p-1 rounded-full hover:bg-gray-700"
                              title="Excluir este item"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                        <p className="text-gray-400 text-sm truncate">{item.prompt.substring(0, 100)}{item.prompt.length > 100 ? '...' : ''}</p>
                        <div className="mt-2 text-xs flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-blue-400" />
                          <span className="text-gray-400">
                            {new Date(item.createdAt).toLocaleDateString('pt-BR', {
                              day: '2-digit',
                              month: '2-digit',
                              year: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Área principal - Coluna da direita */}
        <div className="lg:col-span-2">
          <div className="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800 mb-6">
            <div className="p-4 bg-black border-b border-gray-800">
              <h2 className="text-xl font-semibold text-white flex items-center">
                <Sparkles className="h-5 w-5 mr-2" />
                Novo Conteúdo
              </h2>
            </div>
            
            <div className="p-4">
              {/* Título do conteúdo */}
              <div className="mb-4">
                <label htmlFor="title" className="block text-sm font-medium text-gray-400 mb-1">
                  Título do conteúdo
                </label>
                <input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Digite um título para seu conteúdo..."
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Tipo de conteúdo */}
              <div className="mb-4">
                <label htmlFor="contentType" className="block text-sm font-medium text-gray-400 mb-1">
                  Tipo de conteúdo
                </label>
                <select
                  id="contentType"
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value as any)}
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {contentTypes.map((type) => (
                    <option key={type.id} value={type.id}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </div>

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
                  className="w-full px-4 py-2 bg-black border border-gray-700 rounded-md text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px]"
                />
              </div>

              {/* Botão de gerar */}
              {/* Mensagem de erro - só exibir se não houver histórico disponível */}
              {error && history.length === 0 && (
                <div className="mb-4 p-3 bg-red-900/30 border border-red-700 rounded-md flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-red-200 text-sm">{error}</p>
                </div>
              )}

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
            <div className="bg-black rounded-lg shadow-lg overflow-hidden border border-gray-800">
              <div className="p-4 bg-black border-b border-gray-800 flex justify-between items-center">
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
                <div className="bg-gray-900 rounded-lg p-4 text-white whitespace-pre-line border border-gray-800">
                  {response}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
};

export default AICreator;
