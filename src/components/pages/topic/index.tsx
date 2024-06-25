import TopicDivider from "@/components/atoms/topicDivider";
import ForumComposerArea from "@/components/molecules/forumComposerArea";
import ForumContainer from "@/components/organisms/forumContainer";
import { useUserContext } from "@/context";
import { postsServices } from "@/services/postServices";
import { UserServices } from "@/services/userServices";
import { getTitleFromTag } from "@/services/utils/mappers";
import { PostProps, UserProps } from "@/types";
import { DocumentData } from "firebase/firestore";
import React, { useEffect, useRef, useState } from "react";

interface TopicPageProps {
  tag: string;
}

export const TopicPage = ({ tag }: TopicPageProps) => {
  const [posts, setPosts] = useState<DocumentData[]>([]);
  const [lastDoc, setLastDoc] = useState<DocumentData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPosts = async (reset = false) => {
    setLoading(true);
    try {
      const { posts: newPosts, lastVisible } =
        await postsServices.getPostsByTag(tag, reset ? null : lastDoc);

      const updatedPosts = [...posts];
      newPosts.forEach((newPost: PostProps) => {
        const isExistingPost = updatedPosts.some(
          (existingPost) => existingPost.id === newPost.id
        );
        if (!isExistingPost) {
          updatedPosts.push(newPost);
        }
      });

      setPosts(updatedPosts);
      setLastDoc(lastVisible);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(true);
  }, [tag]);

  return (
    <div className="md:w-full w-screen px-3 md:px-0 min-h-screen  md:max-w-4xl flex flex-col items-center pt-10 gap-y-2 pb-5 relative">
      <ForumComposerArea tag={tag} fetchNewPosts={fetchPosts} />
      <TopicDivider tag={tag} />
      <ForumContainer
        posts={posts as PostProps[]}
        loading={loading}
        fetch={fetchPosts}
        setPosts={setPosts}
      />
    </div>
  );
};
