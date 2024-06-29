import React, { useEffect, useRef, useState } from "react";
import { FaMarker } from "react-icons/fa6";
import Image from "next/image";
import { PostProps, UserProps } from "@/types";
import { useUserContext } from "@/context";
import { UserServices } from "@/services/userServices";
import { FaTimes } from "react-icons/fa";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "@/firebase/firebase";
import { postsServices } from "@/services/postServices";
import { SpinLoad } from "@/components/atoms/SpinLoad";
import { InputFile } from "@/components/atoms/InputFile";

interface ForumComposerProps {
  tag: string;
  fetchNewPosts: () => Promise<void>;
}
export const ForumComposerArea = ({
  tag,
  fetchNewPosts,
}: ForumComposerProps) => {
  const [loadingUser, setLoadingUser] = useState(false);
  const { user } = useUserContext();
  const [userInfo, setUserInfo] = useState<UserProps>();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState<string>("");
  const [hasTitle, setHasTitle] = useState<boolean>(false);
  const [userPhotoUrl, setUserPhotoUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const fetchUserLoggedInfo = async (id: string) => {
    setLoadingUser(true);
    try {
      const response = await UserServices.getUserById(id);
      setUserInfo(response);
      setUserPhotoUrl(response?.photoURL);
      setLoadingUser(false);
      return response;
    } catch (error: any) {
      console.error(error.message);
      setLoadingUser(false);
    }
  };

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
  };

  const handleOptionalTitle = () => {
    setHasTitle(true);
  };

  const handleOptionalTitleRemove = () => {
    setHasTitle(false);
    setTitle("");
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    let mediaFileUrl = "";
    const uniqueId = Date.now(); 

    try {
      if (selectedFile) {
        const fileRef = ref(storage, `forum-images/${uniqueId}-${selectedFile.name}`);
        await uploadBytes(fileRef, selectedFile);
        mediaFileUrl = await getDownloadURL(fileRef);
      }

      const post: PostProps = {
        id: "",
        userId: user?.user?.uid!!,
        mediaFile: mediaFileUrl,
        title: title,
        description: text,
        likeCount: 0,
        commentCount: 0,
        tags: [tag],
        pinned: false,
        createdAt: new Date().toISOString(),
      };

      const postId = await postsServices.sendPost(post);

      post.id = postId;
      await postsServices.updatePost(postId, post);

      const postDocRef = await postsServices.getPostById(postId);

      await postsServices.addPostEmptyCommentsCollection(postDocRef);
      await postsServices.addPostEmptyLikesCollection(postDocRef);

      if (userInfo) {
        userInfo.posts.push(postId);
        await UserServices.updateUser(userInfo);
      }

      setText("");
      setSelectedFile(null);
      setTitle("");
      setHasTitle(false);
      fetchNewPosts();
    } catch (error) {
      console.error("Error adding document: ", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    fetchUserLoggedInfo(user?.user?.uid as string);
  }, []);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="w-full md:max-w-2xl h-auto bg-white rounded-lg p-2 flex flex-row">
      <div className="flex rounded-full m-2 bg-gray-500 w-full max-w-[2.5rem] h-10">
        {!loadingUser ? (
          <Image
            className="rounded-full min-w-full"
            src={userPhotoUrl}
            alt={"user photo"}
            width={40}
            height={40}
            priority
          />
        ) : (
          <div className="rounded-full min-w-full bg-slate-500 animate-pulse"></div>
        )}
      </div>

      <div className="flex flex-col pt-3 w-full">
        <div className="flex mb-2 flex-col justify-start ">
          {hasTitle && (
            <div className="flex flex-row justify-center items-center mb-3">
              <input
                className="font-medium text-base text-gray-500 h-8 w-full border-spacing-1 border p-2 focus:outline-none focus:shadow-outline overflow-hidden"
                id="title"
                placeholder="Insira um título chamativo..."
                type="text"
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                }}
                maxLength={256}
              />
              <button onClick={handleOptionalTitleRemove}>
                <FaTimes
                  size={20}
                  className="fill-slate-500 hover:fill-slate-600"
                />
              </button>
            </div>
          )}
          <textarea
            ref={textareaRef}
            placeholder="Compartilhe suas ideias..."
            className="font-medium text-base text-gray-500 min-h-[2.5rem] w-full border-none focus:outline-none focus:shadow-outline overflow-hidden"
            value={text}
            onChange={(e) => setText(e.target.value)}
            maxLength={4096}
          />
          {selectedFile && (
            <div className="mt-4 flex flex-row items-start">
              <div className="flex flex-col items-start">
                <Image
                  className="mt-4 rounded-md"
                  src={URL.createObjectURL(selectedFile)}
                  alt="Selected"
                  width={250}
                  height={300}
                  priority
                />
              </div>
              <button onClick={handleFileRemove} className="mt-4">
                <FaTimes
                  size={20}
                  className="fill-slate-500 hover:fill-slate-600"
                />
              </button>
            </div>
          )}
        </div>

        <div className="flex w-full h-7 flex-row justify-between items-center mt-auto">
          <div className="flex flex-row gap-1">
            <InputFile onFileSelect={handleFileSelect} />
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleOptionalTitle();
              }}
              className="w-5 h-5 z-10"
            >
              <FaMarker
                size={18}
                className="fill-slate-500 hover:fill-slate-600"
              />
            </button>
          </div>
          <div className="pr-3 h-7 flex flex-row gap-2">
            {isSubmitting && <SpinLoad />}
            <button
              className="px-4 py-1 z-10 bg-slate-500 hover:bg-slate-600 transition-colors delay-75 text-whiteColor font-bold text-sm rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !(text.trim() || selectedFile)}
              onClick={handleSubmit}
            >
              ENVIAR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
