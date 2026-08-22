import { CloudinaryServices } from "@/services/cloudinaryServices";
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

export const EditProfileModal = ({
  open,
  profile,
  loading = false,
  onClose,
  onSave,
}: EditProfileModalProps) => {
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [location, setLocation] = useState("");
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState("");
  const [bannerPreview, setBannerPreview] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!profile || !open) return;

    setDisplayName(profile.displayName || "");
    setBio(profile.bio || "");
    setLocation(profile.location || "");
    setPhotoFile(null);
    setBannerFile(null);
    setPhotoPreview("");
    setBannerPreview("");
    setError("");
  }, [open, profile]);

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
    if (!displayName.trim()) {
      setError("Informe um nome de usuário.");
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
        displayName: displayName.trim(),
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

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 px-3 pb-3 backdrop-blur-sm sm:items-center sm:p-4"
      onClick={onClose}
    >
      <section
        className="max-h-[92svh] w-full max-w-2xl overflow-hidden rounded-2xl border border-borderDark bg-background shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex h-14 items-center justify-between border-b border-borderDark px-4">
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
          className="max-h-[calc(92svh-56px)] overflow-y-auto p-4"
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
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                maxLength={48}
                disabled={busy}
                className="h-11 rounded-lg border border-borderDark bg-secondary px-3 text-sm font-medium text-primary placeholder:text-mutedText/70 focus:border-accent focus:outline-none disabled:opacity-60"
              />
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

          <footer className="mt-5 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="h-10 rounded-lg px-4 text-sm font-semibold text-mutedText transition-colors hover:bg-secondary hover:text-primary disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              disabled={busy}
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
