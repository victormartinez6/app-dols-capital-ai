import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Marketing from './components/Marketing';
import AICreator from './ai-creator';
import MarketingNav from './components/MarketingNav';

const MarketingRoutes: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-3xl font-bold text-white bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600 mb-6">
        Marketing
      </h1>
      
      <MarketingNav />
      
      <Routes>
        <Route path="/" element={<Marketing />} />
        <Route path="ai-creator" element={<AICreator />} />
        <Route path="*" element={<Navigate to="/marketing" replace />} />
      </Routes>
    </div>
  );
};

export default MarketingRoutes;
