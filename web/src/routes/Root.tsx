import React from "react";
import { Outlet } from "react-router-dom";
import { rootRouteContentStyles, rootRouteWrapStyles } from "./Root.css";
import Box from "@components/Box/Box";

const RootLayout: React.FC = () => {
  return (
    <Box gap={0} vaul-drawer-wrapper="" className={rootRouteWrapStyles}>
      <Box gap={0} className={rootRouteContentStyles}>
        <Outlet />
      </Box>
    </Box>
  );
};

export default RootLayout;
