import { shapeStyles } from "@components/Card/Card.css";
import Diamond from "@components/Card/Diamond";
import Oval from "@components/Card/Oval";
import Squiggle from "@components/Card/Squiggle";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import {
  splashScreenContentShapes,
  splashScreenContentWrap,
  splashScreenWrap,
} from "./Splash.css";
import { cx } from "../../util/cx";

const SPLASH_DURATION = 3000;
export const SplashScreen = ({ children }: { children: React.ReactNode }) => {
  const [showSplash, setShowSplash] = useState(true);

  const cardMotionVariants = {
    initial: { opacity: 0, y: 50 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -50 },
  };
  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), SPLASH_DURATION + 50);
    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <AnimatePresence>
        {!showSplash && (
          <motion.div
            initial="initial"
            animate="animate"
            exit="exit"
            transition={{ type: "spring" }}
            variants={cardMotionVariants}
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
            className={splashScreenWrap}
          >
            <motion.div
              className={splashScreenContentWrap}
              animate={{
                width: "110vw",
                height: "100vh",
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
                zIndex: 2,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  width: "100%",
                  position: "relative",
                  height: "100%",
                }}
              >
                <RunningShapes />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
type ShapeStyle = {
  color: "green" | "purple" | "red";
  shading: "outlined" | "striped" | "solid";
};

const getRandomElement = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

const RunningShapes = () => {
  const [activeShapeIndex, setActiveShapeIndex] = useState(0);

  const [currentStyle, setCurrentStyle] = useState<ShapeStyle>({
    color: "red",
    shading: "solid",
  });

  const colors: ShapeStyle["color"][] = ["red", "purple", "green"];
  const shadings: ShapeStyle["shading"][] = ["outlined", "striped", "solid"];

  useEffect(() => {
    const timer = setInterval(() => {
      const newStyle = {
        color: getRandomElement(colors) as ShapeStyle["color"],
        shading: getRandomElement(shadings) as ShapeStyle["shading"],
      };

      setCurrentStyle(newStyle);
    }, 500);

    return () => clearInterval(timer);
  }, []);

  const appliedStyles = shapeStyles({
    color: currentStyle.color,
    shading: currentStyle.shading,
  });

  const shapes = [
    <Diamond className={cx(splashScreenContentShapes, appliedStyles)} />,
    <Oval className={cx(splashScreenContentShapes, appliedStyles)} />,
    <Squiggle className={cx(splashScreenContentShapes, appliedStyles)} />,
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveShapeIndex((prevIndex) => (prevIndex + 1) % shapes.length);
    }, 500);

    return () => {
      clearInterval(timer);
    };
  }, []);

  return <div>{shapes[activeShapeIndex]}</div>;
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
      }, SPLASH_DURATION + 150);
    }
  }, []);

  return (
    <>{hasSeenSplash ? children : <SplashScreen>{children}</SplashScreen>}</>
  );
};
