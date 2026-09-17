# NIRIKSHAK Project: Master End-to-End System Operational Flowchart (In-Depth Guide)

**Welcome to NIRIKSHAK!** Agar aap is project ko pehli baar dekh rahe hain, toh yeh document aapko system ke architecture aur operational flow ko bilkul basic se lekar advanced details tak samajhne mein madad karega.

## 🎯 The Core Philosophy (System Ke Mool Siddhant)

NIRIKSHAK ek aam AI app nahi hai. Yeh ek **Legal Compliance System** hai. Iska mool mantra hai:

> _"AI Observes, Deterministic Rules Verify, and the Human Officer Decides."_

Iska seedha sa matlab hai:

1. **AI ka kaam sirf "Aankh" (Eyes) ka hai:** AI algorithms (jaise OCR aur Object Detection) sirf product ke packet par likhi hui cheezon ko dhoondhte hain aur padhte hain. **AI khud se koi legal rule nahi banata ya guess (hallucinate) nahi karta.**
2. **Deterministic Rule Engine (Dimaag):** Jo bhi text AI padhta hai, usko Government of India ke strict laws (Legal Metrology Act, 2009) aur mathematics ke rules par test kiya jata hai. Yeh rules fix hote hain (deterministic), isliye error ka chance zero ho jata hai.
3. **Quasi-Judicial Human Sovereignty (Faisla):** System khud kisiko saza (penalty) ya notice nahi bhejta. Yeh saara data aur saboot (evidence) ek Legal Metrology Officer (LMO) ko dikhata hai. Final judgement aur notice generate karne ki authority hamesha ek Insaan (Officer) ke paas hi hoti hai.

---

## 🔄 The 12-Stage Pipeline: Step-by-Step Breakdown

Is system ka architecture 12 alag-alag stages mein bata hua hai. Chaliye dekhte hain ki ek photo lene se lekar court ke notice banne tak kya hota hai:

### 📥 S0: INTAKE & INGESTION TIER (Data Ka Pravesh)

System mein data do jagah se aa sakta hai:

- **Physical Field Intake:** Ek officer field mein jaakar apne smartphone ya web camera se directly packet ki photo click karta hai.
- **E-Commerce URL / DOM:** System online websites (jaise Amazon, Blinkit) ka URL scan karke wahan se product ki photos aur details extract kar sakta hai.

### 🛡️ PHASE 1: FORENSICS & INTAKE (Saboot Ko Surakshit Karna)

**Stage 1: Forensic Ingestion & Hashing**
Jaise hi photo system mein aati hai, uspe **SHA-256 Hash** (ek complex mathematical cryptographic lock) lag jata hai. Saath hi ek **Monotonic Timestamp** record hota hai. Iska faayda yeh hai ki Bharatiya Sakshya Adhiniyam (BSA) ke hisaab se yeh photo ek pukhta saboot (tamper-proof evidence) ban jati hai. Kal ko court mein koi yeh nahi keh sakta ki photo ke sath digital manipulation hui hai.

**Stage 2: Optical Quality Gate (Photo Check Engine)**
Yeh kachra data (bad data) ko shuruwat mein hi bahar nikalne ka smart filter hai. AI check karta hai:

- **Laplacian Blur Check:** Kya photo dhundhli (blurry) hai?
- **Glare Masking:** Kya flash ki chamak (specular glare) ki wajah se text chhup raha hai?
- **Skew Check:** Kya photo bahut zyada tedhi (tilted) angle se li gayi hai?
  _Smart Feature:_ Agar photo kharab hai, toh system aage ka heavy AI computation rok deta hai aur screen par turant guidance deta hai: _"Hold Steady"_ ya _"Tilt 15° to Avoid Glare"_. Isse faaltu server processing aur time dono bachte hain.

### 📐 PHASE 2: GEOMETRIC METROLOGY (Nap-Tol Ki Tayari)

**Stages 3 & 4: Fiducial Calibration & Rectification**
Kyunki law kehta hai ki text ek specific millimetre (mm) size ka hona chahiye, system ko accurately pata hona chahiye ki photo mein distance (mm) kaise measure karna hai.

- **Calibration (Stage 3):** System photo mein ek reference point dhoondhta hai, jaise 50mm ka 'ArUco marker' ya ek standard 'ISO ID Card' (jiska size hamesha fix hota hai). Isse system turant calculate kar leta hai ki photo ke 1 pixel ka matlab real life mein kitne mm hai (px_to_mm conversion).
- **Rectification (Stage 4):** Agar photo thode angle se li gayi hai, toh math algorithm (`cv2.warpPerspective`) use karke us photo ko digitally ekdum flat (straight/planar) kar deta hai, taaki font size measurement mein distortion ke karan gadbadi na ho.

**Stage 5: Principal Display Panel (PDP) Calculation**

- System pehchanta hai ki packet ki geometric shape kya hai: Rectangular box, cylindrical bottle ya flexible pouch?
- Us shape ke aadhar par packet ka total visible area nikalta hai aur phir us area ka **40% (PDP)** calculate karta hai. Legal Metrology rules (Table-I) ke hisaab se, is package ke area ke basis par hi tay hota hai ki net quantity aur MRP ka font size kitna hona chahiye.

### 🔤 PHASE 3: NEURAL PERCEPTION (Padhne Ki Shamta)

**Stages 6 & 7: Multilingual Text Perception**
Yahan system ki "Aankhen" kaam karti hain, advanced Deep Learning ki madad se:

- **DBNet++:** Yeh AI model packet par likhe hue text ke blocks (bounding polygons) ko dhundhta hai.
- **PP-OCRv4 (PaddleOCR):** Yeh English (Latin) aur Hindi (Devanagari) bhashaon ko accuracy ke sath scan aur read karta hai.
- **Fallback Mechanism:** Agar AI ka confidence score kam hai (maan lijiye packet ulta pakda hai), toh system smartly photo ko 180-degree ghumakar (inversion probing) dobara padhne ki koshish karta hai. Phir bhi issue aaye toh 'Tesseract v5' naam ke doosre OCR engine ko trigger karke cross-verify karta hai.

### ⚖️ PHASE 4: SEMANTIC EXTRACTION & RULE ENGINE (Niyam Lagana)

**Stages 8 & 9: Semantic Extraction & Metrology**

- **Data Parsing:** System padhe hue raw text mein se Entities samajhta hai ki MRP kya hai, Net Quantity kahan likhi hai, Expiry Date kya hai, Manufacturer ka address aur Pincode (6-digit) kya hai.
- **Banned Unit Detector:** Yeh check karta hai ki kya company ne illegal/banned unit symbols use kiye hain? (e.g., law ke hisaab se weight 'g' ya 'kg' likhna chahiye. Agar packet par 'gms' ya 'Kgs' likha hai, toh system usko as a violation pakad lega).
- **Physical Font Measurement:** Stage 3 ke calibration ka use karke, system exact calculate karta hai ki printed letters/numbers ki height kitne millimetre (mm) hai. Iski precision kafi high (±0.08 mm tak) hoti hai.

**Stage 10: Deterministic Statutory Rule Engine (AST)**
Bina kisi AI ke assumptions/hallucinations ke, strictly **Legal Metrology laws aur Math formulas** apply kiye jaate hain.

- Kya number ka size (mm) sarkar ke bataye gaye table minimum size se match karta hai?
- Kya USP (Unit Sale Price) ka formula (jaise Rs per 100g) mathematically aur logically correct hai?
- Kya 'inclusive of all taxes' jaise mandatory words packet par hain?
  Saare niyam check hone ke baad ek solid **Legal Verdict** banta hai (Pass, Fail, ya Review).

### 👨‍⚖️ PHASE 5: QUASI-JUDICIAL & LEGAL DOSSIER (Faisla Aur Notice)

**Stage 11: Human-in-the-Loop Adjudication**

- Machine ka decision final nahi hota. AI ka sara kaam aur findings ek interactive dashboard (Officer Adjudication Canvas) par Legal Metrology Officer (LMO) ke paas jata hai.
- System unhe highlight (red boxes ke through) karke dikhata hai ki kahan rule tuta hai.
- Officer khud apne discretion (faisle) se us evidence ko dekh kar violation ko **Confirm (Approve)** kar sakta hai ya **Override (Reject)** kar sakta hai.

**Stage 12: Evidence Dossier & Notice Generation**

- Agar officer ne legal violation ko confirm kar diya, toh system aakhiri kadam uthata hai.
- System ek **Merkle DAG** (Blockchain-style technology) use karke Stage 1 se lekar Stage 11 tak ki har choti detail ko ek aisi chain mein baandh deta hai jise hack/change nahi kiya ja sakta.
- Aakhir mein ek **Court-Admissible PDF/A Document (Form-1/Form-2 Show-Cause Notice)** automatically generate hota hai. Is notice par ek Verification QR code hota hai jisse scan karke court, manufacturer ya koi bhi authorized entity is notice ki original integrity verify kar sakti hai.

---

### 💡 Conclusion (Nishkarsh)

Diagram 1 ka yeh flowchart kisi aam image-reading app ka nahi, balki ek highly secure, legally compliant aur AI-powered judicial enforcement tool ka blueprint hai. Yeh system **AI ki speed aur scalability** ko **Rule-Engine ki legal accuracy** aur ek **Insaan ke judgement** ke sath milata hai, taaki investigation aur justice system fast bhi ho aur completely fair bhi!
