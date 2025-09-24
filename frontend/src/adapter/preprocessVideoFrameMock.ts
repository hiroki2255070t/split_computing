// mockPreprocessVideoFrame.ts

type Backend = 'tfjs' | 'onnx';
export type OutputTensor = {
  pixelData: Float32Array<ArrayBuffer>;
  tensorShape: [number, number, number, number];
};

/**
 * モック版 preprocessVideoFrame
 * - ランダム pixelData を生成
 * - backend に応じて tfjs / onnx のレイアウトを返す
 */
export const preprocessVideoFrameMock = (
  height: number,
  width: number,
  backend: Backend
): OutputTensor => {
  const totalPixels = width * height;

  if (backend === 'tfjs') {
    // NHWC: shape [1, H, W, 3]
    const float32Data = new Float32Array(totalPixels * 3);
    for (let i = 0; i < float32Data.length; i++) {
      float32Data[i] = Math.random(); // 0〜1 のランダム値
    }
    const tensorShape: [number, number, number, number] = [1, height, width, 3];
    return { pixelData: float32Data, tensorShape };
  } else {
    // backend === 'onnx'
    // NCHW: shape [1, 3, H, W]
    const float32Data = new Float32Array(totalPixels * 3);
    for (let i = 0; i < float32Data.length; i++) {
      float32Data[i] = Math.random(); // 0〜1 のランダム値
    }
    const tensorShape: [number, number, number, number] = [1, 3, height, width];
    return { pixelData: float32Data, tensorShape };
  }
};
