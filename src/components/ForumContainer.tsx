import React, { useState } from "react";
import ForumCards from "./ForumCards";
import { ForumProps, MessagesProps } from "@/types";
import ForumCardInfo from "./ForumCardInfo";
import { FaRegRectangleXmark as CloseIcon } from "react-icons/fa6";
import CardSkeleton from "./utils/CardSkeleton";

const ForumContainer = ({
  messages,
  onDelete,
  onUpdate,
  onLike,
}: ForumProps) => {
  const [showModal, setShowModal] = useState(false);
  const [selectedCard, setSelectedCard] = useState("");

  const sortedMessages = messages.sort((a: MessagesProps, b: MessagesProps) => {
    const dateA = new Date(
      a.created_at.replace(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
        "$3-$2-$1T$4:$5:$6"
      )
    ).getTime();
    const dateB = new Date(
      b.created_at.replace(
        /(\d{2})\/(\d{2})\/(\d{4}), (\d{2}):(\d{2}):(\d{2})/,
        "$3-$2-$1T$4:$5:$6"
      )
    ).getTime();

    return dateB - dateA;
  });

  //console.log("IsOpen: ", showModal, " Card: ", selectedCard);

  return (
    <div className="w-full min-h-screen max-w-3xl flex flex-col items-center pt-10 gap-y-5 pb-5 relative">
      {sortedMessages.length !== 0 ? (
        sortedMessages.map((item) => {
          return (
            <ForumCards
              key={item.id}
              post={item}
              onDelete={onDelete}
              onUpdate={onUpdate}
              showModal={setShowModal}
              selectedCard={setSelectedCard}
              onLike={onLike}
            />
          );
        })
      ) : (
        <CardSkeleton />
      )}
      {showModal && (
        <div className="fixed w-full h-full bg-[rgba(17,25,40,.75)] border-[rgba(255,255,255,.125)] backdrop-filter backdrop-blur-[16px] backdrop-saturate-[180%] inset-0 p-5 z-10 flex justify-center">
          <div className="w-full max-w-6xl h-fit overflow-y-hidden bg-white flex flex-col items-center pb-5 relative rounded-lg">
            <div className="w-full h-8 flex justify-end items-center pr-2">
              <button onClick={() => setShowModal(false)} className="">
                <CloseIcon className="text-gray-700" size={24} />
              </button>
            </div>
            {sortedMessages.map((item) => {
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
      )}
    </div>
  );
};

export default ForumContainer;
