"use client";
import {useEffect,useRef} from "react";
export default function InteractiveNetwork({className=""}){
 const ref=useRef(null);
 useEffect(()=>{const root=ref.current;if(!root)return;const onMove=e=>{const r=root.getBoundingClientRect();root.style.setProperty("--mx",((e.clientX-r.left)/r.width*100)+"%");root.style.setProperty("--my",((e.clientY-r.top)/r.height*100)+"%")};root.addEventListener("pointermove",onMove);return()=>root.removeEventListener("pointermove",onMove)},[]);
 return <div ref={ref} className={"interactiveNetwork "+className} aria-hidden="true"><span className="netBeam b1"/><span className="netBeam b2"/><span className="netBeam b3"/>{[["a",20,35],["b",52,22],["c",78,48],["d",44,72],["e",67,78]].map(([n,x,y])=><i key={n} className={"netNode "+n} style={{left:x+"%",top:y+"%"}}/>)}<span className="cursorGlow"/></div>
}