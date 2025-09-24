import { parseAsMessageMetadata, WsMessage } from "../adapters/types";

export const convertBufferToWsMessage = (message: Buffer): WsMessage => {
  // 1. ヘッダーからメタデータの長さを読み取る (最初の4バイト)
  const metadataLength = message.readUInt32LE(0);
  const headerByteLength = 4; // ヘッダーは4バイト

  // 2. メタデータ部分を抽出してJSONにパース
  const metadataBuffer = message.subarray(
    headerByteLength,
    headerByteLength + metadataLength
  );
  const metadataJson = new TextDecoder().decode(metadataBuffer);
  const metadata = JSON.parse(metadataJson);

  // 3. メタデータをZodで検証
  const validatedMessageMetadata = parseAsMessageMetadata(metadata);

  // 4. 特徴量データを抽出
  const featuresBuffer = message.subarray(headerByteLength + metadataLength);

  // 5. 特徴量バッファのコピーを作成してアライメントを保証する
  const copiedFeaturesBuffer = Buffer.from(featuresBuffer);

  // 6. コピーしたバッファからFloat32Arrayを作成する
  const features = new Float32Array(
    copiedFeaturesBuffer.buffer,
    copiedFeaturesBuffer.byteOffset,
    copiedFeaturesBuffer.length / 4
  );

  return {
    features,
    wsMessageMetadata: validatedMessageMetadata,
  };
};
