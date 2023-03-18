//import TableauEmbed from '../components/tableau'
//import BasicEmbed from '../components/basicembed'
//import Disclaimer from '../components/disclaimer'

//import NavTabs from '../components/tabs'

//import { Tab } from '@headlessui/react'

import Nav from "../components/nav";

import Head from "next/head";

import React from "react";
import dynamic from "next/dynamic";

function Payroll() {
  return (
    <div className="height100">
      <Head>
        <link
          rel="icon"
          href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-32x32.png"
          sizes="32x32"
        />
        <link
          rel="icon"
          href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-192x192.png"
          sizes="192x192"
        />
        <link
          rel="apple-touch-icon"
          href="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-180x180.png"
        />
        <meta
          name="msapplication-TileImage"
          content="https://mejiaforcontroller.com/wp-content/uploads/2020/12/cropped-favicon-1-270x270.png"
        />

        <meta charSet="utf-8" />
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no"
        />
        <title>LAAS Spay Neuter & Shelter | Charts</title>
        <meta property="og:type" content="website" />
        <meta name="twitter:site" content="@lacontroller" />
        <meta name="twitter:creator" content="@lacontroller" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta
          name="twitter:title"
          key="twittertitle"
          content="311 Homeless Encampment Requests | Charts"
        ></meta>
        <meta
          name="twitter:description"
          key="twitterdesc"
          content="Requests to the City of Los Angeles for homeless encampments."
        ></meta>
        <meta
          name="twitter:image"
          key="twitterimg"
          content="https://311homeless.lacontroller.io/homeless-311-thumbnail-min.png"
        ></meta>
        <meta
          name="description"
          content="Requests to the City of Los Angeles for homeless encampments."
        />

        <meta
          property="og:url"
          content="https://311homeless.lacontroller.io/"
        />
        <meta property="og:type" content="website" />
        <meta
          property="og:title"
          content="311 Homeless Encampment Requests | Map"
        />
        <meta
          property="og:description"
          content="Requests to the City of Los Angeles for homeless encampments."
        />
        <meta
          property="og:image"
          content="https://311homeless.lacontroller.io/homeless-311-thumbnail-min.png"
        />
      </Head>
      <div suppressHydrationWarning={true} className="height100">
        <React.StrictMode>
          <Nav />
        </React.StrictMode>
        <div className="p-2"></div>
      </div>
    </div>
  );
}

export default Payroll;
