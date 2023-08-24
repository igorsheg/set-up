import React, { useState, createContext } from "react";
import { darkTheme, lightTheme } from "../styles/index.css";
import { styleWrapperStyles } from "./ThemeProvider.css";

const ThemeContext = createContext({
  theme: "",
  toggleTheme: () => console.log(),
});

const StyleWrapper: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [theme, setTheme] = useState(lightTheme);

  const toggleTheme = () => {
    setTheme((prevValue) =>
      prevValue === lightTheme ? darkTheme : lightTheme,
    );
  };
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={`${lightTheme} ${styleWrapperStyles}`}>{children}</div>
    </ThemeContext.Provider>
  );
};

export { StyleWrapper, ThemeContext };