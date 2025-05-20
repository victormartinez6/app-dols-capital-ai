// Tipos para o Criador com IA

export interface AIPrompt {
  id: string;
  prompt: string;
  response: string;
  createdAt: Date;
  userId: string;
  userEmail: string;
  type: 'social-post' | 'article' | 'email' | 'other';
  title: string;
}

export interface ContentType {
  id: 'social-post' | 'article' | 'email' | 'other';
  name: string;
  description: string;
}

export const contentTypes: ContentType[] = [
  { id: 'social-post', name: 'Post para Redes Sociais', description: 'Crie posts engajadores para Instagram, Facebook, LinkedIn, etc.' },
  { id: 'article', name: 'Artigo', description: 'Crie artigos informativos sobre temas financeiros' },
  { id: 'email', name: 'Email Marketing', description: 'Crie emails persuasivos para seus clientes' },
  { id: 'other', name: 'Outro', description: 'Crie qualquer outro tipo de conteúdo' }
];
