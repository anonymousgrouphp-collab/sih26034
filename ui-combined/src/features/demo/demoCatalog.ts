/**
 * Authoritative Demonstration Scenario Catalog for NyayaDrishti-LM
 * Models the 7 Golden Statutory Demonstration Scenarios per 12_DEMO_PLAN.md
 * and 11_TESTING_AND_VALIDATION_PLAN.md.
 * 
 * Strict boundary:
 * - All demonstration cases are pre-certified golden test fixtures.
 * - Truthfully tagged as DEMO FIXTURE across all UI surfaces.
 * - Never misrepresents synthetic data as live seized enforcement records.
 */

export interface DemoScenarioItem {
  scenarioNumber: number;
  totalScenarios: number;
  skuId: string;
  caseId: string;
  inspectionNumber: string;
  title: string;
  titleHi: string;
  category: string;
  categoryHi: string;
  packageType: string;
  packageTypeHi: string;
  targetVerdict: "FAIL" | "PASS" | "REVIEW" | "UNABLE_TO_VERIFY";
  verdictLabel: string;
  verdictLabelHi: string;
  headlineViolation: string;
  headlineViolationHi: string;
  statutoryRules: string[];
  statutoryRulesHi: string[];
  testedCapabilities: string[];
  testedCapabilitiesHi: string[];
  detailedRationale: string;
  detailedRationaleHi: string;
  evaluatorGuide: string;
  evaluatorGuideHi: string;
  imagePath: string;
  pdpAreaCm2: number;
  expectedFontMm: number;
  observedFontMm?: number;
  mrpInr?: number;
  uspDeclared?: string;
  uspCalculated?: string;
}

export const DEMO_SCENARIOS: DemoScenarioItem[] = [
  {
    scenarioNumber: 1,
    totalScenarios: 7,
    skuId: "SKU-DEMO-01",
    caseId: "SKU-DEMO-01",
    inspectionNumber: "INSP-20260910-B144",
    title: "Sunfeast Butter Cookies 200g",
    titleHi: "सनफीस्ट बटर कुकीज़ 200g",
    category: "Food & Snacks",
    categoryHi: "खाद्य एवं स्नैक्स",
    packageType: "Rectangular Cardboard Carton",
    packageTypeHi: "आयताकार गत्ता कार्टन",
    targetVerdict: "FAIL",
    verdictLabel: "STATUTORY VIOLATION",
    verdictLabelHi: "सांविधिक उल्लंघन (अनुत्तीर्ण)",
    headlineViolation: "Table-I Font Deficit 1.84 mm vs 2.50 mm + Banned 'gms' Unit",
    headlineViolationHi: "तालिका-I फॉन्ट कमी 1.84 मिमी बनाम 2.50 मिमी + प्रतिबंधित 'gms' इकाई",
    statutoryRules: [
      "Rule 6(1)(h) read with Table-I, G.S.R. 629(E)",
      "Section 11 LM Act 2009 read with Rule 12 LMPC Rules 2011",
      "Section 36(1) Legal Metrology Act 2009 (Misbranded Packaging)",
    ],
    statutoryRulesHi: [
      "नियम 6(1)(h) सहपठित तालिका-I, जीएसआर 629(E)",
      "धारा 11 एलएम अधिनियम 2009 सहपठित नियम 12",
      "धारा 36(1) विधिक मापविज्ञान अधिनियम 2009 (मिथ्या छाप)",
    ],
    testedCapabilities: [
      "Optical Quality Gate (Sharpness & Exposure Verified)",
      "ArUco 4x4 Planar Metric Homography Calibration",
      "Multilingual DBNet++ & PP-OCRv4 Tokenization",
      "Table-I Minimum Numeral Height Schedule Engine",
      "Banned Unit Regex Flagger ('gms' -> standard 'g')",
      "Section 63 BSA 2023 Merkle Proof & Form-1 Compounding Notice",
    ],
    testedCapabilitiesHi: [
      "प्रकाशीय गुणवत्ता द्वार (तीक्ष्णता एवं उद्भासन सत्यापित)",
      "ArUco 4x4 समतलीय मीट्रिक होमोग्राफी अंशांकन",
      "बहुभाषी DBNet++ एवं PP-OCRv4 टोकनीकरण",
      "तालिका-I न्यूनतम अंक ऊंचाई अनुसूची इंजन",
      "प्रतिबंधित मात्रक फ़्लैगर ('gms' -> मानक 'g')",
      "धारा 63 बीएसए 2023 मर्कल प्रमाण एवं प्रपत्र-1 समझौता नोटिस",
    ],
    detailedRationale:
      "Principal Display Panel area (144 cm²) falls within 100 < Area <= 500 cm² bracket, mandating minimum 2.50 mm numeral height under Table-I Row 3. Measured height is 1.84 mm (-26.4% deficit). In addition, using 'gms' instead of SI standard 'g' contravenes Section 11 of the LM Act 2009.",
    detailedRationaleHi:
      "मुख्य प्रदर्शन पैनल क्षेत्रफल (144 सेमी²) 100 < क्षेत्रफल <= 500 सेमी² ब्रैकेट में आता है, जिसके अंतर्गत तालिका-I पंक्ति 3 के अनुसार न्यूनतम 2.50 मिमी अंक ऊंचाई अनिवार्य है। मापी गई ऊंचाई 1.84 मिमी (-26.4% कमी) है। साथ ही, मानक 'g' के स्थान पर 'gms' का प्रयोग धारा 11 का स्पष्ट उल्लंघन है।",
    evaluatorGuide:
      "Inspect the calibrated packaging canvas to verify the red bounding box around '200 gms'. Note the 1.84 mm vs 2.50 mm deficit in the rule card, and click 'Generate Form-1 Notice' to view the automated compounding notice.",
    evaluatorGuideHi:
      "कैलिब्रेटेड पैकेजिंग कैनवास पर '200 gms' के चारों ओर लाल बाउंडिंग बॉक्स का निरीक्षण करें। नियम कार्ड में 1.84 मिमी बनाम 2.50 मिमी का अंतर देखें और स्वचालित नोटिस हेतु 'प्रपत्र-1 नोटिस तैयार करें' पर क्लिक करें।",
    imagePath: "/storage/uploads/sku_demo_01_biscuit.jpg",
    pdpAreaCm2: 144.0,
    expectedFontMm: 2.5,
    observedFontMm: 1.84,
    mrpInr: 75.0,
  },
  {
    scenarioNumber: 2,
    totalScenarios: 7,
    skuId: "SKU-DEMO-02",
    caseId: "SKU-DEMO-02",
    inspectionNumber: "INSP-20260910-C208",
    title: "Ready Curry Retort Pouch 300g",
    titleHi: "रेडी करी रिटॉर्ट पाउच 300g",
    category: "Ready-to-Eat Food",
    categoryHi: "तैयार खाद्य उत्पाद",
    packageType: "Flexible Stand-up Pouch",
    packageTypeHi: "फ्लेक्सिबल स्टैंड-अप पाउच",
    targetVerdict: "FAIL",
    verdictLabel: "USP MATH MISMATCH",
    verdictLabelHi: "यूएसपी गणितीय विसंगति (अनुत्तीर्ण)",
    headlineViolation: "Rule 6(1)(e) USP Mismatch (Declared ₹0.28 vs Calc ₹0.23/g) + Missing Email",
    headlineViolationHi: "नियम 6(1)(e) यूएसपी विसंगति (घोषित ₹0.28 बनाम परिकलित ₹0.23/g) + ईमेल अनुपस्थित",
    statutoryRules: [
      "Rule 6(1)(e) read with GSR 779(E) (Unit Sale Price Mandate)",
      "Rule 6(1)(ab) Consumer Care Details Mandate (Missing Email)",
      "Section 36(1) LM Act 2009",
    ],
    statutoryRulesHi: [
      "नियम 6(1)(e) सहपठित जीएसआर 779(E) (इकाई विक्रय मूल्य)",
      "नियम 6(1)(ab) उपभोक्ता सेवा विवरण (ईमेल अनुपस्थित)",
      "धारा 36(1) विधिक मापविज्ञान अधिनियम 2009",
    ],
    testedCapabilities: [
      "Unit Sale Price (USP) Mathematical Verification Engine",
      "Consumer Care Contact Details Extraction & Validation",
      "Temporal Epoch Router (Enforcing post-Jan 2022 USP mandate)",
      "Multi-finding Severity Aggregation",
    ],
    testedCapabilitiesHi: [
      "इकाई विक्रय मूल्य (यूएसपी) गणितीय सत्यापन इंजन",
      "उपभोक्ता सेवा संपर्क विवरण निष्कर्षण एवं सत्यापन",
      "कालिक कालखंड राउटर (जनवरी 2022 उपरांत यूएसपी जनादेश)",
      "बहु-खोज गंभीरता एकत्रीकरण",
    ],
    detailedRationale:
      "MRP is ₹70.00 for 300 g. Calculated USP is ₹70 / 300 = ₹0.2333/g (rounded to ₹0.23/g). Package declares ₹0.28/g, which deviates by ₹0.05/g (|Declared - Calculated| = 0.05 > 0.02 INR statutory tolerance). Furthermore, consumer care email is missing.",
    detailedRationaleHi:
      "300 ग्राम हेतु एमआरपी ₹70.00 है। परिकलित यूएसपी ₹70 / 300 = ₹0.2333/ग्राम (निकटतम ₹0.23/ग्राम) है। पैकेज पर ₹0.28/ग्राम घोषित है, जो ₹0.05/ग्राम विचलित है (सांविधिक सहिष्णुता सीमा ₹0.02 से अधिक)। साथ ही उपभोक्ता देखभाल ईमेल अनुपस्थित है।",
    evaluatorGuide:
      "Examine the Unit Sale Price discrepancy card. Notice that the mathematical validation engine automatically computes the expected rate per gram and flags both the math mismatch and consumer care omission.",
    evaluatorGuideHi:
      "इकाई विक्रय मूल्य विसंगति कार्ड का परीक्षण करें। देखें कि गणितीय सत्यापन इंजन स्वचालित रूप से प्रति ग्राम अपेक्षित दर की गणना करता है और विसंगति को रेखांकित करता है।",
    imagePath: "/storage/uploads/sku_demo_02_curry.jpg",
    pdpAreaCm2: 120.0,
    expectedFontMm: 2.5,
    observedFontMm: 2.7,
    mrpInr: 70.0,
    uspDeclared: "₹0.28 / g",
    uspCalculated: "₹0.23 / g",
  },
  {
    scenarioNumber: 3,
    totalScenarios: 7,
    skuId: "SKU-DEMO-03",
    caseId: "SKU-DEMO-03",
    inspectionNumber: "INSP-20260910-W312",
    title: "Packaged Natural Mineral Water 1L",
    titleHi: "पैकेजबंद प्राकृतिक खनिज जल 1L",
    category: "Beverages / Water",
    categoryHi: "पेय पदार्थ / जल",
    packageType: "Cylindrical PET Bottle",
    packageTypeHi: "बेलनाकार पीईटी बोतल",
    targetVerdict: "PASS",
    verdictLabel: "100% STATUTORY COMPLIANT",
    verdictLabelHi: "100% सांविधिक अनुपालन (उत्तीर्ण)",
    headlineViolation: "Full Statutory Compliance (Cylindrical PDP 40% Area, Font 3.1mm, Valid USP)",
    headlineViolationHi: "पूर्ण सांविधिक अनुपालन (बेलनाकार पीडीपी 40% क्षेत्रफल, फॉन्ट 3.1मिमी, मान्य यूएसपी)",
    statutoryRules: [
      "Rule 6(1) Complete Mandatory Declarations Verified",
      "Rule 6(1)(h) Table-I Row 3 (Observed 3.10 mm >= 2.50 mm)",
      "Rule 6(1)(e) USP Consistent (₹20.00 / L)",
      "Section 11 LM Act 2009 (Standard SI unit 'L' verified)",
    ],
    statutoryRulesHi: [
      "नियम 6(1) संपूर्ण अनिवार्य घोषणाएं सत्यापित",
      "नियम 6(1)(h) तालिका-I पंक्ति 3 (प्रेक्षित 3.10 मिमी >= 2.50 मिमी)",
      "नियम 6(1)(e) यूएसपी सुसंगत (₹20.00 / L)",
      "धारा 11 एलएम अधिनियम 2009 (मानक एसआई मात्रक 'L' सत्यापित)",
    ],
    testedCapabilities: [
      "Cylindrical Packaging Surface Area Geometry Calculation",
      "Principal Display Panel (PDP) 40% Projection Schedule",
      "Full Metric Schedule Verification",
      "Section 63 BSA Tamper-Proof Clearance Certificate Generation",
    ],
    testedCapabilitiesHi: [
      "बेलनाकार पैकेजिंग सतह क्षेत्रफल ज्यामिति गणना",
      "मुख्य प्रदर्शन पैनल (पीडीपी) 40% प्रक्षेपण अनुसूची",
      "पूर्ण मीट्रिक अनुसूची सत्यापन",
      "धारा 63 बीएसए छेड़छाड़-रोधी प्रमाण पत्र उत्पादन",
    ],
    detailedRationale:
      "Cylindrical container has surface area of 785 cm² with 40% PDP area of 314 cm² (requiring >= 2.50 mm height). Observed numeral height is 3.10 mm (+24% safety margin). MRP ₹20.00 matches calculated USP of ₹20.00 / L. All mandatory declarations present.",
    detailedRationaleHi:
      "बेलनाकार कंटेनर का सतह क्षेत्रफल 785 सेमी² है जिसमें 40% पीडीपी क्षेत्रफल 314 सेमी² है (न्यूनतम 2.50 मिमी आवश्यक)। प्रेक्षित अंक ऊंचाई 3.10 मिमी (+24% सुरक्षा मार्जिन) है। एमआरपी ₹20.00 परिकलित यूएसपी ₹20.00 / L से पूर्णतः मेल खाता है।",
    evaluatorGuide:
      "Notice the green PASS indicators across all 5 statutory dimensions. The officer can issue an official Certificate of Compliance under Section 63 of BSA 2023 with cryptographic signature.",
    evaluatorGuideHi:
      "सभी 5 सांविधिक आयामों में हरे PASS संकेतकों का अवलोकन करें। अधिकारी डिजिटल हस्ताक्षर के साथ धारा 63 के तहत अनुपालन प्रमाण पत्र जारी कर सकता है।",
    imagePath: "/storage/uploads/sku_demo_03_water.jpg",
    pdpAreaCm2: 314.0,
    expectedFontMm: 2.5,
    observedFontMm: 3.1,
    mrpInr: 20.0,
    uspDeclared: "₹20.00 / L",
    uspCalculated: "₹20.00 / L",
  },
  {
    scenarioNumber: 4,
    totalScenarios: 7,
    skuId: "SKU-DEMO-04",
    caseId: "SKU-DEMO-04",
    inspectionNumber: "INSP-20260910-S419",
    title: "Herbal Bathing Soap Bar 125g",
    titleHi: "हर्बल बाथिंग साबुन बार 125g",
    category: "Cosmetics & Personal Care",
    categoryHi: "सौंदर्य प्रसाधन एवं व्यक्तिगत स्वच्छता",
    packageType: "Rectangular Paper Wrap",
    packageTypeHi: "आयताकार पेपर रैपर",
    targetVerdict: "REVIEW",
    verdictLabel: "HUMAN OFFICER REVIEW",
    verdictLabelHi: "मानव अधिकारी समीक्षा (रिव्यू)",
    headlineViolation: "Borderline Font Measurement (2.46 mm within sensor k=2 uncertainty band)",
    headlineViolationHi: "सीमांत फॉन्ट माप (सेंसर k=2 अनिश्चितता बैंड में 2.46 मिमी)",
    statutoryRules: [
      "Rule 6(1)(h) read with Table-I Row 3 (Required >= 2.50 mm)",
      "ISO/IEC Guide 98-3 (GUM) Metrological Measurement Uncertainty",
      "Human-in-the-Loop (HITL) Statutory Adjudication Principle",
    ],
    statutoryRulesHi: [
      "नियम 6(1)(h) सहपठित तालिका-I पंक्ति 3 (अपेक्षित >= 2.50 मिमी)",
      "आईएसओ/आईईसी गाइड 98-3 माप संबंधी अनिश्चितता सिद्धांत",
      "ह्यूमन-इन-द-लूप (एचआईटीएल) सांविधिक निर्णय सिद्धांत",
    ],
    testedCapabilities: [
      "Metrological Sensor Uncertainty Band Computation (k=2, 95% Confidence)",
      "Epistemic 4-State Verdict Classification (REVIEW vs premature FAIL)",
      "Zero False Accusation Evidentiary Guardrail",
      "Officer Manual Caliper Retest Recommendation Interface",
    ],
    testedCapabilitiesHi: [
      "मापिकी सेंसर अनिश्चितता बैंड गणना (k=2, 95% विश्वास अंतराल)",
      "ज्ञानमीमांसा 4-अवस्था निर्णय वर्गीकरण (समीक्षा बनाम असामयिक असफलता)",
      "शून्य असत्य आरोप साक्ष्य सुरक्षा तंत्र",
      "अधिकारी भौतिक कैलिपर पुनः परीक्षण संस्तुति इंटरफेस",
    ],
    detailedRationale:
      "Required minimum height is 2.50 mm. The optical vision pipeline measured 2.46 mm. However, sensor calibration margin of error is +/- 0.08 mm (95% confidence). Because 2.50 mm lies within [2.38, 2.54] mm, the system refuses to issue a false violation and escalates to human officer review.",
    detailedRationaleHi:
      "अपेक्षित न्यूनतम ऊंचाई 2.50 मिमी है। ऑप्टिकल विजन पाइपलाइन ने 2.46 मिमी मापा। हालांकि सेंसर अंशांकन त्रुटि सीमा +/- 0.08 मिमी (95% विश्वास) है। चूंकि 2.50 मिमी [2.38, 2.54] मिमी बैंड के भीतर आता है, सिस्टम असत्य आरोप लगाने से बचते हुए मानव अधिकारी समीक्षा हेतु अग्रेषित करता है।",
    evaluatorGuide:
      "Examine how the system protects the merchant from unwarranted prosecution. The officer can record physical digital caliper measurements or order a re-inspection.",
    evaluatorGuideHi:
      "परीक्षण करें कि कैसे सिस्टम विक्रेता को अवांछित अभियोजन से बचाता है। अधिकारी भौतिक डिजिटल कैलिपर माप दर्ज कर सकता है।",
    imagePath: "/storage/uploads/sku_demo_04_soap.jpg",
    pdpAreaCm2: 110.0,
    expectedFontMm: 2.5,
    observedFontMm: 2.46,
    mrpInr: 45.0,
  },
  {
    scenarioNumber: 5,
    totalScenarios: 7,
    skuId: "SKU-DEMO-05",
    caseId: "SKU-DEMO-05",
    inspectionNumber: "INSP-20260910-P525",
    title: "Crispy Potato Chips 75g",
    titleHi: "कुरकुरी आलू चिप्स 75g",
    category: "Food & Snacks",
    categoryHi: "खाद्य एवं स्नैक्स",
    packageType: "Glossy Metallic Pillow Pouch",
    packageTypeHi: "चमकदार मेटैलिक तकिया पाउच",
    targetVerdict: "UNABLE_TO_VERIFY",
    verdictLabel: "OPTICAL RETAKE REQUIRED",
    verdictLabelHi: "प्रकाशीय पुनः कैप्चर आवश्यक",
    headlineViolation: "Specular Glare Bloom (6.4% > 3.0% threshold) Obscuring Declarations",
    headlineViolationHi: "चकाचौंध फैलाव (6.4% > 3.0% सीमा) से घोषणाएं अस्पष्ट",
    statutoryRules: [
      "Section 63 BSA 2023 Digital Evidence Quality Standards",
      "Optical Quality Gate Thresholds (Glare Variance <= 3.0%)",
      "Field Inspector Guidance Protocol",
    ],
    statutoryRulesHi: [
      "धारा 63 बीएसए 2023 डिजिटल साक्ष्य गुणवत्ता मानक",
      "प्रकाशीय गुणवत्ता द्वार सीमाएं (चकाचौंध प्रसरण <= 3.0%)",
      "क्षेत्रीय निरीक्षक मार्गदर्शन प्रोटोकॉल",
    ],
    testedCapabilities: [
      "Automated Specular Glare & Reflection Detection",
      "Laplacian Blur Variance Quality Gate",
      "Real-time Camera HUD Retake Guidance Advisor",
      "Prevention of Judicial Rejection under Section 63 BSA 2023",
    ],
    testedCapabilitiesHi: [
      "स्वचालित चकाचौंध एवं परावर्तन पहचान",
      "लाप्लासियन ब्लर प्रसरण गुणवत्ता द्वार",
      "रीयल-टाइम कैमरा एचयूडी पुनः कैप्चर मार्गदर्शन",
      "धारा 63 बीएसए के तहत न्यायिक अस्वीकृति की रोकथाम",
    ],
    detailedRationale:
      "Glossy packaging caused specular flash bloom covering 6.4% of the panel area (statutory tolerance <= 3.0%). The net quantity text is obscured by glare. Rather than hallucinating or guessing OCR values, the system classifies the case as UNABLE_TO_VERIFY and instructs the officer to tilt the camera 15°.",
    detailedRationaleHi:
      "चमकदार पैकेजिंग के कारण 6.4% पैनल क्षेत्र पर फ्लैश चकाचौंध उत्पन्न हुई (सांविधिक सीमा <= 3.0%)। चकाचौंध से शुद्ध मात्रा का पाठ अस्पष्ट हो गया। ओसीआर में अनुमान लगाने के बजाय सिस्टम इसे UNABLE_TO_VERIFY वर्गीकृत करता है और कैमरे को 15° झुकाने की सलाह देता है।",
    evaluatorGuide:
      "Observe the Optical Quality Gate diagnostics card displaying the glare warning. Notice the camera re-shoot advisory providing exact angle corrections.",
    evaluatorGuideHi:
      "चकाचौंध चेतावनी प्रदर्शित करने वाले प्रकाशीय गुणवत्ता द्वार नैदानिक कार्ड का अवलोकन करें। कोण सुधार प्रदान करने वाली पुनः शूट सलाह देखें।",
    imagePath: "/storage/uploads/sku_demo_05_chips.jpg",
    pdpAreaCm2: 210.0,
    expectedFontMm: 2.5,
    mrpInr: 20.0,
  },
  {
    scenarioNumber: 6,
    totalScenarios: 7,
    skuId: "SKU-DEMO-06",
    caseId: "SKU-DEMO-06",
    inspectionNumber: "INSP-20260910-E631",
    title: "Premium Wireless Earbuds (E-Commerce)",
    titleHi: "प्रीमियम वायरलेस ईयरबड्स (ई-कॉमर्स)",
    category: "Electronics / E-Commerce",
    categoryHi: "इलेक्ट्रॉनिक्स / ई-कॉमर्स",
    packageType: "Digital Marketplace Single Listing",
    packageTypeHi: "डिजिटल मार्केटप्लेस एकल लिस्टिंग",
    targetVerdict: "FAIL",
    verdictLabel: "E-COMMERCE RULE 6(10) VIOLATION",
    verdictLabelHi: "ई-कॉमर्स नियम 6(10) उल्लंघन (अनुत्तीर्ण)",
    headlineViolation: "Rule 6(10) / GSR 594(E) Missing Mandatory Country of Origin Declaration",
    headlineViolationHi: "नियम 6(10) / जीएसआर 594(E) अनिवार्य मूल देश घोषणा अनुपस्थित",
    statutoryRules: [
      "Rule 6(10) read with Rule 6(1)(p) and G.S.R. 128(E)",
      "Statutory Exemption for Mfg Date on digital listings (GSR 594(E))",
      "Section 36(1) read with Section 49 Legal Metrology Act 2009",
    ],
    statutoryRulesHi: [
      "नियम 6(10) सहपठित नियम 6(1)(p) एवं जीएसआर 128(E)",
      "डिजिटल लिस्टिंग पर निर्माण तिथि हेतु सांविधिक छूट (जीएसआर 594(E))",
      "धारा 36(1) सहपठित धारा 49 विधिक मापविज्ञान अधिनियम 2009",
    ],
    testedCapabilities: [
      "E-Commerce Listing DOM & Snapshot Parsing Pipeline",
      "Country of Origin Verification with Indic Boundaries",
      "Rule 6(10) Statutory Exemption Architecture (Prevents False Mfg Date Flags)",
      "Digital Evidence Audit Record for Online Marketplaces",
    ],
    testedCapabilitiesHi: [
      "ई-कॉमर्स लिस्टिंग डोम एवं स्नैपशॉट पार्सिंग पाइपलाइन",
      "भारतीय सीमाओं के साथ मूल देश सत्यापन",
      "नियम 6(10) सांविधिक छूट आर्किटेक्चर (निर्माण तिथि पर असत्य झंडा रोक)",
      "ऑनलाइन मार्केटप्लेस हेतु डिजिटल साक्ष्य ऑडिट रिकॉर्ड",
    ],
    detailedRationale:
      "Under Rule 6(10) of LMPC Rules, 2011, all digital e-commerce marketplaces must declare manufacturer, net quantity, MRP, consumer care, and country of origin. This listing omits the Country of Origin. Importantly, the engine correctly identifies the statutory exemption for Manufacturing Date under GSR 594(E) and records an audit exemption instead of a false violation.",
    detailedRationaleHi:
      "एलएमपीसी नियम 2011 के नियम 6(10) के अंतर्गत सभी ई-कॉमर्स लिस्टिंग पर निर्माता, शुद्ध मात्रा, एमआरपी, उपभोक्ता सेवा और मूल देश का उल्लेख अनिवार्य है। लिस्टिंग में मूल देश अनुपस्थित है। प्रणाली निर्माण तिथि हेतु सांविधिक छूट को सही ढंग से पहचानती है।",
    evaluatorGuide:
      "Examine the E-Commerce audit panel. Notice that Country of Origin is flagged as a CRITICAL violation while Date of Manufacture is marked NOT_APPLICABLE with explicit citation to GSR 594(E).",
    evaluatorGuideHi:
      "ई-कॉमर्स ऑडिट पैनल का परीक्षण करें। ध्यान दें कि मूल देश को गंभीर उल्लंघन के रूप में चिह्नित किया गया है, जबकि निर्माण तिथि को जीएसआर 594(E) के तहत छूट दी गई है।",
    imagePath: "/storage/uploads/sku_demo_06_listing.png",
    pdpAreaCm2: 400.0,
    expectedFontMm: 2.5,
    mrpInr: 1499.0,
  },
  {
    scenarioNumber: 7,
    totalScenarios: 7,
    skuId: "demo-fortune-sunlite",
    caseId: "demo-fortune-sunlite",
    inspectionNumber: "INSP-20260910-F001",
    title: "Fortune Sunlite Refined Sunflower Oil 1L",
    titleHi: "फॉर्च्यून सनलाइट रिफाइंड सूर्यमुखी तेल 1L",
    category: "Edible Oils",
    categoryHi: "खाद्य तेल",
    packageType: "Flexible Liquid Pouch",
    packageTypeHi: "फ्लेक्सिबल लिक्विड पाउच",
    targetVerdict: "PASS",
    verdictLabel: "END-TO-END CALIBRATED BENCHMARK",
    verdictLabelHi: "एंड-टू-एंड अंशांकित बेंचमार्क (उत्तीर्ण)",
    headlineViolation: "Complete End-to-End Benchmark: ArUco Fiducial, Table-I Compliance, Section 63 Proof",
    headlineViolationHi: "पूर्ण बेंचमार्क: ArUco संदर्भ मानक, तालिका-I अनुपालन, धारा 63 प्रमाण",
    statutoryRules: [
      "Rule 6(1) Edible Oil Mandatory Declarations (Dual Units: 1 L / 910 g)",
      "Rule 6(1)(h) Table-I Row 3 (Observed 3.80 mm >= 2.50 mm)",
      "Rule 6(1)(k) Unit Sale Price Consistency (₹145.00 / L)",
      "Section 63 BSA 2023 Digital Evidence Certificate Generation",
    ],
    statutoryRulesHi: [
      "नियम 6(1) खाद्य तेल अनिवार्य घोषणाएं (दोहरी इकाइयां: 1 L / 910 g)",
      "नियम 6(1)(h) तालिका-I पंक्ति 3 (प्रेक्षित 3.80 मिमी >= 2.50 मिमी)",
      "नियम 6(1)(k) इकाई विक्रय मूल्य सुसंगतता (₹145.00 / L)",
      "धारा 63 बीएसए 2023 डिजिटल साक्ष्य प्रमाण पत्र उत्पादन",
    ],
    testedCapabilities: [
      "50mm ArUco Marker Planar Metric Rectification",
      "Edible Oil Dual Declaration Schedule (Volume + Mass in grams)",
      "Full Cryptographic SHA-256 Merkle DAG Chain of Custody",
      "ReportLab Form 1 Notice & Section 63 BSA Certificate",
    ],
    testedCapabilitiesHi: [
      "50 मिमी ArUco मार्कर समतलीय मीट्रिक परिशोधन",
      "खाद्य तेल दोहरी घोषणा अनुसूची (आयतन + ग्राम में द्रव्यमान)",
      "पूर्ण क्रिप्टोग्राफ़िक SHA-256 मर्कल डीएजी कस्टडी श्रृंखला",
      "रिपोर्टलैब प्रपत्र 1 नोटिस एवं धारा 63 बीएसए प्रमाण पत्र",
    ],
    detailedRationale:
      "High-fidelity reference case with 50mm ArUco fiducial detected (0.2325 mm/px scale). Both volume (1 L) and mass (910 g) are properly declared per Legal Metrology rules for edible oil packaging. Numeral font height of 3.80 mm comfortably exceeds Table-I 2.50 mm threshold. Complete SHA-256 Merkle DAG and Section 63 certificate verified.",
    detailedRationaleHi:
      "50 मिमी ArUco संदर्भ मानक सहित उच्च-सटीकता संदर्भ मामला। खाद्य तेल पैकेजिंग नियमों के अनुसार आयतन (1 L) और द्रव्यमान (910 ग्राम) दोनों विधिवत घोषित हैं। अंक ऊंचाई 3.80 मिमी तालिका-I के 2.50 मिमी से अधिक है। मर्कल डीएजी और धारा 63 प्रमाण पत्र सत्यापित।",
    evaluatorGuide:
      "This is the comprehensive showcase for end-to-end adjudication. Click through the Canvas, HUD, Audit Timeline, and Evidence Dossier tabs to see all 12 stages of the NyayaDrishti-LM pipeline operating harmoniously.",
    evaluatorGuideHi:
      "यह एंड-टू-एंड न्यायनिर्णयन हेतु विस्तृत प्रदर्शन है। न्यायदृष्टि-एलएम पाइपलाइन के सभी 12 चरणों को सामंजस्य से कार्य करते हुए देखने के लिए कैनवास, एचयूडी, ऑडिट टाइमलाइन और साक्ष्य डोजियर टैब देखें।",
    imagePath: "/storage/uploads/REAL-PKG-01_8901719134845.jpg",
    pdpAreaCm2: 180.0,
    expectedFontMm: 2.5,
    observedFontMm: 3.8,
    mrpInr: 145.0,
    uspDeclared: "₹145.00 / L",
    uspCalculated: "₹145.00 / L",
  },
];

export const getDemoScenarioById = (id: string): DemoScenarioItem | undefined => {
  if (!id) return undefined;
  const lower = id.toLowerCase().trim();
  return (
    DEMO_SCENARIOS.find(
      (s) =>
        s.skuId.toLowerCase() === lower ||
        s.caseId.toLowerCase() === lower ||
        s.inspectionNumber.toLowerCase() === lower
    ) ||
    DEMO_SCENARIOS.find((s) => {
      if (lower.includes("biscuit") || lower.includes("cookie") || lower.includes("demo-01") || lower === "1") {
        return s.skuId === "SKU-DEMO-01";
      }
      if (lower.includes("curry") || lower.includes("dal") || lower.includes("demo-02") || lower === "2") {
        return s.skuId === "SKU-DEMO-02";
      }
      if (lower.includes("water") || lower.includes("demo-03") || lower === "3") {
        return s.skuId === "SKU-DEMO-03";
      }
      if (lower.includes("soap") || lower.includes("demo-04") || lower === "4") {
        return s.skuId === "SKU-DEMO-04";
      }
      if (lower.includes("chips") || lower.includes("potato") || lower.includes("demo-05") || lower === "5") {
        return s.skuId === "SKU-DEMO-05";
      }
      if (lower.includes("earbuds") || lower.includes("ecomm") || lower.includes("demo-06") || lower === "6") {
        return s.skuId === "SKU-DEMO-06";
      }
      if (lower.includes("fortune") || lower.includes("sunlite") || lower.includes("oil") || lower === "7") {
        return s.skuId === "demo-fortune-sunlite";
      }
      return false;
    })
  );
};
