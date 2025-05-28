import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "./api";
import { z } from "zod";

const registerSchema = z.object({
  name: z.string()
    .min(1, "Nome é obrigatório")
    .regex(/^[^\d]+$/, "O nome não pode conter números")
    .regex(/^(?!.*[A-Z]{2,}).*$/, "Use espaço entre nomes compostos (evite letras maiúsculas consecutivas)"),
  email: z.string()
    .email("E-mail inválido")
    .regex(/^[^@\s]+@[^@\s]+\.[^\d\s]+$/, "Domínio do e-mail não pode conter números"),
  password: z.string().min(6, "Senha muito curta"),
  phoneNumber: z.string().regex(/^\+55\d{8}$/, "Formato inválido. Use +55 e 8 dígitos."),
});


export default function Register(): JSX.Element {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [notifications, setNotifications] = useState(true);
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const validated = registerSchema.parse({
        name,
        email,
        password,
        phoneNumber,
      });

      const userData = {
        ...validated,
        provider: "credentials",
        notifications: notifications ? "yes" : "no",
      };

      console.log("Dados sendo enviados:", userData);
      const response = await api.post("/v1/auth/register", userData);
      console.log("Resposta do servidor:", response);
      navigate("/login");
    } catch (err: any) {
      if (err instanceof z.ZodError) {
        setErro(err.errors[0].message);
      } else if (err.response) {
        const errorMessage = err.response.data?.message || 
                             err.response.data?.error || 
                             `Erro do servidor: ${err.response.status}`;
        setErro(errorMessage);
      } else if (err.request) {
        setErro("Não foi possível conectar ao servidor. Verifique sua conexão.");
      } else {
        setErro("Erro ao processar a requisição.");
      }
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
                <span className="display-1">👋</span>
              </div>
              <h1 className="display-4 fw-bold mb-4 text-white">Crie sua conta</h1>
              <p className="lead fs-5 mb-0">
                Junte-se a nós e comece a acompanhar o clima de forma inteligente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Register Form Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-6 col-md-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body p-5">
                <h3 className="text-center mb-4" style={{ color: '#1890ff' }}>Criar Conta</h3>

                {erro && (
                  <div className="alert alert-danger" role="alert">
                    <div className="d-flex align-items-start">
                      <i className="text-danger me-2">⚠️</i>
                      <div>
                        <strong>Erro:</strong> {erro}
                        <small className="d-block mt-1 text-muted">
                          Se o problema persistir, verifique se todos os campos estão preenchidos corretamente.
                        </small>
                      </div>
                    </div>
                  </div>
                )}

                <form onSubmit={handleRegister}>
                  <div className="mb-3">
                    <label htmlFor="name" className="form-label fw-semibold">
                      👤 Nome completo
                    </label>
                    <input
                      type="text"
                      className="form-control form-control-lg"
                      id="name"
                      placeholder="Exemplo: João Miguel"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="email" className="form-label fw-semibold">
                      📧 E-mail
                    </label>
                    <input
                      type="email"
                      className="form-control form-control-lg"
                      id="email"
                      placeholder="Exemplo: teste@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="password" className="form-label fw-semibold">
                      🔒 Senha
                    </label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      id="password"
                      placeholder="Crie uma senha segura"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label fw-semibold">
                      📱 Número de celular
                    </label>
                    <input
                      type="tel"
                      className="form-control form-control-lg"
                      id="phoneNumber"
                      placeholder="Ex: +5588888888"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value)}
                      required
                    />
                  </div>

                  <div className="mb-4">
                    <div className="form-check">
                      <input
                        type="checkbox"
                        className="form-check-input"
                        id="notifications"
                        checked={notifications}
                        onChange={(e) => setNotifications(e.target.checked)}
                      />
                      <label className="form-check-label fw-semibold" htmlFor="notifications">
                        🔔 Desejo receber notificações meteorológicas
                      </label>
                    </div>
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
                        Criando conta...
                      </>
                    ) : (
                      "🎉 Criar conta gratuita"
                    )}
                  </button>
                </form>

                <div className="text-center">
                  <p className="text-muted mb-2">Já possui uma conta?</p>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    style={{ borderColor: '#1890ff', color: '#1890ff' }}
                    onClick={() => navigate("/login")}
                  >
                    🔑 Fazer login
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