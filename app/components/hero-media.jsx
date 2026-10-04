"use client";
import {useEffect,useRef} from "react";

export default function HeroMedia(){
  const ref=useRef(null);
  useEffect(()=>{
    const el=ref.current;
    if(!el)return;
    const move=(e)=>{
      const r=el.getBoundingClientRect();
      el.style.setProperty("--mx",`${e.clientX-r.left}px`);
      el.style.setProperty("--my",`${e.clientY-r.top}px`);
    };
    el.addEventListener("pointermove",move);
    return()=>el.removeEventListener("pointermove",move);
  },[]);
  return <div className="heroMedia fiberNetworkHero" ref={ref} aria-hidden="true">
    <div className="fiberAtmosphere"/>
    <svg className="fiberNetworkSvg" viewBox="0 0 900 600" preserveAspectRatio="none">
      <defs>
        <linearGradient id="fiberBlue" x1="0" y1="1" x2="1" y2="0">
          <stop offset="0" stopColor="#1c56d8"/>
          <stop offset=".48" stopColor="#4da0ff"/>
          <stop offset="1" stopColor="#b8dcff"/>
        </linearGradient>
        <linearGradient id="fiberViolet" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#4d75ff"/>
          <stop offset=".65" stopColor="#9d6cff"/>
          <stop offset="1" stopColor="#ff5fd2"/>
        </linearGradient>
        <filter id="fiberGlow"><feGaussianBlur stdDeviation="7" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <g className="fiberGlowPaths" filter="url(#fiberGlow)">
        <path d="M-60 525 C130 500 155 345 305 365 S470 475 610 330 S765 125 960 90"/>
        <path d="M-70 430 C100 390 185 225 350 265 S535 410 675 260 S805 80 950 35"/>
        <path d="M40 650 C170 525 270 520 390 445 S600 405 735 470 S850 505 970 405"/>
        <path className="violetFiber" d="M-50 570 C110 535 235 425 355 450 S555 535 665 405 S800 210 955 190"/>
      </g>
      <g className="fiberCorePaths">
        <path d="M-60 525 C130 500 155 345 305 365 S470 475 610 330 S765 125 960 90"/>
        <path d="M-70 430 C100 390 185 225 350 265 S535 410 675 260 S805 80 950 35"/>
        <path d="M40 650 C170 525 270 520 390 445 S600 405 735 470 S850 505 970 405"/>
        <path className="violetFiber" d="M-50 570 C110 535 235 425 355 450 S555 535 665 405 S800 210 955 190"/>
      </g>
      <g className="fiberNodes">
        <circle cx="305" cy="365" r="5"/><circle cx="470" cy="475" r="5"/><circle cx="610" cy="330" r="5"/>
        <circle cx="350" cy="265" r="5"/><circle cx="535" cy="410" r="5"/><circle cx="675" cy="260" r="5"/>
        <circle cx="390" cy="445" r="5"/><circle cx="735" cy="470" r="5"/>
      </g>
    </svg>
    <div className="fiberParticles"><i/><i/><i/><i/><i/><i/></div>
    <div className="fiberSignal signal1"/><div className="fiberSignal signal2"/><div className="fiberSignal signal3"/>
    <div className="fiberCursorGlow"/>
    <div className="fiberLabel"><span>FIBER NETWORK</span><small>CONNECTED INFRASTRUCTURE</small></div>
  </div>
}