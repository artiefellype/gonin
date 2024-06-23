import React, { useState } from "react";
import { ForumPosts } from "../../molecules/ForumPosts";
import { ForumProps, HomeProps, MessagesProps, PostProps } from "@/types";
import ForumCardInfo from "../ForumCardInfo";
import { FaRegRectangleXmark as CloseIcon } from "react-icons/fa6";
import CardSkeleton from "../../atoms/CardSkeleton";

const ForumContainer = ({
  posts
}: HomeProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");

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
    <div className="md:w-full w-screen px-3 md:px-0 min-h-screen  md:max-w-4xl flex flex-col items-center pt-10 gap-y-5 pb-5 relative">
      {sortedPosts.length !== 0 ? (
        sortedPosts.map((item) => {
          return (
            <ForumPosts
              key={item.id}
              post={item}
            />
          );
        })
      ) : (
        <CardSkeleton />
      )}
      {/* {showModal && (
        <div className="fixed w-full h-full bg-[rgba(17,25,40,.75)] border-[rgba(255,255,255,.125)] backdrop-filter backdrop-blur-[16px] backdrop-saturate-[180%] inset-0 p-5 z-10 flex justify-center">
          <div className="w-full max-w-6xl h-fit overflow-y-hidden bg-white flex flex-col items-center pb-5 relative rounded-lg">
            <div className="w-full h-8 flex justify-end items-center pr-2">
              <button onClick={() => setShowModal(false)} className="">
                <CloseIcon className="text-gray-700" size={24} />
              </button>
            </div>
            {sortedPosts.map((item) => {
              if (item.id === selectedCard) {
                return (
                  <ForumCardInfo
                    key={item.id}
                    post={item}
                    onDelete={onDelete}
                    onUpdate={onUpdate}
                    selectedCard={setSelectedCard}
                    showModal={setShowModal}
                    onLike={onLike}
                  />
                );
              } else {
                <div>VAZIO</div>;
              }
            })}
          </div>
        </div>
      )} */}
    </div>
  );
};

export default ForumContainer;
