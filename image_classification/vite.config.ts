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
      ],
    }),
  ],
  // 💡 修正点：onnxruntime-webを事前バンドルの対象から除外する
  optimizeDeps: {
    exclude: ['onnxruntime-web', 'rollup'],
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp',
    },
    allowedHosts: ['webapp', 'localhost', '127.0.0.1'],
  },
});
