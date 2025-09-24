import { z } from 'zod';

const ConfigSchema = z.object({
  MODEL_FILE_PATH: z.string(),
  BACKEND_LIBRARY: z.union([z.literal('tfjs'), z.literal('onnx')]),
  INPUT_LAYER_NAME: z.string(),
  SPLIT_LAYER_NAME: z.string(),
  INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_B0: z.coerce.number(),
  INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_S: z.coerce.number(),
  WEBSOCKET_URL: z.string(),
  RECONNECT_DELAY_MS: z.coerce.number(),
  MAX_RECONNECT_ATTEMPTS: z.coerce.number(),
  FRAME_CAPTURE_INTERVAL_MS: z.coerce.number(),
});

type ConfigType = z.infer<typeof ConfigSchema>;

const getEnv = (): ConfigType => {
  try {
    // Viteでは import.meta.env を使用
    const env = {
      MODEL_FILE_PATH: import.meta.env.VITE_MODEL_FILE_PATH,
      BACKEND_LIBRARY: import.meta.env.VITE_BACKEND_LIBRARY,
      INPUT_LAYER_NAME: import.meta.env.VITE_INPUT_LAYER_NAME,
      SPLIT_LAYER_NAME: import.meta.env.VITE_SPLIT_LAYER_NAME,
      INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_B0: import.meta.env
        .VITE_INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_B0,
      INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_S: import.meta.env.VITE_INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_S,
      WEBSOCKET_URL: import.meta.env.VITE_WEBSOCKET_URL,
      RECONNECT_DELAY_MS: import.meta.env.VITE_RECONNECT_DELAY_MS,
      MAX_RECONNECT_ATTEMPTS: import.meta.env.VITE_MAX_RECONNECT_ATTEMPTS,
      FRAME_CAPTURE_INTERVAL_MS: import.meta.env.VITE_FRAME_CAPTURE_INTERVAL_MS,
    };
    console.log({ env });
    return ConfigSchema.parse(env);
  } catch (error) {
    console.error('環境変数の設定エラー:', error);
    throw new Error('必要な環境変数が設定されていません。.envファイルを確認してください。');
  }
};
export const Config = getEnv();
