type PixelData = {
  data: Uint8ClampedArray;
  height: number;
  width: number;
};

/**
 * ビデオフレームを描画・リサイズし、生のピクセルデータを取得する共通関数
 */
export const getPixelDataFromVideo = (
  video: HTMLVideoElement,
  height: number,
  width: number
): PixelData => {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) {
    throw new Error('Failed to get 2D context');
  }
  ctx.drawImage(video, 0, 0, width, height);
  const imageData = ctx.getImageData(0, 0, width, height);
  return { data: imageData.data, height, width };
};
