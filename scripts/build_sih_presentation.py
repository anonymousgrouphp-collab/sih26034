import os
import sys
import pptx
from pptx.util import Inches, Pt
from pptx.dml.color import RGBColor
from pptx.enum.text import PP_ALIGN, MSO_ANCHOR
from pptx.enum.shapes import MSO_SHAPE

SRC_TEMPLATE = r"C:\Users\kunal\Desktop\NIRIKSHAK\SIH ppt - kunal\SIH2026-IDEA-Presentation-Format.pptx"
OUT_PPTX = r"C:\Users\kunal\Desktop\NIRIKSHAK\SIH ppt - kunal\SIH26034-KUNAL.pptx"
ASSETS_DIR = r"C:\Users\kunal\Desktop\NIRIKSHAK\SIH ppt - kunal\assests"

# Palette definitions
NAVY_BG       = RGBColor(0x0B, 0x19, 0x2C)
SLATE_CARD    = RGBColor(0x1E, 0x29, 0x3B)
SLATE_BORDER  = RGBColor(0x33, 0x41, 0x55)
DARK_CANVAS   = RGBColor(0x0F, 0x17, 0x2A)

WHITE         = RGBColor(0xFF, 0xFF, 0xFF)
MUTED_TEXT    = RGBColor(0x94, 0xA3, 0xB8)
LIGHT_TEXT    = RGBColor(0xE2, 0xE8, 0xF0)

GOLD_ACCENT   = RGBColor(0xF5, 0x9E, 0x0B)
SAFFRON_DARK  = RGBColor(0xB4, 0x53, 0x09)
CYAN_ACCENT   = RGBColor(0x38, 0xBD, 0xF8)
BLUE_ACCENT   = RGBColor(0x1D, 0x4E, 0xD8)
GREEN_ACCENT  = RGBColor(0x10, 0xB9, 0x81)
GREEN_DARK    = RGBColor(0x06, 0x4E, 0x3B)
RED_ACCENT    = RGBColor(0xEF, 0x44, 0x44)
RED_DARK      = RGBColor(0x7F, 0x1D, 0x1D)

def add_card(slide, left, top, width, height, bg_color=SLATE_CARD, border_color=SLATE_BORDER, border_width=1.5):
    shape = slide.shapes.add_shape(
        MSO_SHAPE.ROUNDED_RECTANGLE,
        left, top, width, height
    )
    shape.fill.solid()
    shape.fill.fore_color.rgb = bg_color
    if border_color:
        shape.line.color.rgb = border_color
        shape.line.width = Pt(border_width)
    else:
        shape.line.fill.background()
    return shape

def add_header_text(tf, text, font_size=12.5, font_bold=True, font_color=CYAN_ACCENT, align=PP_ALIGN.LEFT):
    p = tf.paragraphs[0] if len(tf.paragraphs) > 0 else tf.add_paragraph()
    p.text = text
    p.alignment = align
    p.font.name = "Arial"
    p.font.size = Pt(font_size)
    p.font.bold = font_bold
    p.font.color.rgb = font_color
    p.space_after = Pt(3)
    return p

def add_bullet_line(tf, bold_prefix, text, font_size=10, text_color=LIGHT_TEXT, prefix_color=GOLD_ACCENT, space_after=3):
    p = tf.add_paragraph()
    p.space_after = Pt(space_after)
    if bold_prefix:
        r1 = p.add_run()
        r1.text = bold_prefix + " "
        r1.font.name = "Arial"
        r1.font.size = Pt(font_size)
        r1.font.bold = True
        r1.font.color.rgb = prefix_color
    r2 = p.add_run()
    r2.text = text
    r2.font.name = "Calibri"
    r2.font.size = Pt(font_size)
    r2.font.bold = False
    r2.font.color.rgb = text_color
    return p

def format_slide_header(slide, title_text, subtitle_text, oval_shape_name):
    """Aligns header components cleanly to prevent overlaps."""
    for s in slide.shapes:
        if s.name == oval_shape_name:
            s.left = Inches(0.38)
            s.top = Inches(0.20)
            s.width = Inches(1.48)
            s.height = Inches(0.70)
            s.fill.solid()
            s.fill.fore_color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            s.line.color.rgb = GOLD_ACCENT
            s.line.width = Pt(1.5)
            tf = s.text_frame
            tf.clear()
            tf.margin_top = tf.margin_bottom = tf.margin_left = tf.margin_right = 0
            p = tf.paragraphs[0]
            p.text = "TEAM 92770"
            p.alignment = PP_ALIGN.CENTER
            p.font.name = "Arial"
            p.font.size = Pt(9.5)
            p.font.bold = True
            p.font.color.rgb = WHITE
            
            p2 = tf.add_paragraph()
            p2.text = "NIRIKSHAK"
            p2.alignment = PP_ALIGN.CENTER
            p2.font.name = "Arial"
            p2.font.size = Pt(10)
            p2.font.bold = True
            p2.font.color.rgb = GOLD_ACCENT
        elif s.name == "Title 1":
            s.left = Inches(2.00)
            s.top = Inches(0.12)
            s.width = Inches(8.55)
            s.height = Inches(0.85)
            tf = s.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = title_text
            p.alignment = PP_ALIGN.CENTER
            p.font.name = "Arial"
            p.font.size = Pt(19)
            p.font.bold = True
            p.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
            
            p2 = tf.add_paragraph()
            p2.text = subtitle_text
            p2.alignment = PP_ALIGN.CENTER
            p2.font.name = "Calibri"
            p2.font.size = Pt(11)
            p2.font.bold = True
            p2.font.color.rgb = BLUE_ACCENT
        elif s.name == "TextBox 8":
            tf = s.text_frame
            tf.clear()
            s.left = Inches(15) # move away

def main():
    print(f"Loading template: {SRC_TEMPLATE}")
    prs = pptx.Presentation(SRC_TEMPLATE)

    # -------------------------------------------------------------
    # SLIDE 1: TITLE PAGE
    # -------------------------------------------------------------
    print("Formatting Slide 1...")
    s1 = prs.slides[0]
    for s in s1.shapes:
        if s.name == "Subtitle 3":
            tf = s.text_frame
            tf.clear()
            p = tf.paragraphs[0]
            p.text = "NIRIKSHAK (निरीक्षक)"
            p.font.name = "Arial"
            p.font.size = Pt(32)
            p.font.bold = True
            p.font.color.rgb = GOLD_ACCENT
            
            p2 = tf.add_paragraph()
            p2.text = "AI-Powered Automated Legal Metrology Inspection & Compliance Enforcement System"
            p2.font.name = "Calibri"
            p2.font.size = Pt(15)
            p2.font.bold = True
            p2.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)

        elif s.name == "TextBox 9":
            tf = s.text_frame
            tf.clear()
            lines = [
                ("Problem Statement ID:", "SIH26034", GOLD_ACCENT),
                ("Problem Statement Title:", "Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels.", RGBColor(0x1E, 0x29, 0x3B)),
                ("Theme:", "Agriculture, FoodTech & Rural Development (Smart Metrology & Consumer Welfare)", RGBColor(0x1E, 0x29, 0x3B)),
                ("PS Category:", "Software", RGBColor(0x1E, 0x29, 0x3B)),
                ("Team ID:", "92770", GOLD_ACCENT),
                ("Team Name:", "NIRIKSHAK (404 The Optimists)", BLUE_ACCENT),
                ("Statutory Authority:", "Ministry of Consumer Affairs, Food & Public Distribution | Department of Consumer Affairs (DoCA), Govt. of India", RGBColor(0x1E, 0x29, 0x3B)),
                ("Core Engineering Team:", "Kunal Raj (Lead, CV & Metrology) • Parmarth Kumar (DL/OCR) • Harsh Patel (NLP) • Ambika Bansal (Statutory Rules) • Shailendra Pratap Singh (Platform/Crypto) • Urvashi Rajput (Web UX)", RGBColor(0x33, 0x41, 0x55)),
            ]
            for idx, (label, val, col) in enumerate(lines):
                p = tf.paragraphs[0] if idx == 0 else tf.add_paragraph()
                p.space_after = Pt(4)
                r1 = p.add_run()
                r1.text = label + " "
                r1.font.name = "Arial"
                r1.font.size = Pt(11.5)
                r1.font.bold = True
                r1.font.color.rgb = RGBColor(0x0F, 0x17, 0x2A)
                
                r2 = p.add_run()
                r2.text = val
                r2.font.name = "Calibri"
                r2.font.size = Pt(11)
                r2.font.bold = (label in ["Problem Statement ID:", "Team ID:", "Team Name:"])
                r2.font.color.rgb = col

    # -------------------------------------------------------------
    # SLIDE 2: IDEA TITLE & PROPOSED SOLUTION
    # -------------------------------------------------------------
    print("Formatting Slide 2...")
    s2 = prs.slides[1]
    format_slide_header(
        s2,
        "NIRIKSHAK: AUGMENTED METROLOGY INTELLIGENCE SYSTEM",
        "AUTOMATED STATUTORY COMPLIANCE FOR PACKAGED COMMODITIES UNDER PCR 2011 & BSA 2023",
        "Oval 9"
    )

    # Card 1: The Ground Enforcement Crisis (Left Column)
    c1 = add_card(s2, Inches(0.45), Inches(1.18), Inches(3.70), Inches(5.62))
    tf1 = c1.text_frame
    tf1.word_wrap = True
    tf1.margin_left = tf1.margin_right = Inches(0.18)
    tf1.margin_top = Inches(0.16)
    add_header_text(tf1, "THE ENFORCEMENT CRISIS IN INDIA", 13, True, CYAN_ACCENT)
    
    add_bullet_line(tf1, "Scale Asymmetry:", "1.2 Crore+ retail shops and godowns vs ~3,000 Legal Metrology Officers nationwide. Less than 0.1% market commodities are ever inspected.", 10, LIGHT_TEXT, GOLD_ACCENT, 8)
    add_bullet_line(tf1, "Manual Friction:", "Manual Vernier calipers and physical magnifiers take 20-25 minutes per package. Officers are bottlenecked at 15-20 packages/day.", 10, LIGHT_TEXT, GOLD_ACCENT, 8)
    add_bullet_line(tf1, "Courtroom Evidentiary Void:", "Section 65B of Indian Evidence Act repealed on 1 July 2024. Unverified smartphone photos fail Section 63 Bharatiya Sakshya Adhiniyam (BSA 2023) admissibility, causing high dismissal rates.", 10, LIGHT_TEXT, RED_ACCENT, 8)
    add_bullet_line(tf1, "Revenue Leakage:", "Unchecked non-standard units (gms, ml.), omitted MRP tax clauses, and deceptive Unit Sale Prices cause consumer detriment and ₹150+ Cr state revenue loss.", 10, LIGHT_TEXT, GOLD_ACCENT, 4)

    # Card 2: Solution & Architecture (Center Column)
    c2 = add_card(s2, Inches(4.30), Inches(1.18), Inches(5.15), Inches(5.62))
    tf2 = c2.text_frame
    tf2.word_wrap = True
    tf2.margin_left = tf2.margin_right = Inches(0.18)
    tf2.margin_top = Inches(0.16)
    add_header_text(tf2, "PROPOSED SOLUTION & CORE INNOVATION", 13, True, CYAN_ACCENT)
    
    p_gold = tf2.add_paragraph()
    p_gold.text = '★ CORE PRINCIPLE: "AI Observes, Rules Verify, Human Decides"'
    p_gold.font.name = "Arial"
    p_gold.font.size = Pt(10.5)
    p_gold.font.bold = True
    p_gold.font.color.rgb = GOLD_ACCENT
    p_gold.space_after = Pt(5)

    add_bullet_line(tf2, "Sub-Millimeter Vision Calibration:", "Planar Homography matrix (H) unwarps angled packaging photos using standard reference cards/coins, achieving ±0.08mm font height precision.", 9.5, LIGHT_TEXT, CYAN_ACCENT, 4)
    add_bullet_line(tf2, "Zero-Hallucination AST Engine:", "Evaluates 100% deterministic mathematical rules codified directly from Gazette notifications (Table-I, Rule 6, Rule 12, GSR 629(E)). Zero LLM hallucination.", 9.5, LIGHT_TEXT, CYAN_ACCENT, 4)
    add_bullet_line(tf2, "3D Cross-Facet Semantic Fusion:", "Assembles multi-surface burst captures (Front, Back, Sides) into one unified inspection case with permanent source-image panel attribution.", 9.5, LIGHT_TEXT, CYAN_ACCENT, 4)
    add_bullet_line(tf2, "Court-Admissible BSA Dossier:", "Chains all pipeline stages into a SHA-256 Merkle DAG, issuing legally unassailable Section 63 BSA 2023 Digital Certificates with verification QR codes.", 9.5, LIGHT_TEXT, GREEN_ACCENT, 4)

    # Embedded pipeline thumbnail in Card 2
    pipe_img = os.path.join(ASSETS_DIR, "flowcharts", "02_pipeline_flow.png")
    if os.path.exists(pipe_img):
        s2.shapes.add_picture(pipe_img, Inches(4.45), Inches(4.85), Inches(4.85), Inches(1.80))

    # Card 3: Why Nirikshak Wins (Right Column)
    c3 = add_card(s2, Inches(9.60), Inches(1.18), Inches(3.30), Inches(5.62))
    tf3 = c3.text_frame
    tf3.word_wrap = True
    tf3.margin_left = tf3.margin_right = Inches(0.18)
    tf3.margin_top = Inches(0.16)
    add_header_text(tf3, "WHY NIRIKSHAK WINS", 13, True, CYAN_ACCENT)

    diffs = [
        ("Manual Vernier Calipers", "Planar Homography (±0.08mm)"),
        ("Generative LLM Guessing", "Deterministic Statutory AST"),
        ("Courtroom Case Dismissals", "Sec. 63 BSA 2023 Merkle DAG"),
        ("Blanket Fines / Harassment", "Jan Vishwas 15-Day ₹0 Notice"),
        ("Fragile Cloud Dependency", "Resilient Offline Field Engine"),
    ]
    for old, new in diffs:
        add_bullet_line(tf3, "❌ " + old, "➜ ✔ " + new, 9.5, LIGHT_TEXT, RED_ACCENT, 5)

    p_b1 = tf3.add_paragraph()
    p_b1.text = "⚡ 5-Second Full Inspection (< 30s E2E)"
    p_b1.font.name = "Arial"
    p_b1.font.size = Pt(10.5)
    p_b1.font.bold = True
    p_b1.font.color.rgb = GOLD_ACCENT
    p_b1.space_after = Pt(3)

    p_b2 = tf3.add_paragraph()
    p_b2.text = "💻 Zero-GPU INT8 CPU Execution"
    p_b2.font.name = "Arial"
    p_b2.font.size = Pt(10.5)
    p_b2.font.bold = True
    p_b2.font.color.rgb = CYAN_ACCENT
    p_b2.space_after = Pt(3)

    p_b3 = tf3.add_paragraph()
    p_b3.text = "📜 Form-1 PDF/A Statutory Notice"
    p_b3.font.name = "Arial"
    p_b3.font.size = Pt(10.5)
    p_b3.font.bold = True
    p_b3.font.color.rgb = GREEN_ACCENT

    # -------------------------------------------------------------
    # SLIDE 3: TECHNICAL APPROACH
    # -------------------------------------------------------------
    print("Formatting Slide 3...")
    s3 = prs.slides[2]
    format_slide_header(
        s3,
        "TECHNICAL APPROACH & SYSTEM ARCHITECTURE",
        "12-STAGE STATUTORY VERIFICATION PIPELINE & DUAL-ENGINE TOPOLOGY",
        "Oval 10"
    )

    # Pipeline graphic on top
    if os.path.exists(pipe_img):
        s3.shapes.add_picture(pipe_img, Inches(0.45), Inches(1.18), Inches(12.45), Inches(2.22))

    # Dual Engine Architecture (bottom left)
    modes_img = os.path.join(ASSETS_DIR, "architecture", "05_system_modes.png")
    if os.path.exists(modes_img):
        s3.shapes.add_picture(modes_img, Inches(0.45), Inches(3.52), Inches(6.50), Inches(3.28))

    # Engineering Stack Card (bottom right)
    c_tech = add_card(s3, Inches(7.10), Inches(3.52), Inches(5.80), Inches(3.28))
    tf_tech = c_tech.text_frame
    tf_tech.word_wrap = True
    tf_tech.margin_left = tf_tech.margin_right = Inches(0.18)
    tf_tech.margin_top = Inches(0.14)
    add_header_text(tf_tech, "ENGINEERING STACK & ARCHITECTURAL DECISIONS", 12.5, True, CYAN_ACCENT)

    add_bullet_line(tf_tech, "Computer Vision & Optics:", "OpenCV 4.10, Planar Homography (3×3 matrix H), ArUco DICT_4X4_50, ISO 7810 ID-1 card (85.60×53.98mm), Connected Components Analysis (CCA) for font height.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 4)
    add_bullet_line(tf_tech, "Deep Learning & OCR:", "DBNet++ polygon detector (Apache-2.0, ADL-05) + PaddleOCR PP-OCRv4 (Latin & Devanagari Hindi) INT8 ONNX. 180° flip probe on conf < 0.92; Tesseract v5 fallback.", 9.5, LIGHT_TEXT, CYAN_ACCENT, 4)
    add_bullet_line(tf_tech, "Backend & Evidentiary Ledger:", "Python 3.12, FastAPI async REST API, PostgreSQL 16+ (central) & SQLite 3.45+ SQLCipher (offline), In-Memory SHA-256 Merkle DAG, ReportLab ISO 19005-1 PDF/A generator.", 9.5, LIGHT_TEXT, GREEN_ACCENT, 4)
    add_bullet_line(tf_tech, "Web Workstation & Adjudication UX:", "React 18/19 SPA, Vite, Tailwind CSS, HTML5 Canvas 2.5× loupe, millimeter grid overlay, mandatory written officer override justification audit logging.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 2)

    # -------------------------------------------------------------
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # -------------------------------------------------------------
    print("Formatting Slide 4...")
    s4 = prs.slides[3]
    format_slide_header(
        s4,
        "FEASIBILITY, VIABILITY & STATUTORY FAIRNESS",
        "ZERO-GPU EDGE RUNTIME, JAN VISHWAS COMPLIANCE & BSA 2023 ADMISSIBILITY",
        "Oval 11"
    )

    c_p1 = add_card(s4, Inches(0.45), Inches(1.18), Inches(3.98), Inches(3.45))
    tf_p1 = c_p1.text_frame
    tf_p1.word_wrap = True
    tf_p1.margin_left = tf_p1.margin_right = Inches(0.16)
    tf_p1.margin_top = Inches(0.14)
    add_header_text(tf_p1, "1. FEASIBILITY ANALYSIS", 12.5, True, CYAN_ACCENT)
    add_bullet_line(tf_p1, "Zero-GPU Edge Barrier:", "INT8 quantization shrinks models from 120MB to 28MB. Full inference runs in 180ms on standard Intel i5/i3 CPU laptops or ₹10k Android phones without dedicated GPUs.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 5)
    add_bullet_line(tf_p1, "Universal Reference Standards:", "Requires zero special laboratory hardware. Works with standard bank/Aadhaar/DL cards (85.60×53.98mm) or standard ₹5 coins (23mm).", 9.5, LIGHT_TEXT, GOLD_ACCENT, 5)
    add_bullet_line(tf_p1, "100% Offline Mandi Resiliency:", "Mode B operates with 0 bytes network required. Secure local SQLite SQLCipher commits inspection state in basement godowns and rural haats.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 5)
    add_bullet_line(tf_p1, "Low Bandwidth Footprint:", "Complete inspection package is < 500 KB, syncing effortlessly over 2G/3G connections when field officers return to network range.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 3)

    c_p2 = add_card(s4, Inches(4.68), Inches(1.18), Inches(3.98), Inches(3.45))
    tf_p2 = c_p2.text_frame
    tf_p2.word_wrap = True
    tf_p2.margin_left = tf_p2.margin_right = Inches(0.16)
    tf_p2.margin_top = Inches(0.14)
    add_header_text(tf_p2, "2. VIABILITY & GOVERNANCE", 12.5, True, GREEN_ACCENT)
    add_bullet_line(tf_p2, "Jan Vishwas 2023 Decriminalization:", "Implements Act No. 18 of 2023. Eliminates jail terms for technical packaging errors, establishing proportional civil administrative enforcement.", 9.5, LIGHT_TEXT, GREEN_ACCENT, 5)
    add_bullet_line(tf_p2, "15-Day Improvement Notice (₹0):", "Minor procedural deficits (e.g. font 1.46mm vs 2.0mm) receive a 15-day cure notice with ₹0 compounding fee, protecting Ease of Doing Business.", 9.5, LIGHT_TEXT, GREEN_ACCENT, 5)
    add_bullet_line(tf_p2, "Civil Compounding for Real Fraud:", "Deliberate omissions (banned units, missing MRP, missing consumer care) trigger Section 48 compounding notices up to ₹25,000 INR.", 9.5, LIGHT_TEXT, RED_ACCENT, 5)
    add_bullet_line(tf_p2, "Quasi-Judicial Human Sovereignty:", "AI never acts as autonomous judge. Officer approval is strictly required; any override mandatorily records written justification remarks.", 9.5, LIGHT_TEXT, GREEN_ACCENT, 3)

    c_p3 = add_card(s4, Inches(8.92), Inches(1.18), Inches(3.98), Inches(3.45))
    tf_p3 = c_p3.text_frame
    tf_p3.word_wrap = True
    tf_p3.margin_left = tf_p3.margin_right = Inches(0.16)
    tf_p3.margin_top = Inches(0.14)
    add_header_text(tf_p3, "3. BUSINESS & GOVT POTENTIAL", 12.5, True, GOLD_ACCENT)
    add_bullet_line(tf_p3, "Government Operational Savings:", "Reduces inspection cycle time from 25 min to < 2 min per package, saving over 1,200 officer man-hours annually per circle.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 5)
    add_bullet_line(tf_p3, "Revenue Leakage Recovery:", "Automates compounding fee tracking under Section 48, capturing an estimated ₹150+ Crore annually in uncollected penalties across states.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 5)
    add_bullet_line(tf_p3, "Near-Zero Court Dismissals:", "Replaces repealed Section 65B with Section 63 BSA 2023 certificates. Cryptographic SHA-256 Merkle root guarantees 95%+ conviction rates.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 5)
    add_bullet_line(tf_p3, "Consumer Trust Empowerment:", "Protects consumers against deceptive packaging, hidden taxes, and short-weight claims while providing manufacturers a pre-compliance tool.", 9.5, LIGHT_TEXT, GOLD_ACCENT, 3)

    # Bottom Area: Jan Vishwas Decision Tree
    jv_img = os.path.join(ASSETS_DIR, "diagrams", "04_jan_vishwas_enforcement.png")
    if os.path.exists(jv_img):
        s4.shapes.add_picture(jv_img, Inches(0.45), Inches(4.75), Inches(12.45), Inches(2.05))

    # -------------------------------------------------------------
    # SLIDE 5: IMPACT AND BENEFITS
    # -------------------------------------------------------------
    print("Formatting Slide 5...")
    s5 = prs.slides[4]
    format_slide_header(
        s5,
        "IMPACT, MULTI-STAKEHOLDER BENEFITS & EMPIRICAL PROOF",
        "QUANTIFIABLE NATIONAL METRICS & 38-SKU PHYSICAL TEST BENCHMARK",
        "Oval 11"
    )

    # Left: Impact metrics visual
    impact_img = os.path.join(ASSETS_DIR, "charts", "06_impact_metrics.png")
    if os.path.exists(impact_img):
        s5.shapes.add_picture(impact_img, Inches(0.45), Inches(1.18), Inches(5.95), Inches(4.00))

    # Right: Empirical Benchmark Card
    c_emp = add_card(s5, Inches(6.55), Inches(1.18), Inches(6.35), Inches(4.00))
    tf_emp = c_emp.text_frame
    tf_emp.word_wrap = True
    tf_emp.margin_left = tf_emp.margin_right = Inches(0.18)
    tf_emp.margin_top = Inches(0.14)
    add_header_text(tf_emp, "EMPIRICAL GROUND-TRUTH BENCHMARK (38 REAL RUNS)", 12, True, CYAN_ACCENT)

    sku_items = [
        ("1. Titan Fastrack Watch (13 photos):", "PASS (0 Fails) | Sanction: ₹0 Clean Cert. Net Qty 1 N, Origin: China. USP exempt under Rule 6(1)(da) 2nd proviso.", GREEN_ACCENT),
        ("2. Himalaya Brahmi 60 Tabs (13 photos):", "FAIL (1 Deficit) | 15-Day Improvement Notice (₹0). Batch font 1.46mm vs 2.0mm. Caliper Truth = 1.47mm (Error only 0.01mm!).", GOLD_ACCENT),
        ("3. Boult Audio TWS Earbuds (6 photos):", "FAIL (1 Deficit) | 15-Day Improvement Notice (₹0). Thermal sticker net qty font 1.24mm vs 2.0mm (Rule 6 Table-I deficit).", GOLD_ACCENT),
        ("4. Gopi Baba Hair Oil (6 photos):", "FAIL (3 Violations) | ₹25,000 Civil Compounding. Banned unit '100ml.', missing tax clause, missing consumer email.", RED_ACCENT)
    ]
    for title, desc, col in sku_items:
        add_bullet_line(tf_emp, title, desc, 8.8, LIGHT_TEXT, col, 2)

    # 4 Product thumbnails in a neat row
    sku_files = ["sku_01_titan_watch.jpg", "sku_02_himalaya_brahmi.jpg", "sku_03_boult_earbuds.jpg", "sku_04_herbal_hair_oil.jpg"]
    labels = ["Titan Watch", "Himalaya Brahmi", "Boult Earbuds", "Hair Oil"]
    for i, sf in enumerate(sku_files):
        img_p = os.path.join(ASSETS_DIR, "product-images", sf)
        if os.path.exists(img_p):
            x_pos = Inches(6.75 + i * 1.50)
            s5.shapes.add_picture(img_p, x_pos, Inches(4.08), Inches(1.35), Inches(0.98))

    # Bottom Comparison Strip
    c_comp = add_card(s5, Inches(0.45), Inches(5.30), Inches(12.45), Inches(1.50))
    tf_comp = c_comp.text_frame
    tf_comp.word_wrap = True
    tf_comp.margin_left = tf_comp.margin_right = Inches(0.20)
    tf_comp.margin_top = Inches(0.10)
    add_header_text(tf_comp, "BEFORE VS. AFTER: THE LEGAL METROLOGY INSPECTION TRANSFORMATION", 12, True, GOLD_ACCENT)

    rows = [
        ("Inspection Throughput:", "25 minutes manual caliper inspection  ➜  < 2 minutes end-to-end with NIRIKSHAK (90% reduction in officer inspection time)."),
        ("Measurement Standard:", "Subjective manual vernier calipers  ➜  Sub-millimeter Planar Homography with ISO 17025 expanded uncertainty budget (±0.08mm)."),
        ("Legal Evidentiary Power:", "Uncalibrated phone photos dismissed under repealed Sec. 65B  ➜  Cryptographic Section 63 BSA 2023 Merkle DAG with QR verification.")
    ]
    for lbl, val in rows:
        add_bullet_line(tf_comp, lbl, val, 9.5, LIGHT_TEXT, CYAN_ACCENT, 2)

    # -------------------------------------------------------------
    # SLIDE 6: RESEARCH, REFERENCES & LIVE PRODUCT
    # -------------------------------------------------------------
    print("Formatting Slide 6...")
    s6 = prs.slides[5]
    format_slide_header(
        s6,
        "RESEARCH, STATUTORY REFERENCES & LIVE PRODUCT",
        "CODIFIED STATUTES, SCIENTIFIC LITERATURE & LIVE PRODUCTION WORKSTATION",
        "Oval 8"
    )

    # Top Citations Card
    c_res = add_card(s6, Inches(0.45), Inches(1.18), Inches(12.45), Inches(2.15))
    tf_res = c_res.text_frame
    tf_res.word_wrap = True
    tf_res.margin_left = tf_res.margin_right = Inches(0.20)
    tf_res.margin_top = Inches(0.12)
    add_header_text(tf_res, "STATUTORY FOUNDATION & SCIENTIFIC LITERATURE CITATIONS", 12, True, CYAN_ACCENT)

    refs = [
        ("The Legal Metrology Act, 2009 & PCR 2011:", "Enforces Sections 11, 18, 36, 48 and Rules 6(1)(a)-(p), 7, 9 (Table-I font schedule), and 12 (prohibited non-SI units).", GOLD_ACCENT),
        ("G.S.R. 629(E) (2021) & Jan Vishwas Act, 2023:", "Codifies Unit Sale Price (USP) arithmetic (|Δ| ≤ ₹0.02) and Act No. 18 of 2023 decriminalization of Section 36(1) with 15-day cure notices.", GOLD_ACCENT),
        ("Section 63 Bharatiya Sakshya Adhiniyam, 2023:", "Replaced Section 65B Indian Evidence Act on 1 July 2024. Mandates device telemetry, monotonic clock, and SHA-256 hash custody.", GREEN_ACCENT),
        ("Computer Vision & OCR Research:", "DBNet++ (Liao et al., IEEE TPAMI 2022) for real-time text polygon detection; PaddleOCR PP-OCRv4 (Du et al., 2023) lightweight SVTR text recognizer.", CYAN_ACCENT),
        ("ISO/IEC 17025 & JCGM 100:2008 (GUM):", "Standard metrological uncertainty budget (U95 = 2.0 · uc) ensuring optical font measurements withstand strict courtroom cross-examination.", CYAN_ACCENT)
    ]
    for lbl, val, col in refs:
        add_bullet_line(tf_res, lbl, val, 9.5, LIGHT_TEXT, col, 2)

    # Bottom Area: 3 Screen Cards
    screens = [
        ("Executive Inspection Control Centre", "Circle DL-SOUTH-01 live stats, active statutory directives & case search", "dashboard.png", CYAN_ACCENT),
        ("Quasi-Judicial Adjudication Desk", "Interactive 2.5x loupe HUD, mm grid overlay & mandatory override logs", "case_details_real.png", CYAN_ACCENT),
        ("Form-1 Notice & BSA 2023 Vault", "Cryptographic SHA-256 Merkle root & Sec. 63 BSA Digital Certificate PDF", "reports.png", GREEN_ACCENT)
    ]
    card_w = Inches(3.98)
    card_h = Inches(3.32)
    card_y = Inches(3.48)
    for idx, (title, sub, img_name, title_col) in enumerate(screens):
        x_pos = Inches(0.45 + idx * 4.23)
        c = add_card(s6, x_pos, card_y, card_w, card_h)
        
        # 1. Title Box
        tb_title = s6.shapes.add_textbox(x_pos + Inches(0.08), card_y + Inches(0.08), card_w - Inches(0.16), Inches(0.28))
        tf_t = tb_title.text_frame
        tf_t.margin_top = tf_t.margin_bottom = tf_t.margin_left = tf_t.margin_right = 0
        p_t = tf_t.paragraphs[0]
        p_t.text = title
        p_t.font.name = "Arial"
        p_t.font.size = Pt(10.5)
        p_t.font.bold = True
        p_t.font.color.rgb = title_col
        p_t.alignment = PP_ALIGN.CENTER
        
        # 2. Add screenshot
        img_p = os.path.join(ASSETS_DIR, "ui-screens", img_name)
        if os.path.exists(img_p):
            s6.shapes.add_picture(img_p, x_pos + Inches(0.10), card_y + Inches(0.38), card_w - Inches(0.20), Inches(2.22))
            
        # 3. Caption box below screenshot
        tb_cap = s6.shapes.add_textbox(x_pos + Inches(0.08), card_y + Inches(2.68), card_w - Inches(0.16), Inches(0.55))
        tf_c = tb_cap.text_frame
        tf_c.word_wrap = True
        tf_c.margin_top = tf_c.margin_bottom = tf_c.margin_left = tf_c.margin_right = 0
        p_c = tf_c.paragraphs[0]
        p_c.text = sub
        p_c.font.name = "Calibri"
        p_c.font.size = Pt(8.5)
        p_c.font.color.rgb = MUTED_TEXT
        p_c.alignment = PP_ALIGN.CENTER


    # -------------------------------------------------------------
    # DELETE SLIDE 7 (Instruction slide)
    # -------------------------------------------------------------
    if len(prs.slides) >= 7:
        print("Deleting Slide 7 (Instructions slide)...")
        rId = prs.slides._sldIdLst[6].rId
        prs.part.drop_rel(rId)
        del prs.slides._sldIdLst[6]

    print(f"Final slide count: {len(prs.slides)}")
    print(f"Saving presentation to: {OUT_PPTX}")
    prs.save(OUT_PPTX)
    print("Presentation saved cleanly!")

if __name__ == "__main__":
    main()
