import { Route, Routes, Navigate } from "react-router-dom";

import Home from "../pages/Home";
import Orders from "../pages/Orders";
import Products from "../pages/Products";
import Users from "../pages/Users";

import { ScrollToTop } from "../components/common/ScrollToTop";
import AppLayout from "../layout/AppLayout";

const Routers = () => {
  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route element={<AppLayout />}>
          <Route path="/" element={<Navigate to="/home" replace/>} />
          <Route path="/home" element={<Home />} />
          <Route path="/orders" element={<Orders />} />
          <Route path="/products" element={<Products />} />
          <Route path="/users" element={<Users />} />
        </Route>
      </Routes>
    </>
  );
};

export default Routers;
