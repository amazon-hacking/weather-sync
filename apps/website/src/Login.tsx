import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";

export default function Login(): JSX.Element {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [erro, setErro] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setErro("");

    try {
      const res = await api.post("/v1/auth/login", { email, password });
      localStorage.setItem("token", res.data.token);
      navigate("/home");
    } catch (err: any) {
      setErro(err.response?.data?.message || "Erro ao fazer login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#e6f7ff' }}>
      {/* Header Section */}
      <div className="container-fluid text-white py-5" style={{ backgroundColor: '#1890ff' }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="mb-4">
                <span className="display-1">🔑</span>
              </div>
              <h1 className="display-4 fw-bold mb-4 text-white">Entrar na sua conta</h1>
              <p className="lead fs-5 mb-0">
                Acesse sua conta e continue acompanhando o clima das suas regiões favoritas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Login Form Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-5 col-md-7">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <h3 className="text-center mb-4" style={{ color: '#1890ff' }}>Login</h3>

                {erro && (
                  <div className="alert alert-danger" role="alert">
                    <i className="text-danger me-2">⚠️</i>
                    {erro}
                  </div>
                )}

                <form onSubmit={handleLogin}>
                  <div className="mb-4">
                    <label htmlFor="email" className="form-label fw-semibold">
                      📧 E-mail
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      placeholder="Digite seu e-mail"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold">
                      🔒 Senha
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      placeholder="Digite sua senha"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    className="btn btn-lg w-100 fw-semibold mb-4"
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2"></span>
                        Entrando...
                      </>
                    ) : (
                      "🚀 Entrar"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-2">Não possui uma conta ainda?</p>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{ borderColor: '#1890ff', color: '#1890ff' }}
                    onClick={() => navigate("/register")}
                  >
                    ➕ Criar conta gratuita
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Back to Landing */}
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-auto">
            <button
              className="btn btn-link text-muted"
              onClick={() => navigate("/")}
            >
              ← Voltar ao início
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="py-4" style={{ backgroundColor: '#262626', color: '#fff' }}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-6">
              <p className="mb-0">
                <strong>Weather Sync</strong> - Seu companheiro meteorológico
              </p>
            </div>
            <div className="col-md-6 text-md-end">
              <small className="text-muted">
                © 2025 Weather Sync. Todos os direitos reservados.
              </small>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}