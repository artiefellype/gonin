import { ForumComment } from "@/components/molecules/ForumComment";
import { PostCommentWithUserProps } from "@/types";

export interface ForumCommentsArea {
  comments: PostCommentWithUserProps[];
  loading: boolean;
}

export const ForumCommentsArea = ({ comments, loading }: ForumCommentsArea) => {
  return (
    <section className="w-full rounded-xl border border-borderDark bg-panel/90 shadow-lg md:rounded-lg">
      <div className="border-b border-borderDark px-3 py-3 sm:px-4">
        <h2 className="text-base font-bold text-primary">Comentários</h2>
        <p className="text-xs font-medium text-mutedText">
          Continue a conversa abaixo.
        </p>
      </div>

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
        <div className="space-y-4 p-3 sm:p-4">
          {[0, 1].map((item) => (
            <div key={item} className="flex animate-pulse gap-3">
              <div className="h-10 w-10 rounded-full bg-secondary" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-40 rounded bg-secondary" />
                <div className="h-4 w-full rounded bg-secondary" />
                <div className="h-4 w-3/4 rounded bg-secondary" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
