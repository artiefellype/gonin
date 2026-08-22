interface CloudinaryUploadResponse {
  secure_url?: string;
  error?: {
    message?: string;
  };
}

export interface CloudinaryMediaUpload {
  mediaUrl: string;
  mediaType: "image" | "video";
  thumbnailUrl?: string;
}

export class CloudinaryServices {
  static uploadMedia = async (file: File): Promise<CloudinaryMediaUpload> => {
    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET;
    const folder = process.env.NEXT_PUBLIC_CLOUDINARY_FOLDER;
    const mediaType = file.type.startsWith("video/") ? "video" : "image";
    const resourceType = mediaType === "video" ? "video" : "image";

    if (!cloudName || !uploadPreset) {
      throw new Error(
        "Cloudinary nao configurado. Defina NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME e NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET."
      );
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", uploadPreset);

    if (folder) {
      formData.append("folder", folder);
    }

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/${resourceType}/upload`,
      {
        method: "POST",
        body: formData,
      }
    );
    const data = (await response.json()) as CloudinaryUploadResponse;

    if (!response.ok || !data.secure_url) {
      throw new Error(
        data.error?.message ||
          "Nao foi possivel enviar a midia para a Cloudinary."
      );
    }

    return {
      mediaUrl: data.secure_url,
      mediaType,
      thumbnailUrl:
        mediaType === "video"
          ? data.secure_url
              .replace("/video/upload/", "/video/upload/so_0/")
              .replace(/\.[^/.]+$/, ".jpg")
          : data.secure_url,
    };
  };

  static uploadImage = async (file: File): Promise<string> => {
    const response = await CloudinaryServices.uploadMedia(file);
    return response.mediaUrl;
  };
}
