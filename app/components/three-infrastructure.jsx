"use client";
import {useState} from "react";
const parts=[["fiber","Fiber Optic","High-capacity transmission foundation."],["node","Network Node","Connectivity distribution and routing."],["core","Core Network","Reliable network architecture."],["edge","Business Edge","Connection closer to operations."]];
export default function ThreeInfrastructure(){
 const [active,setActive]=useState("fiber"); const item=parts.find(x=>x[0]===active)||parts[0];
 return <div className="infraInteractive"><div className="infraScene"><div className="infraCube cubeA"/><div className="infraCube cubeB"/><div className="infraCable"/><div className="infraNode nA"/><div className="infraNode nB"/></div><div className="infraInfo"><span className="eyebrow">SELECT COMPONENT</span><div className="infraTabs">{parts.map(x=><button className={active===x[0]?"active":""} key={x[0]} onClick={()=>setActive(x[0])}>{x[0]}</button>)}</div><h3>{item[1]}</h3><p>{item[2]}</p></div></div>
}