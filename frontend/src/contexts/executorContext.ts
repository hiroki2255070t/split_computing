import { createContext, useContext } from 'react';
import type { ClassificationExecutor } from '../adapter/classificationExecutor';

// Contextで共有する値の型定義
export type ExecutorContextType = {
  executor: ClassificationExecutor | null;
  loading: boolean;
  status: string;
};

// Contextの作成
export const ExecutorContext = createContext<ExecutorContextType | undefined>(undefined);

export const useExecutorContext = () => {
  const context = useContext(ExecutorContext);
  if (context === undefined) {
    throw new Error('useModelContext must be used within a ModelProvider');
  }
  return context;
};
