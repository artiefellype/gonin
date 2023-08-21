import React from "react";
import ForumCards from "./ForumCards";
import { ForumProps, MessagesProps } from "@/types";

const ForumContainer = ({ messages, onDelete, onUpdate }: ForumProps) => {
    
  const sortedMessages = messages
    .sort((a: MessagesProps, b: MessagesProps) => {
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
    })
    .slice(0, 8);

  return (
    <div className="w-full min-h-screen flex flex-col items-center pt-10 gap-y-5 pb-5 relative">
      {sortedMessages.length !== 0 ? (
        sortedMessages.map((item) => {
          return (
            <ForumCards
              key={item.id}
              post={item}
              onDelete={onDelete}
              onUpdate={onUpdate}
            />
          );
        })
      ) : (
        <div>
          <h1 className="text-base font-semibold text-gray-600">
            Ops!, Sem conteúdo
          </h1>
        </div>
      )}
    </div>
  );
};

export default ForumContainer;
