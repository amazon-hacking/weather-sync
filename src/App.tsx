import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";

export default function App(): JSX.Element {
  return (
    <Router>
      <div>
        <h1>Autenticação</h1>
        <nav>
          <Link to="/login">Login</Link> | <Link to="/register">Registrar</Link>
        </nav>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="*" element={<p>Página não encontrada</p>} />
        </Routes>
      </div>
    </Router>
  );
}
