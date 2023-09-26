import { shapeStyles } from "@components/Card/Card.css";
import { useEffect, useMemo, useState } from "react";
import { cx } from "../../util/cx";
import { splashScreenContentShapes } from "./Splash.css";
import Diamond from "@components/Card/Diamond";
import Oval from "@components/Card/Oval";
import Squiggle from "@components/Card/Squiggle";

type ShapeStyle = {
  color: "green" | "purple" | "red";
  shading: "outlined" | "striped" | "solid";
};

const getRandomElement = (arr: string[]) =>
  arr[Math.floor(Math.random() * arr.length)];

export const RunningShapes = () => {
  const [activeShapeIndex, setActiveShapeIndex] = useState(0);

  const [currentStyle, setCurrentStyle] = useState<ShapeStyle>({
    color: "red",
    shading: "solid",
  });

  const colors: ShapeStyle["color"][] = useMemo(
    () => ["red", "purple", "green"],
    [],
  );
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
  }, [colors, shadings]);

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
