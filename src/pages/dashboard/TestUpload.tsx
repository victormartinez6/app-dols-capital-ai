import React, { useState } from 'react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../lib/firebase';

export default function TestUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [uploadUrl, setUploadUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Por favor, selecione um arquivo');
      return;
    }

    setLoading(true);
    setProgress(10);
    setError('');

    try {
      // Criar um caminho único para o arquivo
      const timestamp = new Date().getTime();
      const randomId = Math.random().toString(36).substring(2, 15);
      const filePath = `test-uploads/${timestamp}_${randomId}_${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
      
      // Criar referência para o arquivo no Storage
      const storageRef = ref(storage, filePath);
      
      console.log('Iniciando upload para:', filePath);
      setProgress(20);
      
      // Upload simples sem monitoramento de progresso
      await uploadBytes(storageRef, file);
      console.log('Upload concluído!');
      setProgress(70);
      
      // Obter URL do arquivo
      const downloadURL = await getDownloadURL(storageRef);
      console.log('URL do arquivo:', downloadURL);
      
      setUploadUrl(downloadURL);
      setProgress(100);
      setLoading(false);
    } catch (err) {
      console.error('Erro no upload:', err);
      setError('Erro ao fazer upload do arquivo. Por favor, tente novamente.');
      setProgress(0);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-lg mx-auto bg-black rounded-lg border border-gray-800 mt-10">
      <h1 className="text-xl font-bold text-white mb-4">Teste de Upload</h1>
      
      <div className="mb-4">
        <label className="block text-gray-300 mb-2">Selecione um arquivo:</label>
        <input 
          type="file" 
          onChange={handleFileChange}
          className="block w-full text-gray-400 border border-gray-700 rounded p-2 bg-gray-900"
        />
      </div>
      
      {file && (
        <div className="mb-4 text-gray-300">
          <p>Arquivo selecionado: {file.name}</p>
          <p>Tamanho: {(file.size / 1024).toFixed(2)} KB</p>
        </div>
      )}
      
      {progress > 0 && progress < 100 && (
        <div className="mb-4">
          <p className="text-gray-300 mb-1">Progresso do upload: {progress}%</p>
          <div className="w-full bg-gray-700 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-3 bg-red-900 text-red-200 rounded">
          {error}
        </div>
      )}
      
      {uploadUrl && (
        <div className="mb-4 p-3 bg-green-900 text-green-200 rounded">
          <p>Upload concluído com sucesso!</p>
          <a 
            href={uploadUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-blue-400 hover:underline"
          >
            Ver arquivo
          </a>
        </div>
      )}
      
      <button
        onClick={handleUpload}
        disabled={!file || loading}
        className={`w-full py-2 px-4 rounded ${
          !file || loading 
            ? 'bg-gray-700 text-gray-400 cursor-not-allowed' 
            : 'bg-blue-600 text-white hover:bg-blue-700'
        }`}
      >
        {loading ? 'Enviando...' : 'Fazer Upload'}
      </button>
    </div>
  );
}
