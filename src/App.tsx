import React from 'react';
import { ExecutorProvider } from './contexts/ExecutorProvider';
import RealTimeClassifier from './components/RealTimeClassifier';

const App: React.FC = () => {
  return (
    <ExecutorProvider>
      <RealTimeClassifier />
    </ExecutorProvider>
  );
};

export default App;
