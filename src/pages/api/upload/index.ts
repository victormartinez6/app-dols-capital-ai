import { NextApiRequest, NextApiResponse } from 'next';
import { IncomingForm } from 'formidable';
import { promises as fs } from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { db as firestore, storage } from '../../../lib/firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Desabilitar o body parser padrão do Next.js para permitir o upload de arquivos
export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    // Parsear o formulário com os arquivos
    const form = new IncomingForm({
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Processar o formulário
    const [fields, files] = await new Promise<[any, any]>((resolve, reject) => {
      form.parse(req, (err, fields, files) => {
        if (err) return reject(err);
        resolve([fields, files]);
      });
    });

    // Verificar se há um arquivo
    if (!files.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado' });
    }

    // Extrair informações do formulário
    const file = files.file[0]; // Primeiro arquivo
    const category = fields.category?.[0] || 'default';
    const description = fields.description?.[0] || '';
    const userEmail = fields.userEmail?.[0] || 'unknown';

    // Ler o arquivo
    const fileContent = await fs.readFile(file.filepath);

    // Gerar ID único para o arquivo
    const timestamp = new Date().getTime();
    const fileId = `file_${timestamp}_${uuidv4().substring(0, 8)}`;

    // Criar caminho para o arquivo no Storage
    const storageFilePath = `marketing/${category}/${fileId}_${file.originalFilename.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const storageRef = ref(storage, storageFilePath);

    // Fazer upload do arquivo para o Firebase Storage
    console.log('Iniciando upload para o Firebase Storage via API');
    await uploadBytes(storageRef, fileContent);
    console.log('Upload para o Firebase Storage concluído');

    // Obter URL do arquivo no Storage
    const downloadURL = await getDownloadURL(storageRef);
    console.log('URL do arquivo obtida:', downloadURL);

    // Salvar metadados no Firestore
    const docRef = await addDoc(collection(firestore, 'marketing-files'), {
      id: fileId,
      name: file.originalFilename,
      category: category,
      fileUrl: downloadURL,
      fileType: file.mimetype,
      fileSize: file.size,
      createdAt: serverTimestamp(),
      createdBy: userEmail,
      description: description,
      storagePath: storageFilePath,
      isPersisted: true
    });

    console.log('Metadados salvos no Firestore com ID:', docRef.id);

    // Remover o arquivo temporário
    await fs.unlink(file.filepath);

    // Retornar sucesso com os dados do arquivo
    return res.status(200).json({
      id: fileId,
      name: file.originalFilename,
      category: category,
      fileUrl: downloadURL,
      fileType: file.mimetype,
      fileSize: file.size,
      createdAt: new Date(),
      createdBy: userEmail,
      description: description,
      storagePath: storageFilePath,
      isPersisted: true
    });
  } catch (error) {
    console.error('Erro no upload de arquivo via API:', error);
    return res.status(500).json({
      error: 'Erro ao fazer upload do arquivo',
      details: error instanceof Error ? error.message : String(error)
    });
  }
}
