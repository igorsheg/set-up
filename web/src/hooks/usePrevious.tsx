import { useEffect, useRef } from "react";

export const usePrevious = (value: any): any => {
  const ref = useRef<any>({} as any);
  useEffect(() => {
    ref.current = value;
  }, [value]);
  return ref.current;
};
