import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoWeatherSync from "./assets/logo-weather-sync.png";

export default function PostLoginLanding(): JSX.Element {
  const [userName, setUserName] = useState<string>("");
  const navigate = useNavigate();

  useEffect(() => {
    const name = localStorage.getItem("userName");
    if (name) setUserName(name);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userName");
    navigate("/login");
  };

  return (
    <div className="min-vh-100" style={{ backgroundColor: '#e6f7ff' }}>
      {/* Header Section */}
      <div className="container-fluid text-white py-5" style={{ backgroundColor: '#1890ff' }}>
        <div className="container">
          <div className="row justify-content-center text-center">
            <div className="col-lg-8">
              <div className="mb-4">
                <img 
                  src={logoWeatherSync} 
                  alt="Weather Sync Logo" 
                  className="img-fluid mb-3"
                  style={{ maxHeight: '100px', width: 'auto' }}
                />
              </div>
              <h1 className="display-4 fw-bold mb-4 text-white">
                Olá, {userName || "usuário"}! 👋
              </h1>
              <p className="lead fs-5 mb-0">
                Seja bem-vindo(a) ao Weather Sync. Escolha o que deseja fazer agora
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5">
              <h2 className="h3 fw-bold mb-3" style={{ color: '#1890ff' }}>O que você gostaria de fazer?</h2>
              <p className="text-muted">Escolha uma das opções abaixo para começar</p>
            </div>
            
            <div className="row g-4 mb-5">
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <span className="fs-1">⚙️</span>
                    </div>
                    <h5 className="card-title fw-semibold">Configurar Bairros</h5>
                    <p className="card-text text-muted mb-4">
                      Selecione e configure os bairros que você deseja monitorar para receber atualizações meteorológicas
                    </p>
                    <button
                      className="btn btn-lg fw-semibold w-100"
                      style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                      onClick={() => navigate("/home")}
                    >
                      📍 Configurar Agora
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <span className="fs-1">📊</span>
                    </div>
                    <h5 className="card-title fw-semibold">Ver Dashboard</h5>
                    <p className="card-text text-muted mb-4">
                      Acesse gráficos, estatísticas e análises detalhadas sobre o clima das suas regiões favoritas
                    </p>
                    <button
                      className="btn btn-outline-secondary btn-lg fw-semibold w-100"
                      style={{ borderColor: '#1890ff', color: '#1890ff' }}
                      onClick={() => navigate("/dashboard")}
                    >
                      📈 Acessar Dashboard
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold" style={{ color: '#1890ff' }}>
                      🌤️
                    </h4>
                    <p className="text-muted small mb-0">Status do Sistema</p>
                    <small className="text-success fw-semibold">Online</small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-success">
                      ✅
                    </h4>
                    <p className="text-muted small mb-0">Conta Ativa</p>
                    <small className="text-success fw-semibold">Verificada</small>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-info">
                      🔔
                    </h4>
                    <p className="text-muted small mb-0">Notificações</p>
                    <small className="text-info fw-semibold">Ativas</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Quick Stats */}
<div className="container pb-5">
  <div className="row justify-content-center">
    <div className="col-lg-8">
      {/* 3 cards de status aqui */}
      
      {/* Logout Button Centered */}
      <div className="text-center mt-4">
        <button 
          className="btn btn-outline-danger fw-semibold px-4 py-2" 
          onClick={handleLogout}
        >
          🚪 Sair da Conta
        </button>
      </div>
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