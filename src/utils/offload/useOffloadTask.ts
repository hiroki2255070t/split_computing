import { useCallback } from 'react';
import type { WsMessage } from '../../api/types';

export type OffloadTaskProps = {
  middleTensorData: Float32Array;
  tensorShape: number[];
  splitLayerName: string;
  inferenceTimeOnDevice: number;
  clientExecuteStartTimestamp: number;
};
type OffloadTaskFunction = (props: OffloadTaskProps) => void;

export const useOffloadTask = (
  sendWsMessage: (wsMessage: WsMessage) => void
): OffloadTaskFunction => {
  // 返す関数全体をuseCallbackでラップする
  const offloadTask = useCallback(
    ({
      middleTensorData,
      tensorShape,
      splitLayerName,
      inferenceTimeOnDevice,
      clientExecuteStartTimestamp,
    }: OffloadTaskProps) => {
      console.log('🦞 Offload Task!');

      const clientMessageSentTimestamp = performance.now();
      const wsMessage: WsMessage = {
        features: middleTensorData,
        wsMessageMetadata: {
          shape: tensorShape,
          splitLayerName,
          inferenceTimeOnDevice,
          clientMessageSentTimestamp,
          clientExecuteStartTimestamp,
        },
      };
      sendWsMessage(wsMessage);
    },
    [sendWsMessage]
  );

  return offloadTask;
};
