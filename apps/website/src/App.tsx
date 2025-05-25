import React from "react";
import { Routes, Route } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import Home from "./Home";
import LandingPage from "./LandingPage"; 

export default function App(): JSX.Element {
  return (
    <div > {/* Container do Bootstrap para centralizar */}
      
      {/*<nav className="nav justify-content-center mb-4 navbar-climate">
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/register" className="nav-link">Registrar</Link>
        <Link to="/home" className="nav-link">Dados</Link> {/* Adicione um link para a Home *
      </nav>*/}
      <Routes>
         <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/home" element={<Home />} />
      <Route path="*" element={<p className="text-danger p-4">Página não encontrada</p>} />
      </Routes>
    </div>
  );
}