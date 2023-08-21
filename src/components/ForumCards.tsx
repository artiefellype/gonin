import { auth } from "@/firebase/authentication";
import { ForumCardProps, ForumProps, MessagesProps } from "@/types";
import Image from "next/image";
import React, { useImperativeHandle, useState } from "react";
import {
  FaPenToSquare as EditIcon,
  FaTrash as TrashIcon,
  FaCheck as CheckIcon,
  FaXmark as UncheckIcon,
} from "react-icons/fa6";

const ForumCards = ({
  post: {
    id,
    user_id,
    title,
    description,
    created_at,
    user_Name,
    user_photo_url,
  },
  onDelete,
  onUpdate,
  selectedCard,
  showModal,
}: ForumCardProps) => {
  const [isOpen, setIsOpen] = useState(false);

  const [inputTitle, setInputTitle] = useState(title);
  const [inputDescription, setInputDescription] = useState(description);

  const handleUpdate = (postId: string) => {
    const newPost: MessagesProps = {
      id: id,
      user_id: user_id,
      user_Name: user_Name,
      user_photo_url: user_photo_url,
      title: inputTitle,
      description: inputDescription,
      created_at: created_at,
    };

    onUpdate(postId, newPost);
    setIsOpen(false);
  };

  return (
    <>
      <div
        className="w-5/6 h-52 bg-white rounded-lg p-4"
        onClick={() => {
          selectedCard(id);
          showModal(true);
        }}
      >
        <div className="flex flex-row text-gray-800 relative">
          <div className="rounded-full m-3 bg-gray-500 w-12 h-12">
            <Image
              className="rounded-full"
              src={user_photo_url}
              alt={"use photo"}
              width={48}
              height={48}
            />
          </div>
          <div className="flex flex-col justify-center items-start">
            <h1 className="font-semibold text-base">{user_Name}</h1>
            <p className="font-light text-xs">{created_at}</p>
          </div>
          {auth.currentUser?.photoURL === user_photo_url && (
            <div className="absolute right-1 w-12 h-5 gap-2 flex">
              <button onClick={(e) => {
                e.stopPropagation()
                setIsOpen(true)
                }}>
                <EditIcon size={20} className="text-gray-500" />
              </button>
              <button onClick={(e) => {
                e.stopPropagation()
                onDelete(id)
                }}>
                <TrashIcon size={20} className="text-gray-500" />
              </button>
            </div>
          )}
        </div>

        <div className="w-full h-4/6 flex justify-center items-center">
          {!isOpen ? (
            <div className="w-full h-5/6 break-words text-clip">
              <h2 className="font-semibold text-sm text-gray-800 line-clamp-1">
                {title}
              </h2>
              <p className="font-medium text-xs text-gray-500 line-clamp-3">
                {description}
              </p>
            </div>
          ) : (
            <div className="w-full h-5/6 break-words text-clip">
              <input
                type="text"
                className="font-semibold text-sm text-gray-800 shadow border focus:outline-none focus:shadow-outline"
                value={inputTitle}
                onChange={(e) => setInputTitle(e.target.value)}
                onClick={(e)=> e.stopPropagation()}
              />
              <textarea
                className="font-medium text-xs text-gray-500  w-full shadow border focus:outline-none focus:shadow-outline"
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                onClick={(e)=> e.stopPropagation()}
              />
              <div className="w-full h-5 flex justify-start flex-row">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    setIsOpen(false)
                  }}
                  className="text-gray-200 border bg-red-600 w-9 h-7 flex justify-center items-center rounded-md"
                >
                  <UncheckIcon size={18} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUpdate(id)
                  }}
                  className="text-gray-200 border bg-green-600 w-9 h-7 flex justify-center items-center rounded-md"
                >
                  <CheckIcon size={18} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default ForumCards;
