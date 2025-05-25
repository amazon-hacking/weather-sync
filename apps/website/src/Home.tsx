import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

type Bairro = {
  id: number;
  name: string;
  isFavorite: boolean;
  originallyFavorite?: boolean;
};

export default function Home(): JSX.Element {
  const [bairros, setBairros] = useState<Bairro[]>([]);
  const [erro, setErro] = useState<string>("");
  const [mensagem, setMensagem] = useState<string>("");
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;

    fetch("http://localhost:8080/v1/favorite-places", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error("unauthorized");
        const json = await res.json();

        const favoritos = json.data.userRelationsPlaces as Bairro[];

        setBairros(
          favoritos.map((b) => ({
            ...b,
            originallyFavorite: b.isFavorite,
          }))
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar bairros:", err);
        setErro("Você não está autorizado. Faça login para continuar.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleToggleFavorito = (id: number) => {
    setBairros((prev) =>
      prev.map((bairro) =>
        bairro.id === id
          ? { ...bairro, isFavorite: !bairro.isFavorite }
          : bairro
      )
    );
  };

  const handleSalvar = async () => {
    const token = localStorage.getItem("token");
    setSalvando(true);
    setMensagem("");
    setErro("");

    try {
      for (const bairro of bairros) {
        if (bairro.isFavorite && bairro.originallyFavorite !== true) {
          await fetch("http://localhost:8080/v1/favorite-places", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ placeId: bairro.id }),
          });
        } else if (!bairro.isFavorite && bairro.originallyFavorite === true) {
          await fetch(
            `http://localhost:8080/v1/favorite-places/${bairro.id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }
      }

      setMensagem("Configurações atualizadas com sucesso!");
      setTimeout(() => window.location.reload(), 1200);
    } catch (err) {
      console.error("Erro ao atualizar configurações:", err);
      setErro("Erro ao salvar configurações.");
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
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
                <span className="display-1">⚙️</span>
              </div>
              <h1 className="display-4 fw-bold mb-4 text-white">Seus Bairros Favoritos</h1>
              <p className="lead fs-5 mb-0">
                Configure quais bairros você deseja acompanhar e receber notificações
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content Section */}
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8 col-md-10">
            {/* Alerts */}
            {erro && (
              <div className="alert alert-danger d-flex align-items-center mb-4">
                <span className="me-2">⚠️</span>
                {erro}
              </div>
            )}
            
            {mensagem && (
              <div className="alert alert-success d-flex align-items-center mb-4">
                <span className="me-2">✅</span>
                {mensagem}
              </div>
            )}

            {/* Main Card */}
            <div className="card border-0 shadow-lg">
              <div className="card-header py-4" style={{ backgroundColor: '#f8f9fa' }}>
                <h3 className="mb-0" style={{ color: '#1890ff' }}>
                  📍 Configurar Bairros Favoritos
                </h3>
                <p className="text-muted mb-0 mt-2">
                  Selecione os bairros que você quer monitorar
                </p>
              </div>

              <div className="card-body p-4">
                {loading ? (
                  <div className="text-center py-5">
                    <div className="spinner-border" style={{ color: '#1890ff' }}></div>
                    <p className="mt-3 text-muted">Carregando bairros...</p>
                  </div>
                ) : (
                  <>
                    {bairros.length === 0 ? (
                      <div className="text-center py-5">
                        <span className="display-4">📍</span>
                        <h5 className="mt-3 text-muted">Nenhum bairro disponível</h5>
                        <p className="text-muted">Não foi possível carregar os bairros disponíveis.</p>
                      </div>
                    ) : (
                      <div className="list-group list-group-flush">
                        {bairros.map((bairro, index) => (
                          <div
                            key={bairro.id}
                            className="list-group-item border-0 d-flex justify-content-between align-items-center py-3"
                            style={{ backgroundColor: index % 2 === 0 ? '#f8f9fa' : 'white' }}
                          >
                            <div className="d-flex align-items-center">
                              <span className="me-3">🏘️</span>
                              <div>
                                <h6 className="mb-0 fw-semibold">{bairro.name}</h6>
                                {bairro.isFavorite && (
                                  <small className="text-success">
                                    ⭐ Favoritado
                                  </small>
                                )}
                              </div>
                            </div>
                            
                            <button
                              className={`btn btn-sm fw-semibold ${
                                bairro.isFavorite
                                  ? "btn-outline-danger"
                                  : "btn-outline-primary"
                              }`}
                              style={{
                                borderColor: bairro.isFavorite ? '#dc3545' : '#1890ff',
                                color: bairro.isFavorite ? '#dc3545' : '#1890ff'
                              }}
                              onClick={() => handleToggleFavorito(bairro.id)}
                            >
                              {bairro.isFavorite ? "❌ Remover" : "➕ Adicionar"}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {bairros.length > 0 && (
                      <div className="d-flex justify-content-between align-items-center mt-4 pt-3 border-top">
                        <button
                          className="btn btn-outline-danger"
                          onClick={handleLogout}
                        >
                          🚪 Sair da conta
                        </button>
                        
                        <button
                          className="btn btn-lg fw-semibold"
                          style={{ backgroundColor: '#1890ff', borderColor: '#1890ff', color: 'white' }}
                          onClick={handleSalvar}
                          disabled={salvando}
                        >
                          {salvando ? (
                            <>
                              <span className="spinner-border spinner-border-sm me-2"></span>
                              Salvando...
                            </>
                          ) : (
                            "💾 Salvar Configurações"
                          )}
                        </button>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="container pb-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="row g-3">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold" style={{ color: '#1890ff' }}>
                      {bairros.length}
                    </h4>
                    <p className="text-muted small mb-0">Bairros disponíveis</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-success">
                      {bairros.filter(b => b.isFavorite).length}
                    </h4>
                    <p className="text-muted small mb-0">Bairros favoritados</p>
                  </div>
                </div>
              </div>
              
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center">
                    <h4 className="fw-bold text-warning">
                      {bairros.filter(b => b.isFavorite !== b.originallyFavorite).length}
                    </h4>
                    <p className="text-muted small mb-0">Alterações pendentes</p>
                  </div>
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