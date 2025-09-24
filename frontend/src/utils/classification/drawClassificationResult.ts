import { IMAGENET_CLASSES } from '../../data/imageset';

export type ClassificationResult = {
  index: number;
  probability: number;
};

/**
 * 整形された分類結果をCanvasに描画する関数
 * @param results processOutputから返された結果の配列
 * @param ctx 描画対象となるCanvasの2Dコンテキスト
 */
export const drawClassificationResult = (
  results: ClassificationResult[],
  ctx: CanvasRenderingContext2D
) => {
  // 1. 前回の描画内容をクリアする
  ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);

  // 2. 描画スタイルを設定
  const FONT_SIZE = 20;
  const FONT = `bold ${FONT_SIZE}px "Segoe UI", Arial, sans-serif`;
  const TEXT_PADDING = 5;
  const BOX_HEIGHT = FONT_SIZE + TEXT_PADDING * 2;
  const START_X = 10;
  const START_Y = 20;

  ctx.font = FONT;

  // 3. 各結果をループして描画
  results.forEach((result, index) => {
    const text = `${IMAGENET_CLASSES[result.index]}: ${(result.probability * 100).toFixed(1)}%`;
    const textMetrics = ctx.measureText(text);
    const y = START_Y + index * (BOX_HEIGHT + 10);

    // テキストの背景を描画して読みやすくする
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(START_X - TEXT_PADDING, y, textMetrics.width + TEXT_PADDING * 2, BOX_HEIGHT);

    // テキストを描画
    ctx.fillStyle = 'white';
    ctx.textBaseline = 'top'; // y座標をボックスの上端に合わせる
    ctx.fillText(text, START_X, y + TEXT_PADDING);
  });
};
