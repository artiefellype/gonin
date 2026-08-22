import { ForumTopic, TopicProps } from "@/components/molecules/ForumTopic";
import { useUserContext } from "@/context";
import { CommunityServices } from "@/services/communityServices";
import { CloudinaryServices } from "@/services/cloudinaryServices";
import { UserServices } from "@/services/userServices";
import { CommunityProps, UserProps } from "@/types";
import { GetServerSideProps } from "next";
import Image from "next/image";
import { parseCookies } from "nookies";
import React, { useEffect, useState } from "react";
import {
  FaImage,
  FaPlus,
  FaUpload,
  FaUsers,
  FaXmark,
} from "react-icons/fa6";

export const TopicsPage = () => {
  const [communities, setCommunities] = useState<CommunityProps[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProps | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [iconFile, setIconFile] = useState<File | null>(null);
  const [iconPreview, setIconPreview] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");
  const { user } = useUserContext();

  const fetchCommunities = async () => {
    setLoading(true);
    try {
      const response = await CommunityServices.getCommunities();
      setCommunities(response);

      if (user?.user?.uid) {
        const userInfo = await UserServices.getUserById(user.user.uid);
        setCurrentUser(userInfo);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCommunity = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!user?.user?.uid) return;

    setCreating(true);
    setError("");
    try {
      let avatar = "";
      if (iconFile) {
        avatar = await CloudinaryServices.uploadImage(iconFile);
      }

      const newCommunity = await CommunityServices.createCommunity(
        title,
        description,
        user.user.uid,
        avatar,
        isPrivate ? "private" : "public"
      );
      setCommunities((current) => [newCommunity, ...current]);
      setCurrentUser((current) =>
        current ? { ...current, communityId: newCommunity.slug } : current
      );
      handleCloseModal();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleIconChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Escolha uma imagem para o ícone.");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Use uma imagem menor que 5MB.");
      return;
    }

    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconFile(file);
    setIconPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleOpenModal = () => {
    setError("");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    if (creating) return;

    setModalOpen(false);
    setTitle("");
    setDescription("");
    setIconFile(null);
    setIsPrivate(false);
    if (iconPreview) URL.revokeObjectURL(iconPreview);
    setIconPreview("");
    setError("");
  };

  useEffect(() => {
    fetchCommunities();
  }, [user?.user?.uid]);

  useEffect(() => {
    return () => {
      if (iconPreview) URL.revokeObjectURL(iconPreview);
    };
  }, [iconPreview]);

  const topicsData: TopicProps[] = communities.map((community) => ({
    icon: community.avatar || "/imgs/topics/Group discussion-pana.svg",
    title: community.title,
    link: `/topics/${community.slug}`,
    description: community.description,
    membersCount: community.membersCount,
    isPrivate: community.visibility === "private",
  }));

  return (
    <div className="w-full px-3 pb-24 md:h-full md:min-h-0 md:overflow-y-auto md:overscroll-contain md:px-4 md:pb-8">
      <div className="mx-auto w-full max-w-6xl py-3 md:py-6">
        <section className="mb-4 rounded-xl border border-borderDark bg-panel/90 p-4 shadow-lg md:mb-5 md:rounded-lg md:p-5">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-accent">
                Comunidades
              </p>
              <h1 className="mt-1 text-2xl font-semibold text-primary">
                Encontre seu assunto
              </h1>
              <p className="mt-2 max-w-xl text-sm font-medium leading-6 text-mutedText">
                Participe de espaços por tema ou crie um para um assunto novo.
              </p>
            </div>
            <button
              onClick={handleOpenModal}
              disabled={!!currentUser?.communityId}
              className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaPlus size={13} />
              {currentUser?.communityId
                ? "Comunidade criada"
                : "Criar comunidade"}
            </button>
          </div>
        </section>

        {error && !modalOpen && (
          <p className="mb-4 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
            {error}
          </p>
        )}

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 md:gap-4 xl:grid-cols-3">
          {loading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={index}
                className="h-[176px] animate-pulse rounded-xl border border-borderDark bg-panel/90 md:h-[190px] md:rounded-lg"
              />
            ))}
          {!loading &&
            topicsData.map((item) => {
              return (
                <ForumTopic
                  key={item.title}
                  icon={item.icon}
                  title={item.title}
                  link={item.link}
                  description={item.description}
                  membersCount={item.membersCount}
                />
              );
            })}
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-4">
          <section className="max-h-[92svh] w-full max-w-lg overflow-hidden rounded-2xl border border-borderDark bg-background shadow-2xl">
            <header className="flex h-14 items-center justify-between border-b border-borderDark px-4">
              <h2 className="text-base font-semibold text-primary">
                Criar comunidade
              </h2>
              <button
                onClick={handleCloseModal}
                disabled={creating}
                className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
                aria-label="Fechar"
              >
                <FaXmark />
              </button>
            </header>

            <form onSubmit={handleCreateCommunity} className="max-h-[calc(92svh-56px)] overflow-y-auto p-4">
              <label className="mb-4 flex cursor-pointer items-center gap-4 rounded-xl border border-borderDark bg-panel p-3 transition-colors hover:border-accent">
                <div className="grid h-16 w-16 shrink-0 place-items-center overflow-hidden rounded-xl bg-secondary text-accent">
                  {iconPreview ? (
                    <Image
                      src={iconPreview}
                      alt="Ícone da comunidade"
                      width={64}
                      height={64}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <FaImage size={22} />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-semibold text-primary">
                    <FaUpload size={12} />
                    Ícone da comunidade
                  </p>
                  <p className="mt-1 text-xs font-medium text-mutedText">
                    JPG, PNG ou WEBP até 5MB.
                  </p>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleIconChange}
                  disabled={creating}
                  className="hidden"
                />
              </label>

              <div className="grid gap-3">
                <input
                  value={title}
                  onChange={(event) => setTitle(event.target.value)}
                  disabled={creating}
                  required
                  maxLength={48}
                  placeholder="Nome da comunidade"
                  className="h-11 rounded-lg border border-borderDark bg-secondary px-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  disabled={creating}
                  required
                  maxLength={140}
                  placeholder="Descrição curta"
                  className="min-h-[92px] resize-none rounded-lg border border-borderDark bg-secondary px-3 py-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                />
                <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-borderDark bg-panel p-3 transition-colors hover:border-accent">
                  <input
                    type="checkbox"
                    checked={isPrivate}
                    onChange={(event) => setIsPrivate(event.target.checked)}
                    disabled={creating}
                    className="mt-1 h-4 w-4 accent-accent"
                  />
                  <span>
                    <span className="block text-sm font-semibold text-primary">
                      Comunidade privada
                    </span>
                    <span className="mt-1 block text-xs font-medium leading-5 text-mutedText">
                      Só entra quem receber convite de um membro.
                    </span>
                  </span>
                </label>
              </div>

              {error && (
                <p className="mt-3 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
                  {error}
                </p>
              )}

              <footer className="mt-5 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  disabled={creating}
                  className="h-10 rounded-lg px-4 text-sm font-semibold text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
                >
                  Cancelar
                </button>
                <button
                  disabled={creating || !title.trim() || !description.trim()}
                  className="flex h-10 items-center justify-center gap-2 rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <FaUsers size={13} />
                  {creating ? "Criando..." : "Criar"}
                </button>
              </footer>
            </form>
          </section>
        </div>
      )}
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
