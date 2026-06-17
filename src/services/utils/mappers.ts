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
  "animes-e-mangas": { backgroundColor: "#EEE6F2", color: "#5B4A62" },
  "livros-e-literatura": { backgroundColor: "#E4E9DD", color: "#52665A" },
  discussao: { backgroundColor: "#EFE3D8", color: "#7A5143" },
  "espaco-livre": { backgroundColor: "#E5E8E1", color: "#4E6257" },
  tecnologia: { backgroundColor: "#ECE3CD", color: "#6D5A36" },
  curiosidades: { backgroundColor: "#F0E1C9", color: "#7A5930" },
  feedbacks: { backgroundColor: "#EFE0E3", color: "#76505C" },
  ciencia: { backgroundColor: "#DDE9E6", color: "#496761" },
  programacao: { backgroundColor: "#E1E5EA", color: "#4D5667" },
  "filmes-e-series": { backgroundColor: "#E8E4DA", color: "#5B554B" },
  games: { backgroundColor: "#DFE8DC", color: "#4F654A" },
  culinaria: { backgroundColor: "#F0E2CB", color: "#755934" },
  "ajuda-e-suporte": { backgroundColor: "#F0DDDA", color: "#7B4D45" },
  "musica-e-arte": { backgroundColor: "#EEE4EC", color: "#675064" },
  "boas-vindas": { backgroundColor: "#E2E9DD", color: "#4D654B" },
};
