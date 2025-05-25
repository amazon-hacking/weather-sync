import React from "react";
import { useNavigate } from "react-router-dom";
import logoWeatherSync from "./assets/logo-weather-sync.png";

export default function LandingPage(): JSX.Element {
  const navigate = useNavigate();

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
                  style={{ maxHeight: '120px', width: 'auto' }}
                />
              </div>
              
              <p className="lead fs-4 mb-0">
                Acompanhe o clima das suas regiões favoritas de forma prática e inteligente
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-10">
            <div className="text-center mb-5">
              <h2 className="h3 fw-bold mb-3" style={{ color: '#1890ff' }}>O que você pode fazer com o Weather Sync</h2>
              <p className="text-muted">Recursos pensados para facilitar seu dia a dia</p>
            </div>
            
            <div className="row g-4 mb-5">
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <span className="fs-1">📍</span>
                    </div>
                    <h5 className="card-title fw-semibold">Selecione Locais</h5>
                    <p className="card-text text-muted small">
                      Escolha bairros e regiões de interesse para monitoramento
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <span className="fs-1">🔔</span>
                    </div>
                    <h5 className="card-title fw-semibold">Notificações Smart</h5>
                    <p className="card-text text-muted small">
                      Ative ou desative alertas personalizados para cada local
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <span className="fs-1">📊</span>
                    </div>
                    <h5 className="card-title fw-semibold">Previsões Precisas</h5>
                    <p className="card-text text-muted small">
                      Interface simples com dados meteorológicos atualizados
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-6 col-lg-3">
                <div className="card h-100 border-0 shadow-sm">
                  <div className="card-body text-center p-4">
                    <div className="mb-3">
                      <span className="fs-1">📱</span>
                    </div>
                    <h5 className="card-title fw-semibold">Acesso Total</h5>
                    <p className="card-text text-muted small">
                      Mantenha-se informado de qualquer lugar, a qualquer hora
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="container-fluid bg-white py-5 border-top">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <h3 className="fw-bold mb-3">Pronto para começar?</h3>
              <p className="text-muted mb-4">
                Crie sua conta gratuita e comece a acompanhar o clima da sua região agora mesmo
              </p>
              
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center">
                <button 
                  className="btn btn-lg px-5 py-3 fw-semibold shadow-sm"
                  style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                  onClick={() => navigate("/register")}
                >
                  ➕ Criar Conta Grátis
                </button>
                <button 
                  className="btn btn-outline btn-lg px-5 py-3 fw-semibold"
                  style={{ borderColor: '#1890ff', color: '#1890ff' }}
                  onClick={() => navigate("/login")}
                >
                  🔑 Já tenho conta
                </button>
              </div>
              
              <p className="small text-muted mt-3 mb-0">
                🛡️ 100% gratuito • Sem compromisso • Cancele quando quiser
              </p>
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