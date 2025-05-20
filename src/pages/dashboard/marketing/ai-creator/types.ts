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

export const contentTypes = [
  { id: 'social-post', name: 'Post para Redes Sociais' },
  { id: 'article', name: 'Artigo' },
  { id: 'email', name: 'Email Marketing' },
  { id: 'other', name: 'Outro' }
];
