import { getPixelDataFromVideo } from '../utils/getPixelDataFromVideo';

type Backend = 'tfjs' | 'onnx';
export type OutputTensor = {
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: [number, number, number, number];
};

/**
 * ビデオフレームを各バックエンドに適した入力テンソルに変換する共通化された関数
 * @param video 処理対象のHTMLVideoElement
 * @param height モデルの入力画像の高さ
 * @param width モデルの入力画像の幅
 * @param backend 'tfjs' または 'onnx' を指定
 * @returns 指定されたバックエンドのテンソル
 */
export const preprocessVideoFrame = (
  video: HTMLVideoElement,
  height: number,
  width: number,
  backend: Backend
): OutputTensor => {
  // ① Canvasを使ったピクセルデータ取得（共通処理）
  const {
    data,
    height: inputHeight,
    width: inputWidth,
  } = getPixelDataFromVideo(video, height, width);

  // ② バックエンドに応じてデータレイアウトを整える
  if (backend === 'tfjs') {
    // NHWC: [R, G, B, R, G, B, ...] 形式
    const float32Data = new Float32Array(inputWidth * inputHeight * 3);
    for (let i = 0, j = 0; i < data.length; i += 4, j += 3) {
      float32Data[j] = data[i] / 255.0; // R
      float32Data[j + 1] = data[i + 1] / 255.0; // G
      float32Data[j + 2] = data[i + 2] / 255.0; // B
    }
    const tensorShape: [number, number, number, number] = [1, inputHeight, inputWidth, 3];
    return { pixelData: float32Data, tensorShape };
  } else {
    // backend === 'onnx'
    // NCHW: [R, R, ..., G, G, ..., B, B, ...] 形式
    const redChannel = [];
    const greenChannel = [];
    const blueChannel = [];
    for (let i = 0; i < data.length; i += 4) {
      redChannel.push(data[i] / 255.0);
      greenChannel.push(data[i + 1] / 255.0);
      blueChannel.push(data[i + 2] / 255.0);
    }
    const float32Data = new Float32Array([...redChannel, ...greenChannel, ...blueChannel]);
    const tensorShape: [number, number, number, number] = [1, 3, inputHeight, inputWidth];
    return { pixelData: float32Data, tensorShape };
  }
};
