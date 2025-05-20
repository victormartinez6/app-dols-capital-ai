import { useState, useCallback, useEffect } from 'react';
import { useAuth } from '../../../../../contexts/AuthContext';
import { db } from '../../../../../lib/firebase';
import { collection, addDoc, query, where, getDocs, serverTimestamp, deleteDoc, doc } from 'firebase/firestore';
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
  
  // Função para carregar o histórico diretamente do Firestore
  const loadHistory = useCallback(async () => {
    try {
      // Ativar estado de carregamento
      setLoading(true);
      
      if (!user?.id) {
        console.error('ERRO: Usuário não autenticado. Não é possível carregar o histórico.');
        setError('Usuário não autenticado');
        setLoading(false);
        return;
      }
      
      // Buscar dados do Firestore de forma simples e direta
      // Usando apenas where sem orderBy para evitar o erro de índice
      const q = query(
        collection(db, 'ai-prompts'),
        where('userId', '==', user.id)
      );

      const querySnapshot = await getDocs(q);
      console.log(`Firestore retornou ${querySnapshot.size} documentos`);
      
      if (querySnapshot.empty) {
        console.log('Nenhum documento encontrado no Firestore');
        setHistory([]);
        setLoading(false);
        return;
      }
      
      // Converter os documentos para o formato AIPrompt
      const prompts: AIPrompt[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        prompts.push({
          id: doc.id,
          prompt: data.prompt || '',
          response: data.response || '',
          createdAt: data.createdAt?.toDate() || new Date(),
          userId: data.userId || user.id,
          userEmail: data.userEmail || user.email || '',
          type: data.type || 'other',
          title: data.title || 'Sem título'
        });
      });
      
      // Ordenar manualmente por data de criação (mais recente primeiro)
      prompts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      
      // Limitar a 5 itens
      const limitedPrompts = prompts.slice(0, 5);
      
      console.log('Histórico carregado com sucesso:', limitedPrompts.length, 'itens');
      
      // Atualizar o estado com os dados do Firestore
      setHistory(limitedPrompts);
      setError('');
      
      // Desativar estado de carregamento
      setLoading(false);
    } catch (error) {
      console.error('Erro ao carregar histórico:', error);
      setError('Erro ao carregar histórico: ' + (error as Error).message);
      setLoading(false);
    }
  }, [user, setHistory, setError]);
  
  // Efeito para carregar o histórico apenas quando o componente é montado
  useEffect(() => {
    console.log('Componente montado - carregando histórico uma única vez');
    loadHistory();
  }, [loadHistory]);
  
  // Efeito adicional para carregar o histórico quando o usuário estiver autenticado
  useEffect(() => {
    if (user?.id) {
      console.log('Usuário autenticado detectado - carregando histórico');
      loadHistory();
    }
  }, [user?.id, loadHistory]);

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
      const apiKey = import.meta.env.VITE_OPENAI_API_KEY;
      
      // Log para depuração (será visível no console do navegador)
      console.log("Verificando variável de ambiente:", {
        definida: apiKey !== undefined,
        vazia: apiKey === "",
        tipo: typeof apiKey
      });
      
      if (!apiKey) {
        console.error("Chave da API OpenAI não encontrada nas variáveis de ambiente!")
        throw new Error("Chave da API OpenAI não configurada. Verifique as variáveis de ambiente.")
      }
      
      // Verificar se a chave tem o formato correto (começa com 'sk-')
      if (typeof apiKey === 'string' && !apiKey.startsWith('sk-')) {
        console.warn("A chave da API OpenAI não parece estar no formato correto (deve começar com 'sk-')")
      }
      
      try {
        if (typeof apiKey === 'string' && apiKey.length > 10) {
          console.log(`Usando chave da API: ${apiKey.substring(0, 3)}...${apiKey.substring(apiKey.length - 4)}`)
        } else {
          console.log("Chave da API encontrada, mas pode estar em formato inválido")
        }
      } catch (e) {
        console.error("Erro ao processar a chave da API:", e)
      }
      
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
      if (!user?.id) {
        console.error('Usuário não autenticado. Não é possível salvar no histórico.');
        return;
      }

      console.log('Salvando no histórico para o usuário:', user.id);
      
      // Salvar no Firestore
      const docRef = await addDoc(collection(db, 'ai-prompts'), {
        prompt: promptText,
        response: responseText,
        createdAt: serverTimestamp(),
        userId: user.id,
        userEmail: user.email || '',
        type: selectedType,
        title: title
      });

      console.log('Item salvo no Firestore com ID:', docRef.id);

      // Criar o novo item para o histórico local
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

      // Atualizar o estado com o novo item no topo, limitando a 5 itens
      const updatedHistory = [newPrompt, ...history].slice(0, 5);
      setHistory(updatedHistory);
      console.log('Estado do histórico atualizado com', updatedHistory.length, 'itens');
      
      // Se tivermos mais de 5 itens após adicionar o novo, excluir o mais antigo
      if (history.length >= 5) {
        const itemToDelete = history[4]; // O 5º item (agora o 6º após adicionar o novo)
        try {
          if (itemToDelete?.id) {
            console.log(`Excluindo item antigo do histórico: ${itemToDelete.id}`);
            await deleteDoc(doc(db, 'ai-prompts', itemToDelete.id));
            console.log(`Item antigo excluído com sucesso: ${itemToDelete.id}`);
          }
        } catch (e) {
          console.error(`Erro ao excluir item antigo ${itemToDelete?.id}:`, e);
        }
      }
      
      // Recarregar o histórico para garantir que está atualizado
      loadHistory();
      
    } catch (error) {
      console.error('Erro ao salvar no histórico:', error);
    }
  }, [user, selectedType, title, history, loadHistory]);

  // Função para excluir um item do histórico
  const deleteHistoryItem = useCallback(async (id: string) => {
    try {
      if (!user?.id) return;
      
      // Atualizar o estado local primeiro para feedback imediato
      const updatedHistory = history.filter(item => item.id !== id);
      setHistory(updatedHistory);
      
      // Log de confirmação
      console.log('Item removido do histórico com sucesso:', id);
      
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
