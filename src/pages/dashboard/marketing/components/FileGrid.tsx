import React from 'react';
import { Eye, Download, Trash2, Clock, FileText, Film, Image as ImageIcon, PresentationIcon, Lock } from 'lucide-react';
import { MarketingFile, MarketingCategory } from '../types';
import { formatFileSize, formatRelativeTime, isNewFile, downloadAllCarouselImages } from '../utils';

interface FileGridProps {
  files: MarketingFile[];
  activeCategory: string;
  onPreview: (file: MarketingFile) => void;
  onDelete: (fileId: string) => void;
}

const FileGrid: React.FC<FileGridProps> = ({ files, activeCategory, onPreview, onDelete }) => {
  // Filtrar arquivos pela categoria ativa
  const filteredFiles = files.filter(file => file.category === activeCategory);

  // Cores para cada categoria
  const categoryColors: Record<MarketingCategory, string> = {
    'artes': '#ec4899', // Rosa (pink-500)
    'documentos': '#f97316', // Laranja (orange-500)
    'apresentacoes': '#eab308', // Amarelo (yellow-500)
    'videos': '#3b82f6', // Azul (blue-500)
    'restrita': '#dc2626', // Vermelho (red-600)
  };

  // Função para renderizar a miniatura do arquivo
  const renderThumbnail = (file: MarketingFile) => {
    const categoryColor = categoryColors[file.category as MarketingCategory] || '#6b7280';
    
    // Para imagens, mostrar a própria imagem
    if (file.fileType.startsWith('image/') || file.isCarousel) {
      return (
        <div className="relative w-full h-40 overflow-hidden bg-gray-900 rounded-t-lg">
          <img
            src={file.thumbnailUrl || file.fileUrl}
            alt={file.name}
            className="w-full h-full object-cover transition-transform duration-300 hover:scale-110"
            onError={(e) => {
              // Fallback para ícone genérico
              const target = e.target as HTMLImageElement;
              target.src = '/placeholder-image.png';
            }}
          />
          <div 
            className="absolute inset-0 opacity-0 hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black to-transparent"
          />
        </div>
      );
    }
    
    // Para PDFs, mostrar ícone de PDF
    if (file.fileType === 'application/pdf') {
      return (
        <div 
          className="w-full h-40 flex flex-col items-center justify-center rounded-t-lg" 
          style={{ background: `linear-gradient(135deg, #1f2937 0%, rgba(220, 38, 38, 0.8) 100%)` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <path d="M9 15h6"></path>
            <path d="M9 11h6"></path>
          </svg>
          <span className="text-white text-xs mt-2 font-medium">Documento PDF</span>
        </div>
      );
    }
    
    // Para documentos Word, mostrar ícone de documento
    if (file.fileType.includes('word') || file.fileType.includes('document')) {
      return (
        <div 
          className="w-full h-40 flex flex-col items-center justify-center rounded-t-lg" 
          style={{ background: `linear-gradient(135deg, #1f2937 0%, rgba(59, 130, 246, 0.8) 100%)` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
          <span className="text-white text-xs mt-2 font-medium">Documento Word</span>
        </div>
      );
    }
    
    // Para apresentações, mostrar ícone de apresentação
    if (file.fileType.includes('presentation')) {
      return (
        <div 
          className="w-full h-40 flex flex-col items-center justify-center rounded-t-lg" 
          style={{ background: `linear-gradient(135deg, #1f2937 0%, rgba(234, 179, 8, 0.8) 100%)` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
          <span className="text-white text-xs mt-2 font-medium">Apresentação</span>
        </div>
      );
    }
    
    // Para vídeos, mostrar ícone de vídeo
    if (file.fileType.startsWith('video/')) {
      return (
        <div 
          className="w-full h-40 flex flex-col items-center justify-center rounded-t-lg" 
          style={{ background: `linear-gradient(135deg, #1f2937 0%, rgba(124, 58, 237, 0.8) 100%)` }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7"></polygon>
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
          </svg>
          <span className="text-white text-xs mt-2 font-medium">Vídeo</span>
        </div>
      );
    }
    
    // Para outros tipos, mostrar ícone genérico
    return (
      <div 
        className="w-full h-40 flex flex-col items-center justify-center rounded-t-lg" 
        style={{ background: `linear-gradient(135deg, #1f2937 0%, rgba(107, 114, 128, 0.8) 100%)` }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-20 w-20 text-white drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
          <polyline points="13 2 13 9 20 9"></polyline>
        </svg>
        <span className="text-white text-xs mt-2 font-medium">Arquivo</span>
      </div>
    );
  };

  // Renderizar ícone para o tipo de arquivo
  const renderFileTypeIcon = (file: MarketingFile) => {
    if (file.fileType.startsWith('image/')) {
      return <ImageIcon className="h-4 w-4 mr-1" />;
    } else if (file.fileType === 'application/pdf') {
      return <FileText className="h-4 w-4 mr-1" />;
    } else if (file.fileType.includes('word') || file.fileType.includes('document')) {
      return <FileText className="h-4 w-4 mr-1" />;
    } else if (file.fileType.includes('presentation')) {
      return <PresentationIcon className="h-4 w-4 mr-1" />;
    } else if (file.fileType.startsWith('video/')) {
      return <Film className="h-4 w-4 mr-1" />;
    } else if (file.category === 'restrita') {
      return <Lock className="h-4 w-4 mr-1" />;
    } else {
      return <FileText className="h-4 w-4 mr-1" />;
    }
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredFiles.length === 0 ? (
        <div className="col-span-full p-10 text-center bg-black rounded-xl border border-gray-800">
          <div className="flex flex-col items-center justify-center">
            <div className="w-24 h-24 bg-gray-800 rounded-full flex items-center justify-center mb-4">
              {activeCategory === 'artes' && <ImageIcon className="h-10 w-10 text-gray-400" />}
              {activeCategory === 'documentos' && <FileText className="h-10 w-10 text-gray-400" />}
              {activeCategory === 'apresentacoes' && <PresentationIcon className="h-10 w-10 text-gray-400" />}
              {activeCategory === 'videos' && <Film className="h-10 w-10 text-gray-400" />}
              {activeCategory === 'restrita' && <Lock className="h-10 w-10 text-gray-400" />}
            </div>
            <p className="text-gray-300 text-lg font-medium">Nenhum arquivo encontrado</p>
            <p className="text-gray-500 text-sm mt-2 max-w-md">Clique em "Adicionar Arquivo" para fazer upload de materiais nesta categoria.</p>
          </div>
        </div>
      ) : (
        filteredFiles.map(file => {
          const categoryColor = categoryColors[file.category as MarketingCategory] || '#6b7280';
          return (
            <div 
              key={file.id} 
              className="bg-black rounded-xl overflow-hidden border border-gray-800 hover:border-gray-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              style={{ boxShadow: `0 4px 20px rgba(0, 0, 0, 0.2)` }}
            >
              <div className="relative cursor-pointer" onClick={() => onPreview(file)}>
                {renderThumbnail(file)}
                
                {/* Badge para arquivos novos */}
                {isNewFile(file.createdAt) && (
                  <div className="absolute top-3 right-3 bg-blue-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
                    Novo
                  </div>
                )}
                
                {/* Badge para carrosséis */}
                {file.isCarousel && (
                  <div className="absolute top-3 left-3 bg-purple-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
                    Carrossel ({file.imageCount || 0})
                  </div>
                )}
                
                {/* Badge para arquivos não persistidos */}
                {!file.isPersisted && (
                  <div className="absolute bottom-3 right-3 bg-yellow-600 text-white text-xs font-medium px-2 py-1 rounded-md shadow-md">
                    Local
                  </div>
                )}
              </div>
              
              <div className="p-4">
                <h3 className="text-white font-medium truncate text-base" title={file.name}>
                  {file.name}
                </h3>
                
                <div className="flex justify-between items-center mt-2">
                  <div className="flex items-center text-gray-400 text-xs">
                    {renderFileTypeIcon(file)}
                    <span>{formatFileSize(file.fileSize)}</span>
                  </div>
                  <div className="flex items-center text-gray-400 text-xs">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>{formatRelativeTime(file.createdAt)}</span>
                  </div>
                </div>
                
                {file.description && (
                  <p className="text-gray-400 text-sm mt-3 line-clamp-2" title={file.description}>
                    {file.description}
                  </p>
                )}
              </div>
              
              <div className="flex border-t border-gray-800">
                <button
                  onClick={() => onPreview(file)}
                  className="flex-1 py-3 text-blue-400 hover:bg-gray-800 transition-colors flex items-center justify-center"
                  title="Visualizar"
                >
                  <Eye className="h-4 w-4" />
                </button>
                
                {/* Botão de download - diferente para carrossel e arquivos normais */}
                {file.isCarousel && file.carouselUrls && file.carouselUrls.length > 0 ? (
                  <button
                    className="flex-1 py-3 text-green-400 hover:bg-gray-800 transition-colors flex items-center justify-center"
                    title="Download ZIP com todas as imagens"
                    onClick={(e) => {
                      e.stopPropagation();
                      downloadAllCarouselImages(file);
                    }}
                  >
                    <Download className="h-4 w-4" />
                  </button>
                ) : (
                  <a
                    href={file.fileUrl}
                    download={file.name}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-3 text-green-400 hover:bg-gray-800 transition-colors flex items-center justify-center"
                    title="Download"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Download className="h-4 w-4" />
                  </a>
                )}
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(file.id);
                  }}
                  className="flex-1 py-3 text-red-400 hover:bg-gray-800 transition-colors flex items-center justify-center"
                  title="Excluir"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default FileGrid;
