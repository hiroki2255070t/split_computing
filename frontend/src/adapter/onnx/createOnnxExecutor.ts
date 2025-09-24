import * as ort from 'onnxruntime-web';
import { executeClassificationWithNoOffload } from './executeClassificationWithNoOffload';
import { executeClassificationWithPartialOffload } from './executeClassificationWithPartialOffload';
import { type ClassificationExecutor } from '../classificationExecutor';

export const createOnnxExecutor = (session: ort.InferenceSession): ClassificationExecutor => {
  return {
    executeWithNoOffload: (props) => {
      return executeClassificationWithNoOffload({ session, ...props });
    },
    executeWithPartialOffload: (props) => {
      return executeClassificationWithPartialOffload({ session, ...props });
    },
  };
};
