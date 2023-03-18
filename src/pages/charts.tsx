import Head from "next/head";
import * as React from "react";
import Nav from "../components/nav";

export default function charts() {
  return (
    <div className=" h-full">
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
        <title>MyLA-311 Homeless Encampment Statistics | Charts</title>
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
          content="311 Homeless Encampment Requests | Charts"
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
      <div className="flex-none">
        <Nav />
      </div>
      <div
        className=""
        dangerouslySetInnerHTML={{
          __html: `<div class='tableauPlaceholder' id='viz1675271792109' style='position: relative'><noscript><a href='#'><img alt='MyLA-311 Homeless Encampment Service Requests (2015-2022) ' src='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;My&#47;MyLA-311HomelessEncampmentServiceRequests2015-2022&#47;DarkDashboard&#47;1_rss.png' style='border: none' /></a></noscript><object class='tableauViz'  style='display:none;'><param name='host_url' value='https%3A%2F%2Fpublic.tableau.com%2F' /> <param name='embed_code_version' value='3' /> <param name='site_root' value='' /><param name='name' value='MyLA-311HomelessEncampmentServiceRequests2015-2022&#47;DarkDashboard' /><param name='tabs' value='no' /><param name='toolbar' value='yes' /><param name='static_image' value='https:&#47;&#47;public.tableau.com&#47;static&#47;images&#47;My&#47;MyLA-311HomelessEncampmentServiceRequests2015-2022&#47;DarkDashboard&#47;1.png' /> <param name='animate_transition' value='yes' /><param name='display_static_image' value='yes' /><param name='display_spinner' value='yes' /><param name='display_overlay' value='yes' /><param name='display_count' value='yes' /><param name='language' value='en-US' /></object></div>                <script type='text/javascript'>                    var divElement = document.getElementById('viz1675271792109');                    var vizElement = divElement.getElementsByTagName('object')[0];                    if ( divElement.offsetWidth > 800 ) { vizElement.style.width='1400px';vizElement.style.height='2227px';} else if ( divElement.offsetWidth > 500 ) { vizElement.style.width='1400px';vizElement.style.height='2227px';} else { vizElement.style.width='100%';vizElement.style.height='1677px';}                     var scriptElement = document.createElement('script');                    scriptElement.src = 'https://public.tableau.com/javascripts/api/viz_v1.js';                    vizElement.parentNode.insertBefore(scriptElement, vizElement);                </script>`,
        }}
      ></div>
    </div>
  );
}
