import { useEffect, useState } from "react";

export const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 746);
  useEffect(() => {
    const resizeObserver = new ResizeObserver(() => {
      setIsMobile(window.innerWidth < 746);
    });

    resizeObserver.observe(document.body);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  return isMobile;
};
