import { useState, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

// 環境に応じてwasmPathsを設定
if (import.meta.env.PROD) {
  // 本番環境（Firebase Hosting）
  ort.env.wasm.wasmPaths = '/';
} else {
  // 開発環境
  ort.env.wasm.wasmPaths = './';
}

// WebAssemblyの設定を最適化
ort.env.wasm.numThreads = 4;
ort.env.wasm.simd = true;

/**
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
        setStatus('Initializing ONNX Runtime...');

        // セッションオプションを明示的に設定
        const sessionOptions: ort.InferenceSession.SessionOptions = {
          executionProviders: [
            {
              name: 'wasm',
            },
          ],
          enableCpuMemArena: true,
          enableMemPattern: true,
          executionMode: 'sequential',
          logSeverityLevel: 2, // Warning level
        };

        setStatus('Creating inference session...');
        const loadedSession = await ort.InferenceSession.create(modelPath, sessionOptions);

        setSession(loadedSession);
        setLoading(false);
        setStatus('Onnx Session loaded successfully.');

        console.log('ONNX session loaded successfully:', {
          inputNames: loadedSession.inputNames,
          outputNames: loadedSession.outputNames,
        });
      } catch (error) {
        console.error('Failed to load onnx session:', error);

        // より詳細なエラー情報を提供
        let errorMessage = 'Failed to load onnx session.';
        if (error instanceof Error) {
          errorMessage += ` Error: ${error.message}`;
        }

        setLoading(false);
        setStatus(errorMessage);

        // エラーの詳細をログ出力
        console.error('ONNX Runtime error details:', {
          wasmPaths: ort.env.wasm.wasmPaths,
          modelPath,
          userAgent: navigator.userAgent,
          error: error,
        });
      }
    };

    loadSession();
  }, [modelPath]);

  return { session, loading, status };
};
