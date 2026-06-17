import Image from "next/image";
import { formatDate } from "@/services/utils/formaters";
import { FaRocket } from "react-icons/fa6";

export interface ForumCommentProps {
  userName: string;
  userPhotoURL: string;
  userTag: string;
  commentCreatedDate: string;
  commentContent: string;
}

export const ForumComment = ({
  userName,
  userPhotoURL,
  commentContent,
  userTag,
  commentCreatedDate,
}: ForumCommentProps) => {
  return (
    <article className="flex w-full gap-3 border-b border-slate-200 px-4 py-4 last:border-b-0">
      <div className="flex h-10 w-10 shrink-0 rounded-full bg-gray-500">
        <Image
          className="rounded-full object-cover"
          src={userPhotoURL || "/imgs/default_perfil.jpg"}
          alt={"user photo"}
          width={40}
          height={40}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="flex items-center gap-1 text-base font-bold text-primary">
            {userName}
            {userTag ? (
              <span className="mt-1">
                <FaRocket className="animate-blinkAnimation" />
              </span>
            ) : (
              ""
            )}
          </h3>
          <p className="text-xs font-light text-slate-500">
            {formatDate(commentCreatedDate)}
          </p>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm font-normal leading-6 text-gray-600">
          {commentContent}
        </p>
      </div>
    </article>
  );
};
