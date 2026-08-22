import { CSSProperties } from "react";

type TagTitleMap = {
  [key: string]: string;
};

type TagStyleMap = {
  [key: string]: CSSProperties;
};

const tagTitleMap: TagTitleMap = {
  "animes-e-mangas": "Animes e Mangás",
  "livros-e-literatura": "Livros e Literatura",
  "discussao": "Discussão Geral",
  "espaco-livre": "Espaço Livre",
  tecnologia: "Tecnologia",
  curiosidades: "Curiosidades",
  feedbacks: "Feedbacks",
  ciencia: "Ciência",
  programacao: "Programação",
  "filmes-e-series": "Filmes e Séries",
  games: "Games",
  culinaria: "Culinária e Gastronomia",
  "ajuda-e-suporte": "Ajuda e Suporte",
  "musica-e-arte": "Música e Arte",
  "boas-vindas": "Boas-vindas",
};

export const getTitleFromTag = (tag: string): string => {
  return tagTitleMap[tag] || "Tópico";
};

export const tagStyleMap: TagStyleMap = {
  "animes-e-mangas": { backgroundColor: "#111B3E", color: "#82ABFF" },
  "livros-e-literatura": { backgroundColor: "#111B3E", color: "#82ABFF" },
  discussao: { backgroundColor: "#3D2420", color: "#FFB29F" },
  "espaco-livre": { backgroundColor: "#111B3E", color: "#82ABFF" },
  tecnologia: { backgroundColor: "#111B3E", color: "#82ABFF" },
  curiosidades: { backgroundColor: "#3A2F16", color: "#F2C96D" },
  feedbacks: { backgroundColor: "#3D2420", color: "#FFB29F" },
  ciencia: { backgroundColor: "#111B3E", color: "#82ABFF" },
  programacao: { backgroundColor: "#111B3E", color: "#82ABFF" },
  "filmes-e-series": { backgroundColor: "#2B2444", color: "#C8B7FF" },
  games: { backgroundColor: "#111B3E", color: "#82ABFF" },
  culinaria: { backgroundColor: "#3A2F16", color: "#F2C96D" },
  "ajuda-e-suporte": { backgroundColor: "#3D2420", color: "#FFB29F" },
  "musica-e-arte": { backgroundColor: "#2B2444", color: "#C8B7FF" },
  "boas-vindas": { backgroundColor: "#111B3E", color: "#82ABFF" },
};
