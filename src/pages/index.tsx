import { GetServerSideProps } from "next";
import { parseCookies } from "nookies";
import { Fragment } from "react";

export default function LandPage() {
  return (
    <Fragment>
      <h1>Aqui Haverá uma LandPage, Duvido muito</h1>
    </Fragment>
  );
}

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const cookies = parseCookies(ctx);

  if (!cookies.gonin_token) {
    return {
      redirect: {
        destination: '/login',
        permanent: false,
      },
    };
  }else {
    return {
      redirect: {
        destination: '/forum',
        permanent: false,
      },
    };
  }
};

