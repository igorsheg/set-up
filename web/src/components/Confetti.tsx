import React, { CSSProperties, useEffect, useRef } from "react";
import canvasConfetti, {
  CreateTypes,
  GlobalOptions,
  Options,
} from "canvas-confetti";

export interface IProps extends Options, GlobalOptions {
  fire?: boolean;
  reset?: boolean;
  width?: string | number;
  height?: string | number;
  className?: string;
  style?: CSSProperties;
  refConfetti?: (confetti: CreateTypes | null) => void;
  onDecay?: () => void;
  onFire?: () => void;
  onReset?: () => void;
}

const ReactCanvasConfetti: React.FC<IProps> = ({
  fire,
  reset,
  width,
  height,
  className,
  style,
  refConfetti,
  onDecay,
  onFire,
  onReset,
  ...confettiProps
}) => {
  const refCanvas = useRef<HTMLCanvasElement>(null);
  const confettiRef = useRef<CreateTypes | null>(null);

  useEffect(() => {
    if (!refCanvas.current) {
      return;
    }

    const { resize = true, useWorker = true } = confettiProps;
    const globalOptions: GlobalOptions = { resize, useWorker };

    confettiRef.current = canvasConfetti.create(
      refCanvas.current,
      globalOptions,
    );

    refConfetti && refConfetti(confettiRef.current);

    return () => {
      refConfetti && refConfetti(null);
    };
  }, [refConfetti, confettiProps]);

  useEffect(() => {
    if (fire) {
      onFire && onFire();
      const promise = confettiRef.current?.(confettiProps);
      promise && promise.then(() => onDecay && onDecay());
    }
  }, [fire, confettiProps, onDecay, onFire]);

  useEffect(() => {
    if (reset) {
      confettiRef.current?.reset();
      onReset && onReset();
    }
  }, [reset, onReset]);

  return (
    <canvas
      ref={refCanvas}
      style={style}
      className={className}
      width={width}
      height={height}
    />
  );
};

export default ReactCanvasConfetti;
