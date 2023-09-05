import { LoaderVariants, loaderStyles } from "./Loader.css";

const Loader = (props: LoaderVariants) => {
  return <div className={loaderStyles({ theme: props?.theme })} />;
};

export default Loader;
