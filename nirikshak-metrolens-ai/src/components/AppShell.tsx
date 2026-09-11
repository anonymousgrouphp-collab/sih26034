import {useState, type ReactNode} from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function AppShell({children,collapsed,onToggleSidebar}:{children:ReactNode;collapsed:boolean;onToggleSidebar:()=>void}){
  const [mobileOpen,setMobileOpen]=useState(false);
  return <div className="min-h-screen bg-slate-100">
    <Sidebar collapsed={collapsed} onToggle={onToggleSidebar} mobileOpen={mobileOpen} onClose={()=>setMobileOpen(false)}/>
    <div className={`min-w-0 transition-[padding] ${collapsed?"lg:pl-20":"lg:pl-64"}`}>
      <Topbar onOpenMobile={()=>setMobileOpen(true)}/>
      <main className="min-w-0 flex-1 overflow-auto">{children}</main>
    </div>
  </div>
}
