import * as tf from '@tensorflow/tfjs';
import { executeClassificationWithNoOffload } from './executeClassificationWithNoOffload';
import { executeClassificationWithPartialOffload } from './executeClassificationWithPartialOffload';
import { type ClassificationExecutor } from '../classificationExecutor';

export const createTfjsExecutor = (model: tf.GraphModel): ClassificationExecutor => {
  return {
    executeWithNoOffload: (props) => {
      return executeClassificationWithNoOffload({ model, ...props });
    },
    executeWithPartialOffload: (props) => {
      return executeClassificationWithPartialOffload({ model, ...props });
    },
  };
};
