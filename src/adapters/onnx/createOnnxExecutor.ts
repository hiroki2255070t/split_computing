import * as ort from "onnxruntime-node";
import { ClassificationExecutor, TopKResult } from "../classificationExecutor";
import { executeClassification } from "./executeClassification";

export const createOnnxExecutor = (
  session: ort.InferenceSession
): ClassificationExecutor => {
  return {
    executeClassification: (
      features: Float32Array,
      shape: number[],
      splitLayerName: string
    ): Promise<{ top5: TopKResult[]; inferenceTimeOnRemote: number }> => {
      return executeClassification(session, features, shape, splitLayerName);
    },
  };
};
