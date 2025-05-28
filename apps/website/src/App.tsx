import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import LandingPage from "./LandingPage";
import PostLoginLanding from "./PostLoginLanding";
import Dashboard from "./Dashboard";

export default function App(): JSX.Element {
  return (
    <div>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="/welcome" element={<PostLoginLanding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="*" element={<p className="text-danger p-4">Página não encontrada</p>} />
      </Routes>
    </div>
  );
}