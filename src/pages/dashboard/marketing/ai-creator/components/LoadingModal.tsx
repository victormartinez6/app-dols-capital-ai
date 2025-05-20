import React from 'react';
import aiIcon from '../../../../../assets/ai-learning-3d-icon.png';

interface LoadingModalProps {
  isOpen: boolean;
}

const LoadingModal: React.FC<LoadingModalProps> = ({ isOpen }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-black border border-gray-800 rounded-xl p-10 shadow-2xl max-w-lg w-full">
        <div className="flex flex-col items-center">
          <div className="relative">
            {/* Imagem pulsando com efeito de brilho */}
            <div className="relative">
              {/* Efeito de brilho por trás da imagem */}
              <div className="absolute inset-0 bg-blue-500 opacity-30 rounded-full blur-xl animate-pulse"></div>
              <img 
                src={aiIcon} 
                alt="AI Learning" 
                className="w-48 h-48 object-contain relative z-10 animate-pulse"
              />
            </div>
            
            {/* Círculo de carregamento em volta da imagem */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-56 h-56 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
            </div>
          </div>
          
          <h3 className="mt-6 text-2xl font-bold text-white bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">Gerando conteúdo...</h3>
          <p className="mt-2 text-gray-300 text-center">
            Estamos criando seu conteúdo com IA. Isso pode levar alguns segundos.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoadingModal;
