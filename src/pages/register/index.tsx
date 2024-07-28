import React, { useEffect, useState } from "react";
import Head from "next/head";
import { SignUpScreen } from "@/components/pages/SignUpScreen";

const Register = () => {
  return (
    <div className="flex bg-slate-200 justify-center items-center">
      <Head>
        <title>Cadastro</title>
      </Head>
      <SignUpScreen />
    </div>
  );
};

export default Register;
