"use client";
import ForumContainer from "@/components/organisms/ForumContainer";
import { FormEvent, useContext, useEffect, useState } from "react";
import { fireApp as app } from "@/firebase/firebase";
import {
  child,
  get,
  getDatabase,
  push,
  ref,
  remove,
  update,
} from "firebase/database";
import { MessagesProps, PostProps } from "@/types";
import { FaRegRectangleXmark, FaPlus as AddIcon } from "react-icons/fa6";
import ForumForm from "@/components/organisms/ForumForm";
import { useUserContext } from "@/context";
import { postsServices } from "@/services/postServices";
import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";

export function ForumPage() {
 
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUserContext();

  const [ posts, setPosts ] = useState<PostProps[]>([]);
  const [ loading, setLoading ] = useState<boolean>(); 

  const fetchPosts = async () => {
    setLoading(true)
    try {
      const fetchedPosts = await postsServices.getPosts();
      setPosts(fetchedPosts);
      setLoading(false)
    } catch (err: any) {
      console.error("ERROR: ", err.message)
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  return (
    <>
      <div className="pt-10"></div>
      <ForumContainer
        posts={posts}
        loading={loading}
        // onDelete={removeMessage}
        // onUpdate={updateMessage}
        // onLike={handleLike}
      />

      {/* {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed rounded-full bg-gray-700 w-14 h-14 right-8 bottom-8 flex justify-center items-center "
        >
          <AddIcon size={30} />
        </button>
      ) : (
        <ForumForm
          setIsOpen={setIsOpen}
          sendMessage={sendMessage}
          title={title}
          setTitle={setTitle}
          description={description}
          setDescription={setDescription}
        />
      )} */}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.token) {
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
