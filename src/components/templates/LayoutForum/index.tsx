import {
  MenuItemsProps,
  SideOptions,
} from "@/components/molecules/SideOptions";
import { Layout } from "antd";
import React from "react";
import { HiHome } from "react-icons/hi";
import { FaComments } from "react-icons/fa";
import { ForumHeader } from "@/components/molecules/ForumHeader";
import { ForumFooter } from "@/components/molecules/ForumFooter";
import Head from "next/head";

const { Content } = Layout;

interface Props {
  children: React.ReactNode;
}

export const LayoutForum = ({ children }: Props) => {
  const items: MenuItemsProps[] = [
    {
      label: "Início",
      icon: HiHome,
      key: "forum",
      path: `/forum`,
      show: true,
    },
    {
      label: "Comunidades",
      icon: FaComments,
      key: "topics",
      path: `/topics`,
      show: true,
    },
  ];

  return (
    <Layout className="min-h-[100svh] overflow-x-hidden bg-background text-primary">
      <Head>
        <title>Gonin</title>
      </Head>
      <div className="hidden h-screen min-h-0 w-full flex-col items-center bg-background text-primary md:flex">
        <SideOptions items={items}>{children}</SideOptions>
      </div>
      <div className="flex min-h-[100svh] w-full flex-col bg-background text-primary md:hidden">
        <ForumHeader isMobile={true} />
        <Layout className="min-h-0 w-full flex-1 bg-background">
          <Content
            className="relative flex min-h-0 w-full min-w-0 flex-1 flex-col items-stretch justify-start bg-background pb-24 md:hidden"
            style={{
              backgroundColor: "var(--background-color)",
            }}
          >
            {children}
          </Content>
        </Layout>
        <ForumFooter />
      </div>
    </Layout>
  );
};
