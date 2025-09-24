import * as ort from "onnxruntime-node";
import { Config } from "../config";
import { ClassificationExecutor } from "./classificationExecutor";
import { createOnnxExecutor } from "./onnx/createOnnxExecutor";

export async function initializeBackend(): Promise<ClassificationExecutor> {
  if (Config.BACKEND_LIBRARY === "onnx") {
    console.log("... [1/3] ONNX Runtimeバックエンドの初期化を開始 ...");
    console.log(
      `... [2/3] モデルの読み込みを開始します。パス: ${Config.MODEL_PATH_ONNX}`
    );
    const session = await ort.InferenceSession.create(Config.MODEL_PATH_ONNX);
    console.log("✅ [3/3] ONNX Runtimeセッションの作成に成功しました。");
    return createOnnxExecutor(session);
  } else {
    throw new Error(`Unsupported backend library: ${Config.BACKEND_LIBRARY}`);
  }
}
