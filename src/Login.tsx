import React, { useState } from "react";
import api from "./api";

export default function Login(): JSX.Element {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const res = await api.post("/v1/auth/login", {
        email,
        password,
      });
      alert("Login realizado!");
      console.log("Usuário:", res.data);
    } catch (err: any) {
      alert("Erro ao fazer login: " + err.response?.data?.message || "Erro desconhecido.");
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <h2>Login</h2>
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <button type="submit">Entrar</button>
    </form>
  );
}
