import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Register(): JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notifications, setNotifications] = useState(true); // ✅ padrão: deseja receber

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
        notifications: notifications ? "yes" : "no" // ✅ envio compatível com backend
      });
      alert("Usuário registrado com sucesso!");
      navigate("/login");
    } catch (err: any) {
      alert("Erro ao registrar: " + err.response?.data?.message || "Erro desconhecido.");
    }
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registro</h2>
      <input type="text" placeholder="Nome" value={name} onChange={(e) => setName(e.target.value)} required />
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="tel" placeholder="Número de celular" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

      {/* ✅ Opção para notificações */}
      <label style={{ display: "block", marginTop: "10px" }}>
        <input
          type="checkbox"
          checked={notifications}
          onChange={(e) => setNotifications(e.target.checked)}
        />
        Desejo receber notificações
      </label>

      <button type="submit">Registrar</button>
    </form>
  );
}
