import { vars } from "@styles/index.css";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const SPLASH_DURATION = 3000;
export const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION); // Hide splash after 8 seconds
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            style={{
              width: "100%",
              height: "100%",
            }}
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -100 }}
            transition={{
              duration: 0.6,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showSplash && (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.1 }}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              zIndex: 9999,
              backgroundColor: vars.colorVars.a7,
            }}
          >
            <motion.div
              initial={{
                width: "300px",
                height: "300px",
                borderRadius: "40px",
              }}
              animate={{
                width: "110vw",
                height: "120vh",
                borderRadius: "0",
              }}
              transition={{
                delay: 3,
                duration: 0.6,
                ease: [0.16, 1, 0.3, 1],
              }}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                backgroundColor: "white",
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  height: "100%",
                }}
              >
                hey
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export const SplashScreenWrapper = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const hasSeenSplash = sessionStorage.getItem("hasSeenSplash") === "true";
  const [_showSplash, setShowSplash] = useState(!hasSeenSplash);

  useEffect(() => {
    if (!hasSeenSplash) {
      setShowSplash(true);

      setTimeout(() => {
        setShowSplash(false);
        sessionStorage.setItem("hasSeenSplash", "true");
      }, SPLASH_DURATION + 300);
    }
  }, []);

  return (
    <>{hasSeenSplash ? children : <SplashScreen>{children}</SplashScreen>}</>
  );
};
