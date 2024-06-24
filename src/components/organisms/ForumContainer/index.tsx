import React, { useState } from "react";
import { ForumPosts } from "../../molecules/ForumPosts";
import { ForumProps, HomeProps, MessagesProps, PostProps } from "@/types";
import ForumCardInfo from "../ForumCardInfo";
import { FaRegRectangleXmark as CloseIcon } from "react-icons/fa6";
import CardSkeleton from "../../atoms/CardSkeleton";

const ForumContainer = ({
  posts,
  loading
}: HomeProps) => {

  const sortedPosts = posts.sort((a: PostProps, b: PostProps) => {
    const dateA = new Date(
      a.createdAt.replace(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
        "$3-$2-$1T$4:$5:$6"
      )
    ).getTime();
    const dateB = new Date(
      b.createdAt.replace(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
        "$3-$2-$1T$4:$5:$6"
      )
    ).getTime();

    return dateB - dateA;
  });


  return (
    <div className="md:w-full w-screen px-3 md:px-0 min-h-screen md:max-w-4xl flex flex-col items-center gap-y-5 pb-5 relative">
      {loading && <CardSkeleton />}
      {!loading && sortedPosts.length !== 0 ? (
        sortedPosts.map((item) => {
          return (
            <ForumPosts
              key={item.id}
              post={item}
            />
          );
        })
      ) : (
        <div>Vazio</div>
      )}
    </div>
  );
};

export default ForumContainer;
