import React, { useState } from 'react';
import { X, Download, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react';
import { MarketingFile } from '../types';
import { formatFileSize, formatDate, formatMarkdownText } from '../utils';

interface PreviewModalProps {
  show: boolean;
  onClose: () => void;
  file: MarketingFile | null;
  onDownloadAllCarouselImages: (file: MarketingFile) => Promise<void>;
}

const PreviewModal: React.FC<PreviewModalProps> = ({
  show,
  onClose,
  file,
  onDownloadAllCarouselImages
}) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  
  // Função para copiar a descrição para a área de transferência
  const copyDescription = () => {
    if (!file || !file.description) return;
    
    navigator.clipboard.writeText(file.description)
      .then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset após 2 segundos
      })
      .catch(err => {
        console.error('Erro ao copiar descrição:', err);
        alert('Não foi possível copiar a descrição. Tente novamente.');
      });
  };

  if (!show || !file) return null;

  // Função para navegar entre imagens do carrossel
  const navigateCarousel = (direction: 'prev' | 'next') => {
    if (!file.carouselUrls || file.carouselUrls.length <= 1) return;
    
    if (direction === 'prev') {
      setCurrentImageIndex(prev => 
        prev === 0 ? file.carouselUrls!.length - 1 : prev - 1
      );
    } else {
      setCurrentImageIndex(prev => 
        prev === file.carouselUrls!.length - 1 ? 0 : prev + 1
      );
    }
  };

  // Função para renderizar o conteúdo do arquivo
  const renderFileContent = () => {
    // Carrossel de imagens
    if (file.isCarousel && file.carouselUrls && file.carouselUrls.length > 0) {
      return (
        <div className="relative">
          <img
            src={file.carouselUrls[currentImageIndex]}
            alt={`Imagem ${currentImageIndex + 1}`}
            className="max-w-full max-h-[60vh] object-contain mx-auto"
          />
          
          {file.carouselUrls.length > 1 && (
            <>
              <button
                onClick={() => navigateCarousel('prev')}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              
              <button
                onClick={() => navigateCarousel('next')}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 transition-opacity"
              >
                <ChevronRight className="h-6 w-6" />
              </button>
              
              <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-1">
                {file.carouselUrls.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentImageIndex(index)}
                    className={`h-2 w-2 rounded-full ${
                      index === currentImageIndex ? 'bg-white' : 'bg-white bg-opacity-50'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      );
    }
    
    // Imagens
    if (file.fileType.startsWith('image/')) {
      return (
        <div className="flex justify-center">
          <img
            src={file.fileUrl}
            alt={file.name}
            className="max-w-full max-h-[60vh] object-contain"
          />
        </div>
      );
    }
    
    // PDFs
    if (file.fileType === 'application/pdf') {
      return (
        <div className="h-[60vh]">
          <iframe
            src={`${file.fileUrl}#toolbar=0`}
            className="w-full h-full"
            title={file.name}
          />
        </div>
      );
    }
    
    // Vídeos
    if (file.fileType.startsWith('video/')) {
      return (
        <div className="flex justify-center">
          <video
            src={file.fileUrl}
            controls
            className="max-w-full max-h-[60vh]"
            onError={(e) => {
              // Fallback para mensagem de erro
              const target = e.target as HTMLVideoElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="text-center p-6 bg-gray-800 rounded-lg">
                  <p class="text-red-400 mb-2">Não foi possível reproduzir o vídeo</p>
                  <p class="text-gray-400 text-sm">O arquivo pode estar indisponível ou em formato não suportado pelo navegador.</p>
                </div>
              `;
            }}
          />
        </div>
      );
    }
    
    // Outros tipos de arquivo
    return (
      <div className="text-center p-6 bg-gray-800 rounded-lg">
        <p className="text-gray-300 mb-2">Visualização não disponível</p>
        <p className="text-gray-400 text-sm">
          Este tipo de arquivo não pode ser visualizado diretamente no navegador.
          Clique em Download para baixar o arquivo.
        </p>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-4 border-b border-gray-800">
          <h2 className="text-xl font-semibold text-white truncate max-w-[80%]" title={file.name}>
            {file.name}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-6">
            {renderFileContent()}
          </div>
          
          <div className="bg-black rounded-lg border border-gray-800 p-4">
            <h4 className="text-lg font-medium text-white mb-2">Informações do Arquivo</h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-400 text-sm">Nome:</p>
                <p className="text-white">{file.name}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Categoria:</p>
                <p className="text-white">
                  {file.category === 'artes' && 'Artes Gráficas'}
                  {file.category === 'documentos' && 'Documentos PDF'}
                  {file.category === 'apresentacoes' && 'Apresentações'}
                  {file.category === 'videos' && 'Vídeos'}
                  {file.category === 'restrita' && 'Área Restrita'}
                </p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Tamanho:</p>
                <p className="text-white">{formatFileSize(file.fileSize)}</p>
              </div>
              
              <div>
                <p className="text-gray-400 text-sm">Data de Upload:</p>
                <p className="text-white">{formatDate(file.createdAt)}</p>
              </div>
              
              <div className="md:col-span-2">
                <div className="flex justify-between items-center">
                  <p className="text-gray-400 text-sm">Descrição:</p>
                  {file.description && (
                    <button 
                      onClick={copyDescription}
                      className="flex items-center text-gray-400 hover:text-white text-sm bg-gray-800 hover:bg-gray-700 px-2 py-1 rounded transition-colors"
                      title="Copiar descrição"
                    >
                      {copied ? (
                        <>
                          <Check className="h-3 w-3 mr-1" />
                          <span>Copiado!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3 w-3 mr-1" />
                          <span>Copiar</span>
                        </>
                      )}
                    </button>
                  )}
                </div>
                <div className="text-white whitespace-pre-wrap mt-1">
                  {file.description ? (
                    <div dangerouslySetInnerHTML={{ 
                      __html: formatMarkdownText(file.description) 
                    }} />
                  ) : (
                    'Sem descrição'
                  )}
                </div>
              </div>
            </div>
            
            <div className="flex justify-end mt-4 space-x-3">
              {file.isCarousel && file.carouselUrls && file.carouselUrls.length > 0 && (
                <button
                  onClick={() => onDownloadAllCarouselImages(file)}
                  className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                >
                  <Download className="h-4 w-4 mr-2" />
                  <span>Download Todas ({file.carouselUrls.length} imagens)</span>
                </button>
              )}
              <a
                href={file.fileUrl}
                download={file.name}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
              >
                <Download className="h-4 w-4 mr-2" />
                <span>Download</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
