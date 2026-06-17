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
import { TbSend2 as SendIcon } from "react-icons/tb";

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
  const [userPhotoUrl, setUserPhotoUrl] = useState("/imgs/default_perfil.jpg");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const remainingCharacters = 4096 - text.length;

  const fetchUserLoggedInfo = async (id: string) => {
    setLoadingUser(true);
    try {
      const response = await UserServices.getUserById(id);
      setUserInfo(response);
      setUserPhotoUrl(response.photoURL);
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
        const fileRef = ref(
          storage,
          `forum-images/${uniqueId}-${selectedFile.name}`
        );
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
  }, [user]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-whiteColor p-3 shadow-sm md:p-4">
      <div className="mb-4 flex items-start justify-between gap-3 border-b border-slate-200 pb-3">
        <div>
          <div className="mb-1 flex flex-wrap items-center gap-2">
            <h2 className="text-base font-bold text-primary">
              Abrir conversa
            </h2>
            <span className="rounded-full bg-accentSoft px-2 py-1 text-[11px] font-semibold text-accent">
              Espaço livre
            </span>
          </div>
          <p className="text-xs font-light text-slate-500">
            Compartilhe uma ideia pequena. Ela pode crescer com as respostas.
          </p>
        </div>
      </div>

      <div className="flex flex-row gap-3">
        <div className="flex h-10 w-10 shrink-0 rounded-full bg-gray-500">
          {!loadingUser && (
            <Image
              className="rounded-full object-cover"
              src={userPhotoUrl}
              alt={"user photo"}
              width={40}
              height={40}
              priority
            />
          )}
          {loadingUser && (
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-400" />
          )}
        </div>

        <div className="flex w-full flex-col">
          <div className="mb-2 flex flex-col justify-start">
            {hasTitle && (
              <div className="mb-3 flex flex-row items-center gap-2">
                <input
                  className="h-10 w-full rounded-md border border-slate-300 bg-white px-3 text-base font-medium text-gray-700 focus:border-slate-500 focus:outline-none"
                  id="title"
                  placeholder="Insira um título chamativo..."
                  type="text"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                  }}
                  maxLength={256}
                />
                <button
                  onClick={handleOptionalTitleRemove}
                  className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200"
                  aria-label="Remover título"
                >
                  <FaTimes
                    size={20}
                    className="fill-slate-500 hover:fill-slate-600"
                  />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              placeholder="O que vale conversar hoje?"
              className="min-h-[4.5rem] w-full resize-none overflow-hidden border-none bg-transparent text-base font-medium text-gray-700 placeholder:text-slate-400 focus:outline-none"
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4096}
            />
            {selectedFile && (
              <div className="mt-4 flex flex-row items-start gap-2">
                <div className="flex max-w-[280px] flex-col items-start rounded-md border border-slate-200 bg-white p-2">
                  <Image
                    className="rounded-md object-cover"
                    src={URL.createObjectURL(selectedFile)}
                    alt="Selected"
                    width={250}
                    height={300}
                    priority
                  />
                  <p className="mt-2 max-w-full truncate text-xs font-medium text-slate-500">
                    {selectedFile.name}
                  </p>
                </div>
                <button
                  onClick={handleFileRemove}
                  className="mt-1 flex h-9 w-9 items-center justify-center rounded-full hover:bg-slate-200"
                  aria-label="Remover imagem"
                >
                  <FaTimes
                    size={20}
                    className="fill-slate-500 hover:fill-slate-600"
                  />
                </button>
              </div>
            )}
          </div>

          <div className="mt-2 flex w-full flex-col gap-3 border-t border-slate-200 pt-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-row items-center gap-2">
              <InputFile onFileSelect={handleFileSelect} />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionalTitle();
                }}
                className={`z-10 flex h-8 items-center justify-center gap-2 rounded-full px-3 text-xs font-semibold transition-colors ${
                  hasTitle
                    ? "bg-accentSoft text-accent"
                    : "text-slate-600 hover:bg-accentSoft"
                }`}
                aria-label="Adicionar título"
              >
                <FaMarker
                  size={14}
                  className="fill-slate-500 hover:fill-slate-600"
                />
                <span>Título</span>
              </button>
            </div>
            <div className="flex flex-row items-center justify-between gap-3 sm:justify-end">
              <span
                className={`text-xs font-medium ${
                  remainingCharacters < 120 ? "text-red-500" : "text-slate-500"
                }`}
              >
                {remainingCharacters}
              </span>
              {isSubmitting && <SpinLoad />}
              <button
                className="z-10 flex h-9 flex-row items-center justify-center gap-2 rounded-full bg-accent px-4 text-sm font-bold text-whiteColor transition-colors delay-75 hover:bg-primary disabled:cursor-not-allowed disabled:opacity-50"
                disabled={isSubmitting || !(text.trim() || selectedFile)}
                onClick={handleSubmit}
              >
                <SendIcon size={16} />
                <p>Enviar</p>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
