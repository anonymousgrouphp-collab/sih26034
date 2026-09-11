import {ArrowRight, CheckCircle2, ClipboardCheck, FileSearch, Landmark, LockKeyhole, Scale, ShieldCheck, Smartphone, Sparkles, Workflow} from "lucide-react";
import {Link} from "react-router-dom";

const heroImage = "/assets/inspection-workstation.svg";
const inspectionImage = "/assets/tata-salt-demo.svg";
const fieldImage = "/assets/inspection-workstation.svg";

const highlights = [
  ["Evidence-first inspection", "Keep images, OCR, calibration, measurements and rule outcomes connected in one traceable record.", FileSearch],
  ["Human decision authority", "AI assists with extraction and checks; the inspecting officer remains the final decision-maker.", Scale],
  ["Field-ready workflow", "Designed for government workstations and responsive enough for tablets and smartphones.", Smartphone],
];

export default function Landing(){
  return <div className="min-h-screen bg-slate-50 text-slate-900">
    <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] border-b border-slate-200"/>
    <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B365D] text-white shadow-sm"><Scale size={24}/></div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#1B365D]">Government Inspection Platform</p>
            <h1 className="text-lg font-extrabold tracking-tight sm:text-xl">NIRIKSHAK <span className="font-medium text-slate-500">| METROLENS AI</span></h1>
          </div>
        </Link>
        <div className="flex items-center gap-2">
          <a href="#about" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 sm:inline-flex">About</a>
          <a href="#workflow" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100 md:inline-flex">Workflow</a>
          <Link to="/login" className="inline-flex items-center gap-2 rounded-lg bg-[#1B365D] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#142a49]">
            Officer Login <ArrowRight size={16}/>
          </Link>
        </div>
      </div>
    </header>

    <main>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroImage} alt="" className="h-full w-full object-cover"/>
          <div className="absolute inset-0 bg-[#102844]/90"/>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(255,153,51,.18),transparent_28%),linear-gradient(90deg,rgba(16,40,68,.98),rgba(16,40,68,.72),rgba(16,40,68,.90))]"/>
        </div>
        <div className="relative mx-auto grid min-h-[650px] max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-[1.08fr_.92fr] lg:px-8">
          <div className="max-w-3xl text-white">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-xs font-semibold backdrop-blur">
              <ShieldCheck size={14} className="text-emerald-300"/> Government-ready • Evidence-first • Human supervised
            </div>
            <h2 className="text-4xl font-black leading-[1.04] tracking-tight sm:text-5xl lg:text-6xl">
              Smarter package inspection.
              <span className="block text-[#ffbd72]">Stronger evidence.</span>
            </h2>
            <p className="mt-6 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
              NIRIKSHAK — METROLENS AI assists Legal Metrology officers with package-label inspection, OCR, calibration-aware measurements and deterministic compliance checks.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/login" className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3.5 text-sm font-extrabold text-[#1B365D] shadow-lg hover:bg-slate-100">
                Enter Inspection Workstation <ArrowRight size={17}/>
              </Link>
              <a href="#workflow" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/25 bg-white/5 px-5 py-3.5 text-sm font-bold text-white hover:bg-white/10">
                View workflow
              </a>
            </div>
            <div className="mt-8 grid max-w-2xl grid-cols-3 gap-3 border-t border-white/15 pt-6">
              <div><p className="text-2xl font-black">AI + Human</p><p className="text-xs text-slate-300">Decision model</p></div>
              <div><p className="text-2xl font-black">Traceable</p><p className="text-xs text-slate-300">Evidence chain</p></div>
              <div><p className="text-2xl font-black">Responsive</p><p className="text-xs text-slate-300">Field-ready UI</p></div>
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="ml-auto max-w-md rounded-2xl border border-white/20 bg-white/95 p-5 shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-200 pb-4">
                <div><p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Live Inspection Snapshot</p><p className="mt-1 font-bold text-[#1B365D]">INS-2026-0002</p></div>
                <span className="rounded-full bg-amber-50 px-2.5 py-1 text-[10px] font-bold text-amber-700">MANUAL REVIEW</span>
              </div>
              <div className="mt-4 overflow-hidden rounded-xl bg-slate-100">
                <img src={inspectionImage} alt="Inspection workstation" className="h-52 w-full object-cover"/>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {["OCR extracted","Calibration checked","Rules evaluated","Audit trail ready"].map(x=><div key={x} className="flex items-center gap-2 rounded-lg bg-slate-50 p-3 text-xs font-semibold text-slate-700"><CheckCircle2 size={15} className="text-emerald-600"/>{x}</div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="about" className="border-b border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1B365D]">Purpose-built for enforcement</p>
            <h3 className="mt-2 text-3xl font-black tracking-tight text-slate-900 sm:text-4xl">A government workstation, not a generic AI dashboard.</h3>
            <p className="mt-4 text-slate-600">The interface follows familiar government-portal patterns: clear identity, structured navigation, accessibility-minded controls, service-oriented content and explicit accountability.</p>
          </div>
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {highlights.map(([title,desc,Icon])=><article key={title as string} className="rounded-2xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#1B365D] text-white"><Icon size={21}/></div>
              <h4 className="mt-5 font-extrabold text-slate-900">{title as string}</h4>
              <p className="mt-2 text-sm leading-6 text-slate-600">{desc as string}</p>
            </article>)}
          </div>
        </div>
      </section>

      <section id="workflow" className="bg-slate-50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              <img src={fieldImage} alt="Officer using a digital workstation" className="h-[360px] w-full object-cover"/>
            </div>
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#1B365D]">Inspection flow</p>
              <h3 className="mt-2 text-3xl font-black tracking-tight">From capture to evidence dossier.</h3>
              <div className="mt-7 space-y-4">
                {[
                  ["01","Capture","Upload package images and establish inspection context."],
                  ["02","Extract","OCR and visual analysis identify label fields and candidate measurements."],
                  ["03","Validate","Calibration-aware calculations and deterministic rules verify evidence."],
                  ["04","Review","Conflicts and insufficient evidence are routed to the appropriate officer."],
                ].map(([n,t,d])=><div key={n} className="flex gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#1B365D] text-xs font-black text-white">{n}</div>
                  <div><p className="font-extrabold">{t}</p><p className="mt-1 text-sm leading-5 text-slate-600">{d}</p></div>
                </div>)}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-200 bg-white">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              [Landmark,"Government context","Structured for Legal Metrology workflows"],
              [Workflow,"Traceable pipeline","Every processing stage remains visible"],
              [LockKeyhole,"Controlled access","Role-based workstation entry"],
              [Sparkles,"Assisted intelligence","AI supports — officers decide"],
            ].map(([Icon,title,desc])=><div key={title as string} className="flex gap-3 rounded-xl bg-slate-50 p-4">
              <Icon size={20} className="mt-0.5 shrink-0 text-[#1B365D]"/>
              <div><p className="text-sm font-extrabold">{title as string}</p><p className="mt-1 text-xs leading-5 text-slate-500">{desc as string}</p></div>
            </div>)}
          </div>
        </div>
      </section>
    </main>

    <footer className="bg-[#102844] text-slate-300">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 py-8 sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
        <div><p className="font-bold text-white">NIRIKSHAK — METROLENS AI</p><p className="mt-1 text-xs">Prototype frontend for SIH 2026 • Legal Metrology Inspection Workstation</p></div>
        <div className="flex items-center gap-2 text-xs"><ShieldCheck size={15} className="text-emerald-300"/> Demo environment • No live legal decision is made by AI</div>
      </div>
    </footer>
  </div>
}
