import React from "react";
import { Outlet } from "react-router-dom";
import { rootStyles, rootStylesMain } from "./Root.css";
import Box from "@components/Box/Box";

const RootLayout: React.FC = () => {
  return (
    <Box gap={0} vaul-drawer-wrapper="" className={rootStyles}>
      <Box gap={0} className={rootStylesMain}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default RootLayout;
