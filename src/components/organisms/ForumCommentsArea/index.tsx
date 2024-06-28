import React, { useEffect } from "react";
import Image from "next/image";
import { ForumComment } from "@/components/molecules/ForumComment";
import { PostCommentsProps, PostCommentWithUserProps } from "@/types";

export interface ForumCommentsArea {
  comments: PostCommentWithUserProps[];
  loading: boolean;
}

export const ForumCommentsArea = ({ comments, loading }: ForumCommentsArea) => {
  return (
    <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-col relative">
      {!loading &&
        comments.map((comment) => (
          <ForumComment
            key={comment.createdAt}
            userTag={comment.user?.tag!!}
            userPhotoURL={comment.user?.photoURL!!}
            userName={comment.user?.displayName!!}
            commentCreatedDate={comment.createdAt}
            commentContent={comment.content}
          />
        ))}
      {loading && (
        <div className="w-full h-screen mt-10 flex flex-col justify-start items-center gap-1">
          <div className="flex rounded-full m-2 w-full max-w-[2.5rem] h-10 animate-pulse">
            <div className="w-10 h-10 rounded-full bg-slate-400"></div>
          </div>
          <div className="flex flex-col pt-2 w-full">
            <div className="flex">
              <div className="flex md:flex-row md:m-0 mb-3 flex-col md:gap-3 justify-center items-center">
                <div className="h-5 w-28 bg-slate-400 rounded animate-pulse"></div>
                <div className="h-5 w-16 bg-slate-400 rounded animate-pulse"></div>
              </div>
            </div>

            <div className=" flex justify-center items-center">
              <div className="w-full break-words text-clip mb-3">
                <div className="gap-2 flex flex-col mt-2">
                  <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                  <div className="h-5 w-full bg-slate-400 rounded animate-pulse"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
