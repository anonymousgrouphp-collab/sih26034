import os
import pymupdf

base_dir = r"C:\Users\kunal\Desktop\NIRIKSHAK\SIH ppt - kunal\assests"

def save_svg_and_png(svg_content, subfolder, filename_base, dpi=150):
    folder = os.path.join(base_dir, subfolder)
    os.makedirs(folder, exist_ok=True)
    svg_path = os.path.join(folder, f"{filename_base}.svg")
    png_path = os.path.join(folder, f"{filename_base}.png")
    
    with open(svg_path, "w", encoding="utf-8") as f:
        f.write(svg_content.strip())
        
    doc = pymupdf.open(svg_path)
    pix = doc[0].get_pixmap(dpi=dpi)
    pix.save(png_path)
    print(f"Saved: {svg_path} & {png_path} ({pix.width}x{pix.height})")

# -------------------------------------------------------------
# 1. PROBLEM CRISIS DIAGRAM
# -------------------------------------------------------------
svg_01 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 440" width="1200" height="440">
  <rect width="1200" height="440" rx="14" fill="#0B192C"/>
  <!-- Card 1 -->
  <g transform="translate(30, 25)">
    <rect width="360" height="390" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
    <rect width="360" height="52" rx="12" fill="#9A3412"/>
    <text x="180" y="33" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="17" font-weight="bold" text-anchor="middle">CRISIS 1: SCALE ASYMMETRY</text>
    <text x="180" y="105" fill="#FB923C" font-family="Arial, sans-serif" font-size="34" font-weight="bold" text-anchor="middle">1.2 Crore+</text>
    <text x="180" y="132" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13.5" text-anchor="middle">Retail Outlets &amp; Mandis in India</text>
    <line x1="40" y1="158" x2="320" y2="158" stroke="#334155" stroke-width="1.5"/>
    <text x="180" y="202" fill="#F87171" font-family="Arial, sans-serif" font-size="34" font-weight="bold" text-anchor="middle">~3,000</text>
    <text x="180" y="229" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13.5" text-anchor="middle">Legal Metrology Officers Nationwide</text>
    <rect x="25" y="262" width="310" height="100" rx="8" fill="#0F172A" stroke="#EA580C" stroke-width="1.2"/>
    <text x="180" y="292" fill="#FED7AA" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Severe Capacity Bottleneck:</text>
    <text x="180" y="318" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="14.5" font-weight="bold" text-anchor="middle">&lt; 0.1% Packaged Goods Audited</text>
    <text x="180" y="342" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">99.9% market commodities escape verification</text>
  </g>
  <!-- Card 2 -->
  <g transform="translate(420, 25)">
    <rect width="360" height="390" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
    <rect width="360" height="52" rx="12" fill="#1E40AF"/>
    <text x="180" y="33" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="17" font-weight="bold" text-anchor="middle">CRISIS 2: MANUAL FRICTION</text>
    <text x="180" y="105" fill="#60A5FA" font-family="Arial, sans-serif" font-size="34" font-weight="bold" text-anchor="middle">25 Minutes</text>
    <text x="180" y="132" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13.5" text-anchor="middle">Required Per Package Inspection</text>
    <line x1="40" y1="158" x2="320" y2="158" stroke="#334155" stroke-width="1.5"/>
    <text x="180" y="202" fill="#FBBF24" font-family="Arial, sans-serif" font-size="34" font-weight="bold" text-anchor="middle">15 - 20 PKGs</text>
    <text x="180" y="229" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13.5" text-anchor="middle">Maximum Daily Output Per Officer</text>
    <rect x="25" y="262" width="310" height="100" rx="8" fill="#0F172A" stroke="#3B82F6" stroke-width="1.2"/>
    <text x="180" y="292" fill="#BFDBFE" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Manual Tools in Field Use:</text>
    <text x="180" y="318" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="14.5" font-weight="bold" text-anchor="middle">Vernier Calipers &amp; Magnifiers</text>
    <text x="180" y="342" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Human parallax error &amp; handwritten logs</text>
  </g>
  <!-- Card 3 -->
  <g transform="translate(810, 25)">
    <rect width="360" height="390" rx="12" fill="#1E293B" stroke="#334155" stroke-width="2"/>
    <rect width="360" height="52" rx="12" fill="#991B1B"/>
    <text x="180" y="33" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="17" font-weight="bold" text-anchor="middle">CRISIS 3: EVIDENTIARY FAILURE</text>
    <text x="180" y="105" fill="#F87171" font-family="Arial, sans-serif" font-size="32" font-weight="bold" text-anchor="middle">Sec. 63 BSA 2023</text>
    <text x="180" y="132" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13.5" text-anchor="middle">New Electronic Evidence Mandate</text>
    <line x1="40" y1="158" x2="320" y2="158" stroke="#334155" stroke-width="1.5"/>
    <text x="180" y="202" fill="#EF4444" font-family="Arial, sans-serif" font-size="30" font-weight="bold" text-anchor="middle">Sec. 65B Repealed</text>
    <text x="180" y="229" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13.5" text-anchor="middle">1 July 2024 Evidence Act Overhaul</text>
    <rect x="25" y="262" width="310" height="100" rx="8" fill="#0F172A" stroke="#EF4444" stroke-width="1.2"/>
    <text x="180" y="292" fill="#FECACA" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Judicial Vulnerability:</text>
    <text x="180" y="318" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="14.5" font-weight="bold" text-anchor="middle">Prosecutions Dismissed in Court</text>
    <text x="180" y="342" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Unverified phone photos lack hash custody</text>
  </g>
</svg>"""

save_svg_and_png(svg_01, "diagrams", "01_problem_stats")

# -------------------------------------------------------------
# 2. PIPELINE FLOWCHART
# -------------------------------------------------------------
svg_02 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 320" width="1200" height="320">
  <rect width="1200" height="320" rx="14" fill="#0B192C"/>
  <defs>
    <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#38BDF8"/>
      <stop offset="100%" stop-color="#818CF8"/>
    </linearGradient>
  </defs>

  <!-- Stage 1 -->
  <g transform="translate(20, 30)">
    <rect width="175" height="260" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="1.8"/>
    <rect width="175" height="40" rx="10" fill="#0F172A"/>
    <text x="87" y="26" fill="#38BDF8" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">1. FORENSICS</text>
    <text x="87" y="75" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Raw Ingestion</text>
    <text x="87" y="105" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• SHA-256 byte lock</text>
    <text x="87" y="128" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Monotonic clock</text>
    <text x="87" y="151" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Device metadata</text>
    <rect x="15" y="195" width="145" height="50" rx="6" fill="#0F172A"/>
    <text x="87" y="217" fill="#38BDF8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LEGAL PURPOSE</text>
    <text x="87" y="235" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Tamper-Proof Seal</text>
  </g>

  <!-- Stage 2 -->
  <g transform="translate(215, 30)">
    <rect width="175" height="260" rx="10" fill="#1E293B" stroke="#818CF8" stroke-width="1.8"/>
    <rect width="175" height="40" rx="10" fill="#0F172A"/>
    <text x="87" y="26" fill="#818CF8" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">2. QUALITY GATE</text>
    <text x="87" y="75" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Optical Screener</text>
    <text x="87" y="105" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Blur Var ≥ 150.0</text>
    <text x="87" y="128" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Glare mask ≤ 3.0%</text>
    <text x="87" y="151" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Tilt screener ≤ 15°</text>
    <rect x="15" y="195" width="145" height="50" rx="6" fill="#0F172A"/>
    <text x="87" y="217" fill="#818CF8" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">SPEED GAIN</text>
    <text x="87" y="235" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">&lt; 15ms Fast Exit</text>
  </g>

  <!-- Stage 3 -->
  <g transform="translate(410, 30)">
    <rect width="175" height="260" rx="10" fill="#1E293B" stroke="#34D399" stroke-width="1.8"/>
    <rect width="175" height="40" rx="10" fill="#0F172A"/>
    <text x="87" y="26" fill="#34D399" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">3. CALIBRATION</text>
    <text x="87" y="75" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Planar Geometry</text>
    <text x="87" y="105" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• ArUco / ID Card</text>
    <text x="87" y="128" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• 3×3 Homography H</text>
    <text x="87" y="151" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Sub-mm px_to_mm</text>
    <rect x="15" y="195" width="145" height="50" rx="6" fill="#0F172A"/>
    <text x="87" y="217" fill="#34D399" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">CV ACCURACY</text>
    <text x="87" y="235" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">±0.08mm Precision</text>
  </g>

  <!-- Stage 4 -->
  <g transform="translate(605, 30)">
    <rect width="175" height="260" rx="10" fill="#1E293B" stroke="#FBBF24" stroke-width="1.8"/>
    <rect width="175" height="40" rx="10" fill="#0F172A"/>
    <text x="87" y="26" fill="#FBBF24" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">4. NEURAL OCR</text>
    <text x="87" y="75" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">DBNet++ &amp; OCR</text>
    <text x="87" y="105" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Oriented Polygons</text>
    <text x="87" y="128" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• PP-OCRv4 INT8 CPU</text>
    <text x="87" y="151" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Latin &amp; Devanagari</text>
    <rect x="15" y="195" width="145" height="50" rx="6" fill="#0F172A"/>
    <text x="87" y="217" fill="#FBBF24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">EDGE SPEED</text>
    <text x="87" y="235" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">180ms on Core CPU</text>
  </g>

  <!-- Stage 5 -->
  <g transform="translate(800, 30)">
    <rect width="175" height="260" rx="10" fill="#1E293B" stroke="#F472B6" stroke-width="1.8"/>
    <rect width="175" height="40" rx="10" fill="#0F172A"/>
    <text x="87" y="26" fill="#F472B6" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">5. STATUTORY AST</text>
    <text x="87" y="75" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Rule Engine</text>
    <text x="87" y="105" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Table-I Font Sched</text>
    <text x="87" y="128" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• USP Math (|Δ|≤0.02)</text>
    <text x="87" y="151" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Banned Units Filter</text>
    <rect x="15" y="195" width="145" height="50" rx="6" fill="#0F172A"/>
    <text x="87" y="217" fill="#F472B6" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">TRUST PRINCIPLE</text>
    <text x="87" y="235" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Zero Hallucinations</text>
  </g>

  <!-- Stage 6 -->
  <g transform="translate(995, 30)">
    <rect width="180" height="260" rx="10" fill="#1E293B" stroke="#10B981" stroke-width="2.2"/>
    <rect width="180" height="40" rx="10" fill="#064E3B"/>
    <text x="90" y="26" fill="#A7F3D0" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">6. COURT NOTICE</text>
    <text x="90" y="75" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Sec. 63 BSA 2023</text>
    <text x="90" y="105" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• SHA-256 Merkle DAG</text>
    <text x="90" y="128" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Officer Loupe Signoff</text>
    <text x="90" y="151" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">• Form-1 Legal PDF/A</text>
    <rect x="15" y="195" width="150" height="50" rx="6" fill="#0F172A"/>
    <text x="90" y="217" fill="#10B981" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">LEGAL OUTCOME</text>
    <text x="90" y="235" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="11" text-anchor="middle">Courtroom Admissible</text>
  </g>
</svg>"""

save_svg_and_png(svg_02, "flowcharts", "02_pipeline_flow")

# -------------------------------------------------------------
# 3. CORE INNOVATION: PLANAR HOMOGRAPHY METRICS
# -------------------------------------------------------------
svg_03 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 400" width="1200" height="400">
  <rect width="1200" height="400" rx="14" fill="#0F172A"/>
  
  <!-- Left Side: Tilted Raw Physical Capture -->
  <g transform="translate(40, 40)">
    <rect width="330" height="320" rx="10" fill="#1E293B" stroke="#475569" stroke-width="1.5"/>
    <text x="165" y="32" fill="#F87171" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">TILTED PERSPECTIVE CAPTURE</text>
    <!-- Trapezoid simulating perspective tilt -->
    <polygon points="60,90 270,70 300,230 40,250" fill="#0F172A" stroke="#EF4444" stroke-width="2"/>
    <!-- Fiducial Card -->
    <polygon points="70,105 130,100 135,160 75,165" fill="#3B82F6" stroke="#FFFFFF" stroke-width="1.5"/>
    <text x="105" y="137" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="10" font-weight="bold" text-anchor="middle">REF CARD</text>
    <!-- Text patch -->
    <polygon points="160,180 260,170 265,200 165,210" fill="#334155"/>
    <text x="210" y="198" fill="#FBBF24" font-family="Arial, sans-serif" font-size="11" font-weight="bold" text-anchor="middle">MRP ₹260.00</text>
    <rect x="20" y="270" width="290" height="35" rx="6" fill="#0F172A"/>
    <text x="165" y="292" fill="#EF4444" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle">❌ Raw Pixels ≠ Real Millimeters</text>
  </g>

  <!-- Center: Mathematical Transformation Engine -->
  <g transform="translate(400, 40)">
    <rect width="380" height="320" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <rect width="380" height="42" rx="10" fill="#0369A1"/>
    <text x="190" y="27" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">PLANAR HOMOGRAPHY MATRIX (H)</text>
    
    <text x="190" y="80" fill="#E2E8F0" font-family="Courier New, monospace" font-size="16" font-weight="bold" text-anchor="middle">s · [x&apos; y&apos; 1]ᵀ = H · [x y 1]ᵀ</text>
    
    <rect x="30" y="105" width="320" height="110" rx="8" fill="#0F172A" stroke="#334155"/>
    <text x="50" y="132" fill="#38BDF8" font-family="Arial, sans-serif" font-size="13" font-weight="bold">• Known ISO 7810 Standard:</text>
    <text x="65" y="152" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="12">85.60 mm × 53.98 mm (ID-1 / ATM Card)</text>
    <text x="50" y="177" fill="#38BDF8" font-family="Arial, sans-serif" font-size="13" font-weight="bold">• Metric Scale Factor Resolved:</text>
    <text x="65" y="197" fill="#F59E0B" font-family="Courier New, monospace" font-size="13" font-weight="bold">px_to_mm = 14.82 px/mm (Sub-pixel SVD)</text>

    <rect x="30" y="235" width="320" height="70" rx="8" fill="#0369A1" fill-opacity="0.2" stroke="#38BDF8" stroke-width="1"/>
    <text x="190" y="258" fill="#38BDF8" font-family="Arial, sans-serif" font-size="12.5" font-weight="bold" text-anchor="middle">Pinhole Depth Compensation:</text>
    <text x="190" y="280" fill="#E2E8F0" font-family="Courier New, monospace" font-size="12" text-anchor="middle">M = D_cam / (D_cam - Δz) [ADL-03]</text>
  </g>

  <!-- Right Side: Orthogonal Rectified Measurement -->
  <g transform="translate(810, 40)">
    <rect width="350" height="320" rx="10" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
    <text x="175" y="32" fill="#34D399" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">ORTHOGONAL METRIC CANVAS</text>
    <!-- Perfectly rectangular unwarped box -->
    <rect x="45" y="65" width="260" height="180" rx="4" fill="#0F172A" stroke="#10B981" stroke-width="2"/>
    <!-- Metric Grid -->
    <line x1="45" y1="125" x2="305" y2="125" stroke="#334155" stroke-dasharray="4,4"/>
    <line x1="45" y1="185" x2="305" y2="185" stroke="#334155" stroke-dasharray="4,4"/>
    <line x1="175" y1="65" x2="175" y2="245" stroke="#334155" stroke-dasharray="4,4"/>
    
    <text x="175" y="115" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Himalaya Brahmi Batch Numeral</text>
    <text x="175" y="155" fill="#10B981" font-family="Arial, sans-serif" font-size="28" font-weight="bold" text-anchor="middle">1.46 mm</text>
    <text x="175" y="180" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12" text-anchor="middle">Physical Vernier Caliper Truth: 1.47 mm</text>
    <text x="175" y="202" fill="#FBBF24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Absolute Parity Error: Only 0.01 mm!</text>

    <rect x="25" y="265" width="300" height="40" rx="6" fill="#064E3B"/>
    <text x="175" y="290" fill="#A7F3D0" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">✅ Defensible Sub-Millimeter Evidence</text>
  </g>
</svg>"""

save_svg_and_png(svg_03, "diagrams", "03_homography_calibration")

# -------------------------------------------------------------
# 4. JAN VISHWAS 2023 ENFORCEMENT TREE
# -------------------------------------------------------------
svg_04 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" width="1200" height="420">
  <rect width="1200" height="420" rx="14" fill="#0F172A"/>

  <!-- Root: NIRIKSHAK Statutory Rule Evaluation -->
  <g transform="translate(380, 25)">
    <rect width="440" height="65" rx="10" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <text x="220" y="28" fill="#38BDF8" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle">NIRIKSHAK DETERMINISTIC AST VERDICT</text>
    <text x="220" y="50" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="13" text-anchor="middle">Evaluation Under Legal Metrology Act, 2009 &amp; PCR 2011</text>
  </g>

  <!-- Fork Lines -->
  <path d="M 600,90 L 600,125 L 300,125 L 300,155" fill="none" stroke="#10B981" stroke-width="3"/>
  <path d="M 600,90 L 600,125 L 900,125 L 900,155" fill="none" stroke="#EF4444" stroke-width="3"/>

  <!-- Left Branch: Minor Technical Deficit -->
  <g transform="translate(60, 155)">
    <rect width="480" height="235" rx="12" fill="#1E293B" stroke="#10B981" stroke-width="2"/>
    <rect width="480" height="45" rx="12" fill="#064E3B"/>
    <text x="240" y="28" fill="#A7F3D0" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">MINOR PROCEDURAL DEFICIT</text>
    
    <text x="30" y="75" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="13.5" font-weight="bold">• Example Finding:</text>
    <text x="45" y="98" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13">Font height 1.46 mm vs 2.0 mm required (Himalaya Brahmi)</text>
    
    <rect x="25" y="115" width="430" height="65" rx="8" fill="#0F172A" stroke="#10B981" stroke-width="1.2"/>
    <text x="240" y="140" fill="#34D399" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">15-Day Statutory Improvement Notice</text>
    <text x="240" y="163" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">₹0 Compounding Fee (Decriminalized)</text>
    
    <text x="240" y="205" fill="#A7F3D0" font-family="Arial, sans-serif" font-size="12" font-style="italic" text-anchor="middle">Sec. 36(1) proviso (Jan Vishwas Act 2023) — Protects Ease of Doing Business</text>
  </g>

  <!-- Right Branch: Substantive Violation -->
  <g transform="translate(660, 155)">
    <rect width="480" height="235" rx="12" fill="#1E293B" stroke="#EF4444" stroke-width="2"/>
    <rect width="480" height="45" rx="12" fill="#7F1D1D"/>
    <text x="240" y="28" fill="#FECACA" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">SUBSTANTIVE FRAUD / OMISSION</text>
    
    <text x="30" y="75" fill="#E2E8F0" font-family="Arial, sans-serif" font-size="13.5" font-weight="bold">• Example Findings:</text>
    <text x="45" y="98" fill="#94A3B8" font-family="Arial, sans-serif" font-size="13">Banned units (&apos;100ml.&apos;), missing tax clause, missing email</text>
    
    <rect x="25" y="115" width="430" height="65" rx="8" fill="#0F172A" stroke="#EF4444" stroke-width="1.2"/>
    <text x="240" y="140" fill="#F87171" font-family="Arial, sans-serif" font-size="15" font-weight="bold" text-anchor="middle">Section 48 Civil Compounding Notice</text>
    <text x="240" y="163" fill="#EF4444" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">₹25,000 INR Penalty Imposed</text>
    
    <text x="240" y="205" fill="#FCA5A5" font-family="Arial, sans-serif" font-size="12" font-style="italic" text-anchor="middle">Sec. 48 LM Act 2009 — Immediate deterrence against deceptive packaging</text>
  </g>
</svg>"""

save_svg_and_png(svg_04, "diagrams", "04_jan_vishwas_enforcement")

# -------------------------------------------------------------
# 5. DUAL ENGINE ARCHITECTURE TOPOLOGY
# -------------------------------------------------------------
svg_05 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 420" width="1200" height="420">
  <rect width="1200" height="420" rx="14" fill="#0F172A"/>

  <!-- Mode A: Central Online Web Platform -->
  <g transform="translate(40, 30)">
    <rect width="520" height="300" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <rect width="520" height="50" rx="12" fill="#0369A1"/>
    <text x="260" y="32" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="17" font-weight="bold" text-anchor="middle">MODE A: CENTRAL ONLINE PLATFORM</text>
    
    <rect x="25" y="65" width="470" height="30" rx="6" fill="#0F172A"/>
    <text x="40" y="85" fill="#38BDF8" font-family="Arial, sans-serif" font-size="12.5" font-weight="bold">Network: Standard HTTPS | Target: Directorates &amp; Circles</text>
    
    <text x="35" y="125" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Hosted React 18/19 SPA Web Workstation (Browser)</text>
    <text x="35" y="152" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Central PostgreSQL 16+ Datastore &amp; File Storage</text>
    <text x="35" y="179" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Multi-Tenant RBAC: Inspector, Controller, Admin, Auditor</text>
    <text x="35" y="206" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Colocated ONNX INT8 CPU Model Inference (FastAPI)</text>
    <text x="35" y="233" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Real-time Adjudication Canvas &amp; Executive Dashboard</text>
    <text x="35" y="260" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Form-1 Legal PDF/A with Dynamic Verification QR Code</text>
  </g>

  <!-- Mode B: Offline Resilient Field Engine -->
  <g transform="translate(640, 30)">
    <rect width="520" height="300" rx="12" fill="#1E293B" stroke="#F59E0B" stroke-width="2"/>
    <rect width="520" height="50" rx="12" fill="#B45309"/>
    <text x="260" y="32" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="17" font-weight="bold" text-anchor="middle">MODE B: RESILIENT OFFLINE ENGINE</text>
    
    <rect x="25" y="65" width="470" height="30" rx="6" fill="#0F172A"/>
    <text x="40" y="85" fill="#FBBF24" font-family="Arial, sans-serif" font-size="12.5" font-weight="bold">Network: ZERO BYTES (0 KB) | Target: Rural Mandis &amp; Godowns</text>
    
    <text x="35" y="125" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Standalone Local Workstation &amp; CLI Inspector</text>
    <text x="35" y="152" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Embedded SQLite 3.45+ (SQLCipher AES-256 Encrypted)</text>
    <text x="35" y="179" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Local CPU DBNet++ &amp; PP-OCRv4 (Zero Cloud Dependency)</text>
    <text x="35" y="206" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Local Deterministic AST &amp; Quasi-Judicial Canvas</text>
    <text x="35" y="233" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Local Monotonic UTC Clock &amp; Section 63 BSA Notice PDF</text>
    <text x="35" y="260" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="13">• Encrypted Export Bundles for Late-Sync when Online</text>
  </g>

  <!-- Bottom Common Law Engine Strip -->
  <g transform="translate(40, 345)">
    <rect width="1120" height="55" rx="8" fill="#1E293B" stroke="#64748B" stroke-width="1.5"/>
    <text x="560" y="25" fill="#F8FAFC" font-family="Arial, sans-serif" font-size="13.5" font-weight="bold" text-anchor="middle">MODE C (GATEWAY READY): NIC eMaap JSON Staging | MCA21 Corporate Check | GSTN API | Consumer Helpline</text>
    <text x="560" y="44" fill="#94A3B8" font-family="Arial, sans-serif" font-size="11.5" text-anchor="middle">Frozen Pydantic v2 DTOs ensure 100% data contract compatibility across Mode A, Mode B and national portals</text>
  </g>
</svg>"""

save_svg_and_png(svg_05, "architecture", "05_system_modes")

# -------------------------------------------------------------
# 6. IMPACT AND BENCHMARK COMPARISON
# -------------------------------------------------------------
svg_06 = """<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 440" width="1200" height="440">
  <rect width="1200" height="440" rx="14" fill="#0B192C"/>

  <!-- Left Column: 4 Big Numbers -->
  <g transform="translate(35, 30)">
    <!-- Box 1 -->
    <rect width="260" height="175" rx="10" fill="#1E293B" stroke="#334155"/>
    <text x="130" y="60" fill="#F59E0B" font-family="Arial, sans-serif" font-size="44" font-weight="bold" text-anchor="middle">~13x</text>
    <text x="130" y="95" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Throughput Gain</text>
    <text x="130" y="125" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12.5" text-anchor="middle">25 min manual audit</text>
    <text x="130" y="145" fill="#38BDF8" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">→ &lt; 2 min with NIRIKSHAK</text>

    <!-- Box 2 -->
    <g transform="translate(280, 0)">
      <rect width="260" height="175" rx="10" fill="#1E293B" stroke="#334155"/>
      <text x="130" y="60" fill="#38BDF8" font-family="Arial, sans-serif" font-size="44" font-weight="bold" text-anchor="middle">200+</text>
      <text x="130" y="95" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Packages / Day</text>
      <text x="130" y="125" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12.5" text-anchor="middle">Officer daily capacity</text>
      <text x="130" y="145" fill="#34D399" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">vs 15-20 with calipers</text>
    </g>

    <!-- Box 3 -->
    <g transform="translate(0, 195)">
      <rect width="260" height="175" rx="10" fill="#1E293B" stroke="#334155"/>
      <text x="130" y="60" fill="#34D399" font-family="Arial, sans-serif" font-size="44" font-weight="bold" text-anchor="middle">₹0</text>
      <text x="130" y="95" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Cloud GPU Cost</text>
      <text x="130" y="125" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12.5" text-anchor="middle">INT8 ONNX CPU Execution</text>
      <text x="130" y="145" fill="#FBBF24" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">Runs on ₹10k hardware</text>
    </g>

    <!-- Box 4 -->
    <g transform="translate(280, 195)">
      <rect width="260" height="175" rx="10" fill="#1E293B" stroke="#334155"/>
      <text x="130" y="60" fill="#F472B6" font-family="Arial, sans-serif" font-size="44" font-weight="bold" text-anchor="middle">0.01 mm</text>
      <text x="130" y="95" fill="#FFFFFF" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">Vernier Parity Error</text>
      <text x="130" y="125" fill="#94A3B8" font-family="Arial, sans-serif" font-size="12.5" text-anchor="middle">Physical caliper 1.47mm</text>
      <text x="130" y="145" fill="#F87171" font-family="Arial, sans-serif" font-size="13" font-weight="bold" text-anchor="middle">vs NIRIKSHAK 1.46mm</text>
    </g>
  </g>

  <!-- Right Column: 4-Stakeholder Value Framework -->
  <g transform="translate(605, 30)">
    <rect width="560" height="370" rx="12" fill="#1E293B" stroke="#38BDF8" stroke-width="2"/>
    <rect width="560" height="48" rx="12" fill="#0F172A"/>
    <text x="280" y="31" fill="#38BDF8" font-family="Arial, sans-serif" font-size="16" font-weight="bold" text-anchor="middle">MULTI-STAKEHOLDER GOVERNANCE VALUE</text>

    <!-- Stakeholder 1 -->
    <g transform="translate(25, 65)">
      <rect width="510" height="65" rx="8" fill="#0F172A" stroke="#334155"/>
      <text x="20" y="26" fill="#F59E0B" font-family="Arial, sans-serif" font-size="14" font-weight="bold">1. Legal Metrology Officers (Field Inspectors):</text>
      <text x="20" y="48" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="12.5">90% reduction in inspection time; instant retake guidance; zero paper drafting.</text>
    </g>
    <!-- Stakeholder 2 -->
    <g transform="translate(25, 140)">
      <rect width="510" height="65" rx="8" fill="#0F172A" stroke="#334155"/>
      <text x="20" y="26" fill="#38BDF8" font-family="Arial, sans-serif" font-size="14" font-weight="bold">2. Indian Consumers:</text>
      <text x="20" y="48" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="12.5">Eliminates deceptive packaging, hidden taxes, and banned non-standard metric units.</text>
    </g>
    <!-- Stakeholder 3 -->
    <g transform="translate(25, 215)">
      <rect width="510" height="65" rx="8" fill="#0F172A" stroke="#334155"/>
      <text x="20" y="26" fill="#34D399" font-family="Arial, sans-serif" font-size="14" font-weight="bold">3. Packaging Manufacturers &amp; MSMEs:</text>
      <text x="20" y="48" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="12.5">Pre-compliance simulation saves crores in printed stock rejections &amp; recalls.</text>
    </g>
    <!-- Stakeholder 4 -->
    <g transform="translate(25, 290)">
      <rect width="510" height="65" rx="8" fill="#0F172A" stroke="#334155"/>
      <text x="20" y="26" fill="#F87171" font-family="Arial, sans-serif" font-size="14" font-weight="bold">4. Judicial Magistrates &amp; Adjudicating Officers:</text>
      <text x="20" y="48" fill="#CBD5E1" font-family="Arial, sans-serif" font-size="12.5">Tamper-proof Section 63 BSA Merkle DAG evidence prevents courtroom dismissals.</text>
    </g>
  </g>
</svg>"""

save_svg_and_png(svg_06, "charts", "06_impact_metrics")

print("All 6 vector SVGs and high-res PNGs generated successfully!")
