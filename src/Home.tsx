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
            originallyFavorite: b.isFavorite, // ← usado para detectar mudanças
          }))
        );
      })
      .catch((err) => {
        console.error("Erro ao buscar bairros:", err);
        setErro("Você não está autorizado. Faça login para continuar.");
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

    try {
      for (const bairro of bairros) {
        if (bairro.isFavorite && bairro.originallyFavorite !== true) {
          // Adicionar novo favorito
          await fetch("http://localhost:8080/v1/favorite-places", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ placeId: bairro.id }),
          });
        } else if (!bairro.isFavorite && bairro.originallyFavorite === true) {
          // Remover favorito antigo
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
    } catch (err) {
      console.error("Erro ao atualizar configurações:", err);
      alert("Erro ao salvar configurações.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    alert("Logout realizado com sucesso!");
    navigate("/login");
  };

  return (
    <div className="col-md-6 offset-md-3">
      <div className="d-flex justify-content-end mb-3">
        <button className="btn btn-outline-danger" onClick={handleLogout}>
          Sair
        </button>
      </div>

      <h2 className="mb-4">Configurar bairros favoritos</h2>

      {erro && <div className="alert alert-danger">{erro}</div>}

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
          <button className="btn btn-primary" onClick={handleSalvar}>
            Atualizar configurações
          </button>
        </div>
      )}
    </div>
  );
}
