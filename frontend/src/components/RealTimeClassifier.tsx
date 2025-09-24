import React, { useRef, useEffect, useCallback, useMemo } from 'react';
import { useOffloadTask } from '../utils/offload/useOffloadTask';
import { useWebcam } from '../hooks/useWebcam';
import { useWsResponse } from '../hooks/useWsResponse';
import { useTabSelector } from '../hooks/useTabSelector';
import { useSplitLayerName } from '../hooks/useSplitLayerName';
import { useLogData } from '../hooks/useLogData';
import { useExecutorContext } from '../contexts/executorContext';
import { modelMetadata } from '../data/models/efficientNetV2_S/metadataOnnx';
import TabSelector from './TabSelector';
import { LogDataDownloader } from './LogDataDownloader';
import { runClassificationLoop } from '../utils/classification/runClassifiationLoop';
import { drawClassificationResult } from '../utils/classification/drawClassificationResult';
import type { WsResponse } from '../api/types';
import type { LogDataElement } from '../types';
import type { ExecuteClassificationWithNoOffloadResult } from '../adapter/classificationExecutor';

const RealTimeClassifier: React.FC = () => {
  const { executor, loading: modelLoading, status: modelStatus } = useExecutorContext();
  const { videoRef, canvasRef, webcamStatus, cameraReady } = useWebcam(modelLoading);

  const {
    logData,
    pushLogDataElement,
    showLogDataElement,
    saveLogDataAsJson,
    saveAnalyzedDataAsJson,
  } = useLogData();

  // 分割点を選択するタブに表示させる文字列を定義
  const formatSplitTabLabel = useCallback((value: number): string => {
    if (value === 0) return 'Full_Offload';
    if (value === modelMetadata.splitLayers.length + 1) return 'No_Offload';
    return value < modelMetadata.splitLayers.length + 1
      ? modelMetadata.splitLayers[value - 1].splitLayerNameAbbreviation
      : 'undefined';
  }, []);

  // フレームキャプチャの間隔を選択するタブに表示させる文字列を定義
  const formatFrameIntervalLabel = useCallback((value: number): string => {
    return String((value + 1) * 200);
  }, []);

  const { selectedValue: selectedSplitLayerName, handleTabClick: handleSplitLayerNameTabClick } =
    useTabSelector(0);
  const { splitLayerName, handleSplitLayerNameOnValueChange } = useSplitLayerName({
    modelName: 'EfficientNetV2-S',
  });

  const {
    selectedValue: selectedFrameCaptureInterval,
    handleTabClick: handleFrameCaptureIntervalTabClick,
  } = useTabSelector(4);

  const intervalMs = useMemo(
    () => (selectedFrameCaptureInterval + 1) * 200,
    [selectedFrameCaptureInterval]
  );

  const callbackOnWsResponse = useCallback(
    (wsResponse: WsResponse, clientResponseReceivedTimestamp: number) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawClassificationResult(wsResponse.top5, ctx);
      }

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
    [splitLayerName, pushLogDataElement, showLogDataElement, canvasRef]
  );

  const callbackOnNoOffload = useCallback(
    (
      result: ExecuteClassificationWithNoOffloadResult,
      clientExecuteStartTimestamp: number,
      clientExecutionFinishTimestamp: number
    ) => {
      const ctx = canvasRef.current?.getContext('2d');
      if (ctx) {
        drawClassificationResult(result.top5, ctx);
      }

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
      pushLogDataElement(newLogDataElement);
      showLogDataElement(newLogDataElement);
    },
    [splitLayerName, pushLogDataElement, showLogDataElement, canvasRef]
  );

  const { sendWsMessage } = useWsResponse({ callbackOnWsResponse });
  const offloadTask = useOffloadTask(sendWsMessage);

  const intervalIdRef = useRef<number | null>(null);

  const startLoop = useCallback(() => {
    if (!executor || !videoRef.current || !canvasRef.current) return;
    if (intervalIdRef.current != null) clearInterval(intervalIdRef.current);

    const tick = async () => {
      await runClassificationLoop(
        videoRef.current!,
        splitLayerName,
        executor,
        offloadTask,
        callbackOnNoOffload
      );
    };

    intervalIdRef.current = window.setInterval(tick, intervalMs);
  }, [executor, splitLayerName, intervalMs, offloadTask, callbackOnNoOffload, videoRef, canvasRef]);

  // Start/Cleanup loop when ready
  useEffect(() => {
    if (executor && !modelLoading && cameraReady) startLoop();

    return () => {
      if (intervalIdRef.current != null) {
        clearInterval(intervalIdRef.current);
        intervalIdRef.current = null;
      }
    };
  }, [executor, modelLoading, cameraReady, startLoop]);

  // Reflect tab change into splitLayerName state
  useEffect(() => {
    handleSplitLayerNameOnValueChange(selectedSplitLayerName);
  }, [selectedSplitLayerName, handleSplitLayerNameOnValueChange]);

  // ▼ クリックで JSON をダウンロード（依存関係修正）
  const handleSaveLogsClick = useCallback(() => {
    // ファイル名は未指定→タイムスタンプ付きデフォルト名で保存
    saveLogDataAsJson();
    saveAnalyzedDataAsJson();
  }, [saveLogDataAsJson, saveAnalyzedDataAsJson]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h1 className="text-4xl font-bold mb-4">Real-Time Classification 🚀</h1>
      <div className="relative w-full max-w-4xl aspect-video rounded-2xl shadow-2xl overflow-hidden ring-1 ring-white/10">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover transform scale-x-[-1]"
        />
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full z-10" />
        {(modelLoading || webcamStatus !== 'Webcam ready.') && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <p className="text-xl">{modelLoading ? modelStatus : webcamStatus}</p>
          </div>
        )}
      </div>
      <p className="mt-4 text-gray-400">{modelStatus}</p>
      <TabSelector
        selectedValue={selectedSplitLayerName}
        numberOfTabs={modelMetadata.splitLayers.length + 2} // +2 でno-offload＆full-offloadを追加
        onTabClick={handleSplitLayerNameTabClick}
        whatShowed={formatSplitTabLabel}
      />
      <TabSelector
        selectedValue={selectedFrameCaptureInterval}
        numberOfTabs={10} // フレームキャプチャの間隔は10段階で調整
        onTabClick={handleFrameCaptureIntervalTabClick}
        whatShowed={formatFrameIntervalLabel}
      />
      <LogDataDownloader logData={logData} handleSaveLogsClick={handleSaveLogsClick} />
    </div>
  );
};

export default RealTimeClassifier;
