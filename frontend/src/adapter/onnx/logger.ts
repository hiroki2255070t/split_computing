import { Tensor } from 'onnxruntime-web';

export const showOnnxTensorInfo = ({
  tensor,
  tensorName,
}: {
  tensor: Tensor;
  tensorName: string;
}) => {
  const shape = tensor.dims;
  const elementSize = (() => {
    switch (tensor.type) {
      case 'float32':
      case 'int32':
        return 4;
      case 'float64':
      case 'int64':
        return 8;
      case 'bool':
        return 1;
      case 'uint8':
      case 'int8':
        return 1;
      case 'uint16':
      case 'int16':
        return 2;
      case 'uint32':
        return 4;
      default:
        return 4; // fallback
    }
  })();

  const numElements = tensor.size;
  const byteSize = numElements * elementSize;

  console.log(`${tensorName}: ${shape} | ${byteSize} bytes`);
};
