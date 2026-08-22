import { CloudinaryServices } from "@/services/cloudinaryServices";
import { UserServices } from "@/services/userServices";
import {
  buildUsernameCandidate,
  getDisplayNameFallback,
  isValidUsername,
  normalizeUsername,
} from "@/services/utils/userIdentity";
import { UserProps } from "@/types";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import { FaCamera, FaImage, FaTimes } from "react-icons/fa";

interface EditProfileModalProps {
  open: boolean;
  profile: UserProps | null;
  loading?: boolean;
  onClose: () => void;
  onSave: (profile: UserProps) => Promise<void>;
}

type UserNameStatus =
  | "idle"
  | "checking"
  | "available"
  | "unavailable"
  | "invalid";

export const EditProfileModal = ({
  open,
  profile,
  loading = false,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [userNameStatus, setUserNameStatus] =
    useState<UserNameStatus>("idle");

  useEffect(() => {
    if (!profile || !open) return;

    setUsername(
      profile.username ||
        buildUsernameCandidate(profile.displayName, profile.email)
    );
    setDisplayName(profile.displayName || "");
    setBio(profile.bio || "");
    setLocation(profile.location || "");
    setPhotoFile(null);
    setBannerFile(null);
    setPhotoPreview("");
    setBannerPreview("");
    setError("");
    setUserNameStatus("idle");
  }, [open, profile]);

  useEffect(() => {
    if (!profile || !open) return;

    const cleanUsername = username.trim();
    const currentSearchUsername = normalizeUsername(
      profile.username ||
        profile.searchUsername ||
        buildUsernameCandidate(profile.displayName, profile.email)
    );

    if (!cleanUsername || !isValidUsername(cleanUsername)) {
      setUserNameStatus("invalid");
      return;
    }

    if (normalizeUsername(cleanUsername) === currentSearchUsername) {
      setUserNameStatus("available");
      return;
    }

    setUserNameStatus("checking");

    const timeout = window.setTimeout(async () => {
      try {
        const available = await UserServices.checkUserNameAvailability(
          cleanUsername,
          profile.uid || profile.id
        );
        setUserNameStatus(available ? "available" : "unavailable");
      } catch (error) {
        setUserNameStatus("invalid");
      }
    }, 450);

    return () => window.clearTimeout(timeout);
  }, [open, profile, username]);

  useEffect(() => {
    return () => {
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    };
  }, [bannerPreview, photoPreview]);

  if (!open || !profile) return null;

  const validateImage = (file: File) => {
    if (!file.type.startsWith("image/")) {
      return "Escolha uma imagem válida.";
    }

    if (file.size > 5 * 1024 * 1024) {
      return "Use uma imagem menor que 5MB.";
    }

    return "";
  };

  const handlePhotoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleBannerChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validationError = validateImage(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    if (bannerPreview) URL.revokeObjectURL(bannerPreview);
    setBannerFile(file);
    setBannerPreview(URL.createObjectURL(file));
    setError("");
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!username.trim()) {
      setError("Informe um nome de usuário.");
      return;
    }

    if (!isValidUsername(username.trim())) {
      setError("Use um nome de usuário sem espaços.");
      return;
    }

    if (userNameStatus === "checking") {
      setError("Aguarde a verificação do nome de usuário.");
      return;
    }

    if (userNameStatus !== "available") {
      setError("Escolha um nome de usuário disponível.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const [photoURL, profileBanner] = await Promise.all([
        photoFile
          ? CloudinaryServices.uploadImage(photoFile)
          : Promise.resolve(profile.photoURL || ""),
        bannerFile
          ? CloudinaryServices.uploadImage(bannerFile)
          : Promise.resolve(profile.profileBanner || ""),
      ]);

      await onSave({
        ...profile,
        username: normalizeUsername(username),
        displayName: getDisplayNameFallback(displayName, profile.email),
        bio: bio.trim(),
        location: location.trim(),
        photoURL,
        profileBanner,
      });
    } catch (error: any) {
      setError(error.message || "Não foi possível salvar o perfil.");
    } finally {
      setSubmitting(false);
    }
  };

  const busy = loading || submitting;
  const userNameFeedback =
    userNameStatus === "checking"
      ? "Verificando disponibilidade..."
      : userNameStatus === "available"
      ? normalizeUsername(username) ===
        normalizeUsername(
          profile.username ||
            profile.searchUsername ||
            buildUsernameCandidate(profile.displayName, profile.email)
        )
        ? "Nome atual."
        : `@${normalizeUsername(username)} disponível.`
      : userNameStatus === "unavailable"
      ? "Nome já está em uso."
      : userNameStatus === "invalid"
      ? "Use apenas letras, números, ponto, underline ou hífen."
      : "";
  const userNameFeedbackClass =
    userNameStatus === "available"
      ? "text-accent"
      : userNameStatus === "unavailable" || userNameStatus === "invalid"
      ? "text-coral"
      : "text-mutedText";

  return (
    <div
      className="fixed inset-0 z-[120] flex items-end justify-center overflow-hidden bg-black/70 px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-[max(0.75rem,env(safe-area-inset-top))] backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        className="flex max-h-[calc(100svh-1.5rem)] w-full max-w-2xl flex-col overflow-hidden rounded-t-2xl border border-borderDark bg-background shadow-2xl sm:max-h-[92svh] sm:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex h-14 shrink-0 items-center justify-between border-b border-borderDark px-4">
          <h2 className="text-base font-semibold text-primary">
            Editar perfil
          </h2>
          <button
            onClick={onClose}
            disabled={busy}
            className="grid h-9 w-9 place-items-center rounded-full text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
            aria-label="Fechar"
          >
            <FaTimes />
          </button>
        </header>

        <form
          onSubmit={handleSubmit}
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4"
        >
          <label className="group relative block h-36 cursor-pointer overflow-hidden rounded-2xl border border-borderDark bg-secondary sm:h-44">
            {bannerPreview || profile.profileBanner ? (
              <Image
                src={bannerPreview || profile.profileBanner || ""}
                alt="Imagem de fundo do perfil"
                fill
                className="object-cover"
                unoptimized={!!bannerPreview}
              />
            ) : (
              <div className="h-full w-full bg-[radial-gradient(circle_at_30%_20%,rgba(130,171,255,0.32),transparent_38%),linear-gradient(135deg,#111B3E,#10191F)]" />
            )}
            <div className="absolute inset-0 grid place-items-center bg-black/30 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
              <span className="inline-flex items-center gap-2 rounded-full bg-background/85 px-3 py-2 text-xs font-semibold text-primary">
                <FaImage size={13} />
                Alterar fundo
              </span>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleBannerChange}
              disabled={busy}
              className="hidden"
            />
          </label>

          <div className="-mt-10 flex items-end justify-between gap-3 px-3">
            <label className="group relative grid h-24 w-24 cursor-pointer place-items-center overflow-hidden rounded-2xl border-4 border-background bg-secondary">
              <Image
                src={
                  photoPreview || profile.photoURL || "/imgs/default_perfil.jpg"
                }
                alt="Ícone do perfil"
                width={96}
                height={96}
                className="h-full w-full object-cover"
                unoptimized={!!photoPreview}
              />
              <span className="absolute inset-0 grid place-items-center bg-black/35 opacity-100 transition-opacity sm:opacity-0 sm:group-hover:opacity-100">
                <FaCamera className="text-primary" />
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                disabled={busy}
                className="hidden"
              />
            </label>
          </div>

          <div className="mt-5 grid gap-3">
            <label className="grid gap-1">
              <span className="text-xs font-semibold text-mutedText">
                Nome de usuário
              </span>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                maxLength={32}
                disabled={busy}
                placeholder="arthur"
                className="h-11 rounded-lg border border-borderDark bg-secondary px-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:opacity-60"
              />
              {userNameFeedback && (
                <span
                  className={`px-1 text-xs font-semibold ${userNameFeedbackClass}`}
                >
                  {userNameFeedback}
                </span>
              )}
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-mutedText">
                Nome exibido
              </span>
              <input
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={64}
                disabled={busy}
                placeholder={
                  profile.email?.split("@")[0] || "Como você quer aparecer"
                }
                className="h-11 rounded-lg border border-borderDark bg-secondary px-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:opacity-60"
              />
              <span className="px-1 text-xs font-semibold text-mutedText">
                Pode ter espaços. Se vazio, usamos a primeira parte do email.
              </span>
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-mutedText">
                Recado
              </span>
              <textarea
                value={bio}
                onChange={(event) => setBio(event.target.value)}
                maxLength={180}
                disabled={busy}
                placeholder="Um recado curto para o seu perfil"
                className="min-h-[96px] resize-none rounded-lg border border-borderDark bg-secondary px-3 py-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:opacity-60"
              />
            </label>

            <label className="grid gap-1">
              <span className="text-xs font-semibold text-mutedText">
                Localização
              </span>
              <input
                value={location}
                onChange={(event) => setLocation(event.target.value)}
                maxLength={64}
                disabled={busy}
                placeholder="Cidade, estado ou país"
                className="h-11 rounded-lg border border-borderDark bg-secondary px-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:opacity-60"
              />
            </label>
          </div>

          {error && (
            <p className="mt-4 rounded-lg border border-coral/30 bg-coralSoft px-3 py-2 text-sm font-semibold text-coral">
              {error}
            </p>
          )}

          <footer className="mt-5 grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-10 rounded-lg px-4 text-sm font-semibold text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              disabled={busy || userNameStatus !== "available"}
              className="h-10 rounded-lg bg-accent px-4 text-sm font-semibold text-background transition-colors hover:bg-accent/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? "Salvando..." : "Salvar perfil"}
            </button>
          </footer>
        </form>
      </section>
    </div>
  );
};
