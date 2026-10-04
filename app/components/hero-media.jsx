"use client";
import {useEffect,useRef} from "react";
import InteractiveNetwork from "./interactive-network";
export default function HeroMedia(){
 const video=useRef(null);
 useEffect(()=>{const v=video.current;if(!v)return;const io=new IntersectionObserver(([e])=>{if(e.isIntersecting)v.play().catch(()=>{});else v.pause()},{threshold:.1});io.observe(v);return()=>io.disconnect()},[]);
 return <div className="heroMedia"><video ref={video} className="heroVideo" autoPlay muted loop playsInline poster="/hero-fiber.svg"><source src="/media/tscs-hero.mp4" type="video/mp4"/></video><div className="heroFallback"/><InteractiveNetwork/></div>
}