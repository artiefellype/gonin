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
  "tecnologia": "Tecnologia",
  "curiosidades": "Curiosidades",
  "feedbacks": "Feedbacks",
  "ciencia": "Ciência",
  "programacao": "Programação",
  "filmes-e-series": "Filmes e Séries",
  "games": "Games",
  "culinaria": "Culinária e Gastronomia",
  "ajuda-e-suporte": "Ajuda e Suporte",
  "musica-e-arte": "Música e Arte",
  "boas-vindas": "Boas-vindas",
};

export const getTitleFromTag = (tag: string): string => {
  return tagTitleMap[tag] || "Título Padrão";
};

export const tagStyleMap: TagStyleMap = {
  "animes-e-mangas": { backgroundColor: "#E9D8FD", color: "#6B46C1" },
  "livros-e-literatura": { backgroundColor: "#C6F6D5", color: "#2F855A" },
  "discussao": { backgroundColor: "#FEB2B2", color: "#C53030" },
  "espaco-livre": { backgroundColor: "#BEE3F8", color: "#2B6CB0" },
  "tecnologia": { backgroundColor: "#FEFCBF", color: "#D69E2E" },
  "curiosidades": { backgroundColor: "#FBD38D", color: "#DD6B20" },
  "feedbacks": { backgroundColor: "#FED7E2", color: "#B83280" },
  "ciencia": { backgroundColor: "#B2F5EA", color: "#319795" },
  "programacao": { backgroundColor: "#EBF4FF", color: "#5A67D8" },
  "filmes-e-series": { backgroundColor: "#EDF2F7", color: "#4A5568" },
  "games": { backgroundColor: "#E6FFFA", color: "#38A169" },
  "culinaria": { backgroundColor: "#FAF089", color: "#B7791F" },
  "ajuda-e-suporte": { backgroundColor: "#FED7D7", color: "#E53E3E" },
  "musica-e-arte": { backgroundColor: "#FAF5FF", color: "#805AD5" },
  "boas-vindas": { backgroundColor: "#F0FFF4", color: "#276749" },
};
