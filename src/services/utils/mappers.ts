type TagTitleMap = {
  [key: string]: string;
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
  "boas-vindas": "Boas-vindas"
};

export const getTitleFromTag = (tag: string): string => {
  return tagTitleMap[tag] || "Título Padrão";
};
