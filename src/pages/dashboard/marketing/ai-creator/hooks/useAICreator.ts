import { useState, useCallback } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { db } from '../../../../../lib/firebase';
import { collection, addDoc, query, where, getDocs, orderBy, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
import { AIPrompt } from '../types';

interface UseAICreatorReturn {
  prompt: string;
  setPrompt: (prompt: string) => void;
  response: string;
  setResponse: (response: string) => void;
  loading: boolean;
  error: string | null;
  title: string;
  setTitle: (title: string) => void;
  selectedType: 'social-post' | 'article' | 'email' | 'other';
  setSelectedType: (type: 'social-post' | 'article' | 'email' | 'other') => void;
  history: AIPrompt[];
  setHistory: (history: AIPrompt[]) => void;
  generateContent: () => Promise<void>;
  loadHistory: () => Promise<void>;
  deleteHistoryItem: (id: string) => Promise<void>;
  copyResponse: () => void;
  loadHistoryItem: (item: AIPrompt) => void;
}

export const useAICreator = (): UseAICreatorReturn => {
  console.log('useAICreator hook called');
  const { user } = useAuth();
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<AIPrompt[]>([]);
  const [selectedType, setSelectedType] = useState<'social-post' | 'article' | 'email' | 'other'>('social-post');
  const [title, setTitle] = useState('');
  const [error, setError] = useState<string | null>(null);

  // Carregar histórico do usuário com persistência
  const loadHistory = useCallback(async () => {
    try {
      if (!user?.id) return;
      
      // Primeiro, verificar se temos dados em cache no localStorage
      const cachedHistoryKey = `ai_history_${user.id}`;
      const cachedHistory = localStorage.getItem(cachedHistoryKey);
      
      // Se tiver dados em cache, usar temporariamente enquanto carrega do Firestore
      if (cachedHistory) {
        try {
          const parsedHistory = JSON.parse(cachedHistory);
          if (Array.isArray(parsedHistory)) {
            // Converter strings de data para objetos Date
            const formattedHistory = parsedHistory.map(item => ({
              ...item,
              createdAt: new Date(item.createdAt)
            }));
            setHistory(formattedHistory);
            console.log('Histórico carregado do cache local');
          }
        } catch (e) {
          console.error('Erro ao processar cache do histórico:', e);
        }
      }

      // Buscar dados atualizados do Firestore
      const q = query(
        collection(db, 'ai-prompts'),
        where('userId', '==', user.id),
        orderBy('createdAt', 'desc')
      );

      const querySnapshot = await getDocs(q);
      const prompts: AIPrompt[] = [];

      querySnapshot.forEach((doc) => {
        const data = doc.data();
        prompts.push({
          id: doc.id,
          prompt: data.prompt,
          response: data.response,
          createdAt: data.createdAt?.toDate() || new Date(),
          userId: data.userId,
          userEmail: data.userEmail || '',
          type: data.type || 'other',
          title: data.title || 'Sem título'
        });
      });

      // Atualizar o estado com os dados do Firestore
      setHistory(prompts);
      
      // Salvar no localStorage para persistência
      try {
        // Precisamos converter as datas para strings antes de salvar
        const historyForCache = prompts.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString()
        }));
        localStorage.setItem(cachedHistoryKey, JSON.stringify(historyForCache));
        console.log('Histórico salvo no cache local');
      } catch (e) {
        console.error('Erro ao salvar histórico no cache:', e);
      }
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Não foi possível carregar seu histórico. Tente novamente mais tarde.');
    }
  }, [user?.id]);

  // Função para gerar conteúdo com a API do ChatGPT
  const generateContent = useCallback(async () => {
    if (!prompt.trim()) {
      setError('Por favor, digite um prompt antes de gerar o conteúdo.');
      return;
    }

    if (!title.trim()) {
      setError('Por favor, dê um título para seu conteúdo.');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      // Construir o prompt completo baseado no tipo selecionado
      let fullPrompt = prompt;
      
      // Adicionar contexto baseado no tipo de conteúdo
      if (selectedType === 'social-post') {
        fullPrompt = `Crie um post para redes sociais sobre: ${prompt}. O post deve ser engajador, ter entre 80 e 150 palavras, e incluir hashtags relevantes.`;
      } else if (selectedType === 'article') {
        fullPrompt = `Escreva um artigo informativo sobre: ${prompt}. O artigo deve ter uma introdução, desenvolvimento e conclusão, com aproximadamente 500 palavras.`;
      } else if (selectedType === 'email') {
        fullPrompt = `Crie um email de marketing sobre: ${prompt}. O email deve ter um título atrativo, ser persuasivo e ter um call-to-action claro.`;
      }

      // Fazer a requisição para a API do OpenAI
      // Usar variável de ambiente para a chave da API
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY || "API_KEY_PLACEHOLDER"
      
      const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: [
            {
              role: 'system',
              content: 'Você é um assistente especializado em marketing financeiro, focado em criar conteúdo para uma empresa de crédito imobiliário chamada Dols Capital. Seu conteúdo deve ser profissional, persuasivo e direcionado para o mercado brasileiro.'
            },
            {
              role: 'user',
              content: fullPrompt
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        })
      });

      if (!response.ok) {
        throw new Error(`Erro na API: ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.choices[0]?.message?.content || 'Não foi possível gerar o conteúdo.';
      
      setResponse(generatedText);
      
      // Salvar no Firestore
      await saveToHistory(prompt, generatedText);
      
    } catch (error) {
      console.error('Erro ao gerar conteúdo:', error);
      setError('Ocorreu um erro ao gerar o conteúdo. Por favor, tente novamente mais tarde.');
    } finally {
      setLoading(false);
    }
  }, [prompt, title, selectedType, user]);

  // Função para salvar no histórico
  const saveToHistory = useCallback(async (promptText: string, responseText: string) => {
    try {
      if (!user?.id) return;

      const docRef = await addDoc(collection(db, 'ai-prompts'), {
        prompt: promptText,
        response: responseText,
        createdAt: serverTimestamp(),
        userId: user.id,
        userEmail: user.email || '',
        type: selectedType,
        title: title
      });

      // Atualizar o histórico local
      const newPrompt: AIPrompt = {
        id: docRef.id,
        prompt: promptText,
        response: responseText,
        createdAt: new Date(),
        userId: user.id,
        userEmail: user.email || '',
        type: selectedType,
        title: title
      };

      // Atualizar o estado com o novo item no topo
      const updatedHistory = [newPrompt, ...history];
      setHistory(updatedHistory);
      
      // Atualizar o cache local imediatamente
      try {
        const cachedHistoryKey = `ai_history_${user.id}`;
        const historyForCache = updatedHistory.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString()
        }));
        localStorage.setItem(cachedHistoryKey, JSON.stringify(historyForCache));
        console.log('Cache local atualizado com novo item');
      } catch (e) {
        console.error('Erro ao atualizar cache local:', e);
      }
      
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
    }
  }, [user, selectedType, title, history]);

  // Função para excluir um item do histórico
  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      if (!user?.id) return;
      
      // Atualizar o estado local primeiro para feedback imediato
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      
      // Atualizar o cache local imediatamente
      try {
        const cachedHistoryKey = `ai_history_${user.id}`;
        const historyForCache = updatedHistory.map(item => ({
          ...item,
          createdAt: item.createdAt.toISOString()
        }));
        localStorage.setItem(cachedHistoryKey, JSON.stringify(historyForCache));
        console.log('Cache local atualizado após exclusão');
      } catch (e) {
        console.error('Erro ao atualizar cache local após exclusão:', e);
      }
      
      // Remover do Firestore
      await deleteDoc(doc(db, 'ai-prompts', id));
      
    } catch (error) {
      console.error('Erro ao excluir item do histórico:', error);
      setError('Não foi possível excluir o item. Tente novamente mais tarde.');
      // Recarregar o histórico em caso de erro
      loadHistory();
    }
  }, [user?.id, history, loadHistory]);

  // Função para copiar resposta
  const copyResponse = useCallback(() => {
    navigator.clipboard.writeText(response)
      .then(() => {
        // Feedback visual temporário será tratado no componente
      })
      .catch(err => {
        console.error('Erro ao copiar texto:', err);
        setError('Não foi possível copiar o texto. Tente selecionar e copiar manualmente.');
      });
  }, [response]);

  // Função para carregar um item do histórico
  const loadHistoryItem = useCallback((item: AIPrompt) => {
    setPrompt(item.prompt);
    setResponse(item.response);
    setSelectedType(item.type);
    setTitle(item.title);
  }, []);

  return {
    prompt,
    setPrompt,
    response,
    setResponse,
    loading,
    error,
    title,
    setTitle,
    selectedType,
    setSelectedType,
    history,
    setHistory,
    generateContent,
    loadHistory,
    deleteHistoryItem,
    copyResponse,
    loadHistoryItem
  };
};

export default useAICreator;
