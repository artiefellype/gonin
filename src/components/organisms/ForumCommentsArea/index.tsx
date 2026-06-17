import { ForumComment } from "@/components/molecules/ForumComment";
import { PostCommentWithUserProps } from "@/types";

export interface ForumCommentsArea {
  comments: PostCommentWithUserProps[];
  loading: boolean;
}

export const ForumCommentsArea = ({ comments, loading }: ForumCommentsArea) => {
  return (
    <section className="w-full rounded-lg border border-slate-200 bg-whiteColor shadow-sm">
      <div className="border-b border-slate-200 px-4 py-3">
        <h2 className="text-base font-bold text-primary">Comentários</h2>
        <p className="text-xs font-light text-slate-500">
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
        <div className="space-y-4 p-4">
          {[0, 1].map((item) => (
            <div key={item} className="flex animate-pulse gap-3">
              <div className="h-10 w-10 rounded-full bg-slate-400" />
              <div className="flex-1 space-y-3">
                <div className="h-4 w-40 rounded bg-slate-400" />
                <div className="h-4 w-full rounded bg-slate-400" />
                <div className="h-4 w-3/4 rounded bg-slate-400" />
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
