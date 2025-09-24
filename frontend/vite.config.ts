import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          // onnxruntime-webの配布ファイルがある場所
          src: 'node_modules/onnxruntime-web/dist/*.{wasm,jsep.mjs}',
          // コピー先のディレクトリ（ビルド後のルートディレクトリ）
          dest: '.',
        },
        {
          // 追加：ONNXランタイムの必要なファイルを確実にコピー
          src: 'node_modules/onnxruntime-web/dist/ort-*.{wasm,mjs,jsep.mjs}',
          dest: '.',
        },
        {
          // onnxランタイムのワーカーファイルもコピー
          src: 'node_modules/onnxruntime-web/dist/*.js',
          dest: '.',
        },
        {
          // モデルファイルをpublic/modelからコピー（パスは実際の場所に合わせて調整）
          src: 'public/model/**/*',
          dest: 'model',
        },
      ],
    }),
  ],
  // onnxruntime-webを事前バンドルの対象から除外する
  optimizeDeps: {
    exclude: ['onnxruntime-web', 'rollup'],
  },
  build: {
    // 静的ファイルのコピーを確実に行うための設定
    assetsInlineLimit: 0,
    rollupOptions: {
      output: {
        // onnxruntime-webのファイルを適切に処理
        manualChunks: (id) => {
          if (id.includes('onnxruntime-web')) {
            return 'onnxruntime-web';
          }
        },
      },
    },
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    allowedHosts: ['webapp', 'localhost', '127.0.0.1'],
    // 開発サーバーでのMIMEタイプ設定
    middlewareMode: false,
  },
  // 本番環境での追加設定
  define: {
    // ONNXランタイムのパスを明示的に設定
    'process.env.ONNXRUNTIME_WEB_PATH': JSON.stringify('/'),
  },
});
