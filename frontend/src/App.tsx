import React from 'react';
import { ExecutorProvider } from './contexts/ExecutorProvider';
import AutoClassifier from './components/AutoClassifier';

const App: React.FC = () => {
  return (
    <ExecutorProvider>
      <AutoClassifier />
    </ExecutorProvider>
  );
};

export default App;
