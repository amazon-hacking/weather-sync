import React from "react";
import { Routes, Route, Navigate, Link } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";

export default function App(): JSX.Element {
  return (
    <div className="container mt-5"> {/* Container do Bootstrap para centralizar */}
      <h1>Weather Sync</h1>
      {/*<nav className="nav justify-content-center mb-4 navbar-climate">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Registrar</Link>
        <Link to="/home" className="nav-link">Dados</Link> {/* Adicione um link para a Home *
      </nav>*/}
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/home" element={<Home />} />
        <Route path="*" element={<p className="text-danger">Página não encontrada</p>} />
      </Routes>
    </div>
  );
}