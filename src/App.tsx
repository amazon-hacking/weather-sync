import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";

export default function App(): JSX.Element {
  return (
    <div>
      <h1>Autenticação</h1>
      <nav>
        <Link to="/login">Login</Link> | <Link to="/register">Registrar</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<p>Página não encontrada</p>} />
      </Routes>
    </div>
  );
}