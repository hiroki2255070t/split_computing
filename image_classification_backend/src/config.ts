import dotenv from "dotenv";
import { z } from "zod";
dotenv.config(); // ここで .env をロード

const ConfigSchema = z.object({
  HOST: z.string(),
  PORT: z.coerce.number().int().positive().default(8080),
  MODEL_PATH_TFJS: z.string(),
  MODEL_PATH_ONNX: z.string(),
  BACKEND_LIBRARY: z.union([z.literal("tfjs"), z.literal("onnx")]),
});
type ConfigType = z.infer<typeof ConfigSchema>;

const getEnv = (): ConfigType => {
  const env = process.env;
  return ConfigSchema.parse(env);
};
export const Config = getEnv();
