import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import api from "./api";


const bairrosDeBelem = [
  "Marco",
  "Nazaré",
  "Cremação",
  "Guamá",
  "Jurunas",
  "Terra Firme",
  "Telégrafo",
  "Pedreira",
  "Benguí",
  "Condor",
  "Coqueiro",
  "Sacramenta"
];

export default function Register(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [selectedBairros, setSelectedBairros] = useState<string[]>([]);

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      await api.post("/auth/register", {
        email,
        password,
        phoneNumber,
        bairros: selectedBairros,
        provider: "credentials",
      });
      alert("Usuário registrado com sucesso!");
    } catch (err: any) {
      alert("Erro ao registrar: " + err.response?.data?.message || "Erro desconhecido.");
    }
  };

  const toggleBairro = (bairro: string) => {
    setSelectedBairros((prev) =>
      prev.includes(bairro) ? prev.filter(b => b !== bairro) : [...prev, bairro]
    );
  };

  return (
    <form onSubmit={handleRegister}>
      <h2>Registro</h2>
      <input type="email" placeholder="E-mail" value={email} onChange={(e) => setEmail(e.target.value)} required />
      <input type="password" placeholder="Senha" value={password} onChange={(e) => setPassword(e.target.value)} required />
      <input type="tel" placeholder="Número de celular" value={phoneNumber} onChange={(e) => setPhoneNumber(e.target.value)} required />

      <fieldset>
        <legend>Bairros de Belém para receber notificações:</legend>
        {bairrosDeBelem.map((bairro) => (
          <label key={bairro} style={{ display: "block" }}>
            <input
              type="checkbox"
              value={bairro}
              checked={selectedBairros.includes(bairro)}
              onChange={() => toggleBairro(bairro)}
            />
            {bairro}
          </label>
        ))}
      </fieldset>

      <button type="submit">Registrar</button>
    </form>
  );
}
