import type { WsMessage } from '../api/types';

export const convertWsMessageToBuffer = (wsMessage: WsMessage) => {
  // 1. メタデータ（shapeなど）をJSON文字列として作成
  const metadata = wsMessage.wsMessageMetadata;
  const metadataJson = JSON.stringify(metadata);

  // 2. JSON文字列をバイナリ（Uint8Array）に変換
  const metadataBuffer = new TextEncoder().encode(metadataJson);

  // 3. メタデータの長さを格納するヘッダーを作成 (4バイト)
  const header = new Uint32Array([metadataBuffer.length]);

  // 5. [ヘッダー] + [メタデータ] + [特徴量データ] を結合して1つのバイナリデータを作成
  const combinedBuffer = new Uint8Array(
    header.byteLength + metadataBuffer.length + wsMessage.features.byteLength
  );
  combinedBuffer.set(new Uint8Array(header.buffer), 0);
  combinedBuffer.set(metadataBuffer, header.byteLength);
  combinedBuffer.set(
    new Uint8Array(wsMessage.features.buffer),
    header.byteLength + metadataBuffer.length
  );

  return combinedBuffer;
};
