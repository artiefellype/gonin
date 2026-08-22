import React, { useEffect, useRef, useState } from "react";
import { FaMarker } from "react-icons/fa6";
import Image from "next/image";
import { PostProps, UserProps } from "@/types";
import { useUserContext } from "@/context";
import { UserServices } from "@/services/userServices";
import { FaTimes } from "react-icons/fa";
import { postsServices } from "@/services/postServices";
import { SpinLoad } from "@/components/atoms/SpinLoad";
import { InputFile } from "@/components/atoms/InputFile";
import { TbSend2 as SendIcon } from "react-icons/tb";
import { CloudinaryServices } from "@/services/cloudinaryServices";

interface ForumComposerProps {
  tag: string;
  fetchNewPosts: () => Promise<void>;
  variant?: "card" | "timeline";
  lockCommunity?: boolean;
}

export const ForumComposerArea = ({
  tag,
  fetchNewPosts,
  variant = "card",
  lockCommunity = false,
}: ForumComposerProps) => {
  const [loadingUser, setLoadingUser] = useState(false);
  const { user } = useUserContext();
  const [userInfo, setUserInfo] = useState<UserProps>();
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedFilePreview, setSelectedFilePreview] = useState("");
  const [fileError, setFileError] = useState("");
  const [title, setTitle] = useState<string>("");
  const [hasTitle, setHasTitle] = useState<boolean>(false);
  const [userPhotoUrl, setUserPhotoUrl] = useState("/imgs/default_perfil.jpg");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const remainingCharacters = 4096 - text.length;
  const isTimeline = variant === "timeline";
  const communityTag = lockCommunity ? tag : "";
  const postContextLabel = communityTag ? "Post na comunidade" : "Post livre";

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
    setFileError("");
    setSelectedFile(file);
    setSelectedFilePreview(URL.createObjectURL(file));
  };

  const handleFileRemove = () => {
    setSelectedFile(null);
    if (selectedFilePreview) URL.revokeObjectURL(selectedFilePreview);
    setSelectedFilePreview("");
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
    let mediaType: PostProps["mediaType"] = undefined;
    let thumbnailUrl = "";

    try {
      if (selectedFile) {
        const media = await CloudinaryServices.uploadMedia(selectedFile);
        mediaFileUrl = media.mediaUrl;
        mediaType = media.mediaType;
        thumbnailUrl = media.thumbnailUrl || "";
      }

      const post: PostProps = {
        id: "",
        userId: user?.user?.uid!!,
        mediaFile: mediaFileUrl,
        mediaType,
        thumbnailUrl,
        title: title,
        description: text,
        likeCount: 0,
        commentCount: 0,
        savedCount: 0,
        shareCount: 0,
        tags: communityTag ? [communityTag] : [],
        communityId: communityTag || undefined,
        pinned: false,
        postType: "original",
        createdAt: new Date().toISOString(),
      };

      const postId = await postsServices.sendPost(post);

      post.id = postId;
      await postsServices.updatePost(postId, post);

      const postDocRef = await postsServices.getPostById(postId);

      await postsServices.addPostEmptyCommentsCollection(postDocRef);
      await postsServices.addPostEmptyLikesCollection(postDocRef);

      if (userInfo) {
        userInfo.posts = [...(userInfo.posts || []), postId];
        await UserServices.updateUser(userInfo);
      }

      setText("");
      handleFileRemove();
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
    return () => {
      if (selectedFilePreview) URL.revokeObjectURL(selectedFilePreview);
    };
  }, [selectedFilePreview]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [text]);

  return (
    <div
      className={
        isTimeline
          ? "w-full border-b border-borderDark bg-background/70 px-3 py-3 sm:px-4 sm:py-4 md:bg-background"
          : "w-full rounded-xl border border-borderDark bg-panel/90 p-3 shadow-lg md:rounded-lg md:p-4"
      }
    >
      {!isTimeline && (
        <div className="mb-4 flex items-start justify-between gap-3 border-b border-borderDark pb-3">
          <div>
            <div className="mb-1 flex flex-wrap items-center gap-2">
              <h2 className="text-base font-semibold text-primary">
                Abrir conversa
              </h2>
              <span className="rounded-full bg-accentSoft px-2 py-1 text-[11px] font-bold text-accent">
                {postContextLabel}
              </span>
            </div>
            <p className="text-xs font-medium text-mutedText">
              Compartilhe uma ideia pequena. Ela pode crescer com as respostas.
            </p>
          </div>
        </div>
      )}

      <div className="flex flex-row gap-3">
        <div className="flex h-9 w-9 shrink-0 overflow-hidden rounded-full border border-borderDark bg-secondary sm:h-10 sm:w-10">
          {!loadingUser && (
            <Image
              className="h-full w-full object-cover"
              src={userPhotoUrl}
              alt={"user photo"}
              width={40}
              height={40}
              priority
            />
          )}
          {loadingUser && (
            <div className="h-10 w-10 animate-pulse rounded-full bg-secondary" />
          )}
        </div>

        <div className="flex w-full flex-col">
          <div className="mb-2 flex flex-col justify-start">
            {hasTitle && (
              <div className="mb-3 flex flex-row items-center gap-2">
                <input
                  className="h-10 w-full rounded-lg border border-borderDark bg-secondary px-3 text-base font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none"
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
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-mutedText hover:bg-secondary hover:text-primary"
                  aria-label="Remover título"
                >
                  <FaTimes size={20} className="fill-current" />
                </button>
              </div>
            )}
            <textarea
              ref={textareaRef}
              placeholder={
                communityTag
                  ? "Compartilhe uma ideia nesta comunidade"
                  : isTimeline
                    ? "Compartilhe uma ideia no Gonin"
                    : "O que vale conversar hoje?"
              }
              className={`w-full resize-none overflow-hidden border-none bg-transparent font-medium text-primary placeholder:text-mutedText/70 focus:outline-none ${
                isTimeline
                  ? "min-h-[3rem] text-base"
                  : "min-h-[4.5rem] text-base"
              }`}
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={4096}
            />
            {selectedFile && (
              <div className="mt-4 flex flex-row items-start gap-2">
                <div className="flex min-w-0 flex-1 flex-col items-start rounded-xl border border-borderDark bg-secondary p-2 sm:max-w-[360px]">
                  {selectedFile.type.startsWith("video/") ? (
                    <video
                      className="max-h-[260px] w-full rounded-lg object-cover sm:max-h-[320px]"
                      src={selectedFilePreview}
                      controls
                    />
                  ) : (
                    <Image
                      className="max-h-[260px] w-full rounded-lg object-cover sm:max-h-[320px]"
                      src={selectedFilePreview}
                      alt="Selected"
                      width={340}
                      height={320}
                      priority
                    />
                  )}
                  <p className="mt-2 max-w-full truncate text-xs font-medium text-mutedText">
                    {selectedFile.name}
                  </p>
                </div>
                <button
                  onClick={handleFileRemove}
                  className="mt-1 flex h-9 w-9 items-center justify-center rounded-lg text-mutedText hover:bg-secondary hover:text-primary"
                  aria-label="Remover imagem"
                >
                  <FaTimes size={20} className="fill-current" />
                </button>
              </div>
            )}
            {fileError && (
              <p className="mt-3 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
                {fileError}
              </p>
            )}
          </div>

          <div
            className={`mt-2 flex w-full flex-col gap-3 pt-3 sm:flex-row sm:items-center sm:justify-between ${
              isTimeline ? "" : "border-t border-borderDark"
            }`}
          >
            <div className="flex flex-row items-center gap-2">
              <InputFile
                onFileSelect={handleFileSelect}
                onFileError={setFileError}
              />
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleOptionalTitle();
                }}
                className={`z-10 flex h-9 items-center justify-center gap-2 rounded-lg border px-3 text-xs font-bold transition-colors ${
                  hasTitle
                    ? "border-accent bg-accentSoft text-accent"
                    : "border-borderDark text-mutedText hover:border-accent hover:text-accent"
                }`}
                aria-label="Adicionar título"
              >
                <FaMarker size={14} className="fill-current" />
                <span>Título</span>
              </button>
            </div>
            <div className="flex flex-row items-center justify-between gap-3 sm:justify-end">
              <span
                className={`text-xs font-medium ${
                  remainingCharacters < 120 ? "text-coral" : "text-mutedText"
                }`}
              >
                {remainingCharacters}
              </span>
              {isSubmitting && <SpinLoad />}
              <button
                className={`z-10 flex h-9 flex-row items-center justify-center gap-2 px-4 text-sm font-semibold transition-colors delay-75 disabled:cursor-not-allowed disabled:opacity-50 ${
                  isTimeline
                    ? "rounded-full bg-primary text-background hover:bg-primary/90"
                    : "rounded-lg bg-accent text-background hover:bg-accent/90"
                }`}
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
