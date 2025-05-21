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
  const [salvando, setSalvando] = useState(false);
  const [loading, setLoading] = useState(true); // ← estado de carregamento
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
        setLoading(false); // ← fim do carregamento
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

      alert("Configurações atualizadas com sucesso!");
      window.location.reload(); // Recarrega a página após sucesso
    } catch (err) {
      console.error("Erro ao atualizar configurações:", err);
      alert("Erro ao salvar configurações.");
    } finally {
      setSalvando(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout realizado com sucesso!");
    navigate("/login");
  };

  return (
    <div className="col-md-6 offset-md-3">
      <div className="d-flex justify-content-end mb-3"></div>

      <h2 className="mb-4">Configurar bairros favoritos</h2>

      {erro && <div className="alert alert-danger">{erro}</div>}

      {loading ? (
        <p>Carregando bairros...</p>
      ) : (
        <>
          <ul className="list-group">
            {bairros.map((bairro) => (
              <li
                key={bairro.id}
                className="list-group-item d-flex justify-content-between align-items-center"
              >
                <span>
                  {bairro.name}
                  {bairro.isFavorite && (
                    <span className="badge bg-success ms-2">favorito</span>
                  )}
                </span>
                <button
                  className={`btn btn-sm ${
                    bairro.isFavorite
                      ? "btn-outline-danger"
                      : "btn-outline-primary"
                  }`}
                  onClick={() => handleToggleFavorito(bairro.id)}
                >
                  {bairro.isFavorite ? "Remover" : "Adicionar"}
                </button>
              </li>
            ))}
          </ul>


          {bairros.length > 0 && (
            <div className="mt-4 d-flex justify-content-end">
              <button
                className="btn btn-primary"
                onClick={handleSalvar}
                disabled={salvando}
              >
                {salvando ? "Salvando..." : "Atualizar configurações"}
              </button>
            </div>
            
          )}
          
        </>
      )}
      
          <button className="btn btn-outline-danger mt-3" onClick={handleLogout}>
            Sair
          </button>
    </div>
  );
}
