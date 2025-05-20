import React from 'react';
import { Image, FileText, Film, PresentationIcon } from 'lucide-react';
import { MarketingCategory } from '../types';
import { useAuth } from '../../../../contexts/AuthContext';

interface CategoryNavProps {
  activeCategory: MarketingCategory;
  setActiveCategory: (category: MarketingCategory) => void;
  onFileReset?: () => void;
}

const CategoryNav: React.FC<CategoryNavProps> = ({ 
  activeCategory, 
  setActiveCategory,
  onFileReset 
}) => {
  const { user } = useAuth();
  const isAdmin = user?.roleKey === 'admin';

  // Categorias com cores e estilos personalizados
  const categories = [
    { 
      id: 'artes', 
      label: 'Artes Gráficas', 
      icon: Image, 
      color: '#ec4899', // Rosa (pink-500)
      hoverBg: 'rgba(236, 72, 153, 0.1)'
    },
    { 
      id: 'documentos', 
      label: 'Documentos', 
      icon: FileText, 
      color: '#f97316', // Laranja (orange-500)
      hoverBg: 'rgba(249, 115, 22, 0.1)'
    },
    { 
      id: 'apresentacoes', 
      label: 'Apresentações', 
      icon: PresentationIcon, 
      color: '#eab308', // Amarelo (yellow-500)
      hoverBg: 'rgba(234, 179, 8, 0.1)'
    },
    { 
      id: 'videos', 
      label: 'Vídeos', 
      icon: Film, 
      color: '#3b82f6', // Azul (blue-500)
      hoverBg: 'rgba(59, 130, 246, 0.1)'
    }
  ];
  
  // Adicionar categoria restrita apenas para administradores
  if (isAdmin) {
    categories.push({
      id: 'restrita',
      label: 'Área Restrita',
      icon: ({ className }: { className?: string }) => (
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round" 
          className={className}
        >
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
        </svg>
      ),
      color: '#dc2626', // Vermelho (red-600)
      hoverBg: 'rgba(220, 38, 38, 0.1)'
    });
  }

  return (
    <div className="flex flex-wrap gap-4 mb-6 pb-2 overflow-visible">
      {categories.map(category => {
        const isActive = activeCategory === category.id as MarketingCategory;
        const Icon = category.icon;
        
        return (
          <button
            key={category.id}
            onClick={() => {
              setActiveCategory(category.id as MarketingCategory);
              // Limpar arquivo selecionado ao mudar de categoria
              if (onFileReset) {
                onFileReset();
              }
            }}
            className={`flex items-center px-6 py-3 rounded-md transition-all duration-300 whitespace-nowrap ${isActive ? 'scale-105' : ''}`}
            style={{
              backgroundColor: isActive ? 'rgba(17, 24, 39, 0.7)' : 'black',
              color: isActive ? category.color : '#d1d5db',
              border: `1px solid ${isActive ? category.color : 'rgba(255, 255, 255, 0.1)'}`,
              minWidth: 'max-content',
              margin: '0.25rem',
              boxShadow: isActive ? `0 0 10px rgba(0, 0, 0, 0.3), 0 0 5px ${category.color}40` : 'none',
            }}
          >
            <Icon 
              className="h-5 w-5 mr-3" 
              style={{ 
                color: isActive ? category.color : '#d1d5db'
              }} 
            />
            <span className="text-sm font-medium">{category.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export default CategoryNav;
