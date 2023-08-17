import { type AppType } from "next/app";
import { api } from "~/utils/api";
import "~/styles/globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import { Analytics } from "@vercel/analytics/react";
import { Toaster } from "react-hot-toast";
import Head from "next/head";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <ClerkProvider {...pageProps}>
      <Toaster />
      <Head >
        <link rel="shortcut icon" href="/work.ico" />
      </Head>
      <Component {...pageProps} />
      <Analytics />
    </ClerkProvider>
  )
};

export default api.withTRPC(MyApp);
