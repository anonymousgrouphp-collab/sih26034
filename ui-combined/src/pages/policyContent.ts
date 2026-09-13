/**
 * GIGW 3.0 Mandatory Policy Pages — bilingual content for NIRIKSHAK.
 * Content follows the standard Government of India portal policy templates
 * (Terms & Conditions, Privacy Policy, Hyperlink Policy, Copyright Policy,
 * Accessibility Statement) and only cites statutes already referenced in this
 * repository: Legal Metrology Act 2009, LMPC Rules 2011, Sec 63 BSA 2023,
 * and Sec 43 of the IT Act 2000 (as displayed on the Login gateway).
 */

export const POLICY_SLUGS = [
  "terms-and-conditions",
  "privacy-policy",
  "hyperlink-policy",
  "copyright-policy",
  "accessibility-statement",
] as const;

export type PolicySlug = (typeof POLICY_SLUGS)[number];

export interface PolicySection {
  headingEn: string;
  headingHi: string;
  bodyEn: string[];
  bodyHi: string[];
}

export interface PolicyDoc {
  titleEn: string;
  titleHi: string;
  ledeEn: string;
  ledeHi: string;
  sections: PolicySection[];
}

export const POLICY_DOCS: Record<PolicySlug, PolicyDoc> = {
  "terms-and-conditions": {
    titleEn: "Terms & Conditions",
    titleHi: "नियम एवं शर्तें",
    ledeEn:
      "These terms govern the use of NIRIKSHAK, the digital inspection workstation deployed for the Department of Consumer Affairs, Government of India. By accessing this portal you accept these conditions.",
    ledeHi:
      "ये नियम एवं शर्तें उपभोक्ता मामले विभाग, भारत सरकार द्वारा तैनात डिजिटल निरीक्षण कार्यस्थान NIRIKSHAK के उपयोग को नियंत्रित करती हैं। इस पोर्टल तक पहुंचकर आप इन शर्तों को स्वीकार करते हैं।",
    sections: [
      {
        headingEn: "Authorised Use",
        headingHi: "अधिकृत उपयोग",
        bodyEn: [
          "This workstation is restricted to gazetted Legal Metrology Officers, Controllers, departmental administrators and authorized auditors. Access is granted through role-based credentials issued by the Department; sharing credentials or attempting unauthorized access is monitored and recorded under Sec 43 of the Information Technology Act, 2000.",
        ],
        bodyHi: [
          "यह कार्यस्थान विधिक मापविज्ञान अधिकारियों, नियंत्रकों, विभागीय प्रशासकों एवं अधिकृत ऑडिटरों हेतु है। पहुंच विभाग द्वारा जारी भूमिका-आधारित क्रेडेंशियल से दी जाती है; क्रेडेंशियल साझा करना या अनधिकृत पहुंच का प्रयास सूचना प्रौद्योगिकी अधिनियम, 2000 की धारा 43 के अंतर्गत निगरानी एवं अभिलेखन का विषय है।",
        ],
      },
      {
        headingEn: "Augmented Assistant — Human-in-the-Loop",
        headingHi: "संवर्धित सहायक — मानव-सहित निर्णय",
        bodyEn: [
          "NIRIKSHAK is a diagnostic assistant. All automated findings are recommendations presented to a qualified Legal Metrology Officer, who holds sole statutory authority over adjudication, notices and compounding decisions under the Legal Metrology Act, 2009 and the LMPC Rules, 2011.",
        ],
        bodyHi: [
          "NIRIKSHAK एक नैदानिक सहायक है। सभी स्वचालित निष्कर्ष योग्य विधिक मापविज्ञान अधिकारी को प्रस्तुत सिफारिशें हैं, जिनके पास विधिक मापविज्ञान अधिनियम, 2009 एवं LMPC नियम, 2011 के अंतर्गत न्यायिक निर्णय, नोटिस एवं जुर्माने पर अकेला वैधानिक अधिकार है।",
        ],
      },
      {
        headingEn: "Demonstration Data",
        headingHi: "प्रदर्शन डेटा",
        bodyEn: [
          "Scenarios labelled DEMO FIXTURE are pre-certified synthetic demonstrations. They are provided for training and evaluation only and must never be represented as real enforcement records.",
        ],
        bodyHi: [
          "DEMO FIXTURE लेबल वाले परिदृश्य पूर्व-प्रमाणित सिंथेटिक प्रदर्शन हैं। ये केवल प्रशिक्षण एवं मूल्यांकन हेतु हैं और इन्हें कभी भी वास्तविक प्रवर्तन अभिलेख न मानें।",
        ],
      },
      {
        headingEn: "Availability & Liability",
        headingHi: "उपलब्धता एवं दायित्व",
        bodyEn: [
          "The Department strives to keep this portal available at all times, including a local resilient mode for field use during connectivity blackouts; however, service continuity is not warranted. These terms are governed by the laws of India.",
        ],
        bodyHi: [
          "विभाग इस पोर्टल को सदैव उपलब्ध रखने का प्रयास करता है, जिसमें कनेक्टिविटी कालेप के दौरान क्षेत्रीय उपयोग हेतु स्थानीय लचीला मोड शामिल है; परंतु सेवा निरंतरता की गारंटी नहीं है। ये नियम भारत के विधियों द्वारा शासित हैं।",
        ],
      },
    ],
  },

  "privacy-policy": {
    titleEn: "Privacy Policy",
    titleHi: "गोपनीयता नीति",
    ledeEn:
      "This policy describes how NIRIKSHAK handles officer and inspection data. The portal collects the minimum information required to perform statutory verification workflows.",
    ledeHi:
      "यह नीति बताती है कि NIRIKSHAK अधिकारी एवं निरीक्षण डेटा को कैसे संभालता है। यह पोर्टल वैधानिक सत्यापन कार्यप्रवाह हेतु आवश्यक न्यूनतम जानकारी एकत्र करता है।",
    sections: [
      {
        headingEn: "Information Collected",
        headingHi: "एकत्रित जानकारी",
        bodyEn: [
          "Officer authentication details (name, badge number, role, jurisdiction circle), device fingerprint headers for evidence integrity, and inspection records including packaged-commodity photographs, calibration measurements and OCR tokens.",
        ],
        bodyHi: [
          "अधिकारी प्रमाणीकरण विवरण (नाम, बैज संख्या, भूमिका, अधिकार क्षेत्र मंडल), साक्ष्य अखंडता हेतु डिवाइस फिंगरप्रिंट हेडर, तथा निरीक्षण अभिलेख — पैकेज्ड वस्तु के चित्र, अंशांकन माप एवं ओसीआर टोकन सहित।",
        ],
      },
      {
        headingEn: "Local Storage & Offline Mode",
        headingHi: "स्थानीय भंडारण एवं ऑफ़लाइन मोड",
        bodyEn: [
          "Session tokens, language and accessibility preferences, and offline draft cases are stored in your browser's local storage so the workstation can function during connectivity blackouts (Mode B). This data never leaves your device unless synced to the central datastore.",
        ],
        bodyHi: [
          "सत्र टोकन, भाषा एवं सुगम्यता वरीयताएं, तथा ऑफ़लाइन ड्राफ्ट मामले आपके ब्राउज़र के स्थानीय भंडारण में रखे जाते हैं ताकि कनेक्टिविटी कालेप (मोड बी) के दौरान कार्यस्थान कार्य कर सके। यह डेटा केंद्रीय डेटास्टोर में सिंक होने तक आपके डिवाइस से बाहर नहीं जाता।",
        ],
      },
      {
        headingEn: "Evidence Integrity",
        headingHi: "साक्ष्य अखंडता",
        bodyEn: [
          "Inspection evidence is anchored into a SHA-256 Merkle chain-of-custody and certified under Section 63 of the Bharatiya Sakshya Adhiniyam, 2023. Records are retained by the Department as statutory enforcement records.",
        ],
        bodyHi: [
          "निरीक्षण साक्ष्य SHA-256 मर्कल कस्टडी श्रृंखला में अंकित एवं भारतीय साक्ष्य अधिनियम, 2023 की धारा 63 के अंतर्गत प्रमाणित होते हैं। अभिलेख विभाग द्वारा वैधानिक प्रवर्तन रिकॉर्ड के रूप में सुरक्षित रखे जाते हैं।",
        ],
      },
      {
        headingEn: "No Third-Party Trackers",
        headingHi: "कोई तृतीय-पक्ष ट्रैकर नहीं",
        bodyEn: [
          "This portal does not use advertising cookies or third-party analytics trackers. External links (e-Maap, DoCA, e-Gazette, National Consumer Helpline) are provided for reference and are governed by their respective policies.",
        ],
        bodyHi: [
          "यह पोर्टल विज्ञापन कुकीज़ या तृतीय-पक्ष एनालिटिक्स ट्रैकर का उपयोग नहीं करता। बाहरी लिंक (ई-माप, DoCA, ई-राजपत्र, राष्ट्रीय उपभोक्ता हेल्पलाइन) केवल संदर्भ हेतु हैं और उन पर संबंधित नीतियां लागू होती हैं।",
        ],
      },
    ],
  },

  "hyperlink-policy": {
    titleEn: "Hyperlink Policy",
    titleHi: "हाइपरलिंक नीति",
    ledeEn:
      "Links to external websites are provided for the convenience of officers and comply with the Government of India hyperlink guidelines.",
    ledeHi:
      "अधिकारियों की सुविधा हेतु बाहरी वेबसाइटों के लिंक दिए गए हैं और ये भारत सरकार के हाइपरलिंक दिशानिर्देशों के अनुरूप हैं।",
    sections: [
      {
        headingEn: "Links to Other Websites",
        headingHi: "अन्य वेबसाइटों के लिंक",
        bodyEn: [
          "External portals referenced on this site include e-Maap (National Legal Metrology Portal), the Department of Consumer Affairs, e-Gazette of India, the National Consumer Helpline (1915) and the National Portal of India. These open in a new tab; their content is maintained by the respective organisations.",
        ],
        bodyHi: [
          "इस साइट पर संदर्भित बाहरी पोर्टलों में ई-माप (राष्ट्रीय विधिक मापविज्ञान पोर्टल), उपभोक्ता मामले विभाग, भारत का ई-राजपत्र, राष्ट्रीय उपभोक्ता हेल्पलाइन (1915) एवं भारत का राष्ट्रीय पोर्टल शामिल हैं। ये नए टैब में खुलते हैं; उनकी सामग्री संबंधित संगठनों द्वारा संचालित है।",
        ],
      },
      {
        headingEn: "No Endorsement",
        headingHi: "कोई समर्थन नहीं",
        bodyEn: [
          "When a visitor leaves this portal via an external link, the Department of Consumer Affairs is not responsible for the content, availability or privacy practices of that site, and a link does not constitute endorsement.",
        ],
        bodyHi: [
          "जब कोई आगंतुक बाहरी लिंक से इस पोर्टल को छोड़ता है, तो उस साइट की सामग्री, उपलब्धता या गोपनीयता प्रथाओं के लिए उपभोक्ता मामले विभाग उत्तरदायी नहीं है, और कोई लिंक समर्थन नहीं दर्शाता।",
        ],
      },
      {
        headingEn: "Linking to This Portal",
        headingHi: "इस पोर्टल से लिंक करना",
        bodyEn: [
          "Government departments and statutory bodies may link directly to pages on this portal without prior permission. Other organisations should route linking requests through the Department of Consumer Affairs.",
        ],
        bodyHi: [
          "सरकारी विभाग एवं वैधानिक निकाय बिना अनुमति इस पोर्टल के पृष्ठों से सीधे जोड़ सकते हैं। अन्य संगठनों हेतु लिंकिंग अनुरोध उपभोक्ता मामले विभाग से होकर जाने चाहिए।",
        ],
      },
    ],
  },

  "copyright-policy": {
    titleEn: "Copyright Policy",
    titleHi: "कॉपीराइट नीति",
    ledeEn:
      "Material featured on this portal is the property of the Department of Consumer Affairs, Government of India, and is intended for official statutory enforcement use.",
    ledeHi:
      "इस पोर्टल पर उपलब्ध सामग्री उपभोक्ता मामले विभाग, भारत सरकार की संपत्ति है और यह आधिकारिक वैधानिक प्रवर्तन उपयोग हेतु है।",
    sections: [
      {
        headingEn: "Ownership",
        headingHi: "स्वामित्व",
        bodyEn: [
          "The design, workflow, reports, certificates and statutory schedules presented in this workstation are owned by the Department of Consumer Affairs. Third-party open-source components remain under their respective permissive licences (Apache-2.0, MIT, BSD).",
        ],
        bodyHi: [
          "इस कार्यस्थान में प्रस्तुत डिज़ाइन, कार्यप्रवाह, रिपोर्ट, प्रमाणपत्र एवं सांविधिक अनुसूचियां उपभोक्ता मामले विभाग की संपत्ति हैं। तृतीय-पक्ष ओपन-सोर्स घटक अपने संबंधित अनुमतिप्रद लाइसेंस (Apache-2.0, MIT, BSD) के अंतर्गत रहते हैं।",
        ],
      },
      {
        headingEn: "Permitted Use",
        headingHi: "अनुमत उपयोग",
        bodyEn: [
          "Inspection dossiers, Form-1 notices and Section 63 BSA 2023 certificates generated through this portal may be reproduced for official proceedings without fee, provided the origin is acknowledged and the material is not altered.",
        ],
        bodyHi: [
          "इस पोर्टल से जनरेटेड निरीक्षण डोजियर, प्रपत्र-1 नोटिस एवं धारा 63 बीएसए 2023 प्रमाणपत्र आधिकारिक कार्यवाही हेतु बिना शुल्क पुनःप्रस्तुत किए जा सकते हैं, बशर्ते मूल स्रोत का उल्लेख हो और सामग्री अपरिवर्तित हो।",
        ],
      },
      {
        headingEn: "Permissions",
        headingHi: "अनुमति",
        bodyEn: [
          "Commercial reproduction or any use outside statutory enforcement requires prior written permission from the Department of Consumer Affairs, Government of India.",
        ],
        bodyHi: [
          "व्यावसायिक पुनःप्रस्तुति या वैधानिक प्रवर्तन से बाहर किसी भी उपयोग हेतु उपभोक्ता मामले विभाग, भारत सरकार की पूर्व लिखित अनुमति आवश्यक है।",
        ],
      },
    ],
  },

  "accessibility-statement": {
    titleEn: "Accessibility Statement",
    titleHi: "पहुंच-योग्यता विवरण",
    ledeEn:
      "NIRIKSHAK is built to conform with GIGW 3.0 and targets WCAG 2.1 AA so every officer — including those using assistive technology — can complete statutory workflows independently.",
    ledeHi:
      "NIRIKSHAK को GIGW 3.0 के अनुरूप बनाया गया है और यह WCAG 2.1 AA को लक्षित करता है ताकि सहायक तकनीक का उपयोग करने वाले प्रत्येक अधिकारी वैधानिक कार्यप्रवाह स्वतंत्र रूप से पूरा कर सके।",
    sections: [
      {
        headingEn: "Built-in Accessibility Features",
        headingHi: "अंतर्निहित सुगम्यता सुविधाएं",
        bodyEn: [
          "Keyboard-operable interface with visible focus indicators and skip-to-content links; A-/A/A+ text-size controls and a high-contrast toggle in the top utility bar; bilingual English/Hindi interface; tabular numerals for measurements; and print-friendly statutory report layouts.",
        ],
        bodyHi: [
          "कीबोर्ड से संचालन योग्य इंटरफ़ेस, दृश्य फ़ोकस संकेत एवं कंटेंट-तक-छोड़ें लिंक; शीर्ष यूटिलिटी बार में A-/A/A+ पाठ आकार नियंत्रण एवं हाई-कंट्रास्ट टॉगल; द्विभाषी अंग्रेज़ी/हिंदी इंटरफ़ेस; माप हेतु टैबुलर अंक; तथा प्रिंट-अनुकूल सांविधिक रिपोर्ट लेआउट।",
        ],
      },
      {
        headingEn: "Respecting Motion Preferences",
        headingHi: "गति वरीयताओं का सम्मान",
        bodyEn: [
          "Animations on this portal are functional feedback, not decoration. If your operating system requests reduced motion, all non-essential transitions are disabled automatically.",
        ],
        bodyHi: [
          "इस पोर्टल पर एनिमेशन सजावट नहीं, बल्कि कार्यात्मक प्रतिक्रिया है। यदि आपका ऑपरेटिंग सिस्टम कम गति (reduced motion) का अनुरोध करता है, तो सभी गैर-आवश्यक ट्रांज़िशन स्वतः अक्षम हो जाते हैं।",
        ],
      },
      {
        headingEn: "Compatibility",
        headingHi: "संगतता",
        bodyEn: [
          "The portal is designed for current versions of Chrome, Edge, Firefox and Safari on desktop, and responsive layouts support field use on mobile devices.",
        ],
        bodyHi: [
          "पोर्टल डेस्कटॉप पर Chrome, Edge, Firefox एवं Safari के वर्तमान संस्करणों हेतु डिज़ाइन किया गया है, तथा उत्तरदाशी लेआउट मोबाइल उपकरणों पर क्षेत्रीय उपयोग का समर्थन करते हैं।",
        ],
      },
      {
        headingEn: "Feedback",
        headingHi: "प्रतिक्रिया",
        bodyEn: [
          "If any part of this workstation presents an accessibility barrier, report it through the National Consumer Helpline (1915) or your jurisdictional Controller so it can be corrected in the next release.",
        ],
        bodyHi: [
          "यदि इस कार्यस्थान का कोई भाग सुगम्यता बाधा प्रस्तुत करता है, तो इसे राष्ट्रीय उपभोक्ता हेल्पलाइन (1915) या अपने अधिकार-क्षेत्र के नियंत्रक को सूचित करें ताकि अगले रिलीज़ में इसे ठीक किया जा सके।",
        ],
      },
    ],
  },
};
