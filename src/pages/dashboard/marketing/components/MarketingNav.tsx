import React from 'react';
import { NavLink } from 'react-router-dom';
import { Image, Sparkles } from 'lucide-react';

interface MarketingNavProps {
  className?: string;
}

const MarketingNav: React.FC<MarketingNavProps> = ({ className = '' }) => {
  return (
    <div className={`flex space-x-3 mb-6 bg-black p-2 rounded-lg border border-gray-800 ${className}`}>
      <NavLink
        to="."
        end
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
            isActive
              ? 'bg-blue-600 text-white shadow-md font-medium'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`
        }
      >
        <Image className="h-5 w-5 mr-2" />
        <span>Materiais</span>
      </NavLink>
      
      <NavLink
        to="ai-creator"
        className={({ isActive }) =>
          `flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${
            isActive
              ? 'bg-blue-600 text-white shadow-md font-medium'
              : 'text-gray-400 hover:text-white hover:bg-gray-800'
          }`
        }
      >
        <Sparkles className="h-5 w-5 mr-2" />
        <span>Criador com IA</span>
      </NavLink>
    </div>
  );
};

export default MarketingNav;
