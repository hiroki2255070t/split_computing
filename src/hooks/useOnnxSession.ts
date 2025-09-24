import { useState, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

ort.env.wasm.wasmPaths = './';

/**
 *
 * @param modelPath : '/model/<MODEL_NAME>/<MODEL_NAME>.onnx'
 * @returns
 */
export const useOnnxSession = (modelPath: string) => {
  // モデル、ローディング状態、ステータスメッセージを管理
  const [session, setSession] = useState<ort.InferenceSession | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [status, setStatus] = useState<string>('Loading onnx session...');

  useEffect(() => {
    const loadSession = async () => {
      try {
        const loadedSession = await ort.InferenceSession.create(modelPath);
        setSession(loadedSession);
        setLoading(false);
        setStatus('Onnx Session loaded successfully.');
      } catch (error) {
        console.error('Failed to load onnx session:', error);
        setLoading(false);
        setStatus('Failed to load onnx session. Check console for details.');
      }
    };

    loadSession();
  }, [modelPath]); // modelPathが変更された場合（通常はない）に再実行

  return { session, loading, status };
};
