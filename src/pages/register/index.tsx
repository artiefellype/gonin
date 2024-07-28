import React, { useEffect, useState } from "react";
import Head from "next/head";
import { SignUpScreen } from "@/components/pages/SignUpScreen";

const Register = () => {
  return (
    <>
      <Head>
        <title>Cadastro</title>
      </Head>
      <SignUpScreen />
    </>
  );
};

export default Register;
