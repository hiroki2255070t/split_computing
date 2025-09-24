import z from 'zod';

export const ModelMetadataSchema = z.object({
  modelName: z.string(),
  splitLayers: z.array(
    z.object({
      splitLayerName: z.string(),
      splitLayerNameAbbreviation: z.string(),
      featuresBytes: z.coerce.number(),
      // 入力テンソルinputTensorのデータサイズに対する圧縮率
      // 入力テンソルのデータサイズが変わった場合、手動で修正する必要がある
      compressionRatio: z.coerce.number(),
      stage: z.coerce.number(),
    })
  ),
});
export type ModelMetadata = z.infer<typeof ModelMetadataSchema>;
export function parseAsModelMetadata(data: unknown): ModelMetadata {
  return ModelMetadataSchema.parse(data);
}
