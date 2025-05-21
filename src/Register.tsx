import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Register(): JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notifications, setNotifications] = useState(true);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/v1/auth/register", {
        name,
        email,
        password,
        phoneNumber,
        provider: "credentials",
        notifications: notifications ? "yes" : "no"
      });
      alert("Usuário registrado com sucesso!");
      navigate("/login");
    } catch (err: any) {
      alert("Erro ao registrar: " + err.response?.data?.message || "Erro desconhecido.");
    }
  };

  return (
    <div className="auth-form-container"> {/* Novo container para centralizar */}
      <form onSubmit={handleRegister} className="auth-form"> {/* Nova classe para o form */}
        <h2 className="mb-4">Registrar usuário</h2>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">Nome</label>
          <input
            type="text"
            className="form-control"
            id="name"
            placeholder="Exemplo: João Miguel"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">E-mail</label>
          <input
            type="email"
            className="form-control"
            id="email"
            placeholder="Exemplo: teste@gmail.com"
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
            placeholder="*******"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <div className="mb-3">
          <label htmlFor="phoneNumber" className="form-label">Número de celular</label>
          <input
            type="tel"
            className="form-control"
            id="phoneNumber"
            placeholder="Ex: 91912345678"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            required
          />
        </div>

        <div className="mb-3 form-check">
          <input
            type="checkbox"
            className="form-check-input"
            id="notifications"
            checked={notifications}
            onChange={(e) => setNotifications(e.target.checked)}
          />
          <label className="form-check-label" htmlFor="notifications">Desejo receber notificações</label>
        </div>

        <button type="submit" className="btn btn-primary">Registrar</button>
      </form>
    </div>
  );
}