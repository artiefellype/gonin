import { ForumTopic, TopicProps } from "@/components/molecules/ForumTopic";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";

export const TopicsPage = () => {
  const topicsData: TopicProps[] = [
    {
      icon: "/imgs/topics/Welcome aboard-pana.svg",
      title: "Boas-vindas",
      link: "/topics/boas-vindas",
    },
    {
      icon: "/imgs/topics/Group discussion-pana.svg",
      title: "Discussão Geral",
      link: "/topics/discussao",
    },
    {
      icon: "/imgs/topics/manga.png",
      title: "Animes e Mangás",
      link: "/topics/animes-e-mangas",
    },
    {
      icon: "/imgs/topics/World Press Freedom Day-cuate.svg",
      title: "Espaço Livre",
      link: "/topics/espaco-livre",
    },
    {
      icon: "/imgs/topics/Cool robot-bro.svg",
      title: "Tecnologia",
      link: "/topics/tecnologia",
    },
    {
      icon: "/imgs/topics/curiosity child-rafiki.svg",
      title: "Curiosidade",
      link: "/topics/curiosidade",
    },
    {
      icon: "/imgs/topics/Science-pana.svg",
      title: "Ciência e Natureza",
      link: "/topics/ciencia-e-natureza",
    },
    {
      icon: "/imgs/topics/Developer activity-pana.svg",
      title: "Programação",
      link: "/topics/programacao",
    },
    {
      icon: "/imgs/topics/Book lover-bro.svg",
      title: "Livros e Literatura",
      link: "/topics/livros-e-literatura",
    },
    {
      icon: "/imgs/topics/Movie Night-bro.svg",
      title: "Filmes e Séries",
      link: "/topics/filmes-e-series",
    },
    {
      icon: "/imgs/topics/Horror video game-amico.svg",
      title: "Games",
      link: "/topics/games",
    },
    {
      icon: "/imgs/topics/Cooking-pana.svg",
      title: "Culinária",
      link: "/topics/culinaria",
    },
    {
      icon: "/imgs/topics/Playing Music-bro.svg",
      title: "Música e Arte",
      link: "/topics/musica-e-arte",
    },
    {
      icon: "/imgs/topics/Feedback-pana.svg",
      title: "Feedbacks",
      link: "/topics/feedbacks",
    },
    {
      icon: "/imgs/topics/Active Support-pana.svg",
      title: "Suporte e Ajuda",
      link: "/topics/suporte-e-ajuda",
    },
  ];

  return (
    <div className="md:w-full w-screen px-3 md:px-0 md:max-w-4xl gap-4 flex flex-wrap justify-start items-start pt-10 gap-y-5 pb-5 relative">
      {topicsData.map((item) => {
        return (
          <ForumTopic key={item.title} icon={item.icon} title={item.title} link={item.link} />
        );
      })}
    </div>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
