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
    <article className="flex w-full gap-3 border-b border-borderDark px-3 py-4 last:border-b-0 sm:px-4">
      <div className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-borderDark bg-secondary sm:h-10 sm:w-10">
        <Image
          className="h-full w-full object-cover"
          src={userPhotoURL || "/imgs/default_perfil.jpg"}
          alt={"user photo"}
          width={40}
          height={40}
        />
      </div>

      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1">
          <h3 className="flex min-w-0 items-center gap-1 text-[15px] font-semibold text-primary sm:text-base">
            {userName}
            {userTag ? (
              <span className="mt-1">
                <FaRocket className="animate-blinkAnimation" />
              </span>
            ) : (
              ""
            )}
          </h3>
          <p className="text-xs font-medium text-mutedText">
            {formatDate(commentCreatedDate)}
          </p>
        </div>
        <p className="whitespace-pre-wrap break-words text-sm font-normal leading-6 text-mutedText">
          {commentContent}
        </p>
      </div>
    </article>
  );
};
