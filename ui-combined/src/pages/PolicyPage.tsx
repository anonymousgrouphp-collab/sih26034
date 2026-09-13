import React from "react";
import { Link } from "react-router-dom";
import { ChevronRight, FileText, Landmark } from "lucide-react";
import { GovTopBar } from "../components/layout/GovTopBar";
import { GovFooter } from "../components/layout/GovFooter";
import { NirikshakBrandLogo } from "../components/common/NirikshakBrandLogo";
import { StateEmblem } from "../components/common/StateEmblem";
import { Reveal } from "../components/common/motion";
import { useLanguage } from "../context/LanguageContext";
import { POLICY_DOCS, POLICY_SLUGS, type PolicySlug } from "./policyContent";

interface PolicyPageProps {
  slug: string;
}

/**
 * GIGW 3.0 statutory policy page template. Renders one of the five mandatory
 * portal policies (Terms, Privacy, Hyperlink, Copyright, Accessibility) with
 * the official sovereign masthead and footer chrome.
 */
const PolicyPage: React.FC<PolicyPageProps> = ({ slug }) => {
  const { language } = useLanguage();
  const isHi = language === "hi";

  const doc = POLICY_DOCS[slug as PolicySlug] ?? POLICY_DOCS["terms-and-conditions"];
  const currentIndex = POLICY_SLUGS.indexOf(slug as PolicySlug);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <GovTopBar />

      {/* Official Portal Header — Sovereign Masthead */}
      <header className="sticky top-0 z-40 border-b border-slate-800 bg-[#0B1727] text-white shadow-md">
        <div className="h-1 bg-gradient-to-r from-[#ff9933] via-white to-[#138808] w-full" />
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-2.5 sm:px-6 lg:px-8">
          <NirikshakBrandLogo tone="light" size="md" />
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-lg bg-amber-500 hover:bg-amber-400 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 shadow-sm transition"
          >
            <Landmark size={15} />
            <span>{isHi ? "मुख्य पोर्टल" : "Main Portal"}</span>
          </Link>
        </div>
      </header>

      <main id="main-content" className="flex-1">
        <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 sm:py-12">
          {/* Breadcrumb (GIGW requirement) */}
          <nav aria-label="Breadcrumb" className="mb-5 flex items-center gap-1.5 text-[11px] font-semibold text-slate-500">
            <Link to="/" className="hover:text-govNavy transition-colors">
              {isHi ? "मुख्य पृष्ठ" : "Home"}
            </Link>
            <ChevronRight size={12} className="text-slate-300" />
            <span className="text-slate-700">{isHi ? doc.titleHi : doc.titleEn}</span>
          </nav>

          {/* Title Block */}
          <Reveal>
            <div className="flex items-start gap-4">
              <div className="hidden sm:block pt-1">
                <StateEmblem size={44} tone="navy" showMotto={true} />
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10.5px] font-extrabold uppercase tracking-widest text-amber-700">
                  <FileText size={13} />
                  <span>{isHi ? "सरकारी पोर्टल नीति" : "Government Portal Policy"}</span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-govNavy mt-1 leading-tight">
                  {isHi ? doc.titleHi : doc.titleEn}
                </h1>
                <p className="text-[11px] font-mono text-slate-400 mt-1">
                  {isHi
                    ? "अंतिम अद्यतन: 11 सितंबर 2026 • संस्करण 1.0.0-SIH26034"
                    : "Last Updated: 11 September 2026 • Version 1.0.0-SIH26034"}
                </p>
              </div>
            </div>
          </Reveal>

          {/* Lede */}
          <Reveal delay={0.05}>
            <p className="mt-6 rounded-xl border border-amber-200/70 bg-amber-50/60 p-4 text-[13px] leading-relaxed text-slate-700">
              {isHi ? doc.ledeHi : doc.ledeEn}
            </p>
          </Reveal>

          {/* Sections */}
          <div className="mt-8 space-y-6">
            {doc.sections.map((section, idx) => (
              <Reveal key={section.headingEn} delay={0.05 + idx * 0.04}>
                <section className="card p-5 sm:p-6">
                  <h2 className="text-sm font-black uppercase tracking-wider text-govNavy flex items-center gap-2.5">
                    <span className="flex h-6 w-6 items-center justify-center rounded-md bg-govNavy text-[10px] font-black text-white">
                      {idx + 1}
                    </span>
                    {isHi ? section.headingHi : section.headingEn}
                  </h2>
                  <div className="mt-3 space-y-2.5">
                    {(isHi ? section.bodyHi : section.bodyEn).map((para, pIdx) => (
                      <p key={pIdx} className="text-[12.5px] leading-relaxed text-slate-600">
                        {para}
                      </p>
                    ))}
                  </div>
                </section>
              </Reveal>
            ))}
          </div>

          {/* Other Policies Navigation */}
          <Reveal delay={0.05}>
            <div className="mt-10 border-t border-slate-200 pt-6">
              <p className="section-eyebrow mb-3">{isHi ? "अन्य नीतियां" : "Other Policies"}</p>
              <div className="flex flex-wrap gap-2">
                {POLICY_SLUGS.filter((s) => s !== slug).map((other) => {
                  const otherDoc = POLICY_DOCS[other];
                  return (
                    <Link
                      key={other}
                      to={`/policies/${other}`}
                      className="btn-secondary px-3.5 py-2 text-[11px] font-bold"
                    >
                      {isHi ? otherDoc.titleHi : otherDoc.titleEn}
                    </Link>
                  );
                })}
              </div>
              {currentIndex < 0 && (
                <p className="mt-4 text-xs text-rose-600">
                  {isHi ? "अज्ञात नीति पृष्ठ।" : "Unknown policy page."}
                </p>
              )}
            </div>
          </Reveal>
        </div>
      </main>

      <GovFooter />
    </div>
  );
};

export default PolicyPage;
