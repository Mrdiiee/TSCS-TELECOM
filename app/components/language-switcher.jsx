"use client";
import {useEffect,useState} from "react";
export default function LanguageSwitcher(){
 const [lang,setLang]=useState("id");
 useEffect(()=>{setLang(localStorage.getItem("tscs-lang")||"id")},[]);
 function change(v){setLang(v);localStorage.setItem("tscs-lang",v);window.dispatchEvent(new Event("tscs-language"))}
 return <div className="langSwitch" aria-label="Language"><button className={lang==="id"?"active":""} onClick={()=>change("id")}>ID</button><span>/</span><button className={lang==="en"?"active":""} onClick={()=>change("en")}>EN</button></div>
}