import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db as firestore, storage } from '../../lib/firebase';
import { getAuth } from 'firebase/auth';

/**
 * Função para upload de arquivos para o Firebase Storage
 * Usa uploadBytesResumable para monitorar o progresso
 * @param file Arquivo a ser enviado
 * @param category Categoria do arquivo (pasta)
 * @param description Descrição do arquivo
 * @param userEmail Email do usuário que está fazendo o upload
 * @param onProgress Callback para atualizar o progresso do upload
 * @returns Objeto com os dados do arquivo salvo
 */
export const uploadFileToStorage = async (
  file: File,
  category: string,
  description: string,
  userEmail: string,
  onProgress: (progress: number) => void
) => {
  return new Promise((resolve, reject) => {
    try {
      // Verificar autenticação
      const auth = getAuth();
      const currentUser = auth.currentUser;
      if (!currentUser) {
        throw new Error('Usuário não autenticado. Faça login novamente.');
      }
      
      // Atualizar progresso inicial
      onProgress(10);
      console.log('Iniciando upload do arquivo:', file.name);
      
      // Criar nome de arquivo único
      const timestamp = Date.now();
      const sanitizedFileName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
      const fileName = `${timestamp}_${sanitizedFileName}`;
      
      // Criar caminho para o arquivo no Storage
      // Usando o bucket correto: dols-capital-app.firebasestorage.app
      const path = `marketing/${category}/${fileName}`;
      console.log('Caminho do arquivo:', path);
      
      // Criar referência no storage
      const storageRef = ref(storage, path);
      console.log('Referência do storage criada');
      
      // Metadados do arquivo
      const metadata = {
        contentType: file.type,
        customMetadata: {
          'bucket': 'dols-capital-app.firebasestorage.app' // Especificar o bucket correto
        }
      };
      console.log('Metadados:', metadata);
      
      // Usar uploadBytesResumable para monitorar o progresso
      console.log('Iniciando upload...');
      const uploadTask = uploadBytesResumable(storageRef, file, metadata);
      
      // Monitorar o progresso do upload
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          // Progresso do upload
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          console.log('Upload em progresso:', Math.round(progress) + '%');
          onProgress(Math.round(progress));
        },
        (error) => {
          // Erro durante o upload
          console.error('Erro durante o upload:', error);
          console.error('Código do erro:', error.code);
          console.error('Mensagem do erro:', error.message);
          
          let mensagemErro = 'Erro ao fazer upload do arquivo';
          
          if (error.code === 'storage/unauthorized') {
            mensagemErro = 'Você não tem permissão para fazer upload deste arquivo.';
          } else if (error.code === 'storage/canceled') {
            mensagemErro = 'Upload cancelado.';
          } else if (error.code === 'storage/unknown') {
            mensagemErro = 'Ocorreu um erro durante o upload. Por favor, tente novamente.';
          } else if (error.message && error.message.includes('CORS')) {
            mensagemErro = 'Erro de CORS: Verifique se o bucket dols-capital-app.firebasestorage.app está configurado corretamente.';
          } else {
            mensagemErro = error.message || 'Erro ao fazer upload do arquivo.';
          }
          
          onProgress(0);
          reject(new Error(mensagemErro));
        },
        async () => {
          // Upload concluído com sucesso
          try {
            console.log('Upload concluído, obtendo URL...');
            // Obter URL de download
            const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
            console.log('URL obtida:', downloadURL);
            
            // Gerar ID único para o arquivo
            const fileId = `file_${timestamp}_${Math.random().toString(36).substring(2, 15)}`;
            
            // Salvar metadados no Firestore
            const docRef = await addDoc(collection(firestore, 'marketing-files'), {
              id: fileId,
              name: file.name,
              category: category,
              fileUrl: downloadURL,
              fileType: file.type,
              fileSize: file.size,
              createdAt: serverTimestamp(),
              createdBy: userEmail || 'unknown',
              description: description,
              storagePath: path,
              isPersisted: true
            });
            
            console.log('Metadados salvos no Firestore com ID:', docRef.id);
            onProgress(100);
            
            // Retornar objeto do arquivo
            resolve({
              id: fileId,
              name: file.name,
              category: category,
              fileUrl: downloadURL,
              fileType: file.type,
              fileSize: file.size,
              createdAt: new Date(),
              createdBy: userEmail || 'unknown',
              description: description,
              storagePath: path,
              isPersisted: true
            });
            
            console.log('Upload finalizado com sucesso');
          } catch (error: any) {
            console.error('Erro ao obter URL do arquivo ou salvar metadados:', error);
            onProgress(0);
            reject(new Error(error.message || 'Erro ao finalizar o upload do arquivo.'));
          }
        }
      );
    } catch (error: any) {
      console.error('Erro ao configurar o upload:', error);
      onProgress(0);
      reject(new Error(error.message || 'Erro ao iniciar o upload do arquivo.'));
    }
  });
};
