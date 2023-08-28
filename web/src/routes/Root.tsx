import React from "react";
import { Outlet } from "react-router-dom";
import { rootStyles } from "./Root.css";
import Box from "@components/Box/Box";

const RootLayout: React.FC = () => {
  console.log("RootLayout is rendering");
  return (
    <Box gap={0} vaul-drawer-wrapper="" className={rootStyles}>
      <Outlet />
    </Box>
  );
};

export default RootLayout;
