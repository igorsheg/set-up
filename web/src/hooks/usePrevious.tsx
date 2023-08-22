import { useEffect, useRef } from "react";

// 7. Custom hook to get previous state
export const usePrevious = (value: any): any => {
  const ref = useRef<any>({} as any);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
