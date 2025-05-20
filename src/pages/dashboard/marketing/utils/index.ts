import { openDB, IDBPDatabase } from 'idb';
import { format, differenceInHours } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import JSZip from 'jszip';
import { MarketingDBSchema, MarketingFile, MarketingCategory } from '../types';

// Função para inicializar o banco de dados IndexedDB
export const initDB = async (): Promise<IDBPDatabase<MarketingDBSchema>> => {
  return openDB<MarketingDBSchema>('marketing-files-db', 1, {
    upgrade(db) {
      // Criar store de arquivos se não existir
      if (!db.objectStoreNames.contains('files')) {
        const store = db.createObjectStore('files', { keyPath: 'id' });
        store.createIndex('by-category', 'category');
      }
    },
  });
};

// Função para converter Blob para URL
export const blobToURL = (blob: Blob): string => {
  return URL.createObjectURL(blob);
};

// Função para converter File para Blob
export const fileToBlob = async (file: File): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const blob = new Blob([reader.result as ArrayBuffer], { type: file.type });
      resolve(blob);
    };
    reader.onerror = reject;
    reader.readAsArrayBuffer(file);
  });
};

// Função para formatar o tamanho do arquivo
export const formatFileSize = (bytes: number): string => {
  if (bytes < 1024) return bytes + ' bytes';
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  return (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';
};

// Função para formatar data
export const formatDate = (date: Date): string => {
  return format(date, "dd 'de' MMMM 'de' yyyy, HH:mm", { locale: ptBR });
};

// Função para verificar se um arquivo é novo (adicionado nas últimas 24 horas)
export const isNewFile = (date: Date): boolean => {
  const now = new Date();
  const hours = differenceInHours(now, date);
  return hours < 24;
};

// Função para formatar texto markdown para HTML
export const formatMarkdownText = (text: string): string => {
  if (!text) return '';
  
  // Formatação básica
  let formattedText = text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Negrito
    .replace(/\*(.*?)\*/g, '<em>$1</em>') // Itálico
    .replace(/\n/g, '<br>'); // Quebras de linha
  
  // Listas
  formattedText = formattedText.replace(/- (.*?)(?:<br>|$)/g, '• $1<br>');
  
  return formattedText;
};

// Função para formatar data relativa (há quanto tempo)
export const formatRelativeTime = (date: Date): string => {
  const now = new Date();
  const diffHours = differenceInHours(now, date);
  
  if (diffHours < 1) {
    return 'Há menos de uma hora';
  } else if (diffHours < 24) {
    return `Há ${diffHours} ${diffHours === 1 ? 'hora' : 'horas'}`;
  } else if (diffHours < 48) {
    return 'Há 1 dia';
  } else if (diffHours < 168) { // 7 dias
    return `Há ${Math.floor(diffHours / 24)} dias`;
  } else {
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  }
};

// Função para obter os tipos de arquivo aceitos com base na categoria selecionada
export const getAcceptedFileTypes = (category: MarketingCategory): string => {
  switch (category) {
    case 'artes':
      return '.jpg,.jpeg,.png,.gif,.webp,.svg';
    case 'documentos':
      return '.pdf,.doc,.docx,.txt,.rtf';
    case 'apresentacoes':
      return '.ppt,.pptx,.pdf';
    case 'videos':
      return '.mp4,.webm,.mov,.avi';
    case 'restrita':
      return '.jpg,.jpeg,.png,.pdf,.doc,.docx,.ppt,.pptx,.mp4,.zip';
    default:
      return '*';
  }
};

// Função para obter a mensagem de tipos de arquivo aceitos
export const getFileTypeMessage = (category: MarketingCategory): string => {
  switch (category) {
    case 'artes':
      return 'Imagens (JPG, PNG, GIF, WebP, SVG)';
    case 'documentos':
      return 'Documentos (PDF, DOC, DOCX, TXT, RTF)';
    case 'apresentacoes':
      return 'Apresentações (PPT, PPTX, PDF)';
    case 'videos':
      return 'Vídeos (MP4, WebM, MOV, AVI)';
    case 'restrita':
      return 'Arquivos (JPG, PNG, PDF, DOC, DOCX, PPT, PPTX, MP4, ZIP)';
    default:
      return 'Todos os arquivos';
  }
};

// Função para fazer download de todos os arquivos de um carrossel
export const downloadAllCarouselImages = async (carouselFile: MarketingFile): Promise<void> => {
  if (!carouselFile.carouselUrls || carouselFile.carouselUrls.length === 0) {
    console.error('Nenhuma imagem disponível para download');
    alert('Nenhuma imagem disponível para download no carrossel.');
    return;
  }
  
  try {
    console.log('Iniciando download de carrossel:', carouselFile.name);
    console.log('Total de imagens:', carouselFile.carouselUrls.length);
    
    // Criar um novo objeto JSZip com compressão adequada
    const zip = new JSZip();
    const folder = zip.folder('imagens');
    
    if (!folder) {
      throw new Error('Erro ao criar pasta no arquivo ZIP');
    }
    
    // Adicionar cada imagem ao ZIP com tratamento adequado
    const fetchPromises = carouselFile.carouselUrls.map(async (url, index) => {
      try {
        console.log(`Baixando imagem ${index + 1} de ${carouselFile.carouselUrls?.length}:`, url);
        
        // Usar XMLHttpRequest para garantir compatibilidade
        const blob = await new Promise<Blob>((resolve, reject) => {
          const xhr = new XMLHttpRequest();
          xhr.open('GET', url, true);
          xhr.responseType = 'blob';
          
          xhr.onload = function() {
            if (this.status === 200) {
              resolve(this.response);
            } else {
              reject(new Error(`Erro ao baixar: ${this.status}`));
            }
          };
          
          xhr.onerror = function() {
            reject(new Error('Erro de rede ao baixar a imagem'));
          };
          
          xhr.send();
        });
        
        // Determinar extensão do arquivo a partir da URL ou tipo MIME
        let extension = url.split('.').pop()?.toLowerCase() || '';
        if (!extension || extension.length > 4) {
          // Usar o tipo MIME para determinar a extensão
          const mimeType = blob.type;
          if (mimeType.includes('jpeg') || mimeType.includes('jpg')) {
            extension = 'jpg';
          } else if (mimeType.includes('png')) {
            extension = 'png';
          } else if (mimeType.includes('gif')) {
            extension = 'gif';
          } else if (mimeType.includes('webp')) {
            extension = 'webp';
          } else {
            extension = 'jpg'; // Fallback para jpg
          }
        }
        
        // Criar nome de arquivo seguro
        const fileName = `imagem_${(index + 1).toString().padStart(2, '0')}.${extension}`;
        console.log(`Adicionando ao ZIP: ${fileName} (${formatFileSize(blob.size)})`);
        
        // Adicionar ao ZIP
        folder.file(fileName, blob, { binary: true });
        
        return { success: true, index, fileName };
      } catch (error) {
        console.error(`Erro ao baixar imagem ${index + 1}:`, error);
        return { success: false, index, error };
      }
    });
    
    // Aguardar todas as operações de download
    const results = await Promise.all(fetchPromises);
    
    // Verificar se pelo menos uma imagem foi baixada com sucesso
    const successCount = results.filter(r => r.success).length;
    console.log(`${successCount} de ${carouselFile.carouselUrls.length} imagens baixadas com sucesso`);
    
    if (successCount === 0) {
      throw new Error('Não foi possível baixar nenhuma imagem');
    }
    
    // Gerar o arquivo ZIP com opções otimizadas
    console.log('Gerando arquivo ZIP...');
    const zipBlob = await zip.generateAsync({ 
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
      comment: `Carrossel de imagens: ${carouselFile.name} - Baixado em ${new Date().toLocaleString()}`
    });
    
    console.log(`Arquivo ZIP gerado: ${formatFileSize(zipBlob.size)}`);
    
    // Criar nome de arquivo seguro para o ZIP
    const zipFileName = `carrossel_${carouselFile.name.replace(/[^a-zA-Z0-9]/g, '_')}.zip`;
    console.log('Nome do arquivo ZIP:', zipFileName);
    
    // Criar URL para download
    const zipUrl = URL.createObjectURL(zipBlob);
    
    // Criar elemento de link para download
    const downloadLink = document.createElement('a');
    downloadLink.href = zipUrl;
    downloadLink.download = zipFileName;
    
    // Adicionar ao documento, clicar e remover
    document.body.appendChild(downloadLink);
    downloadLink.click();
    
    // Pequeno delay antes de remover o link e liberar a URL
    setTimeout(() => {
      document.body.removeChild(downloadLink);
      URL.revokeObjectURL(zipUrl);
      console.log('Download do ZIP iniciado com sucesso');
    }, 1000);
    
  } catch (error) {
    console.error('Erro ao criar arquivo ZIP:', error);
    alert(`Ocorreu um erro ao criar o arquivo ZIP: ${error instanceof Error ? error.message : 'Erro desconhecido'}. Por favor, tente novamente.`);
  }
};
