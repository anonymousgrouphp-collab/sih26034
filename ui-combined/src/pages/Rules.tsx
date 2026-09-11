import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";
import {
  Scale,
  GitBranch,
  ShieldCheck,
  ChevronDown,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calculator,
  Info,
} from "lucide-react";

interface RuleCatalogItem {
  code: string;
  title: string;
  titleHi?: string;
  category: string;
  categoryHi?: string;
  severity: "CRITICAL" | "MAJOR" | "MINOR";
  statute: string;
  description: string;
  descriptionHi?: string;
  remedy: string;
  remedyHi?: string;
}

const RULE_CATALOG: RuleCatalogItem[] = [
  {
    code: "RULE_6_1_H_TABLE_I",
    title: "Minimum Height of Numerals & Letters",
    titleHi: "अंकों एवं अक्षरों की न्यूनतम ऊंचाई",
    category: "DIMENSIONAL_METROLOGY",
    categoryHi: "आयामी मापविज्ञान",
    severity: "CRITICAL",
    statute: "Rule 6(1)(h) read with Table-I of LMPC Rules, 2011",
    description: "The height of any numeral and letter declared on the Principal Display Panel (PDP) shall not be less than the minimum height specified in Table-I for the corresponding area of the panel.",
    descriptionHi: "मुख्य प्रदर्शन फलक (PDP) पर घोषित किसी भी अंक और अक्षर की ऊंचाई पैनल के संबंधित क्षेत्रफल के लिए तालिका-I में निर्दिष्ट न्यूनतम ऊंचाई से कम नहीं होगी।",
    remedy: "Non-compliance triggers compounding under Section 36(1) of Legal Metrology Act, 2009 (₹5,000 first offense).",
    remedyHi: "गैर-अनुपालन पर विधिक मापविज्ञान अधिनियम, 2009 की धारा 36(1) के तहत शमन (प्रथम अपराध हेतु ₹5,000)।",
  },
  {
    code: "RULE_6_1_K_USP",
    title: "Unit Sale Price (USP) Mathematical Consistency",
    titleHi: "इकाई विक्रय मूल्य (USP) गणितीय संगति",
    category: "MATHEMATICAL_CONSISTENCY",
    categoryHi: "गणितीय संगति",
    severity: "CRITICAL",
    statute: "Rule 6(1)(k) inserted by G.S.R. 779(E) w.e.f. 01 January 2022",
    description: "For packages containing more than 1 kg or 1 L, Unit Sale Price must be declared in rupees per kg or per L. Tolerance between (USP × NetQty) and declared MRP must not exceed ₹0.02.",
    descriptionHi: "1 किग्रा या 1 लीटर से अधिक वाले पैकेजों के लिए, इकाई विक्रय मूल्य प्रति किग्रा या प्रति लीटर रुपयों में घोषित होना चाहिए। (USP × NetQty) और घोषित MRP के बीच अंतर ₹0.02 से अधिक नहीं होना चाहिए।",
    remedy: "Strict statutory compounding under Section 36(1) for deceptive pricing or computational mismatch.",
    remedyHi: "भ्रामक मूल्य निर्धारण या गणनात्मक बेमेल के लिए धारा 36(1) के तहत सख्त सांविधिक शमन।",
  },
  {
    code: "RULE_6_1_E_MRP",
    title: "Maximum Retail Price (MRP) & Tax Inclusivity",
    titleHi: "अधिकतम खुदरा मूल्य (MRP) एवं कर समावेशिता",
    category: "STATUTORY_DECLARATION",
    categoryHi: "सांविधिक घोषणा",
    severity: "CRITICAL",
    statute: "Rule 6(1)(e) read with Rule 18(1) of LMPC Rules, 2011",
    description: "Every package must bear the Maximum Retail Price in the format 'MRP Rs. XX.XX (inclusive of all taxes)'. No individual or retailer may alter or overcharge above declared MRP.",
    descriptionHi: "प्रत्येक पैकेज पर 'MRP रु. XX.XX (सभी करों सहित)' प्रारूप में अधिकतम खुदरा मूल्य होना चाहिए। कोई भी व्यक्ति या विक्रेता घोषित MRP से अधिक नहीं ले सकता।",
    remedy: "Seizure of non-compliant commodity batch under Section 15 and penalty under Section 36.",
    remedyHi: "धारा 15 के तहत गैर-अनुपालन जिंस बैच की जब्ती और धारा 36 के तहत दंडात्मक कार्रवाई।",
  },
  {
    code: "SECOND_SCHEDULE_UNITS",
    title: "Prohibition of Non-Standard Units (Banned Unit Flagger)",
    titleHi: "अमानक इकाइयों का निषेध (प्रतिबंधित इकाई चेतावनी)",
    category: "LEGAL_METROLOGY_UNITS",
    categoryHi: "विधिक माप इकाइयां",
    severity: "MAJOR",
    statute: "Section 11 read with Second Schedule of Legal Metrology Act, 2009",
    description: "Only standard SI units (g, kg, ml, l, m, cm) are permissible. Colloquial abbreviations such as 'gms', 'gm', 'ML', 'ltrs' are strictly prohibited.",
    descriptionHi: "केवल मानक एसआई इकाइयों (g, kg, ml, l, m, cm) की अनुमति है। 'gms', 'gm', 'ML', 'ltrs' जैसे बोलचाल के संक्षिप्ताक्षरों पर सख्त प्रतिबंध है।",
    remedy: "Immediate statutory objection and compounding notice under Section 29.",
    remedyHi: "धारा 29 के तहत तत्काल सांविधिक आपत्ति एवं शमन नोटिस।",
  },
  {
    code: "RULE_6_1_A_NAME_ADDR",
    title: "Name and Complete Address of Manufacturer / Packer",
    titleHi: "निर्माता / पैकर का नाम एवं पूर्ण पता",
    category: "IDENTITY_DECLARATION",
    categoryHi: "पहचान घोषणा",
    severity: "MAJOR",
    statute: "Rule 6(1)(a) of LMPC Rules, 2011",
    description: "Every package must declare the registered name and complete physical address of the manufacturer, packer, or importer, sufficient to identify the exact physical premises.",
    descriptionHi: "प्रत्येक पैकेज पर निर्माता, पैकर या आयातक का पंजीकृत नाम और पूर्ण भौतिक पता घोषित होना चाहिए, जो परिसर की पहचान हेतु पर्याप्त हो।",
    remedy: "Notice issued to the corporate registered office requiring compounding or formal explanation.",
    remedyHi: "कॉर्पोरेट पंजीकृत कार्यालय को शमन या औपचारिक स्पष्टीकरण हेतु नोटिस।",
  },
  {
    code: "RULE_6_10_ECOMMERCE",
    title: "E-Commerce Digital Listing Declarations & Exemptions",
    titleHi: "ई-कॉमर्स डिजिटल लिस्टिंग घोषणाएं एवं छूट",
    category: "E_COMMERCE_COMPLIANCE",
    categoryHi: "ई-कॉमर्स अनुपालन",
    severity: "MAJOR",
    statute: "Rule 6(10) inserted by G.S.R. 594(E)",
    description: "Digital marketplace listings must declare manufacturer, net quantity, MRP, consumer care, and country of origin. Digital listings are statutorily exempt from declaring date of manufacture.",
    descriptionHi: "डिजिटल मार्केटप्लेस लिस्टिंग पर निर्माता, शुद्ध मात्रा, MRP, उपभोक्ता सेवा और मूल देश घोषित होना चाहिए। डिजिटल लिस्टिंग को निर्माण तिथि घोषित करने से सांविधिक छूट है।",
    remedy: "Platform intermediary notice issued to marketplace provider under Section 36.",
    remedyHi: "धारा 36 के तहत मार्केटप्लेस मध्यस्थ को प्लेटफॉर्म नोटिस जारी।",
  },
];

export const Rules: React.FC = () => {
  const { language } = useLanguage();
  const [activeTab, setActiveTab] = useState<"SCHEDULES" | "CATALOG" | "INVARIANTS">("SCHEDULES");
  const [expandedRule, setExpandedRule] = useState<string | null>("RULE_6_1_H_TABLE_I");

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 bg-white p-5 rounded-xl border border-slate-200 shadow-workstation">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-govNavy bg-govNavy/5 px-2 py-0.5 rounded">
            {language === "hi" ? "सांविधिक विधिक आधार" : "Statutory Legal Basis"}
          </span>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            {language === "hi" ? "नियम, अनुसूचियां एवं साक्ष्य मानक" : "Rules, Schedules & Evidentiary Invariants"}
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 max-w-2xl">
            {language === "hi"
              ? "विधिक मापविज्ञान (पैकेज्ड कमोडिटीज) नियम, 2011 और धारा 63 बीएसए 2023 के तहत न्यायदृष्टि-एलएम नियम इंजन द्वारा लागू किए गए प्राधिकृत विधिक प्रावधान।"
              : "Authoritative legal schedules enforced by the NyayaDrishti-LM Rule Engine under the Legal Metrology (Packaged Commodities) Rules, 2011 and Section 63 BSA 2023."}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center bg-slate-100 p-1 rounded-lg border border-slate-200 text-xs font-bold">
          <button
            type="button"
            onClick={() => setActiveTab("SCHEDULES")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "SCHEDULES" ? "bg-govNavy text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "तालिका-I फ़ॉन्ट अनुसूची" : "Table-I Font Schedule"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("CATALOG")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "CATALOG" ? "bg-govNavy text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "नियम सूची (कैटलॉग)" : "Rule Catalog"}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("INVARIANTS")}
            className={`px-3 py-1.5 rounded-md transition-colors ${
              activeTab === "INVARIANTS" ? "bg-govNavy text-white shadow-xs" : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {language === "hi" ? "साक्ष्य मानक" : "Evidentiary Invariants"}
          </button>
        </div>
      </div>

      {/* Tab 1: Table-I Font Schedule */}
      {activeTab === "SCHEDULES" && (
        <div className="space-y-6">
          <div className="card p-6 bg-white space-y-4">
            <div>
              <h3 className="text-sm font-extrabold text-govNavy">
                {language === "hi"
                  ? "तालिका-I: अंकों एवं अक्षरों की न्यूनतम ऊंचाई (नियम 6(1)(h) / सा.का.नि. 629(अ))"
                  : "Table-I: Minimum Height of Numerals & Letters (Rule 6(1)(h) / G.S.R. 629(E))"}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {language === "hi"
                  ? "मुख्य प्रदर्शन फलक (PDP) के क्षेत्रफल के अनुसार सांविधिक फ़ॉन्ट ऊंचाई आवश्यकताएं।"
                  : "Statutory font height requirements mapped against Principal Display Panel (PDP) surface area."}
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="min-w-full divide-y divide-slate-200 text-xs">
                <thead className="bg-slate-50 text-[11px] font-bold text-slate-700 uppercase">
                  <tr>
                    <th className="px-4 py-3 text-left">{language === "hi" ? "पंक्ति" : "Row"}</th>
                    <th className="px-4 py-3 text-left">{language === "hi" ? "मुख्य प्रदर्शन फलक क्षेत्रफल (A)" : "Principal Display Panel Area (A)"}</th>
                    <th className="px-4 py-3 text-left">{language === "hi" ? "न्यूनतम फ़ॉन्ट ऊंचाई (सामान्य स्थिति)" : "Minimum Font Height (Normal Case)"}</th>
                    <th className="px-4 py-3 text-left">{language === "hi" ? "ब्लो, ढाले गए या सांचेदार कंटेनर" : "Blown, Formed or Moulded Container"}</th>
                    <th className="px-4 py-3 text-left">{language === "hi" ? "सांविधिक संदर्भ" : "Statutory Citation"}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 font-normal">
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">1</td>
                    <td className="px-4 py-3">A ≤ 50 cm²</td>
                    <td className="px-4 py-3 font-bold text-govNavy font-mono">1.0 mm</td>
                    <td className="px-4 py-3 font-mono text-slate-600">1.5 mm</td>
                    <td className="px-4 py-3 text-slate-500">{language === "hi" ? "पंक्ति 1, तालिका-I" : "Row 1, Table-I"}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">2</td>
                    <td className="px-4 py-3">50 cm² &lt; A ≤ 100 cm²</td>
                    <td className="px-4 py-3 font-bold text-govNavy font-mono">1.5 mm</td>
                    <td className="px-4 py-3 font-mono text-slate-600">3.0 mm</td>
                    <td className="px-4 py-3 text-slate-500">{language === "hi" ? "पंक्ति 2, तालिका-I" : "Row 2, Table-I"}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">3</td>
                    <td className="px-4 py-3">100 cm² &lt; A ≤ 500 cm²</td>
                    <td className="px-4 py-3 font-bold text-govNavy font-mono">2.5 mm</td>
                    <td className="px-4 py-3 font-mono text-slate-600">4.0 mm</td>
                    <td className="px-4 py-3 text-slate-500">{language === "hi" ? "पंक्ति 3, तालिका-I" : "Row 3, Table-I"}</td>
                  </tr>
                  <tr className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono font-bold text-slate-700">4</td>
                    <td className="px-4 py-3">500 cm² &lt; A ≤ 2500 cm²</td>
                    <td className="px-4 py-3 font-bold text-govNavy font-mono">4.0 mm</td>
                    <td className="px-4 py-3 font-mono text-slate-600">6.0 mm</td>
                    <td className="px-4 py-3 text-slate-500">{language === "hi" ? "पंक्ति 4, तालिका-I" : "Row 4, Table-I"}</td>
                  </tr>
                  <tr className="bg-amber-50/70 hover:bg-amber-50">
                    <td className="px-4 py-3 font-mono font-black text-amber-900">5</td>
                    <td className="px-4 py-3 font-bold text-amber-950">
                      {language === "hi" ? "A > 2500 सेमी² (ADL-01 आधार)" : "A > 2500 cm² (ADL-01 Baseline)"}
                    </td>
                    <td className="px-4 py-3 font-black text-rose-700 font-mono text-sm">
                      {language === "hi" ? "6.0 मिमी (8.0 मिमी कभी नहीं)" : "6.0 mm (Never 8.0 mm)"}
                    </td>
                    <td className="px-4 py-3 font-mono text-slate-700 font-bold">6.0 mm</td>
                    <td className="px-4 py-3 font-bold text-amber-900">
                      {language === "hi" ? "सा.का.नि. 629(अ) संशोधन" : "G.S.R. 629(E) Amendment"}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-600 space-y-1">
              <span className="font-bold text-slate-800">
                {language === "hi" ? "विधिक मापविज्ञान अधिकारी मार्गदर्शन टिप्पणी:" : "Legal Metrology Officer Guidance Note:"}
              </span>
              <p>
                {language === "hi"
                  ? "निर्णय ADL-01 के तहत, पंक्ति 5 (A > 2500 सेमी²) को ऐतिहासिक 8.0 मिमी से घटाकर अनिवार्य रूप से 6.0 मिमी किया गया था। 8.0 मिमी का दावा करने वाली कोई भी डिजिटल प्रणाली सांविधिक झूठे आरोप उत्पन्न करती है जो धारा 36(1) शमन अपीलों के दौरान तत्काल न्यायिक निरस्तीकरण का कारण बनती है।"
                  : "Under Decision ADL-01, Row 5 (A > 2500 cm²) was amended from historical 8.0 mm down to strictly 6.0 mm. Any digital system asserting 8.0 mm produces statutory false positives that trigger immediate judicial dismissal during Section 36(1) compounding appeals."}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Rule Catalog */}
      {activeTab === "CATALOG" && (
        <div className="space-y-3">
          {RULE_CATALOG.map((r) => {
            const isOpen = expandedRule === r.code;
            return (
              <div key={r.code} className="card overflow-hidden bg-white">
                <button
                  type="button"
                  onClick={() => setExpandedRule(isOpen ? null : r.code)}
                  className="w-full p-4 flex items-center justify-between text-left hover:bg-slate-50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-govNavy/5 text-govNavy shrink-0">
                      <GitBranch size={16} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-xs text-govNavy">{r.code}</span>
                        <h4 className="text-xs sm:text-sm font-bold text-slate-800">
                          {language === "hi" && r.titleHi ? r.titleHi : r.title}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {language === "hi" && r.categoryHi ? r.categoryHi : r.category} • {r.statute}
                      </p>
                    </div>
                  </div>
                  <ChevronDown
                    size={17}
                    className={`text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {isOpen && (
                  <div className="p-4 pt-1 border-t border-slate-100 bg-slate-50/50 space-y-3 text-xs">
                    <div>
                      <span className="font-bold text-slate-700">
                        {language === "hi" ? "सांविधिक आवश्यकता:" : "Statutory Requirement:"}
                      </span>
                      <p className="text-slate-600 mt-0.5 leading-relaxed">
                        {language === "hi" && r.descriptionHi ? r.descriptionHi : r.description}
                      </p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900">
                      <span className="font-bold">
                        {language === "hi" ? "विधिक प्रवर्तन कार्रवाई: " : "Legal Enforcement Action: "}
                      </span>
                      <span>{language === "hi" && r.remedyHi ? r.remedyHi : r.remedy}</span>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Tab 3: Evidentiary Invariants */}
      {activeTab === "INVARIANTS" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center gap-2 text-govNavy font-bold text-sm">
              <ShieldCheck size={18} />
              <span>
                {language === "hi"
                  ? "धारा 63 बीएसए 2023 साक्ष्य संरक्षण"
                  : "Section 63 BSA 2023 Evidentiary Defense"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === "hi"
                ? "इलेक्ट्रॉनिक साक्ष्य प्रमाणपत्रों में भारतीय साक्ष्य अधिनियम, 2023 की धारा 63 का संदर्भ अनिवार्य है। निरस्त भारतीय साक्ष्य अधिनियम, 1872 की धारा 65B का संदर्भ देना सख्त वर्जित है। सभी डिजिटल फोटोग्राफ, ओसीआर निर्देशांक और मार्करों को अपरिवर्तनीय SHA-256 डाइजेस्ट सुरक्षित रखना चाहिए।"
                : "Electronic evidence certificates must cite Section 63 of Bharatiya Sakshya Adhiniyam, 2023. Citing repealed Section 65B of the Indian Evidence Act, 1872 is strictly prohibited. All digital photographs, OCR coordinates, and fiducials must preserve immutable SHA-256 digests."}
            </p>
          </div>

          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center gap-2 text-govNavy font-bold text-sm">
              <Calculator size={18} />
              <span>
                {language === "hi"
                  ? "इकाई विक्रय मूल्य (USP) गणितीय सहिष्णुता"
                  : "Unit Sale Price (USP) Mathematical Tolerance"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === "hi"
                ? "नियम 6(1)(k) के तहत, गणितीय पहचान |(USP × NetQty) - MRP| ≤ ₹0.02 लागू की जाती है। 2 पैसे से अधिक का कोई भी अंतर भ्रामक राउंडिंग या गैर-अनुपालन पैकेजिंग को दर्शाता है।"
                : "Under Rule 6(1)(k), the mathematical identity |(USP × NetQty) - MRP| ≤ ₹0.02 is enforced. Any discrepancy exceeding 2 paise indicates deceptive rounding or non-compliant packaging."}
            </p>
          </div>

          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center gap-2 text-govNavy font-bold text-sm">
              <AlertCircle size={18} />
              <span>
                {language === "hi" ? "प्रतिबंधित इकाई पहचान प्रणाली" : "Prohibited Units Flagger"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === "hi"
                ? "विधिक मापविज्ञान अधिनियम, 2009 की दूसरी अनुसूची के तहत, 'gms', 'gm', 'ML', 'ltrs' जैसे बोलचाल के इकाई प्रतीकों का उपयोग प्रतिबंधित है। केवल मानक SI इकाइयों 'g', 'kg', 'ml', 'l' को ही अनुमति है।"
                : "Under the Second Schedule of the Legal Metrology Act, 2009, colloquial unit symbols such as `gms`, `gm`, `ML`, `ltrs` are prohibited. Standard SI units `g`, `kg`, `ml`, `l` must be enforced."}
            </p>
          </div>

          <div className="card p-5 bg-white space-y-3">
            <div className="flex items-center gap-2 text-govNavy font-bold text-sm">
              <Info size={18} />
              <span>
                {language === "hi"
                  ? "नियम 6(10) ई-कॉमर्स सांविधिक छूट"
                  : "Rule 6(10) E-Commerce Statutory Exemption"}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {language === "hi"
                ? "नियम 6(10) / सा.का.नि. 594(अ) के तहत, डिजिटल मार्केटप्लेस लिस्टिंग को निर्माण की तारीख घोषित करने से सांविधिक छूट प्राप्त है। प्रणाली अनुपलब्ध निर्माण तिथि को उल्लंघन के रूप में चिह्नित करने के बजाय एक अभिलेखीय सांविधिक छूट दर्ज करती है।"
                : "Under Rule 6(10) / G.S.R. 594(E), digital marketplace listings are statutorily exempt from declaring the date of manufacture. The system records an archival statutory exemption entry rather than flagging missing manufacture dates as a contravention."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Rules;
