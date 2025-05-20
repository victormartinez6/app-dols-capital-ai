import React, { useState, useEffect } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import { MarketingFile, MarketingCategory, UploadType } from '../types';
import useMarketingFiles from '../hooks/useMarketingFiles';
import { downloadAllCarouselImages } from '../utils';
import CategoryNav from './CategoryNav';
import FileGrid from './FileGrid';
import UploadModal from './UploadModal';
import PreviewModal from './PreviewModal';

const Marketing: React.FC = () => {
  const {
    files,
    loading,
    error,
    activeCategory,
    uploadProgress,
    showSuccessModal,
    setActiveCategory,
    handleDeleteFile,
    handleUploadSingleFile,
    handleUploadCarousel
  } = useMarketingFiles();

  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<MarketingFile | null>(null);
  // Usar a mesma categoria para upload e visualização
  const [uploadCategory, setUploadCategory] = useState<MarketingCategory>('artes');
  
  // Sincronizar uploadCategory com activeCategory
  useEffect(() => {
    setUploadCategory(activeCategory as MarketingCategory);
  }, [activeCategory]);

  // Função para lidar com o upload de arquivos
  const handleUpload = async (files: File[], description: string, uploadType: UploadType) => {
    console.log('Marketing.handleUpload iniciado', { 
      quantidadeArquivos: files.length, 
      tipoUpload: uploadType,
      categoria: uploadCategory,
      descricaoPreenchida: !!description
    });
    
    try {
      // Garantir que estamos na categoria correta para ver o arquivo após o upload
      if (activeCategory !== uploadCategory && activeCategory !== 'todos' as MarketingCategory) {
        console.log(`Alterando categoria ativa de ${activeCategory} para ${uploadCategory} para visualizar o arquivo após o upload`);
        setActiveCategory(uploadCategory);
      }
      
      // Iniciar o upload - NÃO fechamos o modal aqui
      // O modal será fechado automaticamente pelo useEffect no UploadModal
      // quando o progresso chegar a 100%
      if (uploadType === 'single') {
        console.log('Chamando handleUploadSingleFile com:', {
          nomeArquivo: files[0].name,
          tamanhoArquivo: files[0].size,
          tipoArquivo: files[0].type,
          categoria: uploadCategory
        });
        await handleUploadSingleFile(files[0], uploadCategory, description);
        console.log('handleUploadSingleFile concluído com sucesso');
      } else {
        console.log('Chamando handleUploadCarousel com:', {
          quantidadeArquivos: files.length,
          categoria: uploadCategory
        });
        await handleUploadCarousel(files, uploadCategory, description);
        console.log('handleUploadCarousel concluído com sucesso');
      }
      
      // NÃO fechamos o modal aqui - o modal será fechado automaticamente
      // quando o progresso chegar a 100%
      console.log('Upload concluído com sucesso!');
    } catch (error) {
      console.error('Erro no upload:', error);
      console.error('Detalhes do erro:', {
        mensagem: error instanceof Error ? error.message : 'Erro desconhecido',
        stack: error instanceof Error ? error.stack : 'Stack indisponível'
      });
      throw error; // Propagar erro para ser tratado no componente UploadModal
    }
  };

  // Função para abrir o modal de visualização
  const handlePreviewFile = (file: MarketingFile) => {
    setSelectedFile(file);
    setShowPreviewModal(true);
  };

  // Efeito para garantir que o progresso de upload chegue a 100%
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    // Se o progresso estiver em 90% ou mais, mas não em 100%, forçar a conclusão após um tempo
    if (uploadProgress >= 90 && uploadProgress < 100) {
      timer = setTimeout(() => {
        // Forçar a conclusão do upload definindo o progresso como 100%
        console.log('Forçando conclusão do upload que estava parado em:', uploadProgress);
        // Não podemos mais usar setUploadProgress diretamente
        // O hook useMarketingFiles já tem um efeito interno que força o progresso para 100%
        
        // Fechar o modal de upload após um breve delay
        setTimeout(() => {
          if (showUploadModal) {
            setShowUploadModal(false);
          }
        }, 1500);
      }, 3000); // 3 segundos para forçar a conclusão
    }
    
    // Fechar o modal quando o upload for concluído
    if (uploadProgress === 100 && showUploadModal) {
      const closeTimer = setTimeout(() => {
        setShowUploadModal(false);
      }, 1500); // Fechar após 1.5 segundos para dar tempo de ver a mensagem de sucesso
      
      return () => {
        clearTimeout(closeTimer);
        if (timer) clearTimeout(timer);
      };
    }
    
    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [uploadProgress, showUploadModal]);

  // Função para resetar o arquivo selecionado
  const handleFileReset = () => {
    setSelectedFile(null);
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600">Materiais de Marketing</h1>
        
        <div className="flex space-x-2">
          <button
            onClick={() => setShowUploadModal(true)}
            className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-indigo-800 transition-all duration-300 flex items-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Plus className="h-5 w-5 mr-2" />
            <span className="font-medium">Adicionar Arquivo</span>
          </button>
        </div>
      </div>
      
      {/* Navegação de categorias */}
      <CategoryNav 
        activeCategory={activeCategory} 
        setActiveCategory={setActiveCategory}
        onFileReset={handleFileReset}
      />
      
      {/* Mensagem de erro */}
      {error && (
        <div className="mb-6 p-4 bg-red-900/30 border border-red-800/50 rounded-lg text-red-200 flex items-start">
          <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-medium mb-1">Erro ao carregar arquivos</h4>
            <p>{error}</p>
          </div>
        </div>
      )}
      
      {/* Indicador de carregamento */}
      {loading && (
        <div className="flex justify-center items-center mb-6 p-4">
          <div className="flex items-center space-x-3">
            <div className="w-4 h-4 bg-blue-500 rounded-full animate-pulse"></div>
            <span className="text-gray-300">Carregando arquivos...</span>
          </div>
        </div>
      )}
      
      {/* Removemos a barra de progresso daqui e movemos para o modal */}
      
      {/* Modal de sucesso */}
      {showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-6 flex flex-col items-center">
            <svg className="w-16 h-16 text-green-500 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
            </svg>
            <h3 className="text-xl font-medium text-white mb-2">Upload Concluído!</h3>
            <p className="text-gray-300">O arquivo foi enviado com sucesso.</p>
          </div>
        </div>
      )}
      
      {/* Grade de arquivos */}
      {!loading && (
        <FileGrid 
          files={files} 
          activeCategory={activeCategory} 
          onPreview={handlePreviewFile} 
          onDelete={handleDeleteFile} 
        />
      )}
      
      {/* Modal de upload */}
      <UploadModal 
        show={showUploadModal}
        onClose={() => setShowUploadModal(false)}
        uploadCategory={uploadCategory}
        setUploadCategory={setUploadCategory}
        onUpload={handleUpload}
        uploadProgress={uploadProgress}
      />
      
      {/* Modal de visualização */}
      <PreviewModal 
        show={showPreviewModal}
        onClose={() => setShowPreviewModal(false)}
        file={selectedFile}
        onDownloadAllCarouselImages={downloadAllCarouselImages}
      />
    </div>
  );
};

export default Marketing;
