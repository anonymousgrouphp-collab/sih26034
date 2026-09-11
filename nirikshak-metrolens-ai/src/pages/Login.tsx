import {ArrowLeft, Eye, EyeOff, KeyRound, LockKeyhole, Scale, ShieldCheck, UserRound} from "lucide-react";
import {FormEvent, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
import {useAuth, type UserRole} from "../context/AuthContext";

const roles: {id:UserRole; label:string; detail:string}[] = [
  {id:"inspector", label:"Legal Metrology Inspector", detail:"Field inspections & evidence"},
  {id:"senior-officer", label:"Senior Officer", detail:"Review & supervision"},
  {id:"administrator", label:"System Administrator", detail:"Access & configuration"},
  {id:"auditor", label:"Audit Officer", detail:"Reports & audit trail"},
];

export default function Login(){
  const {login, roleMeta} = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [role,setRole] = useState<UserRole>("inspector");
  const [email,setEmail] = useState("inspector@metrolens.gov.in");
  const [password,setPassword] = useState("Demo@123");
  const [showPassword,setShowPassword] = useState(false);
  const [error,setError] = useState("");

  const chooseRole = (next:UserRole) => {
    setRole(next);
    const defaults:Record<UserRole,string> = {
      inspector:"inspector@metrolens.gov.in",
      "senior-officer":"senior.officer@metrolens.gov.in",
      administrator:"admin@metrolens.gov.in",
      auditor:"audit@metrolens.gov.in"
    };
    setEmail(defaults[next]);
    setError("");
  };

  const submit = (e:FormEvent) => {
    e.preventDefault();
    const result = login(role,email,password);
    if (!result.ok) { setError(result.message || "Unable to sign in."); return; }
    const requested = (location.state as {from?:string} | null)?.from;
    navigate(requested || roleMeta[role].landing, {replace:true});
  };

  return <div className="min-h-screen bg-slate-100">
    <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] border-b border-slate-200"/>
    <div className="grid min-h-[calc(100vh-4px)] lg:grid-cols-[1fr_1.08fr]">
      <section className="relative hidden overflow-hidden bg-[#102844] lg:flex">
        <img src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1400&q=80" alt="" className="absolute inset-0 h-full w-full object-cover opacity-20"/>
        <div className="absolute inset-0 bg-[linear-gradient(145deg,rgba(16,40,68,.98),rgba(27,54,93,.82))]"/>
        <div className="relative z-10 flex w-full flex-col justify-between p-10 xl:p-14">
          <Link to="/" className="flex items-center gap-3 text-white"><div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-[#1B365D]"><Scale size={24}/></div><div><p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-300">Government Inspection Platform</p><p className="text-lg font-black">NIRIKSHAK <span className="font-normal text-slate-300">METROLENS AI</span></p></div></Link>
          <div className="max-w-xl">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-bold text-slate-200"><ShieldCheck size={14} className="text-emerald-300"/> Secure role-based access</div>
            <h2 className="text-5xl font-black leading-tight text-white">One workstation.<br/><span className="text-[#ffbd72]">Clear accountability.</span></h2>
            <p className="mt-5 max-w-lg text-sm leading-7 text-slate-300">Access the inspection workspace according to your official role. Each role gets a focused workflow while maintaining a common evidence and audit foundation.</p>
            <div className="mt-8 grid grid-cols-2 gap-3">
              {["Evidence chain","Rule transparency","Audit-ready records","Human approval"].map(x=><div key={x} className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 p-3 text-xs font-semibold text-slate-200"><ShieldCheck size={15} className="text-emerald-300"/>{x}</div>)}
            </div>
          </div>
          <p className="text-xs text-slate-400">Prototype • SIH 2026 • NIRIKSHAK</p>
        </div>
      </section>

      <section className="flex items-center justify-center px-4 py-8 sm:px-8">
        <div className="w-full max-w-xl">
          <div className="mb-7 flex items-center justify-between">
            <Link to="/" className="inline-flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#1B365D]"><ArrowLeft size={16}/> Back to portal</Link>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1.5 text-[10px] font-bold text-emerald-700"><LockKeyhole size={13}/> SECURE SESSION</span>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xl sm:p-8">
            <div className="mb-7">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-[#1B365D]">Officer authentication</p>
              <h1 className="mt-2 text-3xl font-black tracking-tight text-slate-900">Sign in to NIRIKSHAK</h1>
              <p className="mt-2 text-sm text-slate-500">Select your role to load the appropriate inspection workspace.</p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {roles.map(item=><button type="button" key={item.id} onClick={()=>chooseRole(item.id)} className={`rounded-xl border p-3 text-left transition ${role===item.id?"border-[#1B365D] bg-[#1B365D]/5 ring-1 ring-[#1B365D]":"border-slate-200 bg-slate-50 hover:border-slate-300"}`}>
                <p className={`text-sm font-extrabold ${role===item.id?"text-[#1B365D]":"text-slate-800"}`}>{item.label}</p>
                <p className="mt-1 text-xs text-slate-500">{item.detail}</p>
              </button>)}
            </div>

            <div className="my-6 h-px bg-slate-200"/>

            <form onSubmit={submit} className="space-y-4">
              <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Official User ID</span><div className="relative"><UserRound size={17} className="absolute left-3 top-3.5 text-slate-400"/><input value={email} onChange={e=>setEmail(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-3 text-sm outline-none focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/10" placeholder="name@department.gov.in"/></div></label>
              <label className="block"><span className="mb-1.5 block text-xs font-bold uppercase tracking-wide text-slate-600">Password</span><div className="relative"><KeyRound size={17} className="absolute left-3 top-3.5 text-slate-400"/><input type={showPassword?"text":"password"} value={password} onChange={e=>setPassword(e.target.value)} className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-11 text-sm outline-none focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/10" placeholder="Enter password"/><button type="button" onClick={()=>setShowPassword(v=>!v)} className="absolute right-2 top-2 rounded-lg p-2 text-slate-400 hover:bg-slate-100">{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>

              {error && <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-xs font-semibold text-red-700">{error}</div>}

              <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#1B365D] px-4 py-3.5 text-sm font-extrabold text-white shadow-sm transition hover:bg-[#142a49]">Sign in securely <ArrowLeft size={16} className="rotate-180"/></button>
            </form>

            <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-3.5">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Demo credentials</p>
              <p className="mt-1 text-xs text-slate-600">Password: <span className="font-bold">Demo@123</span> • Role: <span className="font-bold">{roleMeta[role].label}</span></p>
            </div>

            <p className="mt-5 text-center text-[11px] leading-5 text-slate-400">Demo authentication only. Production deployment should integrate official SSO, MFA, session controls and department identity management.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
}
