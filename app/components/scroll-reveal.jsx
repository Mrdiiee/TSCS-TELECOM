"use client";
import {useEffect,useRef} from "react";
export default function ScrollReveal({children,className=""}){
 const ref=useRef(null);
 useEffect(()=>{const el=ref.current;if(!el)return;const o=new IntersectionObserver(([e])=>{if(e.isIntersecting){el.classList.add("is-visible");o.disconnect()}},{threshold:.12});o.observe(el);return()=>o.disconnect()},[]);
 return <div ref={ref} className={"reveal "+className}>{children}</div>
}