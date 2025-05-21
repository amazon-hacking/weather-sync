import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Login(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post("/v1/auth/login", { email, password });

<<<<<<< HEAD
=======
      // Salva o token retornado
>>>>>>> f51a4edc8d997dd68e7032b85a191f7aba36eaea
      localStorage.setItem("token", res.data.token);

      alert("Login realizado com sucesso!");
      navigate("/home");
    } catch (err: any) {
      alert(
        "Erro ao fazer login: " +
          (err.response?.data?.message || "Erro desconhecido.")
      );
    }
  };

  return (
<<<<<<< HEAD
    <div className="auth-form-container">
      <form onSubmit={handleLogin} className="auth-form">
=======
    <div className="auth-form-container"> {/* Novo container para centralizar */}
      <form onSubmit={handleLogin} className="auth-form"> {/* Nova classe para o form */}
>>>>>>> f51a4edc8d997dd68e7032b85a191f7aba36eaea
        <h2 className="mb-4">Login</h2>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">Senha</label>
          <input
            type="password"
            className="form-control"
            id="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="btn btn-primary">Entrar</button>
<<<<<<< HEAD

        {/* Link para registro */}
        <div className="mt-3 text-center">
          <span>Não possui uma conta? </span>
          <button
            type="button"
            className="btn btn-link p-0"
            onClick={() => navigate("/register")}
          >
            Registre-se
          </button>
        </div>
=======
>>>>>>> f51a4edc8d997dd68e7032b85a191f7aba36eaea
      </form>
    </div>
  );
}