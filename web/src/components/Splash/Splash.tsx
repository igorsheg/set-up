import { FC, PropsWithChildren, SVGAttributes } from "react";
import * as styles from "./Splash.css";
import { AnimatePresence, motion } from "framer-motion";
import { cx } from "../../util/cx";

export const Rect: FC<PropsWithChildren<SVGAttributes<SVGSVGElement>>> = (
  props,
) => {
  return (
    <svg
      width={75}
      height={75}
      viewBox="0 0 75 75"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g filter="url(#filter0_b_409_229)">
        <rect
          x={0.346436}
          y={0.346436}
          width={74.2749}
          height={74.2749}
          rx={12}
          fill="#3D7773"
          fillOpacity={0.39}
        />
        <rect
          x={3.84644}
          y={3.84644}
          width={67.2749}
          height={67.2749}
          rx={8.5}
          stroke="#3D7773"
          strokeWidth={7}
        />
      </g>
      <defs>
        <filter
          id="filter0_b_409_229"
          x={-14.6536}
          y={-14.6536}
          width={104.275}
          height={104.275}
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity={0} result="BackgroundImageFix" />
          <feGaussianBlur in="BackgroundImageFix" stdDeviation={7.5} />
          <feComposite
            in2="SourceAlpha"
            operator="in"
            result="effect1_backgroundBlur_409_229"
          />
          <feBlend
            in="SourceGraphic"
            in2="effect1_backgroundBlur_409_229"
            result="shape"
          />
        </filter>
      </defs>
    </svg>
  );
};

const Circle: FC<PropsWithChildren<SVGAttributes<SVGSVGElement>>> = (props) => {
  return (
    <svg
      width={66}
      height={65}
      viewBox="0 0 66 65"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <ellipse
        cx={32.7539}
        cy={32.334}
        rx={32.7539}
        ry={32.334}
        fill="#414E9B"
      />
    </svg>
  );
};

const Triangle: FC<PropsWithChildren<SVGAttributes<SVGSVGElement>>> = (
  props,
) => {
  return (
    <svg
      width={71}
      height={64}
      viewBox="0 0 71 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M42.995 8.01l22.84 39.56c3.272 5.667-.817 12.75-7.36 12.75H12.792c-6.543 0-10.632-7.083-7.36-12.75l22.84-39.56c3.271-5.667 11.45-5.667 14.722 0z"
        stroke="#F8503E"
        strokeWidth={7}
      />
    </svg>
  );
};
const cardMotionVars = {
  initial: { opacity: 0, y: 5, scale: 1 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: 0, scale: 0.9 },
};

const shapes = [
  { styles: styles.rect, shape: Rect },
  { styles: styles.circle, shape: Circle },
  { styles: styles.triangle, shape: Triangle },
];

export const Splash: FC<{ show: boolean }> = ({ show }) => {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          variants={cardMotionVars}
          initial="initial"
          animate="animate"
          exit="exit"
          transition={{ type: "spring", damping: 20, stiffness: 300 }}
        >
          <div className={styles.container}>
            {shapes.map((item, i) => {
              const Shape = item.shape;
              return (
                <Shape key={i} className={cx(styles.shape, item.styles)} />
              );
            })}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
