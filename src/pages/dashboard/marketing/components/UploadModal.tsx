import React, { useState, useRef, useEffect } from 'react';
import { X, Upload, Bold, Italic, List, Smile } from 'lucide-react';
import { MarketingCategory, TextFormatting, UploadType } from '../types';
import { getAcceptedFileTypes, getFileTypeMessage, formatFileSize } from '../utils';

interface UploadModalProps {
  show: boolean;
  onClose: () => void;
  uploadCategory: MarketingCategory;
  setUploadCategory: (category: MarketingCategory) => void;
  onUpload: (files: File[], description: string, uploadType: UploadType) => Promise<void>;
  uploadProgress?: number;
}

const UploadModal: React.FC<UploadModalProps> = ({
  show,
  onClose,
  uploadCategory,
  setUploadCategory,
  onUpload,
  uploadProgress = 0
}) => {
  const [fileToUpload, setFileToUpload] = useState<File | null>(null);
  const [multipleFiles, setMultipleFiles] = useState<File[]>([]);
  const [fileDescription, setFileDescription] = useState('');
  const [uploadType, setUploadType] = useState<UploadType>('single');
  const [textFormatting, setTextFormatting] = useState<TextFormatting>({
    bold: false,
    italic: false,
    list: false
  });
  const [error, setError] = useState<string | null>(null);
  const [internalUploadProgress, setInternalUploadProgress] = useState(uploadProgress);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const multipleFilesInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Função para validar o arquivo conforme as regras da categoria
  const validateFile = (file: File, category: MarketingCategory): string | null => {
    // Verificar tipo de arquivo
    const acceptedExtensions = getAcceptedFileTypes(category);
    // Converter a string de extensões em um array
    const extensionsArray = acceptedExtensions.split(',');
    
    // Obter a extensão do arquivo
    const fileExtension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    // Verificar se a extensão do arquivo está entre as extensões aceitas
    const isValidType = extensionsArray.includes(fileExtension) || acceptedExtensions === '*';
    
    if (!isValidType) {
      return `Tipo de arquivo não permitido para a categoria ${category}. Tipos aceitos: ${getFileTypeMessage(category)}`;
    }
    
    // Verificar tamanho do arquivo (limite de 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB em bytes
    if (file.size > maxSize) {
      return `O arquivo é muito grande. Tamanho máximo permitido: 10MB. Tamanho atual: ${formatFileSize(file.size)}`;
    }
    
    return null; // Arquivo válido
  };
  
  // Resetar o estado quando o modal é aberto
  useEffect(() => {
    if (show) {
      // Resetar o estado apenas quando o modal é aberto
      setFileToUpload(null);
      setMultipleFiles([]);
      setFileDescription('');
      setError(null);
      setInternalUploadProgress(0);
      console.log('Modal aberto, estado resetado');
    }
  }, [show]);
  
  // Sincronizar o progresso interno com o progresso recebido via props
  // apenas quando não estamos resetando o estado
  useEffect(() => {
    // Só atualizar o progresso interno se o modal estiver aberto
    // e não estivermos no processo de resetar o estado
    if (show) {
      setInternalUploadProgress(uploadProgress);
    }
  }, [uploadProgress, show]);
  
  // Efeito para resetar o estado quando o upload for concluído
  useEffect(() => {
    if (internalUploadProgress === 100) {
      console.log('Upload concluído (100%), preparando para resetar o estado...');
      const timer = setTimeout(() => {
        console.log('Resetando estado após upload concluído');
        // Resetar o estado para permitir um novo upload
        setFileToUpload(null);
        setMultipleFiles([]);
        setFileDescription('');
        setError(null);
        setInternalUploadProgress(0);
        
        // Opcional: mostrar mensagem de sucesso temporária
        setError('Upload concluído com sucesso! Você pode fazer um novo upload agora.');
        setTimeout(() => setError(null), 3000); // Limpar mensagem após 3 segundos
      }, 1500); // Resetar após 1.5 segundos para dar tempo de ver a mensagem de sucesso
      
      return () => clearTimeout(timer);
    }
  }, [internalUploadProgress]);

  // Função para aplicar formatação ao texto selecionado
  const applyFormatting = (type: 'bold' | 'italic' | 'list') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    let newCursorPos = end;
    
    // Aplicar formatação com base no tipo
    switch (type) {
      case 'bold':
        if (selectedText) {
          formattedText = `**${selectedText}**`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '**texto em negrito**';
          newCursorPos = start + 2; // Posicionar cursor após os primeiros **
        }
        break;
      
      case 'italic':
        if (selectedText) {
          formattedText = `*${selectedText}*`;
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '*texto em itálico*';
          newCursorPos = start + 1; // Posicionar cursor após o primeiro *
        }
        break;
      
      case 'list':
        // Se já houver texto selecionado, adicionar "- " no início de cada linha
        if (selectedText) {
          formattedText = selectedText
            .split('\n')
            .map(line => (line.trim() ? `- ${line}` : line))
            .join('\n');
          newCursorPos = start + formattedText.length;
        } else {
          formattedText = '- Item da lista';
          newCursorPos = start + formattedText.length;
        }
        break;
    }
    
    // Atualizar o valor do textarea
    const newValue = 
      textarea.value.substring(0, start) + 
      formattedText + 
      textarea.value.substring(end);
    
    setFileDescription(newValue);
    
    // Atualizar estado de formatação
    setTextFormatting(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
    
    // Definir foco de volta ao textarea após a atualização do estado
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Função para adicionar emoji à descrição
  const addEmoji = (emoji: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    
    const newValue = 
      textarea.value.substring(0, start) + 
      emoji + 
      textarea.value.substring(end);
    
    setFileDescription(newValue);
    
    // Definir foco de volta ao textarea após a atualização do estado
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  };

  // Lista de emojis comuns
  const commonEmojis = [
    '😀', '👍', '🔥', '⭐', '❤️', '🎉', '✅', '🚀', '💯', '📊',
    '📈', '📝', '💼', '🏆', '💡', '📱', '💻', '🌟', '👏', '🤝'
  ];

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    const file = files[0];
    const errorMessage = validateFile(file, uploadCategory);
    
    if (errorMessage) {
      setError(errorMessage);
      return;
    }
    
    setFileToUpload(file);
    setError(null);
  };

  // Função para lidar com a seleção de múltiplos arquivos
  const handleMultipleFilesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    // Verificar se todos os arquivos são imagens
    const invalidFiles = Array.from(files).filter(file => !file.type.startsWith('image/'));
    
    if (invalidFiles.length > 0) {
      setError('Todos os arquivos devem ser imagens para criar um carrossel.');
      return;
    }
    
    // Limitar a 10 imagens
    if (files.length > 10) {
      setError('O carrossel pode ter no máximo 10 imagens.');
      return;
    }
    
    setMultipleFiles(Array.from(files));
    setError(null);
  };

  // Função para remover um arquivo da lista de múltiplos arquivos
  const removeFileFromMultiple = (index: number) => {
    setMultipleFiles(prev => prev.filter((_, i) => i !== index));
  };

  // Função para lidar com o envio do formulário
  const handleSubmit = async (e: React.FormEvent) => {
    console.log('handleSubmit iniciado', { uploadType, fileToUpload, multipleFiles });
    e.preventDefault();
    
    if (uploadType === 'single' && !fileToUpload) {
      console.log('Erro: Nenhum arquivo selecionado para upload único');
      setError('Por favor, selecione um arquivo para upload.');
      return;
    }
    
    if (uploadType === 'carousel' && multipleFiles.length === 0) {
      console.log('Erro: Nenhuma imagem selecionada para carrossel');
      setError('Por favor, selecione imagens para o carrossel.');
      return;
    }
    
    // Limpar erro antes de iniciar o upload
    setError(null);
    console.log('Iniciando upload...', { 
      tipo: uploadType, 
      arquivo: uploadType === 'single' ? fileToUpload?.name : 'multiplos arquivos',
      descricao: fileDescription ? 'preenchida' : 'vazia',
      categoria: uploadCategory
    });
    
    try {
      // Iniciar o upload - não fechamos o modal aqui
      // O modal será fechado automaticamente pelo useEffect quando o upload estiver concluído
      if (uploadType === 'single') {
        console.log('Chamando onUpload para arquivo único:', fileToUpload?.name);
        await onUpload([fileToUpload!], fileDescription, 'single');
        console.log('onUpload para arquivo único concluído');
      } else {
        console.log('Chamando onUpload para carrossel com', multipleFiles.length, 'arquivos');
        await onUpload(multipleFiles, fileDescription, 'carousel');
        console.log('onUpload para carrossel concluído');
      }
      
      console.log('Upload iniciado com sucesso, aguardando progresso...');
      
      // NÃO limpamos o formulário aqui - isso será feito pelo useEffect
      // quando o upload estiver concluído (uploadProgress === 100)
      
      // Não fechamos o modal aqui - será fechado pelo useEffect quando uploadProgress === 100
    } catch (error) {
      console.error('Erro no upload:', error);
      setError(`Ocorreu um erro ao fazer o upload: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
    }
  };

  // Função para lidar com o drag and drop
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  // Função para lidar com o drop de arquivos
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      if (uploadType === 'single') {
        // Para upload único, pegar apenas o primeiro arquivo
        const file = e.dataTransfer.files[0];
        const validationError = validateFile(file, uploadCategory);
        
        if (validationError) {
          setError(validationError);
          return;
        }
        
        setFileToUpload(file);
        setError(null);
      } else if (uploadType === 'carousel') {
        // Para carrossel, verificar se são imagens
        const files = Array.from(e.dataTransfer.files);
        const nonImageFiles = files.filter(file => !file.type.startsWith('image/'));
        
        if (nonImageFiles.length > 0) {
          setError('Apenas imagens são permitidas para carrossel.');
          return;
        }
        
        if (files.length > 10) {
          setError('Máximo de 10 imagens permitidas para carrossel.');
          return;
        }
        
        // Validar cada arquivo
        for (const file of files) {
          const validationError = validateFile(file, uploadCategory);
          if (validationError) {
            setError(validationError);
            return;
          }
        }
        
        setMultipleFiles(files);
        setError(null);
      }
    }
  };

  // Efeito simplificado para fechar o modal quando o upload for concluído
  useEffect(() => {
    console.log('Upload progress mudou:', internalUploadProgress);
    
    // Quando o progresso chegar a 100%, fechar o modal após um curto delay
    if (internalUploadProgress === 100) {
      console.log('Upload concluído! Fechando o modal...');
      
      // Fechar o modal após um curto delay
      const timer = setTimeout(() => {
        // Limpar formulário
        setFileToUpload(null);
        setMultipleFiles([]);
        setFileDescription('');
        setError(null);
        
        // Fechar modal
        console.log('Fechando o modal agora');
        onClose();
      }, 1000); // Reduzido para 1 segundo para ser mais rápido
      
      return () => clearTimeout(timer);
    }
    
    // Se o progresso ficar travado em 60% por mais de 3 segundos, forçar para 100%
    if (internalUploadProgress === 60) {
      const safetyTimer = setTimeout(() => {
        console.log('Upload travado em 60%, forçando para 100%');
        setInternalUploadProgress(100);
      }, 3000);
      
      return () => clearTimeout(safetyTimer);
    }
  }, [internalUploadProgress, onClose]);
  
  // Efeito adicional para garantir que o modal seja fechado se ficar aberto por muito tempo
  useEffect(() => {
    if (!show) return;
    
    // Timer de segurança global: fechar o modal após 15 segundos independentemente do progresso
    const globalSafetyTimer = setTimeout(() => {
      console.log('Timer de segurança global acionado. Fechando o modal.');
      // Limpar formulário
      setFileToUpload(null);
      setMultipleFiles([]);
      setFileDescription('');
      setError(null);
      
      // Fechar modal
      onClose();
    }, 15000);
    
    return () => clearTimeout(globalSafetyTimer);
  }, [show, onClose]);
  
  // Arredondar o progresso para números inteiros
  const roundedProgress = Math.round(uploadProgress);

  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-black rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-800 shadow-xl">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white">Upload de Arquivo</h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        {/* Barra de progresso para upload */}
        {roundedProgress > 0 && (
          <div className="px-4 pt-4">
            <div className="flex justify-between items-center mb-2">
              <span className="text-gray-300 text-sm font-medium">
                {roundedProgress < 25 ? 'Preparando arquivo...' : 
                 roundedProgress < 50 ? 'Enviando arquivo...' : 
                 roundedProgress < 75 ? 'Processando upload...' : 
                 roundedProgress < 100 ? 'Finalizando upload...' : 
                 'Upload concluído!'}
              </span>
              <span className="text-white text-sm font-bold bg-gray-800 px-2 py-1 rounded">{roundedProgress}%</span>
            </div>
            
            {/* Barra de progresso com animação */}
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all duration-300 ${roundedProgress < 100 ? 'bg-gradient-to-r from-blue-500 to-indigo-600 animate-pulse' : 'bg-green-500'}`}
                style={{ width: `${roundedProgress}%` }}
              ></div>
            </div>
            
            {/* Indicadores de etapa */}
            <div className="flex justify-between mt-2">
              <div className={`flex flex-col items-center ${roundedProgress >= 5 ? 'text-blue-400' : 'text-gray-600'}`}>
                <div className={`w-3 h-3 rounded-full mb-1 ${roundedProgress >= 5 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
                <span className="text-xs">Iniciando</span>
              </div>
              <div className={`flex flex-col items-center ${roundedProgress >= 40 ? 'text-blue-400' : 'text-gray-600'}`}>
                <div className={`w-3 h-3 rounded-full mb-1 ${roundedProgress >= 40 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
                <span className="text-xs">Processando</span>
              </div>
              <div className={`flex flex-col items-center ${roundedProgress >= 75 ? 'text-blue-400' : 'text-gray-600'}`}>
                <div className={`w-3 h-3 rounded-full mb-1 ${roundedProgress >= 75 ? 'bg-blue-400' : 'bg-gray-700'}`}></div>
                <span className="text-xs">Finalizando</span>
              </div>
              <div className={`flex flex-col items-center ${roundedProgress >= 100 ? 'text-green-400' : 'text-gray-600'}`}>
                <div className={`w-3 h-3 rounded-full mb-1 ${roundedProgress >= 100 ? 'bg-green-400' : 'bg-gray-700'}`}></div>
                <span className="text-xs">Concluído</span>
              </div>
            </div>
            
            {/* Mensagem de sucesso dentro do modal de upload */}
            {roundedProgress === 100 && (
              <div className="mt-4 p-4 bg-green-900/30 border border-green-800 rounded-lg flex items-center animate-fadeIn">
                <div className="bg-green-500 rounded-full p-2 mr-3">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                </div>
                <div>
                  <h3 className="text-white font-medium text-lg">Upload Concluído com Sucesso!</h3>
                  <p className="text-green-200 text-sm">Seu arquivo foi enviado e já está disponível na galeria.</p>
                  <p className="text-green-200 text-xs mt-1">Esta janela será fechada automaticamente em instantes...</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        <form 
          onSubmit={(e) => {
            console.log('Formulário submetido!');
            handleSubmit(e);
          }} 
          className="p-4"
        >
          {/* Tipo de Upload */}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2">Tipo de Upload</label>
            <div className="flex space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadType"
                  value="single"
                  checked={uploadType === 'single'}
                  onChange={() => setUploadType('single')}
                  className="mr-2"
                />
                <span className="text-white">Arquivo Único</span>
              </label>
              
              <label className="flex items-center">
                <input
                  type="radio"
                  name="uploadType"
                  value="carousel"
                  checked={uploadType === 'carousel'}
                  onChange={() => setUploadType('carousel')}
                  className="mr-2"
                />
                <span className="text-white">Carrossel de Imagens</span>
              </label>
            </div>
          </div>
          
          {/* Categoria */}
          <div className="mb-4">
            <label htmlFor="category" className="block text-gray-300 mb-2">Categoria</label>
            <select
              id="category"
              value={uploadCategory}
              onChange={(e) => setUploadCategory(e.target.value as MarketingCategory)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2"
            >
              <option value="artes">Artes Gráficas</option>
              <option value="documentos">Documentos</option>
              <option value="apresentacoes">Apresentações</option>
              <option value="videos">Vídeos</option>
              <option value="restrita">Área Restrita</option>
            </select>
          </div>
          
          {/* Upload de Arquivo Único */}
          {uploadType === 'single' && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Arquivo</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 mb-3 flex flex-col items-center justify-center transition-colors ${fileToUpload ? 'border-blue-500 bg-blue-500/10' : 'border-gray-700 hover:border-blue-500 hover:bg-blue-500/5'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept={getAcceptedFileTypes(uploadCategory)}
                  className="hidden"
                />
                
                {fileToUpload ? (
                  <div className="text-center">
                    <div className="text-blue-400 text-lg font-medium mb-2">{fileToUpload.name}</div>
                    <div className="text-gray-400 text-sm">{formatFileSize(fileToUpload.size)}</div>
                    <button
                      type="button"
                      onClick={() => setFileToUpload(null)}
                      className="mt-3 text-red-400 hover:text-red-300 text-sm"
                    >
                      Remover arquivo
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-500 mb-3" />
                    <p className="text-gray-300 text-center mb-2">Arraste e solte seu arquivo aqui ou</p>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center"
                    >
                      <span>Selecionar Arquivo</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                {getFileTypeMessage(uploadCategory)}
              </p>
            </div>
          )}
          
          {/* Upload de Carrossel */}
          {uploadType === 'carousel' && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2">Imagens para o Carrossel</label>
              <div 
                className={`border-2 border-dashed rounded-lg p-6 mb-3 flex flex-col items-center justify-center transition-colors ${multipleFiles.length > 0 ? 'border-purple-500 bg-purple-500/10' : 'border-gray-700 hover:border-purple-500 hover:bg-purple-500/5'}`}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  ref={multipleFilesInputRef}
                  onChange={handleMultipleFilesChange}
                  accept="image/*"
                  multiple
                  className="hidden"
                />
                
                {multipleFiles.length > 0 ? (
                  <div className="text-center w-full">
                    <div className="text-purple-400 text-lg font-medium mb-2">
                      {multipleFiles.length} {multipleFiles.length === 1 ? 'imagem selecionada' : 'imagens selecionadas'}
                    </div>
                    <div className="text-gray-400 text-sm mb-4">
                      Arraste mais imagens ou clique para adicionar
                    </div>
                    
                    {/* Pré-visualização das imagens selecionadas */}
                    <div className="grid grid-cols-5 gap-3 mb-4">
                      {multipleFiles.map((file, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-20 object-cover rounded-md border border-gray-700 group-hover:border-purple-500 transition-colors"
                          />
                          <button
                            type="button"
                            onClick={() => removeFileFromMultiple(index)}
                            className="absolute top-1 right-1 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center hover:bg-red-700 transition-colors opacity-0 group-hover:opacity-100"
                            title="Remover imagem"
                          >
                            <X className="h-3 w-3" />
                          </button>
                          <div className="absolute bottom-1 right-1 bg-black bg-opacity-70 text-xs text-white px-1 rounded">
                            {formatFileSize(file.size)}
                          </div>
                        </div>
                      ))}
                      
                      {/* Botão para adicionar mais imagens */}
                      <div 
                        className="w-full h-20 border border-dashed border-gray-600 rounded-md flex items-center justify-center cursor-pointer hover:border-purple-500 hover:bg-purple-500/10 transition-colors"
                        onClick={() => multipleFilesInputRef.current?.click()}
                      >
                        <span className="text-gray-400 text-2xl">+</span>
                      </div>
                    </div>
                    
                    <button
                      type="button"
                      onClick={() => setMultipleFiles([])}
                      className="text-red-400 hover:text-red-300 text-sm"
                    >
                      Remover todas as imagens
                    </button>
                  </div>
                ) : (
                  <>
                    <Upload className="h-10 w-10 text-gray-500 mb-3" />
                    <p className="text-gray-300 text-center mb-2">Arraste e solte suas imagens aqui ou</p>
                    <button
                      type="button"
                      onClick={() => multipleFilesInputRef.current?.click()}
                      className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition-colors flex items-center"
                    >
                      <span>Selecionar Imagens</span>
                    </button>
                  </>
                )}
              </div>
              <p className="text-gray-400 text-sm">
                Selecione até 10 imagens para criar um carrossel. Apenas imagens são permitidas.
              </p>
            </div>
          )}
          
          {/* Descrição */}
          <div className="mb-4">
            <label htmlFor="description" className="block text-gray-300 mb-2">Descrição</label>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                type="button"
                onClick={() => applyFormatting('bold')}
                className={`p-2 rounded ${
                  textFormatting.bold ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
                title="Negrito"
              >
                <Bold className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => applyFormatting('italic')}
                className={`p-2 rounded ${
                  textFormatting.italic ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
                title="Itálico"
              >
                <Italic className="h-4 w-4" />
              </button>
              
              <button
                type="button"
                onClick={() => applyFormatting('list')}
                className={`p-2 rounded ${
                  textFormatting.list ? 'bg-blue-600 text-white' : 'bg-gray-800 text-gray-300'
                }`}
                title="Lista"
              >
                <List className="h-4 w-4" />
              </button>
              
              <div className="relative group ml-auto">
                <button
                  type="button"
                  className="p-2 rounded bg-gray-800 text-gray-300 hover:bg-gray-700"
                  title="Emojis"
                >
                  <Smile className="h-4 w-4" />
                </button>
                
                <div className="absolute right-0 mt-1 bg-gray-800 rounded-md p-2 hidden group-hover:grid grid-cols-10 gap-1 z-10">
                  {commonEmojis.map((emoji, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => addEmoji(emoji)}
                      className="hover:bg-gray-700 rounded p-1 text-lg"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <textarea
              id="description"
              ref={textareaRef}
              value={fileDescription}
              onChange={(e) => setFileDescription(e.target.value)}
              className="w-full bg-gray-800 text-white border border-gray-700 rounded-md px-3 py-2 min-h-[100px]"
              placeholder="Adicione uma descrição para o arquivo..."
            ></textarea>
            <p className="text-gray-400 text-sm mt-1">
              Você pode usar formatação como <strong>**negrito**</strong>, <em>*itálico*</em> e listas com "- item".
            </p>
          </div>
          
          {/* Removido a barra de progresso duplicada */}
          
          {/* Mensagem de Sucesso - Mostrar quando o upload for concluído */}
          {internalUploadProgress === 100 && (
            <div className="mb-4 p-3 bg-green-900/50 border border-green-800 rounded-md text-green-200">
              Upload concluído com sucesso! Preparando para um novo upload...
            </div>
          )}
          
          {/* Mensagem de Erro */}
          {error && (
            <div className="mb-4 p-3 bg-red-900/50 border border-red-800 rounded-md text-red-200">
              {error}
            </div>
          )}
          
          {/* Botões */}
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancelar
            </button>
            
            <button
              type="button" /* Alterado para button para garantir que o onClick seja chamado */
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center"
              disabled={
                (uploadType === 'single' && !fileToUpload) || 
                (uploadType === 'carousel' && multipleFiles.length === 0)
              }
              onClick={(e) => {
                console.log('Botão de upload clicado diretamente');
                e.preventDefault(); // Prevenir comportamento padrão
                
                if (uploadType === 'single' && fileToUpload) {
                  console.log('Arquivo selecionado para upload:', fileToUpload.name);
                  // Chamar handleSubmit diretamente
                  handleSubmit(e as unknown as React.FormEvent);
                } else if (uploadType === 'carousel' && multipleFiles.length > 0) {
                  console.log('Carrossel com', multipleFiles.length, 'imagens selecionadas');
                  // Chamar handleSubmit diretamente
                  handleSubmit(e as unknown as React.FormEvent);
                } else {
                  console.log('Nenhum arquivo selecionado para upload');
                }
              }}
            >
              <Upload className="h-4 w-4 mr-2" />
              <span>Fazer Upload</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadModal;
