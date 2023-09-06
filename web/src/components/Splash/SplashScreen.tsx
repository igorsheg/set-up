import { AnimatePresence, motion } from "framer-motion";
import { FC, PropsWithChildren, useState } from "react";
import {
  revealContent,
  splashContent,
  splashMask,
  splashScreenWrap,
} from "./Splash.css";
import { RunningShapes } from "./RunningShapes";

const SPLASH_DURATION = 2300;

interface SplashScreenProps {}

export const SplashScreenWrapper: FC<PropsWithChildren<SplashScreenProps>> = ({
  children,
}) => {
  const hasSeenSplash = sessionStorage.getItem("hasSeenSplash") === "true";
  const [showSplash, setShowSplash] = useState(!hasSeenSplash);

  const handleAnimatonComplete = () => {
    setTimeout(() => {
      setShowSplash(false);
      sessionStorage.setItem("hasSeenSplash", "true");
    }, SPLASH_DURATION);
  };

  return (
    <div className={splashScreenWrap}>
      <motion.div
        initial={showSplash}
        animate={{ clipPath: "circle(100% at 50% 50%)" }}
        onAnimationStart={handleAnimatonComplete}
        transition={{
          delay: 2,
          duration: 0.8,
          ease: [0.87, 0, 0.13, 1],
        }}
        className={splashMask}
      >
        <AnimatePresence>
          {showSplash && (
            <motion.div
              exit={{ opacity: 0 }}
              transition={{ duration: 0.1 }}
              className={splashContent}
            >
              <RunningShapes />
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!showSplash && (
            <motion.div
              exit={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              initial={{ opacity: 0 }}
              className={revealContent}
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
