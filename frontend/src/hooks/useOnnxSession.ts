import { useState, useEffect } from 'react';
import * as ort from 'onnxruntime-web';

// 環境に応じてwasmPathsを設定
if (import.meta.env.PROD) {
  // 本番環境（Firebase Hosting）- 文字列でパスを指定
  ort.env.wasm.wasmPaths = '/';
  // onnxruntime-webのバージョンによってはこちらの設定が必要
  ort.env.wasm.numThreads = 1; // マルチスレッドを無効化してCORSエラー回避
  ort.env.wasm.simd = true;
} else {
  // 開発環境
  ort.env.wasm.wasmPaths = './';
  ort.env.wasm.numThreads = 4;
  ort.env.wasm.simd = true;
}

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

        // モデルファイルが存在するか事前確認
        try {
          const response = await fetch(modelPath, { method: 'HEAD' });
          console.log('Model file check:', {
            url: modelPath,
            status: response.status,
            headers: Object.fromEntries(response.headers.entries()),
          });
          if (!response.ok) {
            throw new Error(`Model file not accessible: ${response.status}`);
          }
        } catch (fetchError) {
          console.error('Model file fetch error:', fetchError);
          throw new Error(`Cannot access model file: ${modelPath}`);
        }

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
        console.log('Attempting to create session with options:', sessionOptions);
        console.log('Model path:', modelPath);
        console.log('WASM paths:', ort.env.wasm.wasmPaths);

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

          // CORS関連のエラーかチェック
          if (
            error.message.includes('CORS') ||
            error.message.includes('Cross-Origin') ||
            error.message.includes('NetworkError') ||
            error.message.includes('Failed to fetch')
          ) {
            errorMessage += ' This appears to be a CORS issue.';
          }
        }

        setLoading(false);
        setStatus(errorMessage);

        // エラーの詳細をログ出力
        console.error('ONNX Runtime error details:', {
          wasmPaths: ort.env.wasm.wasmPaths,
          modelPath,
          userAgent: navigator.userAgent,
          currentURL: window.location.href,
          error: error,
        });
      }
    };

    loadSession();
  }, [modelPath]);

  return { session, loading, status };
};
