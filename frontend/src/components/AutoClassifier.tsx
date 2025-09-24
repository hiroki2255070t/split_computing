import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useOffloadTask } from '../utils/offload/useOffloadTask';
import { useWsResponse } from '../hooks/useWsResponse';
import { useLogData } from '../hooks/useLogData';
import { useExecutorContext } from '../contexts/executorContext';
import type { WsResponse } from '../api/types';
import type { LogDataElement } from '../types';
import type { ExecuteClassificationWithNoOffloadResult } from '../adapter/classificationExecutor';
import { runClassificationLoopWithoutWebcam } from '../utils/classification/runClassificationLoopWithoutWebcam';
import { modelMetadata } from '../data/models/efficientNetV2_S/metadataOnnx';

const AutoClassifier: React.FC = () => {
  const { executor, loading: modelLoading } = useExecutorContext();

  const { logData, pushLogDataElement, showLogDataElement, saveLogDataAsJson } = useLogData();

  const intervalMs = useMemo(() => 1000, []);

  // const splitLayerName = modelMetadata.splitLayers[0].splitLayerName;
  const splitLayerName = 'full_offload';

  const callbackOnWsResponse = useCallback(
    (wsResponse: WsResponse, clientResponseReceivedTimestamp: number) => {
      const newLogDataElement: LogDataElement = {
        splitLayerName,
        inferenceTimeOnDevice: wsResponse.inferenceTimeOnDevice,
        inferenceTimeOnRemote: wsResponse.inferenceTimeOnRemote,
        clientExecuteStartTimestamp: wsResponse.clientExecuteStartTimestamp,
        clientMessageSentTimestamp: wsResponse.clientMessageSentTimestamp,
        clientResponseReceivedTimestamp,
        serverMessageReceivedTimestamp: wsResponse.serverMessageReceivedTimestamp,
        serverResponseSentTimestamp: wsResponse.serverResponseSentTimestamp,
      };
      pushLogDataElement(newLogDataElement);
      showLogDataElement(newLogDataElement);
    },
    [pushLogDataElement, showLogDataElement]
  );

  const callbackOnNoOffload = useCallback(
    (
      result: ExecuteClassificationWithNoOffloadResult,
      clientExecuteStartTimestamp: number,
      clientExecutionFinishTimestamp: number
    ) => {
      const newLogDataElement: LogDataElement = {
        splitLayerName,
        inferenceTimeOnDevice: result.inferenceTimeOnDevice,
        inferenceTimeOnRemote: 0,
        clientExecuteStartTimestamp,
        clientMessageSentTimestamp: clientExecutionFinishTimestamp,
        clientResponseReceivedTimestamp: clientExecutionFinishTimestamp, // リモートでは実行されないため恣意的な値を利用
        serverMessageReceivedTimestamp: clientExecutionFinishTimestamp, // リモートでは実行されないため恣意的な値を利用
        serverResponseSentTimestamp: clientExecutionFinishTimestamp, // リモートでは実行されないため恣意的な値を利用
      };
      console.dir({ newLogDataElement });
      pushLogDataElement(newLogDataElement);
      showLogDataElement(newLogDataElement);
    },
    [pushLogDataElement, showLogDataElement]
  );

  const { sendWsMessage } = useWsResponse({ callbackOnWsResponse });
  const offloadTask = useOffloadTask(sendWsMessage);

  const intervalIdRef = useRef<number | null>(null);

  const startLoop = useCallback(() => {
    if (!executor) return;
    if (intervalIdRef.current != null) clearInterval(intervalIdRef.current);

    const tick = async () => {
      await runClassificationLoopWithoutWebcam(
        splitLayerName,
        executor,
        offloadTask,
        callbackOnNoOffload
      );
      if (logData.length === 10) {
        saveLogDataAsJson('logdata');
      }
    };

    intervalIdRef.current = window.setInterval(tick, intervalMs);
  }, [executor, intervalMs, logData, offloadTask, callbackOnNoOffload, saveLogDataAsJson]);

  // Start/Cleanup loop when ready
  useEffect(() => {
    if (executor && !modelLoading) startLoop();

    return () => {
      if (intervalIdRef.current != null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [executor, modelLoading, startLoop]);

  return (
    <>
      <p>You are genius!</p>
      <p>{logData.length !== 0 ? logData[0].inferenceTimeOnDevice : 0} </p>
    </>
  );
};

export default AutoClassifier;
