import {BarChart3,ClipboardCheck,FileText,GitBranch,Home,Menu,SearchCheck,Settings,Scale,ShieldCheck,Users,X} from "lucide-react";
import {NavLink} from "react-router-dom";
import {useAuth} from "../context/AuthContext";

const navigation=[["Dashboard","/dashboard",Home],["New Inspection","/inspections/new",ClipboardCheck],["Inspections","/inspections",SearchCheck],["Review Queue","/review-queue",Users],["Evidence Dossier","/inspections/INS-2026-0001/evidence",FileText],["Rules & Checks","/rules",GitBranch],["Reports","/reports",BarChart3]] as const;

export default function Sidebar({collapsed,onToggle,mobileOpen,onClose}:{collapsed:boolean;onToggle:()=>void;mobileOpen:boolean;onClose:()=>void}){
  const {user}=useAuth();
  const allowed = navigation.filter(([label])=>{
    if(!user) return false;
    if(user.role==="inspector") return ["Dashboard","New Inspection","Inspections","Review Queue","Evidence Dossier","Rules & Checks","Reports"].includes(label);
    if(user.role==="senior-officer") return ["Dashboard","Inspections","Review Queue","Evidence Dossier","Rules & Checks","Reports"].includes(label);
    if(user.role==="auditor") return ["Dashboard","Inspections","Evidence Dossier","Rules & Checks","Reports"].includes(label);
    return ["Dashboard","Reports"].includes(label);
  });

  return <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 shrink-0 flex-col border-r border-slate-700 bg-[#102844] text-white shadow-2xl transition-transform lg:w-64 lg:translate-x-0 lg:shadow-none ${mobileOpen?"translate-x-0":"-translate-x-full"} ${collapsed?"lg:w-20":""}`}>
    <div className="flex h-16 items-center border-b border-white/10 px-4">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-white text-[#1B365D]"><Scale size={21}/></div>
        {!collapsed&&<div><p className="text-sm font-bold tracking-wide">NIRIKSHAK</p><p className="text-[10px] uppercase tracking-widest text-slate-300">METROLENS AI</p></div>}
      </div>
      <button onClick={onToggle} className={`ml-auto hidden rounded-md p-2 text-slate-300 hover:bg-white/10 lg:block ${collapsed?"hidden":""}`}><Menu size={18}/></button>
      <button onClick={onClose} className="ml-auto rounded-md p-2 text-slate-300 hover:bg-white/10 lg:hidden"><X size={20}/></button>
    </div>
    {collapsed&&<button onClick={onToggle} className="mx-auto mt-3 hidden rounded-md p-2 text-slate-300 hover:bg-white/10 lg:block"><Menu size={18}/></button>}
    <nav className="flex-1 space-y-1 overflow-y-auto p-3">
      {!collapsed&&<p className="mb-3 px-3 pt-2 text-[10px] font-semibold uppercase tracking-widest text-slate-400">Workstation</p>}
      {allowed.map(([label,path,Icon])=><NavLink key={path} onClick={onClose} to={path} className={({isActive})=>`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive?"bg-white text-[#1B365D] shadow-sm":"text-slate-200 hover:bg-white/10"}`}><Icon size={18}/>{!collapsed&&<span>{label}</span>}</NavLink>)}
    </nav>
    <div className="border-t border-white/10 p-3">
      <NavLink onClick={onClose} to="/settings" className={({isActive})=>`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium ${isActive?"bg-white text-[#1B365D]":"text-slate-200 hover:bg-white/10"}`}><Settings size={18}/>{!collapsed&&<span>Settings</span>}</NavLink>
      {!collapsed&&<div className="mt-4 rounded-xl bg-white/5 p-3"><div className="flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-300"/><span className="text-xs font-semibold">Role: {user?.designation}</span></div><p className="mt-2 text-xs text-slate-400">Mock secure workstation session</p></div>}
    </div>
  </aside>
}
