import React, { useState } from "react";
import Image from "next/image";
import { formatDate } from "@/services/utils/formaters";
import { UserProps } from "@/types";
import { UserServices } from "@/services/userServices";

export interface ForumCommentProps {
  userName: string;
  userPhotoURL: string;
  commentCreatedDate: string;
  commentContent: string;
}

export const ForumComment = ({
  userName,
  userPhotoURL,
  commentContent,
  commentCreatedDate,
}: ForumCommentProps) => {
  return (
    <div className="w-full mt-1 flex flex-col justify-start items-center gap-1">
      <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-row relative">
        <div className="flex rounded-full m-2 bg-gray-500 w-full max-w-[2.5rem] h-10">
          <Image
            className="rounded-full "
            src={userPhotoURL}
            alt={"user photo"}
            width={40}
            height={40}
          />
        </div>

        <div className="flex flex-col pt-2 w-full">
          <div className="flex">
            <div className="flex md:flex-row md:m-0 mb-3 flex-col md:gap-3 justify-center items-center">
              <h1 className="text-base font-bold">{userName}</h1>
              <p className="font-light text-xs text-left">
                {formatDate(commentCreatedDate)}
              </p>
            </div>
          </div>

          <div className=" flex justify-center items-center">
            <div className="w-full break-words text-clip mb-3">
              <p className="font-normal text-sm text-gray-500 mb-2">
                {commentContent}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
