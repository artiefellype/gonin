import { CommunityProps } from "@/types";
import { BaseAPI } from "./baseAPI";

export type CommunitySeed = Omit<
  CommunityProps,
  "id" | "ownerId" | "membersCount" | "postsCount" | "createdAt"
> & {
  icon: string;
};

export const defaultCommunities: CommunitySeed[] = [
  {
    slug: "boas-vindas",
    title: "Boas-vindas",
    description: "Apresente-se, conheça o Gonin e encontre as primeiras conversas.",
    avatar: "/imgs/topics/Welcome aboard-pana.svg",
    icon: "/imgs/topics/Welcome aboard-pana.svg",
    isSystem: true,
  },
  {
    slug: "discussao",
    title: "Discussão Geral",
    description: "Converse sobre assuntos variados com a comunidade.",
    avatar: "/imgs/topics/Group discussion-pana.svg",
    icon: "/imgs/topics/Group discussion-pana.svg",
    isSystem: true,
  },
  {
    slug: "espaco-livre",
    title: "Espaço Livre",
    description: "Ideias soltas, perguntas rápidas e conversas abertas.",
    avatar: "/imgs/topics/World Press Freedom Day-cuate.svg",
    icon: "/imgs/topics/World Press Freedom Day-cuate.svg",
    isSystem: true,
  },
  {
    slug: "tecnologia",
    title: "Tecnologia",
    description: "Produtos, desenvolvimento, internet e cultura digital.",
    avatar: "/imgs/topics/Cool robot-bro.svg",
    icon: "/imgs/topics/Cool robot-bro.svg",
    isSystem: true,
  },
  {
    slug: "programacao",
    title: "Programação",
    description: "Código, carreira, dúvidas técnicas e projetos.",
    avatar: "/imgs/topics/Developer activity-pana.svg",
    icon: "/imgs/topics/Developer activity-pana.svg",
    isSystem: true,
  },
  {
    slug: "games",
    title: "Games",
    description: "Jogos, recomendações, novidades e nostalgia.",
    avatar: "/imgs/topics/Horror video game-amico.svg",
    icon: "/imgs/topics/Horror video game-amico.svg",
    isSystem: true,
  },
  {
    slug: "feedbacks",
    title: "Feedbacks",
    description: "Sugestões e melhorias para o próprio Gonin.",
    avatar: "/imgs/topics/Feedback-pana.svg",
    icon: "/imgs/topics/Feedback-pana.svg",
    isSystem: true,
  },
  {
    slug: "musica-e-arte",
    title: "Música e Arte",
    description: "Criações, referências, artistas e cultura.",
    avatar: "/imgs/topics/Playing Music-bro.svg",
    icon: "/imgs/topics/Playing Music-bro.svg",
    isSystem: true,
  },
];

export class CommunityServices {
  static getCommunities = async (): Promise<CommunityProps[]> => {
    try {
      const communities = await new BaseAPI().getCommunities();
      const defaultAsCommunities = defaultCommunities.map((community) => ({
        id: community.slug,
        slug: community.slug,
        title: community.title,
        description: community.description,
        avatar: community.avatar,
        banner: community.banner,
        ownerId: "system",
        membersCount: 0,
        postsCount: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
        isSystem: true,
        visibility: "public" as const,
      }));
      const communityMap = new Map<string, CommunityProps>();

      defaultAsCommunities.forEach((community) => {
        communityMap.set(community.slug, community);
      });
      communities.forEach((community) => {
        communityMap.set(community.slug, community);
      });

      return Array.from(communityMap.values()).sort((a, b) => {
        if (a.isSystem && !b.isSystem) return 1;
        if (!a.isSystem && b.isSystem) return -1;
        return a.title.localeCompare(b.title);
      });
    } catch (error) {
      throw error;
    }
  };

  static getCommunityBySlug = async (
    slug: string
  ): Promise<CommunityProps | null> => {
    try {
      const community = await new BaseAPI().getCommunityBySlug(slug);

      if (community) return community;

      const fallback = defaultCommunities.find((item) => item.slug === slug);
      if (!fallback) return null;

      return {
        id: fallback.slug,
        slug: fallback.slug,
        title: fallback.title,
        description: fallback.description,
        avatar: fallback.avatar,
        banner: fallback.banner,
        ownerId: "system",
        membersCount: 0,
        postsCount: 0,
        createdAt: "2026-01-01T00:00:00.000Z",
        isSystem: true,
        visibility: "public",
      };
    } catch (error) {
      throw error;
    }
  };

  static createCommunity = async (
    title: string,
    description: string,
    ownerId: string,
    avatar = "",
    visibility: "public" | "private" = "public"
  ): Promise<CommunityProps> => {
    try {
      const slug = CommunityServices.slugify(title);
      if (!slug) {
        throw new Error("Informe um nome válido para a comunidade.");
      }

      return await new BaseAPI().createCommunity({
        title,
        slug,
        description,
        ownerId,
        avatar,
        banner: "",
        visibility,
        createdAt: new Date().toISOString(),
        isSystem: false,
      });
    } catch (error) {
      throw error;
    }
  };

  static joinCommunity = async (
    communityId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      await CommunityServices.ensureDefaultCommunity(communityId);
      return await new BaseAPI().joinCommunity(communityId, userId);
    } catch (error) {
      throw error;
    }
  };

  static leaveCommunity = async (
    communityId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      return await new BaseAPI().leaveCommunity(communityId, userId);
    } catch (error) {
      throw error;
    }
  };

  static deleteCommunity = async (
    communityId: string,
    userId: string
  ): Promise<void> => {
    try {
      await new BaseAPI().deleteCommunity(communityId, userId);
    } catch (error) {
      throw error;
    }
  };

  static checkMembership = async (
    communityId: string,
    userId: string
  ): Promise<boolean> => {
    try {
      return await new BaseAPI().checkCommunityMembership(communityId, userId);
    } catch (error) {
      throw error;
    }
  };

  static countPosts = async (communityId: string): Promise<number> => {
    try {
      return await new BaseAPI().countPostsByCommunity(communityId);
    } catch (error) {
      throw error;
    }
  };

  static getActiveByRecentPosts = async (
    limit: number = 3
  ): Promise<CommunityProps[]> => {
    try {
      return await new BaseAPI().getActiveCommunitiesByRecentPosts(limit);
    } catch (error) {
      throw error;
    }
  };

  static inviteToCommunity = async (
    communityId: string,
    inviterId: string,
    inviteeId: string
  ) => {
    try {
      return await new BaseAPI().inviteToCommunity(
        communityId,
        inviterId,
        inviteeId
      );
    } catch (error) {
      throw error;
    }
  };

  static getPendingInvites = async (userId: string) => {
    try {
      return await new BaseAPI().getPendingCommunityInvites(userId);
    } catch (error) {
      throw error;
    }
  };

  static declineInvite = async (inviteId: string, userId: string) => {
    try {
      await new BaseAPI().declineCommunityInvite(inviteId, userId);
    } catch (error) {
      throw error;
    }
  };

  static ensureDefaultCommunity = async (
    communityId: string
  ): Promise<CommunityProps | null> => {
    const fallback = defaultCommunities.find(
      (community) => community.slug === communityId
    );

    if (!fallback) return null;

    return await new BaseAPI().ensureCommunity({
      id: fallback.slug,
      slug: fallback.slug,
      title: fallback.title,
      description: fallback.description,
      avatar: fallback.avatar,
      banner: fallback.banner,
      ownerId: "system",
      membersCount: 0,
      postsCount: 0,
      createdAt: "2026-01-01T00:00:00.000Z",
      isSystem: true,
      visibility: "public",
    });
  };

  static slugify = (value: string) => {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "");
  };
}
