import type { OffloadTaskProps } from '../offload/useOffloadTask';
import { Config } from '../../config';
import { preprocessVideoFrame } from '../../adapter/preprocessVideoFrame';
import type { ExecuteClassificationWithNoOffloadResult } from '../../adapter/classificationExecutor';
import type { ClassificationExecutor } from '../../adapter/classificationExecutor';

export const runClassificationLoop = async (
  video: HTMLVideoElement,
  splitLayerName: string,
  executor: ClassificationExecutor,
  offloadTask?: ({
    middleTensorData,
    tensorShape,
    splitLayerName,
    inferenceTimeOnDevice,
    clientExecuteStartTimestamp,
  }: OffloadTaskProps) => void,
  callbackOnNoOffload?: (
    result: ExecuteClassificationWithNoOffloadResult,
    clientExecuteStartTimestamp: number,
    clientExecutionFinishTimestamp: number
  ) => void
) => {
  if (video.readyState < 3) return;
  console.log('🍋 Execute Classification!');
  const clientExecuteStartTimestamp = performance.now();

  // モデル学習時に使用した画像サイズ
  const [inputHeight, inputWidth] = [
    Config.INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_S,
    Config.INPUT_IMAGE_SIZE_EFFICIENT_NET_V2_S,
  ];

  // videoオブジェクトからフレームのピクセルデータを取得
  const { pixelData, tensorShape } = preprocessVideoFrame(
    video,
    inputHeight,
    inputWidth,
    Config.BACKEND_LIBRARY
  );

  if (splitLayerName === 'no_offload') {
    // オフロードなし（全てデバイスで推論実行）
    const result = await executor.executeWithNoOffload({ pixelData, tensorShape });
    const clientExecutionFinishTimestamp = performance.now();
    if (callbackOnNoOffload) {
      callbackOnNoOffload(result, clientExecuteStartTimestamp, clientExecutionFinishTimestamp);
    }
  } else if (splitLayerName === 'full_offload') {
    // フルオフロード（全てリモートで推論実行）
    if (offloadTask) {
      offloadTask({
        middleTensorData: pixelData,
        tensorShape,
        splitLayerName: Config.INPUT_LAYER_NAME,
        inferenceTimeOnDevice: 0,
        clientExecuteStartTimestamp,
      });
    } else {
      throw new Error("The function 'offloadTask' is undefined.");
    }
  } else {
    // 部分オフロード（推論処理をデバイスとリモートで分担）
    const { middleTensorData, middleTensorShape, inferenceTimeOnDevice } =
      await executor.executeWithPartialOffload({
        pixelData,
        tensorShape,
        splitLayerName,
      });
    // 3. 残りの推論処理をリモートにオフロード
    if (offloadTask) {
      offloadTask({
        middleTensorData: middleTensorData as Float32Array,
        tensorShape: middleTensorShape,
        splitLayerName: splitLayerName,
        inferenceTimeOnDevice,
        clientExecuteStartTimestamp,
      });
    } else {
      throw new Error("The function 'offloadTask' is undefined.");
    }
  }
};
