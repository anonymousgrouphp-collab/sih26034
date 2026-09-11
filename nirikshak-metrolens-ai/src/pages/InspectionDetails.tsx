import {
  ArrowLeft, ArrowRight, CheckCircle2, ChevronDown, Copy, Crosshair, FileText,
  Flag, Maximize2, Minus, Plus, RotateCcw, Save, ScanSearch, ShieldCheck,
  Ruler, AlertTriangle, Clock3, Eye, Layers3, Send, UserCheck, ZoomIn
} from "lucide-react";
import {useEffect, useMemo, useState, type ReactNode} from "react";
import {Link, useNavigate, useParams} from "react-router-dom";
import {getInspection} from "../services/inspectionService";
import type {Inspection, BoundingBox} from "../types";
import StatusBadge from "../components/StatusBadge";

const navy="#1B365D";

export default function InspectionDetails(){
  const {id}=useParams();
  const navigate=useNavigate();
  const [inspection,setInspection]=useState<Inspection|null>(null);
  const [selectedImage,setSelectedImage]=useState<string|null>(null);
  const [showBoxes,setShowBoxes]=useState(true);
  const [zoom,setZoom]=useState(1);
  const [tab,setTab]=useState<"image"|"annotations"|"calibration">("image");
  const [saved,setSaved]=useState(false);
  const [reviewSent,setReviewSent]=useState(false);
  const [note,setNote]=useState("");

  useEffect(()=>{ if(id) getInspection(id).then(x=>{ if(x){setInspection(x);setSelectedImage(x.images[0]?.id??null);setNote(x.notes??"");}})},[id]);

  if(!inspection) return <div className="p-8 text-center text-sm text-slate-500">Inspection not found.</div>;

  const image=inspection.images.find(x=>x.id===selectedImage) ?? inspection.images[0];
  const boxes=useMemo<BoundingBox[]>(()=>inspection.boundingBoxes.filter(b=>inspection.ocrFields.some(f=>f.boundingBoxId===b.id && f.sourceImageId===image?.id)),[inspection,image]);
  const flagged=inspection.ruleResults.filter(r=>r.status!=="PASS").length;
  const passed=inspection.ruleResults.length-flagged;
  const statusLabel=inspection.status==="MANUAL_REVIEW_REQUIRED"?"MANUAL REVIEW":inspection.status.replaceAll("_"," ");

  const save=()=>{setSaved(true);setTimeout(()=>setSaved(false),1600)};
  const sendReview=()=>{setReviewSent(true);setTimeout(()=>setReviewSent(false),1800)};

  return <div className="min-h-screen bg-[#eef3f8]">
    {/* Analysis header */}
    <div className="border-b border-slate-200 bg-white">
      <div className="mx-auto max-w-[1600px] px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <button onClick={()=>navigate(-1)} className="mt-1 rounded-lg p-2 text-slate-500 hover:bg-slate-100"><ArrowLeft size={18}/></button>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-semibold text-slate-400">
                <Link to="/dashboard" className="hover:text-[#1B365D]">Dashboard</Link><span>/</span><Link to="/inspections/new" className="hover:text-[#1B365D]">New Inspection</Link><span>/</span><span className="text-slate-600">Analysis</span>
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-black tracking-tight text-[#18375f]">Inspection Analysis</h1>
                <StatusBadge status={inspection.status} size="md"/>
              </div>
              <p className="mt-1 text-xs text-slate-500">AI-assisted analysis for human review. <b>Not a final legal decision.</b></p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link to={`/inspections/${inspection.id}/evidence`} className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><FileText size={15}/>Evidence Dossier</Link>
            <button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-[#1B365D] px-4 py-2.5 text-xs font-bold text-white shadow-sm hover:bg-[#142b4b]"><Save size={15}/>{saved?"Saved":"Save Review"}</button>
          </div>
        </div>
      </div>
    </div>

    <main className="mx-auto max-w-[1600px] px-4 py-4 sm:px-6 lg:px-8">
      {/* Pipeline */}
      <div className="mb-4 overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-w-[760px] items-center px-3 py-2.5">
          {[
            ["1","Upload Images",true],["2","OCR Extraction",true],["3","Measurement",true],["4","Rule Evaluation",true],["5","Review & Confirm",true]
          ].map(([n,label,done],idx)=><div key={label as string} className="flex flex-1 items-center">
            <div className={`flex items-center gap-2 rounded-lg px-3 py-2 ${idx===4?"bg-blue-50":"bg-white"}`}>
              <span className={`flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-black ${idx===4?"bg-blue-600 text-white":"bg-emerald-600 text-white"}`}>{done?<CheckCircle2 size={15}/>:n}</span>
              <span className={`whitespace-nowrap text-xs font-bold ${idx===4?"text-blue-800":"text-slate-600"}`}>{label as string}</span>
            </div>
            {idx<4&&<div className="mx-1 h-px flex-1 bg-slate-200"/>}
          </div>)}
        </div>
      </div>

      {/* Case context */}
      <section className="mb-4 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="grid grid-cols-2 divide-x divide-y divide-slate-200 sm:grid-cols-4 lg:grid-cols-7 lg:divide-y-0">
          <Info label="Inspection ID" value={inspection.id} copy/>
          <Info label="Date" value={new Date(inspection.createdAt).toLocaleDateString("en-IN",{day:"2-digit",month:"short",year:"numeric"})}/>
          <Info label="Status" value={statusLabel} emphasis/>
          <Info label="Product" value={inspection.productName}/>
          <Info label="Declared Quantity" value={inspection.declaredQuantity}/>
          <Info label="Package Type" value="Pouch"/>
          <Info label="Inspector" value={inspection.officer}/>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.32fr)_minmax(360px,.9fr)]">
        {/* LEFT: vision canvas */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 px-3 py-2.5 sm:px-4">
            <div className="flex items-center gap-2"><ScanSearch size={18} className="text-[#1B365D]"/><div><p className="text-sm font-black text-[#17375f]">Image Analysis</p><p className="text-[10px] text-slate-400">{image?.filename} · {image?.width} × {image?.height}px</p></div></div>
            <div className="flex items-center gap-1 rounded-lg bg-slate-100 p-1">
              {[
                ["image","Image View"],["annotations","Annotations"],["calibration","Calibration"]
              ].map(([key,label])=><button key={key} onClick={()=>setTab(key as typeof tab)} className={`rounded-md px-2.5 py-1.5 text-[10px] font-bold ${tab===key?"bg-white text-[#1B365D] shadow-sm":"text-slate-500"}`}>{label}</button>)}
            </div>
          </div>

          <div className="relative min-h-[480px] bg-[#1b2026] sm:min-h-[600px]">
            {tab==="calibration" ? <CalibrationVisual inspection={inspection}/> :
             <div className="relative flex h-[480px] items-center justify-center overflow-auto p-5 sm:h-[600px] sm:p-8">
              <div className="relative shrink-0 transition-transform duration-200" style={{width:`${Math.min(620*zoom,900)}px`,aspectRatio:"900/1100"}}>
                <img src={image?.url || "/assets/tata-salt-demo.svg"} alt={image?.filename || "Inspection image"} className="h-full w-full rounded-md object-cover shadow-2xl"/>
                {showBoxes && boxes.map((b,idx)=><button key={b.id} title={`${b.label} • ${Math.round(b.confidence*100)}%`} onClick={()=>{}} className={`absolute border-2 ${idx===0?"border-sky-400 bg-sky-400/10":"border-emerald-400 bg-emerald-400/10"} hover:bg-yellow-300/20`} style={{left:`${b.x}%`,top:`${b.y}%`,width:`${b.width}%`,height:`${b.height}%`}}>
                  <span className={`absolute -top-6 left-0 whitespace-nowrap rounded px-2 py-1 text-[9px] font-black text-white shadow ${idx===0?"bg-sky-600":"bg-emerald-600"}`}>{b.label} · {Math.round(b.confidence*100)}%</span>
                </button>)}
                {tab==="annotations" && <div className="absolute inset-0 pointer-events-none">
                  <div className="absolute left-3 top-3 rounded bg-black/70 px-2 py-1 text-[9px] font-bold text-white">AI DETECTION OVERLAY</div>
                </div>}
              </div>
            </div>}
            {tab!=="calibration" && <div className="absolute left-3 top-3 flex flex-col gap-1 rounded-lg bg-white/95 p-1 shadow-lg">
              <Tool icon={<ZoomIn size={15}/>} onClick={()=>setZoom(v=>Math.min(1.8,Number((v+.1).toFixed(1))))}/>
              <Tool icon={<Minus size={15}/>} onClick={()=>setZoom(v=>Math.max(.6,Number((v-.1).toFixed(1))))}/>
              <Tool icon={<RotateCcw size={15}/>} onClick={()=>setZoom(1)}/>
              <Tool icon={<Maximize2 size={15}/>} onClick={()=>setZoom(1.2)}/>
              <Tool icon={<Eye size={15}/>} onClick={()=>setShowBoxes(v=>!v)} active={showBoxes}/>
            </div>}
            {tab!=="calibration" && <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between border-t border-white/10 bg-[#07101c]/95 px-3 py-2 text-[10px] text-slate-300"><span>{showBoxes?"Detection overlays ON":"Detection overlays OFF"}</span><span>{Math.round(zoom*100)}% · Scroll to inspect</span></div>}
          </div>

          <div className="flex gap-2 overflow-x-auto border-t border-slate-200 p-3">
            {inspection.images.map(x=><button key={x.id} onClick={()=>setSelectedImage(x.id)} className={`group relative h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 ${x.id===selectedImage?"border-[#1B365D]":"border-slate-200"}`}>
              <img src={x.url || "/assets/tata-salt-demo.svg"} alt={x.filename} className="h-full w-full object-cover"/>
              <span className="absolute inset-x-0 bottom-0 bg-black/65 px-1 py-1 text-[8px] font-bold uppercase text-white">{x.type.replaceAll("_"," ")}</span>
            </button>)}
          </div>
        </section>

        {/* RIGHT: integrated evidence stack */}
        <section className="space-y-4">
          <Panel title="OCR Extracted Text" icon={<FileText size={17}/>} action={<button className="rounded-md border border-slate-200 px-2 py-1 text-[10px] font-bold text-[#1B365D]">Edit</button>}>
            <div className="divide-y divide-slate-100 overflow-hidden rounded-lg border border-slate-200">
              {inspection.ocrFields.slice(0,7).map(f=><div key={f.id} className="grid grid-cols-[115px_1fr_42px] items-center gap-2 px-3 py-2.5 text-xs">
                <span className="font-semibold text-slate-500">{f.field}</span><span className="truncate font-bold text-slate-800">{f.value}</span><span className="text-right text-[9px] font-bold text-slate-400">{Math.round(f.confidence*100)}%</span>
              </div>)}
            </div>
          </Panel>

          <Panel title="Measurements & Calibration" icon={<Ruler size={17}/>} badge={inspection.calibration.available?"Calibrated":"Missing"}>
            <div className="space-y-2 text-xs">
              <Metric icon={<Crosshair size={15}/>} label="Reference Object" value={inspection.calibration.referenceObject}/>
              <Metric icon={<Ruler size={15}/>} label="Pixels per cm" value={inspection.calibration.available?`${(1/inspection.calibration.scaleMmPerPixel*10).toFixed(1)} px/cm`:"Not available"}/>
              <Metric icon={<ArrowRight size={15}/>} label="Measured Width" value={inspection.measurements[0]?`${inspection.measurements[0].observedValue} ${inspection.measurements[0].unit}`:"—"}/>
              <Metric icon={<ArrowRight size={15}/>} label="Measured Height" value={inspection.measurements[1]?`${inspection.measurements[1].observedValue} ${inspection.measurements[1].unit}`:"—"}/>
              <div className="mt-3 rounded-lg bg-slate-50 p-3"><div className="flex items-center justify-between text-[10px] text-slate-500"><span>Scale math</span><span className="font-mono font-bold text-slate-700">{inspection.calibration.available?`${inspection.calibration.measuredPixels}px ÷ ${inspection.calibration.referenceLengthMm}mm = ${inspection.calibration.scaleMmPerPixel.toFixed(4)} mm/px`:"Calibration required before measurement"}</span></div></div>
            </div>
          </Panel>

          <Panel title="Rule Evaluation" icon={<ShieldCheck size={17}/>} badge={`${passed} Passed | ${flagged} Flagged`}>
            <div className="space-y-2">
              {inspection.ruleResults.map(r=><div key={r.id} className="flex items-center gap-2 rounded-lg border border-slate-100 bg-slate-50 px-3 py-2.5">
                {r.status==="PASS"?<CheckCircle2 size={17} className="text-emerald-600"/>:<AlertTriangle size={17} className="text-red-600"/>}
                <div className="min-w-0 flex-1"><p className="truncate text-xs font-bold text-slate-700">{r.ruleCode}. {r.title}</p><p className="truncate text-[10px] text-slate-400">{r.rationale}</p></div>
                <span className={`rounded px-2 py-1 text-[9px] font-black ${r.status==="PASS"?"bg-emerald-50 text-emerald-700":"bg-red-50 text-red-700"}`}>{r.status==="PASS"?"PASS":"FLAGGED"}</span>
              </div>)}
            </div>
          </Panel>

          <Panel title="Detected Issues" icon={<Flag size={17}/>} tone={inspection.conflicts.length?"danger":"normal"}>
            {inspection.conflicts.length ? inspection.conflicts.map(c=><div key={c.id} className="rounded-lg border border-red-200 bg-red-50 p-3">
              <div className="flex gap-2"><AlertTriangle size={18} className="mt-0.5 shrink-0 text-red-600"/><div><p className="text-xs font-black text-red-800">{c.field} Conflict Detected</p><p className="mt-1 text-[10px] leading-5 text-red-700">{c.description}</p><div className="mt-2 rounded border border-red-100 bg-white p-2 text-[10px]"><b>Expected:</b> {c.expected}<br/><b>Found on package:</b> {c.observed}</div></div></div>
              <div className="mt-2 flex items-center gap-2 rounded-lg border border-amber-200 bg-amber-50 p-2 text-[10px] font-bold text-amber-800"><UserCheck size={14}/>Requires human review</div>
            </div>) : <div className="flex items-center gap-2 rounded-lg bg-emerald-50 p-3 text-xs font-bold text-emerald-700"><CheckCircle2 size={16}/> No unresolved issues detected.</div>}
          </Panel>
        </section>
      </div>

      {/* Bottom evidence strip */}
      <div className="mt-4 grid gap-4 lg:grid-cols-[1.25fr_.8fr_.62fr]">
        <Panel title="Analysis Timeline" icon={<Clock3 size={17}/>}>
          <div className="relative grid grid-cols-5 gap-2">
            <div className="absolute left-[8%] right-[8%] top-3 h-px bg-slate-300"/>
            {[
              ["10:14 AM","Image uploaded"],["10:14 AM","OCR completed"],["10:15 AM","Measurement done"],["10:15 AM","Rules evaluated"],["10:16 AM","Ready for review"]
            ].map(([time,label],idx)=><div key={label} className="relative text-center"><span className={`mx-auto flex h-6 w-6 items-center justify-center rounded-full border-2 bg-white ${idx===4?"border-blue-600":"border-emerald-600"}`}>{idx===4?<span className="h-2 w-2 rounded-full bg-blue-600"/>:<span className="h-2 w-2 rounded-full bg-emerald-600"/>}</span><p className="mt-2 text-[9px] font-black text-[#1B365D]">{time}</p><p className="mt-0.5 text-[9px] leading-4 text-slate-500">{label}</p></div>)}
          </div>
        </Panel>

        <Panel title="Confidence Score" icon={<Crosshair size={17}/>}>
          <div className="flex items-center gap-5">
            <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full" style={{background:`conic-gradient(#168b58 ${inspection.overallConfidence*360}deg,#e7edf2 0)`}}>
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-xl font-black text-[#1B365D]">{Math.round(inspection.overallConfidence*100)}%</div>
            </div>
            <div className="min-w-0 flex-1 space-y-2 text-[10px]">
              <Confidence label="OCR Confidence" value={92}/>
              <Confidence label="Measurement Confidence" value={85}/>
              <Confidence label="Rule Matching Confidence" value={84}/>
              <Confidence label="Overall Confidence" value={Math.round(inspection.overallConfidence*100)}/>
            </div>
          </div>
        </Panel>

        <Panel title="Actions" icon={<ShieldCheck size={17}/>}>
          <div className="space-y-2">
            <button onClick={sendReview} className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#1B365D] px-3 py-2.5 text-xs font-black text-white hover:bg-[#142b4b]"><Send size={14}/>{reviewSent?"Sent for Review":"Send for Review"}<ArrowRight size={13}/></button>
            <Link to={`/inspections/${inspection.id}/evidence`} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><FileText size={14}/>Add to Evidence Dossier</Link>
            <button onClick={()=>navigate(-1)} className="flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-50"><ArrowLeft size={14}/>Back</button>
          </div>
        </Panel>
      </div>

      <section className="mt-4 grid gap-4 lg:grid-cols-2">
        <Panel title="Officer Assessment" icon={<UserCheck size={17}/>}>
          <p className="mb-3 text-[10px] text-slate-500">Record the authorized officer's assessment. AI output is advisory and does not constitute a final legal decision.</p>
          <textarea value={note} onChange={e=>setNote(e.target.value)} className="min-h-24 w-full rounded-lg border border-slate-300 p-3 text-xs outline-none focus:border-[#1B365D] focus:ring-2 focus:ring-[#1B365D]/10" placeholder="Enter review observations..."/>
          <div className="mt-3 flex flex-wrap gap-2"><button onClick={save} className="inline-flex items-center gap-2 rounded-lg bg-[#1B365D] px-3.5 py-2 text-xs font-bold text-white"><Save size={14}/>Record assessment</button><button className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-3.5 py-2 text-xs font-bold text-slate-700"><Flag size={14}/>Request evidence</button></div>
        </Panel>
        <Panel title="Audit & Evidence Integrity" icon={<Layers3 size={17}/>}>
          <div className="grid gap-2 sm:grid-cols-2">
            {[
              ["Evidence items",String(inspection.evidence.length),"Linked to case"],
              ["Audit events",String(inspection.auditTrail.length),"Chronological trail"],
              ["Rule checks",String(inspection.ruleResults.length),"Deterministic evaluation"],
              ["Evidence state",inspection.status==="PASSED"?"Complete":"Review required","Human verification"]
            ].map(([a,b,c])=><div key={a} className="rounded-lg bg-slate-50 p-3"><p className="text-[10px] font-bold uppercase tracking-wide text-slate-400">{a}</p><p className="mt-1 text-sm font-black text-[#1B365D]">{b}</p><p className="text-[10px] text-slate-500">{c}</p></div>)}
          </div>
        </Panel>
      </section>
    </main>
  </div>
}

function Info({label,value,copy,emphasis}:{label:string;value:string;copy?:boolean;emphasis?:boolean}){
  return <div className="min-w-0 px-3 py-3 sm:px-4"><p className="text-[9px] font-bold uppercase tracking-widest text-slate-400">{label}</p><div className="mt-1 flex items-center gap-1"><p className={`truncate text-xs font-black ${emphasis?"text-amber-700":"text-[#18375f]"}`}>{value}</p>{copy&&<Copy size={12} className="shrink-0 text-slate-400"/>}</div></div>
}
function Tool({icon,onClick,active}:{icon:ReactNode;onClick:()=>void;active?:boolean}){return <button onClick={onClick} className={`flex h-9 w-9 items-center justify-center rounded-md ${active?"bg-[#1B365D] text-white":"text-slate-600 hover:bg-slate-100"}`}>{icon}</button>}
function Panel({title,icon,children,action,badge,tone="normal"}:{title:string;icon:ReactNode;children:ReactNode;action?:ReactNode;badge?:string;tone?:"normal"|"danger"}){
  return <section className={`overflow-hidden rounded-xl border bg-white shadow-sm ${tone==="danger"?"border-red-200":"border-slate-200"}`}><div className="flex items-center justify-between gap-2 border-b border-slate-100 px-4 py-3"><div className="flex items-center gap-2"><span className="text-[#1B365D]">{icon}</span><p className="text-sm font-black text-[#17375f]">{title}</p></div>{badge&&<span className={`rounded-full px-2.5 py-1 text-[9px] font-black ${tone==="danger"?"bg-red-50 text-red-700":"bg-emerald-50 text-emerald-700"}`}>{badge}</span>}{action}</div><div className="p-3 sm:p-4">{children}</div></section>
}
function Metric({icon,label,value}:{icon:ReactNode;label:string;value:string}){return <div className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2.5"><span className="text-[#1B365D]">{icon}</span><span className="flex-1 text-[10px] text-slate-500">{label}</span><span className="text-right text-[10px] font-black text-slate-700">{value}</span></div>}
function Confidence({label,value}:{label:string;value:number}){return <div className="flex items-center gap-2"><span className="flex-1 text-slate-500">{label}</span><span className="font-black text-[#1B365D]">{value}%</span></div>}
function CalibrationVisual({inspection}:{inspection:Inspection}){
  const c=inspection.calibration;
  return <div className="flex h-[480px] items-center justify-center p-6 sm:h-[600px]"><div className="w-full max-w-xl rounded-2xl border border-white/10 bg-[#101820] p-5 text-white shadow-2xl"><div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-widest text-slate-400">Calibration visualization</p><p className="mt-1 text-lg font-black">Reference scale → pixel ratio</p></div><Ruler size={28} className="text-emerald-400"/></div><div className="mt-8 rounded-xl border border-dashed border-slate-600 p-6"><div className="flex items-end gap-4"><div className="h-36 w-10 rounded-t bg-slate-500"/><div className="flex-1"><div className="mb-2 flex justify-between text-[10px] text-slate-400"><span>Reference object</span><span>{c.available?`${c.referenceLengthMm} mm`:"Unavailable"}</span></div><div className="h-5 rounded-full bg-slate-700"><div className="h-full w-3/5 rounded-full bg-emerald-500"/></div><p className="mt-3 font-mono text-xs text-emerald-300">{c.available?`${c.measuredPixels}px ÷ ${c.referenceLengthMm}mm = ${c.scaleMmPerPixel.toFixed(4)} mm/px`:"Add calibration image to establish scale."}</p></div></div></div><div className="mt-5 grid grid-cols-2 gap-3"><div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] text-slate-400">Method</p><p className="mt-1 text-xs font-bold">{c.method}</p></div><div className="rounded-lg bg-white/5 p-3"><p className="text-[10px] text-slate-400">Uncertainty</p><p className="mt-1 text-xs font-bold">{c.available?`${c.uncertaintyMm} mm`:"—"}</p></div></div></div></div>
}
