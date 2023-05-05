import { type AppType } from "next/dist/shared/lib/utils";

import "leaflet/dist/leaflet.css";
import "~/styles/globals.css";

const MyApp: AppType = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default MyApp;
