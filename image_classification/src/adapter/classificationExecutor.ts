// == オフロードなしでの推論実行 ==
export type TopKResult = {
  index: number;
  probability: number;
};

export type ExecuteClassificationWithNoOffloadProps = {
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: number[];
};

export type ExecuteClassificationWithNoOffloadResult = {
  top5: TopKResult[];
  inferenceTimeOnDevice: number;
};

// == 部分オフロードでの推論実行 ==
export type ExecuteClassificationWithPartialOffloadProps = {
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: number[];
  splitLayerName: string;
};

export type ExecuteClassificationWithPartialOffloadResult = {
  middleTensorData: Float32Array;
  middleTensorShape: number[];
  inferenceTimeOnDevice: number;
};

export interface ClassificationExecutor {
  executeWithNoOffload(
    props: ExecuteClassificationWithNoOffloadProps
  ): Promise<ExecuteClassificationWithNoOffloadResult>;

  executeWithPartialOffload(
    props: ExecuteClassificationWithPartialOffloadProps
  ): Promise<ExecuteClassificationWithPartialOffloadResult>;
}
