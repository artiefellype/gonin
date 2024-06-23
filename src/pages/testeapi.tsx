// pages/posts.tsx
import { useEffect, useState } from 'react';
import { postsServices } from '@/services/postServices';

const PostsPage = () => {
  const [posts, setPosts] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);

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

  return (
    <div>
      <h1>Posts</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <ul>
        {posts.map(post => (
          <li key={post.id}>
            <p>{post.content}</p>
            <small>Author: {post.user ? post.user.displayName : 'Unknown'}</small>
            <small>Created At: {post.createdAt}</small>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PostsPage;
