import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Importações dinâmicas para evitar problemas de carregamento
const MarketingComponent = React.lazy(() => import('./marketing/components/Marketing'));
const AICreatorComponent = React.lazy(() => import('./marketing/ai-creator'));

// Importar o componente de navegação
const MarketingNav = React.lazy(() => import('./marketing/components/MarketingNav'));

export default function Marketing(): JSX.Element {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
        Marketing
      </h1>
      
      <React.Suspense fallback={<div>Carregando navegação...</div>}>
        <MarketingNav />
      </React.Suspense>
      
      <Routes>
        <Route path="/" element={
          <React.Suspense fallback={<div>Carregando materiais...</div>}>
            <MarketingComponent />
          </React.Suspense>
        } />
        <Route path="ai-creator" element={
          <React.Suspense fallback={<div>Carregando criador com IA...</div>}>
            <AICreatorComponent />
          </React.Suspense>
        } />
        <Route path="*" element={<Navigate to="/marketing" replace />} />
      </Routes>
    </div>
  );
}