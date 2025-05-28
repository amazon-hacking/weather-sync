import React from "react";
import { useNavigate } from "react-router-dom";
import logoWeatherSync from "./assets/logo-weather-sync.png";

export default function Dashboard(): JSX.Element {
  const navigate = useNavigate();

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
              <h1 className="display-4 fw-bold mb-4 text-white">Dashboard Meteorológico</h1>
              <p className="lead fs-5 mb-0">
                Visualize dados e estatísticas do clima das suas regiões favoritas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Coming Soon Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="card border-0 shadow-lg">
              <div className="card-body text-center p-5">
                <div className="mb-4">
                  <span className="display-1">🚧</span>
                </div>
                <h3 className="fw-bold mb-3" style={{ color: '#1890ff' }}>
                  Dashboard em Desenvolvimento
                </h3>
                <p className="text-muted fs-5 mb-4">
                  Estamos trabalhando para trazer recursos incríveis para você acompanhar 
                  o clima de forma ainda mais detalhada e intuitiva.
                </p>
                
                <div className="row g-3 mb-4">
                  <div className="col-md-4">
                    <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="card-body p-3">
                        <h6 className="fw-semibold" style={{ color: '#1890ff' }}>
                          📊 Gráficos Interativos
                        </h6>
                        <small className="text-muted">
                          Visualize tendências climáticas
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="card-body p-3">
                        <h6 className="fw-semibold" style={{ color: '#1890ff' }}>
                          🌡️ Análises Detalhadas
                        </h6>
                        <small className="text-muted">
                          Dados meteorológicos completos
                        </small>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-md-4">
                    <div className="card border-0" style={{ backgroundColor: '#f8f9fa' }}>
                      <div className="card-body p-3">
                        <h6 className="fw-semibold" style={{ color: '#1890ff' }}>
                          📈 Previsões Avançadas
                        </h6>
                        <small className="text-muted">
                          Alertas personalizados
                        </small>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                  <button
                    className="btn btn-lg fw-semibold"
                    style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                    onClick={() => navigate("/welcome")}
                  >
                    🏠 Voltar ao Início
                  </button>

                  <button
                    className="btn btn-outline-secondary btn-lg fw-semibold"
                    style={{ borderColor: '#1890ff', color: '#1890ff' }}
                    onClick={() => navigate("/home")}
                  >
                    ⚙️ Configurar Bairros
                  </button>

                  <button
                    className="btn btn-outline-danger btn-lg fw-semibold"
                    onClick={handleLogout}
                  >
                    🚪 Sair da Conta
                  </button>
                </div>
              </div>
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