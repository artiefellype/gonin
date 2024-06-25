// pages/posts.tsx
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
    const fetchPosts = async (reset = false) => {
      try {
        const response = await postsServices.getPostsByTag(
          "discussao",
          reset ? null : lastDoc,
          10
        );
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchPosts(true);
  }, []);

  return (
    <div>
      <h1>Posts</h1>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <ul>
        {posts.map((post) => (
          <li key={post.id}>
            <p>{post.content}</p>
            <small>
              Author: {post.user ? post.user.displayName : "Unknown"}
            </small>
            <small>Created At: {post.createdAt}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsPage;
