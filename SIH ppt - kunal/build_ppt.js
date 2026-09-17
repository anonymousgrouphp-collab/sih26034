// NIRIKSHAK SIH26034 — Winning Presentation Build Script
// Uses pptxgenjs to generate a 6-slide SIH2026-compliant presentation
// Run: node build_ppt.js

'use strict';
const PptxGenJS = require('pptxgenjs');
const path = require('path');
const fs = require('fs');

// ─── COLOR PALETTE ─────────────────────────────────────────────────────────
const C = {
  navy:       'F2F6FA',  // light blue-grey background
  navyDark:   '1B3A6B',  // deep navy (primary)
  navyMid:    '274A8B',  // mid navy
  gold:       'D4AF37',  // gold accent
  goldLight:  'F5E87A',  // light gold
  white:      'FFFFFF',
  offWhite:   'F8F9FC',
  textDark:   '1A1A2E',
  textMid:    '3D4870',
  textLight:  '6B7A99',
  pass:       '1A7F3C',
  fail:       'C0392B',
  warn:       'E67E22',
  bgSlide:    'FAFBFF',  // very light slide background
  bgDark:     '0D1B2A',  // dark background for title
  bgSection:  'EEF3FA',  // section highlight
};

// ─── ASSET PATHS ────────────────────────────────────────────────────────────
const ASSETS = {
  logo:         path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/assets/brand/png/nirikshak-wordmark.png'),
  emblem:       path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/assets/brand/png/emblem_highres_white.png'),
  emblemColor:  path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/assets/brand/png/emblem_highres.png'),
  icon:         path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/assets/brand/png/nirikshak-icon.png'),
  mark:         path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/assets/brand/png/nirikshak-mark-drishti-chakra.png'),
  problemImg:   path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/diagrams/01_problem_stats.jpg'),
  pipelineImg:  path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/flowcharts/02_pipeline_flow.jpg'),
  janVishwas:   path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/diagrams/03_jan_vishwas_enforcement.jpg'),
  skuResults:   path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/charts/04_sku_test_results.jpg'),
  sysArch:      path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/architecture/05_system_modes.jpg'),
  impact:       path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/charts/06_impact_metrics.jpg'),
  dashboardUI:  path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/02_screenshots/dashboard_overview.png'),
  adjudicationUI: path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/02_screenshots/inspection_adjudication_hud.png'),
  caseDetailUI: path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/02_screenshots/case_details_demo.png'),
  evidenceDossierUI: path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/assests/02_screenshots/reports_evidence_dossier.png'),
};


// Verify assets exist
const missing = Object.entries(ASSETS).filter(([k, v]) => !fs.existsSync(v));
if (missing.length) {
  console.warn('WARNING: Missing assets:', missing.map(([k]) => k).join(', '));
}

// ─── PPTX SETUP ─────────────────────────────────────────────────────────────
const pres = new PptxGenJS();
pres.layout = 'LAYOUT_16x9'; // 10" × 5.625"
pres.title = 'NIRIKSHAK — SIH26034 Presentation';
pres.subject = 'AI-Assisted Legal Metrology Inspection Platform';
pres.author = 'Team Nirikshak';
pres.company = 'Ministry of Consumer Affairs, Food and Public Distribution';

// ─── HELPERS ─────────────────────────────────────────────────────────────────
function addFooter(slide, slideNum) {
  // Team watermark at bottom right
  slide.addText([
    { text: `SIH26034  |  Ministry of Consumer Affairs  |  `, options: { color: 'AAAAAA', fontSize: 7 } },
    { text: `Team NIRIKSHAK`, options: { color: C.navyDark, fontSize: 7, bold: true } },
    { text: `  |  ${slideNum}`, options: { color: 'AAAAAA', fontSize: 7 } },
  ], { x: 0.3, y: 5.35, w: 9.4, h: 0.2, align: 'right' });
}

function addDivider(slide, y, color = C.navyDark) {
  slide.addShape(pres.ShapeType.rect, { x: 0.3, y: y, w: 9.4, h: 0.008, fill: { color: color } });
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 1: TITLE PAGE
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  
  // Dark navy background
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bgDark } });
  
  // Subtle texture overlay — lighter strip at bottom
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 4.2, w: 10, h: 1.425, fill: { color: C.navyDark } });
  
  // Government emblem (top left)
  if (fs.existsSync(ASSETS.emblem)) {
    slide.addImage({ path: ASSETS.emblem, x: 0.35, y: 0.25, w: 0.7, h: 0.9 });
  }
  
  // SIH logo area — text since no SIH image available
  slide.addText('SMART INDIA HACKATHON 2026', {
    x: 1.15, y: 0.30, w: 8.5, h: 0.35,
    fontSize: 11, bold: true, color: C.gold, align: 'left',
    fontFace: 'Calibri', charSpacing: 1.5,
  });

  slide.addText('SIH26034  ·  Ministry of Consumer Affairs, Food & Public Distribution', {
    x: 1.15, y: 0.65, w: 8.5, h: 0.25,
    fontSize: 9, color: 'AAAACC', align: 'left', fontFace: 'Calibri',
  });
  
  // Divider gold line
  slide.addShape(pres.ShapeType.rect, { x: 0.35, y: 1.05, w: 9.3, h: 0.025, fill: { color: C.gold } });
  
  // NIRIKSHAK Logo / wordmark
  if (fs.existsSync(ASSETS.logo)) {
    slide.addImage({ path: ASSETS.logo, x: 3.0, y: 1.2, w: 4.0, h: 1.0 });
  } else {
    slide.addText('NIRIKSHAK', {
      x: 1.5, y: 1.1, w: 7.0, h: 0.9,
      fontSize: 52, bold: true, color: C.white, align: 'center', fontFace: 'Cambria',
    });
  }
  
  // Devanagari subtitle
  slide.addText('निरीक्षक', {
    x: 1.5, y: 2.2, w: 7.0, h: 0.5,
    fontSize: 22, color: C.gold, align: 'center', fontFace: 'Calibri', italic: true,
  });
  
  // Main tagline
  slide.addText('AI-Assisted Legal Metrology Inspection & Evidence Workstation', {
    x: 1.0, y: 2.75, w: 8.0, h: 0.45,
    fontSize: 15, color: 'CCDCF0', align: 'center', fontFace: 'Calibri',
  });
  
  // Golden principle
  slide.addText('"AI Assists. Deterministic Rules Verify. Officers Decide."', {
    x: 1.2, y: 3.25, w: 7.6, h: 0.4,
    fontSize: 12, color: C.gold, align: 'center', fontFace: 'Calibri', italic: true,
  });
  
  // Bottom info strip
  const teamInfo = [
    { label: 'Problem ID', value: 'SIH26034' },
    { label: 'Theme', value: 'Consumer Affairs' },
    { label: 'PS Category', value: 'Software' },
    { label: 'Team', value: 'NIRIKSHAK' },
  ];
  
  const colW = 2.2;
  teamInfo.forEach((item, i) => {
    const x = 0.5 + i * colW;
    slide.addText(item.label.toUpperCase(), {
      x: x, y: 4.32, w: colW - 0.1, h: 0.22,
      fontSize: 7, color: 'AAAACC', fontFace: 'Calibri', bold: true, charSpacing: 1,
    });
    slide.addText(item.value, {
      x: x, y: 4.54, w: colW - 0.1, h: 0.28,
      fontSize: 11, color: C.white, fontFace: 'Calibri', bold: true,
    });
  });

  slide.addNotes('Slide 1 – Title. Introduce NIRIKSHAK as an AI-assisted legal metrology inspection and evidence workstation. Mention SIH26034 under Ministry of Consumer Affairs. The core principle: AI assists, deterministic rules verify, and the human officer makes the final call. This ensures no hallucinated verdicts in legal enforcement.');
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 2: IDEA / PROPOSED SOLUTION
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  
  // Light background
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bgSlide } });
  
  // Header bar (navy)
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: C.navyDark } });
  slide.addText('IDEA & PROPOSED SOLUTION', {
    x: 0.3, y: 0.10, w: 8.0, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Cambria',
  });
  slide.addText('Team NIRIKSHAK', {
    x: 0.3, y: 0.42, w: 8.0, h: 0.25,
    fontSize: 10, color: C.gold, fontFace: 'Calibri',
  });
  slide.addText('2', { x: 9.4, y: 0.18, w: 0.5, h: 0.35, fontSize: 18, bold: true, color: C.gold, fontFace: 'Calibri' });
  
  // Problem image (full width, occupying top 55% of content area)
  if (fs.existsSync(ASSETS.problemImg)) {
    slide.addImage({ path: ASSETS.problemImg, x: 0.2, y: 0.85, w: 9.6, h: 2.6 });
  }
  
  // Gold divider
  slide.addShape(pres.ShapeType.rect, { x: 0.3, y: 3.55, w: 9.4, h: 0.025, fill: { color: C.gold } });
  
  slide.addText('THE NIRIKSHAK SOLUTION', {
    x: 0.3, y: 3.62, w: 9.4, h: 0.28,
    fontSize: 13, bold: true, color: C.navyDark, fontFace: 'Cambria',
  });
  
  // Three solution pillars (left 6")
  const pillars = [
    {
      title: 'Physics-Based Calibration',
      body: 'Planar Homography: pixels → real mm (±0.01mm measured error on real products)',
    },
    {
      title: 'Deterministic Rule Engine',
      body: 'Zero LLM dependency. 100% statutory rules. Reproducible, court-defensible verdicts.',
    },
    {
      title: 'Cryptographic Evidence Vault',
      body: 'SHA-256 Merkle DAG. Section 63 BSA 2023 compliant. Tamper-evident chain.',
    },
  ];
  
  pillars.forEach((p, i) => {
    const x = 0.3;
    const y = 3.97 + i * 0.45;
    slide.addShape(pres.ShapeType.rect, {
      x: x, y: y, w: 6.2, h: 0.40,
      fill: { color: i === 1 ? C.navyDark : i === 0 ? C.bgSection : C.offWhite },
      line: { color: C.navyDark, width: 0.5 }
    });
    slide.addText([
      { text: ['①', '②', '③'][i] + '  ', options: { bold: true, color: i === 1 ? C.gold : C.navyDark, fontSize: 9 } },
      { text: p.title + ':  ', options: { bold: true, color: i === 1 ? C.white : C.navyDark, fontSize: 9 } },
      { text: p.body, options: { color: i === 1 ? 'CCDCF0' : C.textMid, fontSize: 8.5 } },
    ], { x: x + 0.1, y: y + 0.05, w: 6.0, h: 0.32, fontFace: 'Calibri' });
  });
  
  // Dashboard UI thumbnail (right side)
  slide.addText('LIVE APP', {
    x: 6.65, y: 3.62, w: 3.1, h: 0.28,
    fontSize: 9, bold: true, color: C.navyDark, fontFace: 'Cambria', align: 'center',
  });
  if (fs.existsSync(ASSETS.dashboardUI)) {
    slide.addImage({ path: ASSETS.dashboardUI, x: 6.65, y: 3.93, w: 3.1, h: 1.5 });
  }

  
  addFooter(slide, '2 / 6');
  slide.addNotes('Slide 2 – Idea & Solution. Present the three-pronged crisis: scale (1.2 crore shops vs 3,000 officers), manual speed (25 min per product), and broken evidence (court dismissals). Then show our three technical pillars: physics calibration for accurate measurement, deterministic rule engine (no LLM guessing), and cryptographic evidence for courts.');
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 3: TECHNICAL APPROACH
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bgSlide } });
  
  // Header
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: C.navyDark } });
  slide.addText('TECHNICAL APPROACH', {
    x: 0.3, y: 0.10, w: 8.0, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Cambria',
  });
  slide.addText('Team NIRIKSHAK  |  Python · FastAPI · React · DBNet++ · PP-OCRv4 · ONNX Runtime', {
    x: 0.3, y: 0.42, w: 8.5, h: 0.25,
    fontSize: 9, color: C.gold, fontFace: 'Calibri',
  });
  slide.addText('3', { x: 9.4, y: 0.18, w: 0.5, h: 0.35, fontSize: 18, bold: true, color: C.gold, fontFace: 'Calibri' });
  
  // Pipeline image (full width, top half)
  if (fs.existsSync(ASSETS.pipelineImg)) {
    slide.addImage({ path: ASSETS.pipelineImg, x: 0.2, y: 0.82, w: 9.6, h: 2.4 });
  }
  
  // Three innovations below
  addDivider(slide, 3.30);
  slide.addText('THREE KEY TECHNICAL INNOVATIONS', {
    x: 0.3, y: 3.35, w: 9.4, h: 0.28,
    fontSize: 12, bold: true, color: C.navyDark, fontFace: 'Cambria',
  });

  const innovations = [
    {
      title: '1. Planar Homography Calibration',
      points: [
        'ArUco marker / ISO 7810 card as physical reference',
        '3×3 homography matrix H: pixels → real millimeters',
        'Cylindrical surface unrolling for round bottles',
        'Accuracy: ≤0.30mm retail · ≤0.15mm synthetic',
        'Himalaya Brahmi: 1.46mm measured vs 1.47mm caliper',
      ],
    },
    {
      title: '2. Cross-Facet Semantic Fusion',
      points: [
        '6–13 multi-angle photos per inspection',
        'K-D Tree spatial proximity graph links key-value pairs',
        'Panel precedence hierarchy (Front > Back > Side)',
        'Devanagari numeral normalizer (०→0)',
        'Source image attributed to every extracted field',
      ],
    },
    {
      title: '3. Deterministic Statutory Engine',
      points: [
        'No LLM → 100% reproducible verdicts',
        'Rules 6, 9 (Table-I font schedule), 12, 24',
        'Jan Vishwas 2023: proportional 4-state triage',
        'PASS · FAIL · REVIEW · UNABLE_TO_VERIFY',
        'USP arithmetic: |USP × Qty − MRP| ≤ ₹0.02',
      ],
    },
  ];
  
  const colW = 3.0;
  innovations.forEach((inn, i) => {
    const x = 0.3 + i * (colW + 0.12);
    slide.addShape(pres.ShapeType.rect, {
      x: x, y: 3.68, w: colW, h: 1.7,
      fill: { color: i === 0 ? C.navyDark : i === 1 ? C.bgSection : C.offWhite },
      line: { color: C.navyDark, width: 0.5 },
    });
    slide.addText(inn.title, {
      x: x + 0.08, y: 3.72, w: colW - 0.16, h: 0.28,
      fontSize: 8, bold: true, color: i === 0 ? C.white : C.navyDark,
      fontFace: 'Calibri',
    });
    inn.points.forEach((pt, j) => {
      slide.addText('• ' + pt, {
        x: x + 0.08, y: 4.05 + j * 0.25, w: colW - 0.16, h: 0.22,
        fontSize: 7.5, color: i === 0 ? 'CCDCF0' : C.textDark,
        fontFace: 'Calibri',
      });
    });
  });
  
  addFooter(slide, '3 / 6');
  slide.addNotes('Slide 3 – Technical Approach. Walk through the 6-stage pipeline: capture → quality gate → homography calibration → OCR → rule engine → evidence. Highlight three key innovations: (1) physics-based pixel-to-mm calibration — no guessing, actual math; (2) cross-facet fusion to handle multi-panel 3D packages; (3) deterministic rule engine — zero LLM, 100% reproducible, court-defensible.');
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 4: FEASIBILITY & VIABILITY
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bgSlide } });
  
  // Header
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: C.navyDark } });
  slide.addText('FEASIBILITY & VIABILITY', {
    x: 0.3, y: 0.10, w: 8.0, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Cambria',
  });
  slide.addText('Team NIRIKSHAK  |  Empirically Tested on Real Retail Products', {
    x: 0.3, y: 0.42, w: 8.5, h: 0.25,
    fontSize: 10, color: C.gold, fontFace: 'Calibri',
  });
  slide.addText('4', { x: 9.4, y: 0.18, w: 0.5, h: 0.35, fontSize: 18, bold: true, color: C.gold, fontFace: 'Calibri' });
  
  // Two-column layout: SKU results LEFT, Architecture RIGHT
  // Left: SKU test results
  slide.addText('EMPIRICAL VALIDATION — 4 REAL PHYSICAL SKUs (38 Photos)', {
    x: 0.2, y: 0.85, w: 5.8, h: 0.28,
    fontSize: 10, bold: true, color: C.navyDark, fontFace: 'Cambria',
  });
  
  if (fs.existsSync(ASSETS.skuResults)) {
    slide.addImage({ path: ASSETS.skuResults, x: 0.2, y: 1.18, w: 5.8, h: 2.55 });
  }
  
  // Right: LIVE APPLICATION UI SCREENSHOT — much more impactful than text bullets
  slide.addText('LIVE APPLICATION — ADJUDICATION VIEW', {
    x: 6.2, y: 0.85, w: 3.6, h: 0.28,
    fontSize: 10, bold: true, color: C.navyDark, fontFace: 'Cambria',
  });
  
  if (fs.existsSync(ASSETS.adjudicationUI)) {
    slide.addImage({ path: ASSETS.adjudicationUI, x: 6.2, y: 1.18, w: 3.6, h: 2.05 });
  }
  
  // Caption below UI screenshot
  slide.addShape(pres.ShapeType.rect, {
    x: 6.2, y: 3.28, w: 3.6, h: 0.4, fill: { color: C.navyDark },
  });
  slide.addText('Live at sih26034.vercel.app — Inspectors can access from any browser', {
    x: 6.25, y: 3.31, w: 3.5, h: 0.32,
    fontSize: 7, color: C.gold, fontFace: 'Calibri', italic: true,
  });
  
  // Feasibility bullets (compact, below images)
  const feasPoints = [
    ['✅', 'Apache-2.0 models only — gov-safe licensing'],
    ['✅', 'INT8 ONNX CPU inference — no GPU required (180ms/panel)'],
    ['✅', 'Oracle Cloud Always Free VPS — ₹0/month hosting'],
    ['✅', '562 automated tests passing'],
    ['⚠', 'eMaap live API: schema ready, webhook planned (Mode C)'],
    ['⚠', 'Aadhaar eSign: Ed25519 local; CDAC planned'],
  ];
  
  feasPoints.forEach((pt, i) => {
    const isWarn = pt[0] === '⚠';
    const col = i < 3 ? 0 : 1;
    const row = i < 3 ? i : i - 3;
    const x = 0.2 + col * 5.0;
    slide.addText([
      { text: pt[0] + ' ', options: { color: isWarn ? C.warn : C.pass, bold: true, fontSize: 7.5 } },
      { text: pt[1], options: { color: isWarn ? C.textMid : C.textDark, fontSize: 7.5 } },
    ], { x: x, y: 3.82 + row * 0.25, w: 4.8, h: 0.22, fontFace: 'Calibri' });
  });
  
  addFooter(slide, '4 / 6');
  slide.addNotes('Slide 4 – Feasibility & Viability. Show the 4 real SKU test results. PASS = Titan Watch (correct exemption applied), FAIL with Rs.0 notice = Himalaya Brahmi (1.46mm vs 1.47mm caliper = 0.01mm error only), FAIL with Rs.25k = Gopi Baba Hair Oil (3 violations). Show the live application adjudication UI. Be honest: eMaap live webhook and Aadhaar eSign are planned, not implemented yet.');
}


// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 5: IMPACT & BENEFITS
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bgSlide } });
  
  // Header
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: C.navyDark } });
  slide.addText('IMPACT & BENEFITS', {
    x: 0.3, y: 0.10, w: 8.0, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Cambria',
  });
  slide.addText('Team NIRIKSHAK  |  For Legal Metrology Officers, Manufacturers, and the Judicial System', {
    x: 0.3, y: 0.42, w: 8.5, h: 0.25,
    fontSize: 9.5, color: C.gold, fontFace: 'Calibri',
  });
  slide.addText('5', { x: 9.4, y: 0.18, w: 0.5, h: 0.35, fontSize: 18, bold: true, color: C.gold, fontFace: 'Calibri' });
  
  // Impact metrics image (top)
  if (fs.existsSync(ASSETS.impact)) {
    slide.addImage({ path: ASSETS.impact, x: 0.2, y: 0.82, w: 5.7, h: 2.7 });
  }
  
  // Jan Vishwas tree (right)
  if (fs.existsSync(ASSETS.janVishwas)) {
    slide.addImage({ path: ASSETS.janVishwas, x: 6.1, y: 0.82, w: 3.7, h: 2.7 });
  }
  
  // Stakeholder benefits row
  addDivider(slide, 3.60);
  slide.addText('WHO BENEFITS', {
    x: 0.3, y: 3.67, w: 9.4, h: 0.28,
    fontSize: 12, bold: true, color: C.navyDark, fontFace: 'Cambria',
  });

  const stakeholders = [
    {
      title: 'Field Inspectors (LMOs)',
      pts: ['25 min → ~2 min per package', 'Guided multi-shot capture', 'Automatic compliance report'],
    },
    {
      title: 'Manufacturers / Brands',
      pts: ['Pre-check label compliance', 'Avoid costly print recalls', 'Understand exact defects'],
    },
    {
      title: 'Courts & Adjudicators',
      pts: ['Section 63 BSA 2023 dossier', 'SHA-256 tamper-proof evidence', 'Full audit trail for every verdict'],
    },
  ];
  
  const sw = 3.0;
  stakeholders.forEach((s, i) => {
    const x = 0.3 + i * (sw + 0.12);
    slide.addShape(pres.ShapeType.rect, {
      x: x, y: 4.00, w: sw, h: 1.4,
      fill: { color: i === 1 ? C.navyDark : C.bgSection },
      line: { color: C.navyDark, width: 0.5 },
    });
    slide.addText(s.title, {
      x: x + 0.1, y: 4.04, w: sw - 0.2, h: 0.3,
      fontSize: 9, bold: true, color: i === 1 ? C.white : C.navyDark, fontFace: 'Calibri',
    });
    s.pts.forEach((pt, j) => {
      slide.addText('• ' + pt, {
        x: x + 0.1, y: 4.38 + j * 0.28, w: sw - 0.2, h: 0.25,
        fontSize: 8.5, color: i === 1 ? 'CCDCF0' : C.textDark, fontFace: 'Calibri',
      });
    });
  });
  
  addFooter(slide, '5 / 6');
  slide.addNotes('Slide 5 – Impact & Benefits. Lead with the four key metrics: ~13x inspection throughput, 200+ packages/officer/day, ₹0 cloud GPU cost, 0.01mm measurement error. Then show Jan Vishwas proportional enforcement (₹0 for minor deficits, ₹25k for substantive violations). Show three stakeholder groups: inspectors, manufacturers, courts.');
}

// ═══════════════════════════════════════════════════════════════════════════
// SLIDE 6: RESEARCH & REFERENCES
// ═══════════════════════════════════════════════════════════════════════════
{
  const slide = pres.addSlide();
  
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 5.625, fill: { color: C.bgSlide } });
  
  // Header
  slide.addShape(pres.ShapeType.rect, { x: 0, y: 0, w: 10, h: 0.75, fill: { color: C.navyDark } });
  slide.addText('RESEARCH & REFERENCES', {
    x: 0.3, y: 0.10, w: 8.0, h: 0.35,
    fontSize: 18, bold: true, color: C.white, fontFace: 'Cambria',
  });
  slide.addText('Team NIRIKSHAK  |  Statutory & Technical Foundation', {
    x: 0.3, y: 0.42, w: 8.5, h: 0.25,
    fontSize: 10, color: C.gold, fontFace: 'Calibri',
  });
  slide.addText('6', { x: 9.4, y: 0.18, w: 0.5, h: 0.35, fontSize: 18, bold: true, color: C.gold, fontFace: 'Calibri' });
  
  // Two columns: Statutory LEFT, Technical RIGHT
  // LEFT — Statutory References
  slide.addShape(pres.ShapeType.rect, {
    x: 0.2, y: 0.85, w: 4.6, h: 0.3,
    fill: { color: C.navyDark },
  });
  slide.addText('STATUTORY FOUNDATIONS', {
    x: 0.3, y: 0.88, w: 4.4, h: 0.22,
    fontSize: 9, bold: true, color: C.white, fontFace: 'Calibri',
  });
  
  const statRefs = [
    ['Legal Metrology Act, 2009', 'Ministry of Consumer Affairs — primary enforcement law for weights and measures'],
    ['PCR 2011 (Packaged Commodities Rules)', 'Rules 6, 9, 12, 24 — mandatory declaration requirements for pre-packaged goods'],
    ['G.S.R. 629(E) (2021)', 'Table-I minimum numeral font height schedule for various PDP surface areas'],
    ['Jan Vishwas Act, 2023', 'Decriminalized packaging offenses; introduced proportional 15-day civil notice system'],
    ['Bharatiya Sakshya Adhiniyam, 2023 — Sec. 63', 'Replaced Section 65B IEA 1872; governs electronic evidence admissibility (post 1 July 2024)'],
    ['Article 20(1), Constitution of India', 'Non-retroactivity principle — inspections apply rules per manufacturing date'],
  ];
  
  statRefs.forEach((r, i) => {
    slide.addShape(pres.ShapeType.rect, {
      x: 0.2, y: 1.20 + i * 0.65, w: 4.6, h: 0.60,
      fill: { color: i % 2 === 0 ? C.bgSection : C.offWhite },
      line: { color: 'DDDDDD', width: 0.3 },
    });
    slide.addText(r[0], {
      x: 0.3, y: 1.23 + i * 0.65, w: 4.4, h: 0.22,
      fontSize: 8.5, bold: true, color: C.navyDark, fontFace: 'Calibri',
    });
    slide.addText(r[1], {
      x: 0.3, y: 1.46 + i * 0.65, w: 4.4, h: 0.28,
      fontSize: 7.5, color: C.textMid, fontFace: 'Calibri',
    });
  });
  
  // RIGHT — Technical References
  slide.addShape(pres.ShapeType.rect, {
    x: 5.0, y: 0.85, w: 4.8, h: 0.3,
    fill: { color: C.navyDark },
  });
  slide.addText('TECHNICAL FOUNDATIONS', {
    x: 5.1, y: 0.88, w: 4.6, h: 0.22,
    fontSize: 9, bold: true, color: C.white, fontFace: 'Calibri',
  });
  
  const techRefs = [
    ['DBNet++ (Apache-2.0)', 'Real-time multi-oriented scene text detection via Differentiable Binarization'],
    ['PP-OCRv4 / PaddleOCR (Apache-2.0)', 'SVTR-based multilingual OCR for English & Devanagari Hindi scripts'],
    ['ONNX Runtime (MIT)', 'Cross-platform INT8 CPU inference — 180ms per panel without GPU'],
    ['OpenCV (Apache-2.0)', 'Planar homography, perspective warp, ArUco detection, Hough circles'],
    ['FastAPI + Pydantic v2 (MIT)', 'Typed REST API with Merkle DAG evidence chaining across 25+ endpoints'],
    ['SIH26034 Problem Statement', 'Ministry of Consumer Affairs — Smart India Hackathon 2026 (Consumer Affairs Theme)'],
  ];
  
  techRefs.forEach((r, i) => {
    slide.addShape(pres.ShapeType.rect, {
      x: 5.0, y: 1.20 + i * 0.65, w: 4.8, h: 0.60,
      fill: { color: i % 2 === 0 ? C.bgSection : C.offWhite },
      line: { color: 'DDDDDD', width: 0.3 },
    });
    slide.addText(r[0], {
      x: 5.1, y: 1.23 + i * 0.65, w: 4.6, h: 0.22,
      fontSize: 8.5, bold: true, color: C.navyDark, fontFace: 'Calibri',
    });
    slide.addText(r[1], {
      x: 5.1, y: 1.46 + i * 0.65, w: 4.6, h: 0.28,
      fontSize: 7.5, color: C.textMid, fontFace: 'Calibri',
    });
  });
  
  // Live URL
  slide.addShape(pres.ShapeType.rect, {
    x: 0.2, y: 5.22, w: 9.6, h: 0.28,
    fill: { color: C.navyDark },
  });
  slide.addText([
    { text: 'Live: ', options: { color: 'AAAACC', fontSize: 8 } },
    { text: 'https://sih26034.vercel.app/', options: { color: C.gold, fontSize: 8, bold: true } },
    { text: '  |  Backend: ', options: { color: 'AAAACC', fontSize: 8 } },
    { text: 'http://68.233.117.16:8000/api/v1/health', options: { color: C.gold, fontSize: 8, bold: true } },
    { text: '  |  Tests: ', options: { color: 'AAAACC', fontSize: 8 } },
    { text: '562 Passed', options: { color: C.pass, fontSize: 8, bold: true } },
  ], { x: 0.3, y: 5.24, w: 9.4, h: 0.22, fontFace: 'Calibri' });
  
  slide.addNotes('Slide 6 – Research & References. Two columns: statutory foundations on left (Legal Metrology Act 2009, PCR 2011, GSR 629E, Jan Vishwas 2023, BSA 2023 Section 63, Article 20(1)) and technical foundations on right (DBNet++, PP-OCRv4, ONNX, OpenCV, FastAPI). Note Apache-2.0 licensing for all AI models — critical for government software. Show live URL for judges to verify.');
}

// ─── WRITE OUTPUT ─────────────────────────────────────────────────────────────
const outputPath = path.resolve('C:/Users/kunal/Desktop/NIRIKSHAK/SIH ppt - kunal/SIH26034-KUNAL.pptx');
pres.writeFile({ fileName: outputPath })
  .then(() => {
    console.log('✅ PPT written to:', outputPath);
  })
  .catch(err => {
    console.error('❌ Error writing PPT:', err);
    process.exit(1);
  });
