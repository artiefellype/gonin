import { useUserContext } from "@/context";
import { Divider, Layout, Menu, MenuProps } from "antd";
import Sider from "antd/es/layout/Sider";
import Link from "next/link";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import { IconType } from "react-icons";
import { TbLogin as LogoutIcon } from "react-icons/tb";

export interface MenuItemsProps {
  label: React.ReactNode;
  key?: React.Key | null;
  icon?: IconType;
  path?: string;
  children?: MenuItemsProps[];
  show?: boolean;
}

interface Props {
  children: React.ReactNode;
  items: MenuItemsProps[];
}

type MenuItem = Required<MenuProps>["items"][number];

export const SideOptions = ({ children, items }: Props) => {
  const { signOut } = useUserContext();
  const [sideBarItemsm, stateSetSideBarItemsm] = useState<MenuItem[]>([]);
  const { Sider, Content } = Layout;

  const router = useRouter();

  const activePath = useMemo(() => {
    if (router.pathname === "/") return;

    const paths = router.pathname.split("/");

    return paths[1];
  }, [router.pathname]) as string;

  function getItem({
    label,
    children,
    icon: Icon,
    show = true,
    key,
    path: to,
  }: MenuItemsProps): MenuItem | undefined {
    if (show)
      return {
        key,
        style: {
          fontSize: "16px",
          color: "#374151",
          marginBottom: 10,
        },
        icon: Icon ? <Icon size={20} className="mr-1 fill-primary" /> : null,
        children,
        label: to ? <Link href={to}>{label}</Link> : label,
      } as MenuItem;
  }

  useEffect(() => {
    if (items?.length === 0) return;
    const sideBarItems = items?.map((item) => {
      return getItem(item);
    });

    if (!sideBarItems) return;

    stateSetSideBarItemsm(sideBarItems as MenuItem[]);
  }, [items]);

  const handleLogout = async () => {
    await signOut();
    router.push("/login");
  };

  return (
    <Layout className="max-w-7xl w-full">
      <Sider trigger={null} width={250} style={{}}>
        <div className="h-full w-full bg-background pt-10">
          <Menu
            mode="inline"
            defaultSelectedKeys={[activePath]}
            defaultOpenKeys={[activePath]}
            className=" border-none rounded-lg"
            style={{
              backgroundColor: "#D6D6D6",
              borderRight: 0,
              borderLeft: 0,
            }}
            items={sideBarItemsm}
          />
          <Divider />
          <button
            onClick={handleLogout}
            className="hover:bg-gray-100 transition-all delay-75 cursor-pointer w-[250px] h-10 rounded-md flex justify-start px-6 py-4 items-center "
          >
            <LogoutIcon size={24} className="mr-2 " color="#374151" />
            <p className="text-[#374151] text-base">SAIR</p>
          </button>
        </div>
      </Sider>
      <Layout>
        <Content
          className={`min-h-screen relative flex justify-center items-start flex-row gap-4`}
          style={{ backgroundColor: "#D6D6D6" }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};
