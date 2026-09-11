import {Bell,ChevronDown,HelpCircle,MapPin,Menu,ShieldCheck,LogOut} from "lucide-react";
import {useAuth} from "../context/AuthContext";

export default function Topbar({onOpenMobile}:{onOpenMobile:()=>void}){
  const {user,logout}=useAuth();
  return <header className="sticky top-0 z-30 flex min-h-16 items-center justify-between gap-3 border-b border-slate-200 bg-white px-3 sm:px-5 lg:px-6">
    <div className="flex min-w-0 items-center gap-3">
      <button onClick={onOpenMobile} className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"><Menu size={20}/></button>
      <div className="min-w-0">
        <p className="hidden text-[10px] font-semibold uppercase tracking-widest text-slate-400 sm:block">Government Inspection Workstation</p>
        <div className="mt-0.5 flex items-center gap-2"><MapPin size={14} className="shrink-0 text-[#1B365D]"/><span className="truncate text-xs font-semibold text-slate-700 sm:text-sm">Gautam Buddha Nagar Division</span></div>
      </div>
    </div>
    <div className="flex items-center gap-1.5 sm:gap-2">
      <button className="relative rounded-lg p-2 text-slate-500 hover:bg-slate-100"><Bell size={18}/><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-[#ff9933]"/></button>
      <button className="hidden rounded-lg p-2 text-slate-500 hover:bg-slate-100 sm:block"><HelpCircle size={18}/></button>
      <div className="mx-1 hidden h-7 w-px bg-slate-200 sm:block"/>
      <div className="hidden items-center gap-2 sm:flex"><div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1B365D]/10 text-sm font-bold text-[#1B365D]">{user?.initials}</div><div className="hidden text-right md:block"><p className="text-xs font-semibold text-slate-800">{user?.name}</p><p className="text-[10px] text-slate-500">{user?.designation}</p></div></div>
      <button onClick={logout} title="Sign out" className="rounded-lg p-2 text-slate-500 hover:bg-red-50 hover:text-red-600"><LogOut size={17}/></button>
      <div className="hidden items-center gap-1.5 rounded-full bg-emerald-50 px-2.5 py-1 text-[10px] font-semibold text-emerald-700 md:flex"><ShieldCheck size={13}/>SECURE</div>
    </div>
  </header>
}
