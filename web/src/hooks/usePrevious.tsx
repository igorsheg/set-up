import { useEffect, useRef } from "react";
import { Data } from "src/types";

// 7. Custom hook to get previous state
export const usePrevious = (value: Data): Data => {
  const ref = useRef<Data>({} as Data);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
