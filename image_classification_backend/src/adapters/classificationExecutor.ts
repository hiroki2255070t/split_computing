export type TopKResult = {
  index: number;
  probability: number;
};

// 推論実行者の「契約」を定義
export interface ClassificationExecutor {
  executeClassification(
    features: Float32Array,
    shape: number[],
    splitLayerName: string
  ): Promise<{ top5: TopKResult[]; inferenceTimeOnRemote: number }>;
}
