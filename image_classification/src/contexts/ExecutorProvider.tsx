import { useState, useEffect, type ReactNode } from 'react';
import { ExecutorContext } from './executorContext';
import { Config } from '../config';
import { createTfjsExecutor } from '../adapter/tfjs/createTfjsExecutor';
import { createOnnxExecutor } from '../adapter/onnx/createOnnxExecutor'; // 後で作成
import type { ClassificationExecutor } from '../adapter/classificationExecutor';
import { useTfjsModel } from '../hooks/useTfjsModel';
import { useOnnxSession } from '../hooks/useOnnxSession';

export const ExecutorProvider = ({ children }: { children: ReactNode }) => {
  const [executor, setExecutor] = useState<ClassificationExecutor | null>(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState('Initializing...');

  // 環境変数に応じて適切なフックを呼び出す
  const tfjsHook =
    Config.BACKEND_LIBRARY === 'tfjs'
      ? useTfjsModel(Config.MODEL_FILE_PATH)
      : { model: null, loading: false, status: '' };
  const onnxHook =
    Config.BACKEND_LIBRARY === 'onnx'
      ? useOnnxSession(Config.MODEL_FILE_PATH)
      : { session: null, loading: false, status: '' };

  useEffect(() => {
    // tf.js用のExecutorを生成
    if (Config.BACKEND_LIBRARY === 'tfjs') {
      setLoading(tfjsHook.loading);
      setStatus(tfjsHook.status);
      if (tfjsHook.model) {
        setExecutor(createTfjsExecutor(tfjsHook.model));
      }
    }
    // ONNX用のExecutorを生成
    else if (Config.BACKEND_LIBRARY === 'onnx') {
      setLoading(onnxHook.loading);
      setStatus(onnxHook.status);
      if (onnxHook.session) {
        setExecutor(createOnnxExecutor(onnxHook.session));
      }
    }
  }, [
    tfjsHook.model,
    tfjsHook.loading,
    tfjsHook.status,
    onnxHook.session,
    onnxHook.loading,
    onnxHook.status,
  ]);

  return (
    <ExecutorContext.Provider value={{ executor, loading, status }}>
      {children}
    </ExecutorContext.Provider>
  );
};
