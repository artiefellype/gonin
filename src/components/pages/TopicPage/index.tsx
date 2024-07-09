
import { CustomDivider} from "@/components/atoms/CustomDivider";
import { ForumComposerArea } from "@/components/molecules/ForumComposer";
import ForumContainer from "@/components/organisms/ForumContainer";
import { postsServices } from "@/services/postServices";
import { PostProps } from "@/types";
import { DocumentData } from "firebase/firestore";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";

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
      <CustomDivider tag={tag}/>
      <ForumContainer
        posts={posts as PostProps[]}
        loading={loading}
        fetch={fetchPosts}
        setPosts={setPosts}
      />
    </div>
  );
};


export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.gonin_token) {
    return {
      redirect: {
        destination: "/login",
        permanent: false,
      },
    };
  }

  return {
    props: {},
  };
};
