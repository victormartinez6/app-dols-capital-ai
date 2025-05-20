// Função para upload de arquivos para Firebase Storage e IndexedDB
const handleUploadFile = async () => {
  if (!fileToUpload) {
    return;
  }

  // Gerar ID único para o arquivo
  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;

  // Criar caminho para o arquivo no Storage
  const storageFilePath = `marketing/${uploadCategory}/${fileId}_${fileToUpload.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
  const storageRef = ref(storage, storageFilePath);
  
  // Variável para armazenar o intervalo de atualização do progresso
  let progressInterval: NodeJS.Timeout | undefined;
  
  // Definir loading e limpar erros anteriores
  setLoading(true);
  setError(null);
  
  try {
    console.log('Iniciando upload para o Firebase Storage');

    // Definir progresso inicial
    setUploadProgress(10);
    
    // Simular progresso com um intervalo
    progressInterval = setInterval(() => {
      setUploadProgress(prev => {
        if (prev < 90) return prev + 1;
        return prev;
      });
    }, 100);
    
    // Criar objeto para o novo arquivo
    let newFile: MarketingFile = {
      id: fileId,
      name: fileToUpload.name,
      category: uploadCategory,
      fileUrl: '',
      fileType: fileToUpload.type,
      fileSize: fileToUpload.size,
      description: fileDescription || '',
      createdAt: new Date(),
      createdBy: user?.email || 'unknown'
    };

    // Método simples - primeiro fazer upload do arquivo
    await uploadBytesResumable(storageRef, fileToUpload);
    console.log('Upload para o Firebase Storage concluído');

    // Atualizar progresso
    setUploadProgress(50);

    // Obter URL do arquivo no Storage
    const downloadURL = await getDownloadURL(storageRef);
    console.log('URL do arquivo obtida:', downloadURL);

    // Atualizar progresso
    setUploadProgress(70);

    // Atualizar objeto do arquivo com URL do Firebase Storage
    newFile = {
      ...newFile,
      fileUrl: downloadURL,
      isPersisted: true
    };

    // Atualizar progresso
    setUploadProgress(80);

    // Salvar metadados no Firestore
    await addDoc(collection(firestore, 'marketing-files'), {
      id: newFile.id,
      name: newFile.name,
      category: newFile.category,
      fileUrl: newFile.fileUrl,
      fileType: newFile.fileType,
      fileSize: newFile.fileSize,
      createdAt: serverTimestamp(),
      createdBy: newFile.createdBy,
      description: newFile.description,
      isPersisted: true
    });

    // Atualizar progresso
    setUploadProgress(90);

    // Salvar no IndexedDB se disponível
    if (db) {
      const tx = db.transaction('files', 'readwrite');
      const store = tx.objectStore('files');

      await store.put({
        id: newFile.id,
        name: newFile.name,
        category: newFile.category,
        fileBlob: await fileToBlob(fileToUpload),
        fileType: newFile.fileType,
        fileSize: newFile.fileSize,
        createdAt: newFile.createdAt,
        createdBy: newFile.createdBy,
        description: newFile.description,
        isPersisted: true
      });

      await tx.done;
    }
    
    // Adicionar o novo arquivo à lista se ele existir
    if (newFile) {
      setFiles(prevFiles => {
        // Colocar o novo arquivo no topo da lista
        const updatedFiles = [newFile, ...prevFiles];
        return updatedFiles;
      });
    }
    
    // Garantir que o progresso esteja em 100% e mostrar mensagem de sucesso
    setTimeout(() => {
      setUploadProgress(100);
      setShowSuccessModal(true);
      setLoading(false);
      
      // Fechar o modal de sucesso após 2 segundos
      setTimeout(() => {
        setShowSuccessModal(false);
        setShowUploadModal(false);
        setFileToUpload(null);
        setFileDescription('');
        setUploadProgress(0);
        setTextFormatting({ bold: false, italic: false, list: false });
        if (db) {
          fetchFiles(db);
        }
      }, 2000);
    }, 500);
    
    console.log('Upload concluído com sucesso!');
    
  } catch (error) {
    // Limpar o intervalo de progresso em caso de erro
    if (progressInterval) {
      clearInterval(progressInterval);
    }
    
    console.error('Erro no upload:', error);
    const errorMessage = error instanceof Error ? error.message : 'Erro desconhecido durante o upload';
    setError(errorMessage);
    setUploadProgress(0);
    setLoading(false);
  }
};
