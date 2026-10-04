"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

export default function SiteChrome({children}){
  const [scrolled,setScrolled]=useState(false);
  useEffect(()=>{
    const onScroll=()=>setScrolled(window.scrollY>18);
    onScroll();
    window.addEventListener("scroll",onScroll,{passive:true});
    return()=>window.removeEventListener("scroll",onScroll);
  },[]);
  return <><header className={`nav ${scrolled?"navScrolled":""}`}>
    <Link href="/" className="brand"><span>TSCS</span><small>PT. TIGA SERANGKAI CAHAYA SELATAN</small></Link>
    <nav>{[["Layanan","/layanan"],["Jaringan","/jaringan"],["Tentang Kami","/tentang-kami"],["Berita","/berita"],["Kontak","/kontak"]].map(([x,h])=><Link key={h} href={h}>{x}</Link>)}</nav>
    <Link className="navCta" href="/kontak">Hubungi Kami <span>↗</span></Link>
  </header><main>{children}</main><footer>
    <div><b>PT. TIGA SERANGKAI CAHAYA SELATAN</b><p>Membangun konektivitas. Menguatkan infrastruktur.</p></div>
    <div>Telecommunication • Fiber Optic • Connectivity</div>
    <div>© {new Date().getFullYear()} TSCS</div>
  </footer></>
}
