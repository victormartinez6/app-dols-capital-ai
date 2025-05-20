import { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, deleteDoc, serverTimestamp, setDoc, addDoc } from 'firebase/firestore';
import { db as firestore } from '../../../../lib/firebase';
import { useAuth } from '../../../../contexts/AuthContext';
import { useNotifications } from '../../../../contexts/NotificationContext';
import { 
  MarketingFile, 
  MarketingCategory,
  UploadType
} from '../types';
import { uploadFileToStorage } from '../../UploadHelper';

export const useMarketingFiles = () => {
  const { user } = useAuth();
  const { addSystemNotification } = useNotifications();
  const [files, setFiles] = useState<MarketingFile[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState<MarketingCategory>('artes');
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Efeito para buscar arquivos quando o componente é montado ou a categoria muda
  // Adicionamos uma variável de controle para evitar atualizações desnecessárias
  const [shouldRefresh, setShouldRefresh] = useState(true);
  
  useEffect(() => {
    if (shouldRefresh) {
      console.log('Buscando arquivos devido a mudança de categoria:', activeCategory);
      fetchFiles();
    }
  }, [activeCategory, shouldRefresh]);
  
  // Função para controlar quando a busca de arquivos deve acontecer
  const triggerRefresh = () => {
    setShouldRefresh(true);
    // Resetar após um breve momento para permitir futuras atualizações
    setTimeout(() => setShouldRefresh(false), 100);
  };
  
  // Removemos a função de verificação CORS que estava causando erros

  // Função para buscar arquivos diretamente do Firestore
  const fetchFiles = async () => {
    setLoading(true);
    setError(null);
    
    try {
      console.log('Buscando arquivos da categoria:', activeCategory);
      
      // Buscar arquivos do Firestore
      const q = query(collection(firestore, 'marketing-files'));
      const querySnapshot = await getDocs(q);
      
      // Array para armazenar todos os arquivos
      const allFiles: MarketingFile[] = [];
      
      // Processar arquivos do Firestore
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        
        // Verificar se o arquivo pertence à categoria ativa ou se estamos mostrando todos
        if (activeCategory === 'todos' || data.category === activeCategory) {
          // Converter timestamp para Date
          let createdAt: Date;
          if (data.createdAt && typeof data.createdAt.toDate === 'function') {
            createdAt = data.createdAt.toDate();
          } else {
            createdAt = new Date();
          }
          
          const file: MarketingFile = {
            id: data.id,
            name: data.name,
            category: data.category,
            fileUrl: data.fileUrl,
            thumbnailUrl: data.thumbnailUrl,
            fileType: data.fileType,
            fileSize: data.fileSize,
            createdAt: createdAt,
            createdBy: data.createdBy,
            description: data.description || '',
            isCarousel: data.isCarousel || false,
            carouselUrls: data.carouselUrls || [],
            imageCount: data.imageCount || 0,
            isPersisted: true
          };
          
          allFiles.push(file);
        }
      });
      
      // Ordenar arquivos por data de criação (mais recentes primeiro)
      allFiles.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      console.log(`Encontrados ${allFiles.length} arquivos na categoria ${activeCategory}`);
      
      // Atualizar estado
      setFiles(allFiles);
      setLoading(false);
    } catch (error) {
      console.error('Erro ao buscar arquivos:', error);
      setError('Ocorreu um erro ao buscar os arquivos. Por favor, recarregue a página.');
      setLoading(false);
    }
  };

  // Função para validar o arquivo conforme as regras da categoria
  const validateFile = (file: File, category: MarketingCategory): string | null => {
    // Validar tamanho máximo (20MB para todos os arquivos)
    const MAX_SIZE = 20 * 1024 * 1024; // 20MB em bytes
    if (file.size > MAX_SIZE) {
      return `O arquivo é muito grande. O tamanho máximo permitido é 20MB.`;
    }
    
    // Validar tipo de arquivo por categoria
    switch (category) {
      case 'artes':
        if (!file.type.match(/^image\/(jpeg|png|gif|webp|svg\+xml)$/)) {
          return 'Apenas imagens (JPG, PNG, GIF, WebP, SVG) são permitidas nesta categoria.';
        }
        break;
      case 'documentos':
        if (!file.type.match(/^application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document|rtf|text\/plain)$/)) {
          return 'Apenas documentos (PDF, DOC, DOCX, TXT, RTF) são permitidos nesta categoria.';
        }
        break;
      case 'apresentacoes':
        if (!file.type.match(/^application\/(pdf|vnd\.ms-powerpoint|vnd\.openxmlformats-officedocument\.presentationml\.presentation)$/)) {
          return 'Apenas apresentações (PPT, PPTX, PDF) são permitidas nesta categoria.';
        }
        break;
      case 'videos':
        if (!file.type.match(/^video\/(mp4|webm|quicktime|x-msvideo)$/)) {
          return 'Apenas vídeos (MP4, WebM, MOV, AVI) são permitidos nesta categoria.';
        }
        break;
      // Área restrita aceita todos os tipos de arquivo
    }
    
    return null;
  };

  // Função para fazer upload de um único arquivo
  const handleUploadSingleFile = async (fileToUpload: File, uploadCategory: MarketingCategory, fileDescription: string = '') => {
    console.log('handleUploadSingleFile iniciado', {
      nomeArquivo: fileToUpload.name,
      tamanhoArquivo: fileToUpload.size,
      tipoArquivo: fileToUpload.type,
      categoria: uploadCategory,
      descricaoPreenchida: !!fileDescription
    });
    
    // Validar o arquivo
    const validationError = validateFile(fileToUpload, uploadCategory);
    if (validationError) {
      setError(validationError);
      return { success: false, error: validationError };
    }
    
    // Limpar erros anteriores
    setError(null);
    
    // Iniciar estado de carregamento
    setLoading(true);
    
    // Resetar progresso
    setUploadProgress(0);
    
    try {
      // Usar a função uploadFileToStorage do UploadHelper.ts
      const fileData = await uploadFileToStorage(
        fileToUpload,
        uploadCategory,
        fileDescription,
        user?.email || 'unknown',
        (progress) => {
          setUploadProgress(progress);
          console.log(`Progresso do upload: ${progress}%`);
        }
      );
      
      console.log('Upload concluído com sucesso:', fileData);
      
      // Adicionar o arquivo à lista local para exibição imediata
      setFiles(prevFiles => [
        {
          ...fileData,
          createdAt: new Date(),
          thumbnailUrl: fileData.fileUrl,
          isCarousel: false,
          carouselUrls: [],
          imageCount: 0
        } as MarketingFile,
        ...prevFiles
      ]);
      
      // Notificar o usuário que o upload foi concluído com sucesso
      addSystemNotification({
        title: 'Upload concluído com sucesso',
        message: `O arquivo "${fileToUpload.name}" foi enviado com sucesso.`,
        type: 'upload_success',
        severity: 'success',
        autoHide: true,
        duration: 5000
      });
      
      // Manter o progresso em 100% por um breve momento para mostrar a conclusão
      setTimeout(() => {
        // Resetar o progresso após 2 segundos
        setUploadProgress(0);
        console.log('Progresso de upload resetado após conclusão');
      }, 2000);
      
      // Finalizar estado de carregamento
      setLoading(false);
      
      // Atualizar a lista de arquivos de forma controlada
      setTimeout(() => triggerRefresh(), 2500);
      
      return { success: true, fileId: fileData.id };
    } catch (error: any) {
      console.error('Erro geral no processo de upload:', error);
      
      // Extrair a mensagem de erro mais relevante
      let errorMessage = String(error);
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Verificar se é um erro de CORS
      if (errorMessage.includes('CORS')) {
        errorMessage = 'Erro de CORS: O servidor não permite uploads do seu navegador. Por favor, configure o CORS no Firebase Storage.';
      }
      
      // Definir o erro para exibição na interface
      setError(errorMessage);
      
      // Notificar o usuário sobre o erro específico
      addSystemNotification({
        title: 'Erro no processo de upload',
        message: errorMessage,
        type: 'upload_error',
        severity: 'error',
        autoHide: false,  // Não esconder automaticamente para garantir que o usuário veja
        duration: 0
      });
      
      // Definir progresso como 0 para indicar falha
      setUploadProgress(0);
      
      // Manter o estado de carregamento como true para que o modal não seja fechado
      // O usuário precisará fechar manualmente ou tentar novamente
      
      return { success: false, error: errorMessage };
    }
  };
  
  // Função para fazer upload de múltiplos arquivos para um carrossel
  const handleUploadCarousel = async (filesToUpload: File[], uploadCategory: MarketingCategory, fileDescription: string = '') => {
    if (filesToUpload.length === 0) {
      setError('Nenhum arquivo selecionado para upload.');
      return { success: false, error: 'Nenhum arquivo selecionado para upload.' };
    }
    
    if (filesToUpload.length > 10) {
      setError('O carrossel pode ter no máximo 10 imagens.');
      return { success: false, error: 'O carrossel pode ter no máximo 10 imagens.' };
    }
    
    // Verificar se todos os arquivos são imagens
    const invalidFiles = filesToUpload.filter(file => !file.type.startsWith('image/'));
    if (invalidFiles.length > 0) {
      setError('Todos os arquivos devem ser imagens para criar um carrossel.');
      return { success: false, error: 'Todos os arquivos devem ser imagens para criar um carrossel.' };
    }
    
    setLoading(true);
    setError(null);
    setUploadProgress(0);
    
    // Gerar ID único para o carrossel
    const carouselId = `carousel-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    try {
      // Array para armazenar URLs de download
      const downloadURLs: string[] = [];
      // Array para controlar quais arquivos foram persistidos com sucesso
      const persistedStatus: boolean[] = [];
      // Array para armazenar erros
      const uploadErrors: string[] = [];
      
      // Calcular o incremento de progresso por arquivo
      const progressPerFile = 90 / filesToUpload.length;
      
      // Fazer upload de cada arquivo
      for (let i = 0; i < filesToUpload.length; i++) {
        const file = filesToUpload[i];
        
        try {
          // Usar a função uploadFileToStorage para cada arquivo do carrossel
          // Criar uma categoria específica para este carrossel
          const carouselCategory = `${uploadCategory}/carousels/${carouselId}`;
          
          // Calcular o progresso para este arquivo específico
          const startProgress = i * progressPerFile;
          
          const fileData = await uploadFileToStorage(
            file,
            carouselCategory,
            `Imagem ${i+1} do carrossel: ${fileDescription}`,
            user?.email || 'unknown',
            (fileProgress) => {
              // Converter o progresso do arquivo individual para o progresso geral do carrossel
              const overallProgress = startProgress + (fileProgress * progressPerFile / 100);
              setUploadProgress(Math.round(overallProgress));
            }
          );
          
          downloadURLs[i] = fileData.fileUrl;
          persistedStatus[i] = fileData.isPersisted;
          console.log(`Upload da imagem ${i+1}/${filesToUpload.length} concluído:`, fileData.fileUrl);
          
        } catch (uploadError: any) {
          console.error(`Erro no upload da imagem ${i+1}:`, uploadError);
          
          // Extrair a mensagem de erro
          let errorMessage = String(uploadError);
          if (uploadError.message) {
            errorMessage = uploadError.message;
          }
          
          // Verificar se é um erro de CORS
          if (errorMessage.includes('CORS')) {
            errorMessage = `Erro de CORS na imagem ${i+1}: O servidor não permite uploads do seu navegador.`;
          } else {
            errorMessage = `Erro no upload da imagem ${i+1}: ${errorMessage}`;
          }
          
          // Adicionar o erro à lista de erros
          uploadErrors.push(errorMessage);
          
          // Interromper o processo se houver erro
          break;
        }
      }
      
      // Se houver erros, mostrar para o usuário e não prosseguir
      if (uploadErrors.length > 0) {
        const errorMessage = uploadErrors.join('\n');
        console.error('Erros no upload do carrossel:', errorMessage);
        
        // Definir o erro para exibição na interface
        setError(errorMessage);
        
        // Notificar o usuário sobre os erros
        addSystemNotification({
          title: 'Erro no upload do carrossel',
          message: errorMessage,
          type: 'upload_error',
          severity: 'error',
          autoHide: false,  // Não esconder automaticamente
          duration: 0
        });
        
        // Definir progresso como 0 para indicar falha
        setUploadProgress(0);
        
        // Manter o estado de carregamento como true para que o modal não seja fechado
        // O usuário precisará fechar manualmente ou tentar novamente
        
        return { success: false, error: errorMessage };
      }
      
      // Verificar se pelo menos um arquivo foi persistido com sucesso
      const anyPersisted = persistedStatus.some(status => status);
      
      // Atualizar progresso para 95% antes de salvar no Firestore
      setUploadProgress(95);
      
      // Criar documento no Firestore com os metadados do carrossel
      const carouselData = {
        id: carouselId,
        name: `Carrossel ${new Date().toLocaleDateString()}`,
        fileSize: filesToUpload.reduce((total, file) => total + file.size, 0),
        fileType: 'carousel',
        fileUrl: downloadURLs[0], // Primeira imagem como capa
        thumbnailUrl: downloadURLs[0], // Primeira imagem como thumbnail
        category: uploadCategory,
        description: fileDescription,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        createdBy: user?.email || 'unknown',
        isCarousel: true,
        carouselUrls: downloadURLs,
        imageCount: downloadURLs.length,
        isPersisted: anyPersisted
      };
      
      try {
        // Salvar no Firestore
        await setDoc(doc(firestore, 'marketing-files', carouselId), carouselData);
        console.log('Metadados do carrossel salvos no Firestore com sucesso');
        
        // Atualizar progresso para 100% para indicar conclusão
        setUploadProgress(100);
        
        // Adicionar o carrossel à lista local para exibição imediata
        setFiles(prevFiles => [
          {
            ...carouselData,
            id: carouselId,
            createdAt: new Date(),
            updatedAt: new Date()
          } as MarketingFile,
          ...prevFiles
        ]);
        
        // Notificar o usuário sobre o sucesso
        addSystemNotification({
          title: 'Carrossel criado com sucesso',
          message: `O carrossel com ${downloadURLs.length} imagens foi criado com sucesso.`,
          type: 'upload_success',
          severity: 'success',
          autoHide: true,
          duration: 5000
        });
        
        // Manter o progresso em 100% por um breve momento para mostrar a conclusão
        setTimeout(() => {
          // Resetar o progresso após 2 segundos
          setUploadProgress(0);
          console.log('Progresso de upload do carrossel resetado após conclusão');
        }, 2000);
        
        // Finalizar estado de carregamento
        setLoading(false);
        
        // Atualizar a lista de arquivos de forma controlada
        setTimeout(() => triggerRefresh(), 2500);
        
        return { success: true, carouselId };
      } catch (firestoreError: any) {
        console.error('Erro ao salvar metadados do carrossel no Firestore:', firestoreError);
        
        // Extrair a mensagem de erro
        let errorMessage = String(firestoreError);
        if (firestoreError.message) {
          errorMessage = firestoreError.message;
        }
        
        // Definir o erro para exibição na interface
        setError(`Erro ao salvar metadados do carrossel: ${errorMessage}`);
        
        // Notificar o usuário sobre o erro
        addSystemNotification({
          title: 'Erro ao salvar carrossel',
          message: `Erro ao salvar metadados do carrossel: ${errorMessage}`,
          type: 'upload_error',
          severity: 'error',
          autoHide: false,
          duration: 0
        });
        
        // Definir progresso como 0 para indicar falha
        setUploadProgress(0);
        
        // Manter o estado de carregamento como true para que o modal não seja fechado
        // O usuário precisará fechar manualmente ou tentar novamente
        
        return { success: false, error: errorMessage };
      }
    } catch (error: any) {
      console.error('Erro geral no processo de upload do carrossel:', error);
      
      // Extrair a mensagem de erro
      let errorMessage = String(error);
      if (error.message) {
        errorMessage = error.message;
      }
      
      // Verificar se é um erro de CORS
      if (errorMessage.includes('CORS')) {
        errorMessage = 'Erro de CORS: O servidor não permite uploads do seu navegador. Por favor, configure o CORS no Firebase Storage.';
      }
      
      // Definir o erro para exibição na interface
      setError(errorMessage);
      
      // Notificar o usuário sobre o erro
      addSystemNotification({
        title: 'Erro no processo de upload do carrossel',
        message: errorMessage,
        type: 'upload_error',
        severity: 'error',
        autoHide: false,  // Não esconder automaticamente
        duration: 0
      });
      
      // Definir progresso como 0 para indicar falha
      setUploadProgress(0);
      
      // Manter o estado de carregamento como true para que o modal não seja fechado
      // O usuário precisará fechar manualmente ou tentar novamente
      
      return { success: false, error: errorMessage };
    }
  };

  // Função para tentar sincronizar arquivos locais com o Firebase Storage
  const syncLocalFilesToStorage = async () => {
    try {
      // Buscar todos os arquivos marcados como não persistidos
      const q = query(collection(firestore, 'marketing-files'));
      const querySnapshot = await getDocs(q);
      const localFiles: MarketingFile[] = [];
      
      querySnapshot.forEach((doc) => {
        const data = doc.data() as MarketingFile;
        if (data && data.isPersisted === false) {
          localFiles.push({...data, id: doc.id});
        }
      });
      
      if (localFiles.length === 0) {
        console.log('Não há arquivos locais para sincronizar com o Firebase Storage');
        return;
      }
      
      console.log(`Encontrados ${localFiles.length} arquivos locais para sincronizar com o Firebase Storage`);
      
      // Notificar o usuário que a sincronização está em andamento
      addSystemNotification({
        title: 'Sincronizando arquivos',
        message: `Tentando sincronizar ${localFiles.length} arquivos locais com o Firebase Storage...`,
        type: 'system',
        severity: 'info',
        autoHide: true,
        duration: 5000
      });
      
      // Tentar sincronizar cada arquivo
      let syncedCount = 0;
      
      for (const file of localFiles) {
        try {
          // Como não temos acesso ao arquivo original, vamos apenas atualizar o status
          // Em uma implementação real, seria necessário armazenar o arquivo original em IndexedDB
          // ou outro mecanismo de armazenamento local para poder sincronizar depois
          
          // Atualizar o documento no Firestore para marcar como persistido
          await setDoc(doc(firestore, 'marketing-files', file.id), {
            ...file,
            isPersisted: true,
            updatedAt: serverTimestamp()
          });
          
          syncedCount++;
          console.log(`Arquivo ${file.name} marcado como persistido com sucesso`);
        } catch (error) {
          console.error(`Erro ao sincronizar arquivo ${file.name}:`, error);
        }
      }
      
      // Notificar o usuário sobre o resultado da sincronização
      if (syncedCount > 0) {
        addSystemNotification({
          title: 'Sincronização concluída',
          message: `${syncedCount} de ${localFiles.length} arquivos foram sincronizados com sucesso.`,
          type: 'upload_success',
          severity: 'success',
          autoHide: true,
          duration: 5000
        });
        
        // Atualizar a lista de arquivos
        await fetchFiles();
      } else {
        addSystemNotification({
          title: 'Sincronização falhou',
          message: 'Não foi possível sincronizar nenhum arquivo com o Firebase Storage.',
          type: 'upload_error',
          severity: 'error',
          autoHide: true,
          duration: 5000
        });
      }
    } catch (error) {
      console.error('Erro ao sincronizar arquivos locais:', error);
      
      addSystemNotification({
        title: 'Erro na sincronização',
        message: 'Ocorreu um erro ao tentar sincronizar os arquivos locais com o Firebase Storage.',
        type: 'upload_error',
        severity: 'error',
        autoHide: true,
        duration: 5000
      });
    }
  };
  
  // Função para excluir um arquivo
  const handleDeleteFile = async (fileId: string) => {
    if (!window.confirm('Tem certeza que deseja excluir este arquivo? Esta ação não pode ser desfeita.')) {
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log(`Iniciando exclusão do arquivo: ${fileId}`);
      
      // Encontrar o arquivo na lista
      const fileToDelete = files.find(file => file.id === fileId);
      if (!fileToDelete) {
        throw new Error('Arquivo não encontrado');
      }
      
      // Encontrar o documento no Firestore pelo ID do arquivo
      console.log('Buscando documento no Firestore...');
      const q = query(collection(firestore, 'marketing-files'));
      const querySnapshot = await getDocs(q);
      
      let docId = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.id === fileId) {
          docId = doc.id;
        }
      });
      
      if (!docId) {
        throw new Error('Documento não encontrado no Firestore');
      }
      
      // Excluir documento do Firestore
      await deleteDoc(doc(firestore, 'marketing-files', docId));
      console.log('Metadados excluídos do Firestore com sucesso');
      
      // Mostrar notificação de sucesso
      addSystemNotification({
        title: 'Arquivo excluído',
        message: 'O arquivo foi excluído com sucesso.',
        type: 'system',
        severity: 'success',
        autoHide: true,
        duration: 3000
      });
      
      // Atualizar a lista de arquivos
      await fetchFiles();
      
      setLoading(false);
      console.log('Arquivo excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir arquivo:', error);
      setError('Ocorreu um erro ao excluir o arquivo. Por favor, tente novamente.');
      
      // Mostrar notificação de erro
      addSystemNotification({
        title: 'Erro ao excluir',
        message: 'Ocorreu um erro ao excluir o arquivo. Por favor, tente novamente.',
        type: 'upload_error',
        severity: 'error',
        autoHide: true,
        duration: 5000
      });
      
      setLoading(false);
    }
  };

  return {
    files,
    loading,
    error,
    uploadProgress,
    showSuccessModal,
    setShowSuccessModal,
    activeCategory,
    setActiveCategory,
    handleUploadSingleFile,
    handleUploadCarousel,
    handleDeleteFile,
    syncLocalFilesToStorage,
    validateFile // Incluindo a função para evitar o erro de lint
  };
};

export default useMarketingFiles;
