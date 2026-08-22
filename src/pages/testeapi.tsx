// pages/posts.tsx
import Head from "next/head";
import { useEffect, useState } from "react";
import { postsServices } from "@/services/postServices";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";

const PostsPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const fetchedPosts = await postsServices.getPosts();
        setPosts(fetchedPosts);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchPosts();
  }, []);

  useEffect(() => {
    const fetchPostComments = async () => {
      try {
        const response = await postsServices.getAllComments('ID')
      } catch (error:any) {
        console.error(error.message)
      }
    };

    fetchPostComments();
  }, []);

  return (
    <div className="min-h-[100svh] bg-transparent px-3 py-6 text-primary sm:px-4">
      <Head>
        <title>Teste API - Gonin</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <main className="mx-auto w-full max-w-2xl rounded-2xl border border-borderDark bg-panel/90 p-4 shadow-lg">
        <p className="text-xs font-bold uppercase tracking-wide text-accent">
          Teste interno
        </p>
        <h1 className="mt-1 text-xl font-semibold">Posts</h1>
        {error && (
          <p className="mt-3 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
            {error}
          </p>
        )}
        <ul className="mt-4 grid gap-3">
          {posts.map((post) => (
            <li
              key={post.id}
              className="rounded-xl border border-borderDark bg-background/70 p-3"
            >
              <p className="break-words text-sm text-primary">
                {post.content || post.description || "Sem conteúdo"}
              </p>
              <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-mutedText">
                <span>
                  Autor: {post.user ? post.user.displayName : "Desconhecido"}
                </span>
                <span>{post.createdAt}</span>
              </div>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
};

export default PostsPage;
