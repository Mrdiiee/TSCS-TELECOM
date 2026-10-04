import "./globals.css";
import SiteChrome from "./components/site-chrome";
export const metadata={title:"PT. Tiga Serangkai Cahaya Selatan",description:"Telecommunication, fiber optic and connectivity solutions."};
export default function Layout({children}){return <html lang="id"><body><SiteChrome>{children}</SiteChrome></body></html>}