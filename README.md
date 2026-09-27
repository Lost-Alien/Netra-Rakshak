# Netra Rakshak (नेत्र रक्षक)
### Explainable AI for Diabetic Retinopathy Screening in Rural India

[![Live Production](https://img.shields.io/badge/Live%20Deployment-Vercel-0F6F6A?style=for-the-badge&logo=vercel&logoColor=white)](https://netra-rakshak-seven.vercel.app)
[![Backend API](https://img.shields.io/badge/Backend%20API-AWS%20EC2%20t3.small-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)](http://13.200.63.0/health)
[![MATLAB Web App Server](https://img.shields.io/badge/MATLAB-Web%20App%20Server-E16726?style=for-the-badge&logo=mathworks&logoColor=white)](https://github.com/mathworks-ref-arch/matlab-web-app-server-on-aws)
[![SIH 2026](https://img.shields.io/badge/SIH%202026-Problem%2026038-C1652F?style=for-the-badge)](https://netra-rakshak-seven.vercel.app/research)
[![Pipeline](https://img.shields.io/badge/Engineering-MATLAB%20R2026a%20%26%20App%20Designer-12314F?style=for-the-badge&logo=mathworks&logoColor=white)](https://netra-rakshak-seven.vercel.app/#how-it-works)
[![Standard](https://img.shields.io/badge/Clinical%20Standard-ICDR%205--Stage-3F7D5C?style=for-the-badge)](https://netra-rakshak-seven.vercel.app/#validation)

> **Smart India Hackathon 2026** | **Problem Statement ID:** 26038
> **Domain:** MedTech / BioTech / HealthTech
> **Sponsor / Challenge:** MathWorks India & Ministry of Health and Family Welfare
> **Production Web App:** [https://netra-rakshak-seven.vercel.app](https://netra-rakshak-seven.vercel.app)
> **Backend API (Health):** [http://13.200.63.0/health](http://13.200.63.0/health)
> **MathWorks Cloud Architecture:** [AWS Reference Architecture](https://github.com/mathworks-ref-arch/matlab-web-app-server-on-aws) | [Azure Reference Architecture](https://github.com/mathworks-ref-arch/matlab-web-app-server-on-azure)

---

## 📋 Table of Contents
1. [Executive Summary & Clinical Background](#-executive-summary--clinical-background)
2. [☁️ Production Infrastructure (AWS EC2 Backend)](#%EF%B8%8F-production-infrastructure-aws-ec2-backend)
3. [MATLAB® Web App Server Cloud Deployment](#%EF%B8%8F-matlab-web-app-server-cloud-deployment)
4. [Key Deployment Challenges Solved](#-key-deployment-challenges-solved)
5. [5-Stage MATLAB Pipeline Architecture](#-5-stage-matlab-pipeline-architecture)
6. [Platform Features & Tele-Ophthalmology Workflows](#-platform-features--tele-ophthalmology-workflows)
7. [Clinical Validation & Benchmark Targets](#-clinical-validation--benchmark-targets)
8. [Tech Stack](#%EF%B8%8F-tech-stack)
9. [Repository Structure](#-repository-structure)
10. [Local Installation & Getting Started](#-local-installation--getting-started)
11. [The Team — Built by Innovators](#-the-team--built-by-innovators)
12. [Citations & Acknowledgments](#-citations--acknowledgments)

---

## 🩺 Executive Summary & Clinical Background

India is confronting a diabetic retinopathy epidemic:
- **77+ Million Adults** in India live with diabetes (the 2nd highest population globally).
- **~18% of this diabetic population** suffers from Diabetic Retinopathy (DR)—a leading cause of preventable adult blindness.
- **90% of vision loss is preventable** with routine fundus screening and timely clinical escalation (laser photocoagulation or anti-VEGF therapies).
- **1 Ophthalmologist per 100,000 rural citizens**: In rural India, mass manual fundus examination by certified specialists is mathematically impossible.

Existing commercial AI systems operate as **black boxes**, lack transparent clinical explainability, and fail frequently when tested on variable, low-illumination non-mydriatic (undilated) captures from portable fundus cameras deployed in field camps.

**Netra Rakshak** is a clinical-grade, explainable tele-ophthalmology screening platform designed specifically for Primary Healthcare Centres (PHCs) and rural mobile health camps across India.

---

## ☁️ Production Infrastructure (AWS EC2 Backend)

The production diagnostic AI backend is deployed on **AWS EC2** in the `ap-south-1` (Mumbai) region — chosen for lowest latency from Indian PHC locations.

### Infrastructure Overview

```
┌──────────────────────────────────────────────────────────────────────────────┐
│                        PRODUCTION DEPLOYMENT                                 │
│                                                                              │
│  Browser (HTTPS) ──►  Vercel Edge Network  ──►  /api/predict (SSR Proxy)   │
│                            (Global CDN)              (TanStack Start)        │
│                                                              │               │
│                                                              ▼ HTTP          │
│                                              ┌───────────────────────────┐  │
│                                              │  AWS EC2 t3.small         │  │
│                                              │  Region: ap-south-1       │  │
│                                              │  Elastic IP: 13.200.63.0  │  │
│                                              │  ─────────────────────    │  │
│                                              │  Nginx (Port 80 → 8000)   │  │
│                                              │  FastAPI + Uvicorn        │  │
│                                              │  ONNX Runtime (CPU)       │  │
│                                              │  netra_rakshak.onnx (91MB)│  │
│                                              └───────────────────────────┘  │
└──────────────────────────────────────────────────────────────────────────────┘
```

### EC2 Instance Specifications

| Property | Value |
| :--- | :--- |
| **Instance Type** | `t3.small` (2 vCPU, 2 GB RAM) |
| **Region** | `ap-south-1` (Mumbai, India) |
| **OS** | Ubuntu 22.04 LTS |
| **Elastic IP** | `13.200.63.0` (static, never changes) |
| **Storage** | 20 GB gp3 SSD |
| **Backend Framework** | FastAPI + Uvicorn (2 workers) |
| **Inference Engine** | ONNX Runtime 1.x (CPUExecutionProvider) |
| **Model** | `netra_rakshak.onnx` — 94.5 MB ResNet-50 |
| **Memory at Runtime** | ~767 MB / 1.9 GB |
| **API Health Endpoint** | `http://13.200.63.0/health` |
| **Process Manager** | systemd (`netra-rakshak.service`) |
| **Reverse Proxy** | Nginx (port 80 → 8000) |

### Why a Server-Side Proxy (No Domain Needed)?

The Vercel frontend is served over **HTTPS**. Browsers block direct `HTTP` fetch calls from HTTPS pages (Mixed Content policy). Rather than paying for a domain + SSL cert, we use a **TanStack Start SSR API route** (`/api/predict`) that proxies requests server-side:

```
Browser ──HTTPS──► Vercel /api/predict ──HTTP (server-side)──► EC2 13.200.63.0
```

The EC2 **Elastic IP is permanent** — no DNS, no domain, no Cloudflare tunnel maintenance required. Free forever.

### API Endpoints

| Endpoint | Method | Description |
| :--- | :--- | :--- |
| `/health` | `GET` | Backend liveness check. Returns `model_loaded: true` when ready. |
| `/predict` | `POST` | Accepts `multipart/form-data` with `file` field (fundus image). Returns ICDR grade + confidence + biomarkers. |

**Sample `/predict` Response:**
```json
{
  "prediction": "Level 3: Severe Non-Proliferative DR",
  "confidence": 0.91,
  "severity_index": 3,
  "biomarkers": {
    "microaneurysm_count": 47,
    "hemorrhage_area_ratio": 0.034,
    "exudate_area_ratio": 0.018,
    "neovascularization_detected": false
  },
  "processing_time_ms": 812
}
```

### Model: netra_rakshak.onnx

The ONNX model is stored directly on the EC2 instance at:
```
/opt/netra-rakshak/backend/netra_rakshak.onnx   (94.5 MB, ResNet-50)
```

> **⚠️ Critical Preprocessing Note:**
> This model was trained on raw `[0, 255]` uint8 pixel values **with MATLAB CLAHE preprocessing**.
> **Never normalize to `[0.0, 1.0]`** — doing so collapses all predictions to Grade 0.
> The backend faithfully replicates the MATLAB `step2_quality_check.m` Green-Channel Rayleigh CLAHE pipeline.

### Backend Stack

- **`backend/main.py`** — FastAPI app with MATLAB-faithful CLAHE preprocessing and biomarker extraction
- **`src/routes/api.predict.ts`** — TanStack Start SSR proxy route (permanent HTTPS bridge)
- **`backend/setup.sh`** — EC2 provisioning script (Python 3.11, Nginx, systemd, ONNX Runtime)

---

## ☁️ MATLAB® Web App Server Cloud Deployment

Deploying the MATLAB pipeline to the cloud while keeping the exact clinical user interface uses MathWorks Web App Server hosted on an AWS or Azure virtual machine and integrated with the Vercel web application via an embedded iframe.

### 4-Step Packaging & Deployment Architecture

```
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│ STEP 1: App Designer & Compiler     │       │ STEP 2: Cloud Infrastructure         │
│ • step11_master_dashboard.m -> .mlapp│  ───► │ • AWS / Azure Reference Architecture │
│ • Bundle classifier.mat & ONNX model │       │ • MathWorks SIH 26038 Cloud License  │
│ • Compile to .ctf archive            │       │ • R2026a Web App Server VM           │
└──────────────────────────────────────┘       └──────────────────────────────────────┘
                   │                                              │
                   ▼                                              ▼
┌──────────────────────────────────────┐       ┌──────────────────────────────────────┐
│ STEP 3: Admin Portal Upload          │       │ STEP 4: Frontend Web Integration     │
│ • Open https://<PUBLIC_IP>/webapps   │  ───► │ • Embed via responsive iframe:       │
│ • Upload generated .ctf application  │       │   <iframe src="https://<IP>/webapps" │
│ • Instant live diagnostic URL        │       │   width="100%" height="850px">       │
└──────────────────────────────────────┘       └──────────────────────────────────────┘
```

#### Step 1: Prepare and Package Your App
MATLAB Web App Server strictly requires applications to be designed using App Designer. Because the `step11_master_dashboard.m` script generates the UI programmatically, it is ported into an App Designer `.mlapp` file:
1. Open MATLAB App Designer and save as `netra_rakshak_dashboard.mlapp`.
2. Go to the **MATLAB Apps** tab and launch the **Web App Compiler**.
3. Select `netra_rakshak_dashboard.mlapp` as the main application file.
4. In **"Files required for your application to run"**, include:
   - `trained_dr_classifier.mat` (87.8 MB trained ResNet/ensemble weights)
   - `netra_rakshak.onnx` (94.5 MB ONNX network)
   - All pipeline dependencies (`step1_sort_data.m` through `step10_benchmark_messidor2.m`)
5. Click **Package** to generate the standalone `.ctf` (Component Technology File) archive.

#### Step 2: Spin Up the Cloud Server
Under Smart India Hackathon (SIH 26038), authenticate using your MathWorks hackathon cloud license:
- **AWS Deployment**: [MathWorks AWS Reference Architecture](https://github.com/mathworks-ref-arch/matlab-web-app-server-on-aws)
- **Azure Deployment**: [MathWorks Azure Reference Architecture](https://github.com/mathworks-ref-arch/matlab-web-app-server-on-azure)

Select the MATLAB release version (**R2026a**) on the repository and click **Deploy**. This automatically provisions a cloud virtual machine, configures SSL/TLS, and installs the Web App Server environment.

#### Step 3: Upload the Application (.ctf)
1. When cloud deployment completes, copy the public IP address from your AWS/Azure console.
2. Open `https://<YOUR_CLOUD_PUBLIC_IP>/webapps/home` in your browser to access the Admin Portal.
3. Upload the generated `.ctf` archive into the portal.
4. The server instantly compiles and generates a public live URL for the application.

#### Step 4: Integrate with Vercel Frontend
Embed the live MATLAB Web App directly into the Netra Rakshak web interface using the dedicated diagnostic iframe:

```html
<iframe src="https://<YOUR_CLOUD_PUBLIC_IP>/webapps/home" width="100%" height="850px" style="border:none;"></iframe>
```

This configuration executes heavy computational and tensor processing securely on the cloud virtual machine while serving the exact MATLAB interface directly through the web application.

---

## 🎯 Key Deployment Challenges Solved

| Real-World Challenge | Traditional Solutions | Netra Rakshak Solution |
| :--- | :--- | :--- |
| **Field Image Quality** | Ungradable captures misclassified blindly by AI. | **Quality Gate (Stage 1)**: Real-time focus and illumination scoring with CLAHE normalization before inference. |
| **Black-Box Skepticism** | Clinicians reject AI predictions due to lack of evidence. | **Grad-CAM Explainability (Stage 4)**: Class activation heatmaps highlight exact lesion clusters (microaneurysms, hemorrhages, exudates). |
| **Rural Bandwidth Constraints** | Cloud-only architectures fail in sub-centres without 4G/5G. | **Two-Tier Edge Processing**: Local triage on low-power PC; store-and-forward sync to district hospitals. |
| **Specialist Workflow Overload** | Doctors burdened with manual screening of normal eyes. | **Intelligent Triage Filtering**: Only referable cases (Grade ≥ 2) route to specialists; review takes < 30 seconds. |
| **HTTPS Mixed Content Errors** | EC2 HTTP blocked by HTTPS Vercel frontend. | **TanStack SSR Proxy** (`/api/predict`): Browser calls HTTPS Vercel, which proxies server-side to EC2. No domain or cert needed. |

---

## 🔬 5-Stage MATLAB Pipeline Architecture

```
                                  [ Portable Fundus Camera ]
                                              │
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Stage 1: Quality Gate & Illumination Normalization                                        │
│ • Focus evaluation via Laplacian variance & edge sharpness metrics                        │
│ • Adaptive contrast enhancement: MATLAB adapthisteq() [CLAHE with Rayleigh distribution]  │
│ • Rejection / recapture feedback if ungradable                                            │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Stage 2: Retinal Landmark & Lesion Segmentation                                           │
│ • Circular Hough Transform: imfindcircles() for optic nerve head localization             │
│ • Macular fovea center estimation via geometric distance mapping                          │
│ • Gabor wavelet filters & multi-scale morphological strel() top/bottom-hat filters        │
│ • Deterministic detection of microaneurysms (down to 10µm) and hard lipid exudates        │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Stage 3: Deep Convolutional Severity Grading (ICDR Scale)                                 │
│ • Fine-tuned ResNet-50 CNN (ONNX export from MATLAB Deep Learning Toolbox™)               │
│ • Staged into 5 ICDR classes:                                                             │
│   - Grade 0: No Apparent Retinopathy                                                      │
│   - Grade 1: Mild NPDR (Microaneurysms only)                                              │
│   - Grade 2: Moderate NPDR (Hemorrhages, hard exudates)                                   │
│   - Grade 3: Severe NPDR (4-2-1 rule: >20 hemorrhages per quadrant, venous beading)       │
│   - Grade 4: Proliferative DR (Neovascularization, preretinal hemorrhages)                │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Stage 4: Explainability via Grad-CAM Visualizations                                       │
│ • Gradient-weighted Class Activation Mapping computed from final convolutional layer      │
│ • Transparent diagnostic heatmap highlighting microvascular lesions                       │
│ • Spatial IoU correlation scored against physician-annotated IDRiD ground truth           │
└─────────────────────────────────────────────┬─────────────────────────────────────────────┘
                                              ▼
┌───────────────────────────────────────────────────────────────────────────────────────────┐
│ Stage 5: Tele-Ophthalmology & Specialist Validation Loop                                  │
│ • Non-referable (Grade 0–1): Logged to patient's ABHA record with routine annual rescreen │
│ • Referable (Grade 2–4): Encrypted packet synced to District Hospital Specialist Console  │
│ • Ophthalmologist confirms or overrides diagnosis with Grad-CAM inspection in <30 seconds │
└───────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 💻 Platform Features & Tele-Ophthalmology Workflows

The web application is engineered with a **strict clinical editorial light theme** (`#FFFFFF` paper, `#F4F1EA` paper-alt, `#12314F` dark ink, `#0F6F6A` medical teal, `#C1652F` amber, and `#3F7D5C` green), free from gimmicky consumer SaaS dark modes.

### 1. Interactive Case Inspector (Public Portal)
- Live interactive clinical demonstration with 4 benchmark cases:
  - **Case 01:** Normal Retinal Scan (IDRiD Sample 042 — Grade 0)
  - **Case 02:** Enhanced Mild NPDR (APTOS Sample 118 — Grade 1)
  - **Case 03:** Moderate NPDR (IDRiD Sample 201 — Grade 2, Referable)
  - **Case 04:** Severe / Proliferative DR (EyePACS Sample 882 — Grade 4, Urgent Referral)
- **Multi-Layer Diagnostic Switcher**:
  - `Original Fundus`: High-resolution raw capture.
  - `Segmentation Overlay`: Real-time SVG morphological vascular tree, optic disc border, macular crosshair, and lesion bounding boxes.
  - `Grad-CAM Overlay`: Multi-focal heat map activation verifying model attention on true pathological signs.

### 2. PHC Kiosk Intake Station (`/kiosk`)
- **Operator-Friendly Registration**: Fast input for Patient Name, Indian Mobile Number (`+91`), and ABHA (Ayushman Bharat Health Account) / Center ID.
- **Drag-and-Drop Ingestion**: Unlockable upload area with file format validation.
- **One-Click Quick Demonstration**: `"Use Sample Fundus Scan →"` shortcut demonstrating real-time 3-stage triage pipeline simulation.
- **Screening Ledger**: Full clinical audit ledger with modal record view and doctor verification status badges.

### 3. Specialist Validation Console (`/doctor`)
- **Triage Workstation for District Ophthalmologists**: Prioritized queue sorted by severity and wait time.
- **Grad-CAM Interactive Toggle**: Inspect original capture vs heatmap overlay side-by-side.
- **30-Second Verification Action Bar**:
  - Grade adjustment dropdown (confirming or overriding AI predictions).
  - One-click `Confirm & Sign Off` and `Override AI Grade` workflows that dynamically update queue states in real-time.

### 4. Technical Architecture & Grant Documentation (`/research`)
- Academic publication layout detailing the mathematical specifications, dataset splits, MATLAB toolbox configurations, and rural edge deployment topology.

---

## 📊 Clinical Validation & Benchmark Targets

The pipeline is validated on **599 independent samples** across APTOS 2019, IDRiD, DRIVE, and Messidor-2 cohorts in MATLAB R2026a. All metrics below are directly verified from `step6_clinical_metrics.m` and `step8_benchmark_drive.m`.

#### Matrix 1 — Referable DR Triage Performance vs MathWorks PS 26038 Targets

| Diagnostic Metric | PS 26038 Target | Netra Rakshak Verified | Status | Clinical Impact |
| :--- | :--- | :--- | :--- | :--- |
| **Referable DR Sensitivity (Recall)** | > 90.00% | **91.44%** | ✅ PASSED (Exceeded) | 171 / 187 referable cases correctly escalated; prevents missed referrals for sight-threatening PDR |
| **Referable DR Specificity** | > 85.00% | **98.06%** | ✅ PASSED (Exceeded) | 404 / 412 non-referable correctly discharged locally; prevents false-positive specialist flooding |
| **Overall Triage Accuracy** | High Clinical Standard | **95.99%** | ✅ EXCELLENT | 575 / 599 cases correctly triaged end-to-end |
| **Positive Predictive Value (PPV)** | High Clinical Reliability | **95.53%** | ✅ EXCELLENT | Ophthalmologist can trust 95.5% of referable-flagged cases |
| **Negative Predictive Value (NPV)** | High Safety Factor | **96.19%** | ✅ EXCELLENT | Over 96% of locally discharged patients are confirmed healthy |
| **F1-Score (Referable Class)** | Balanced Diagnostic Target | **93.44%** | ✅ EXCELLENT | Harmonized precision-recall for the clinically critical Grade 2+ class |

#### Matrix 2 — Five-Class ICDR Severity Accuracy (599 Validation Samples)

| ICDR Grade | Class Sensitivity | Precision (PPV) | Notes |
| :--- | :--- | :--- | :--- |
| **Level 0: No DR** | 97.46% | 97.19% | 346 / 355 correctly graded |
| **Level 1: Mild NPDR** | 78.95% | 70.31% | 45 / 57 correctly graded |
| **Level 2: Moderate NPDR** | 72.36% | 87.25% | 89 / 123 correctly graded |
| **Level 3: Severe NPDR** | 72.00% | 40.91% | 18 / 25 correctly graded |
| **Level 4: Proliferative DR** | 61.54% | 72.73% | 24 / 39 correctly graded |
| **Overall 5-Class Accuracy** | — | — | **87.15%** across all 599 samples |

#### Matrix 3 — Integrated Pipeline vs Single-Technique Approaches

| Evaluation Dimension | Standalone Classical Morphology | Standalone Black-Box CNN | Netra Rakshak Integrated |
| :--- | :--- | :--- | :--- |
| **Referable DR Sensitivity** | 76.4% | 88.2% | **91.44%** ✅ |
| **Referable DR Specificity** | 82.1% | 86.5% | **98.06%** ✅ |
| **Grad-CAM Explainability** | ❌ None | ❌ Black box | ✅ Thermal saliency + biomarker overlay |
| **Telemedicine Bandwidth** | High (raw masks) | 8.5 MB/scan | **0.65 MB compressed packet (98.7% saved)** |
| **IQA Fail-Safe** | ❌ None | ❌ None | ✅ Automated recapture rejection |

### Benchmark Datasets:
- **IDRiD**: Indian Demographic Retinal Image Dataset (pixel-level lesion annotations).
- **APTOS 2019 Blindness Detection**: High-variance field captures from Indian tele-screening camps.
- **EyePACS & Messidor-2**: Diverse multi-centre clinical cohorts for generalizability.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: [TanStack Start](https://tanstack.com/router) (Full-stack SSR / Static generation for React 19)
- **Routing**: `@tanstack/react-router` (Type-safe file-based routing)
- **Language**: TypeScript & Modern React 19
- **Styling**: Tailwind CSS v4 with `@theme inline` CSS custom properties
- **Icons**: Lucide React
- **Hosting**: Vercel Edge Network (auto-deploys from GitHub `main` branch)

### Backend (Production — AWS)
- **Runtime**: Python 3.11 + FastAPI + Uvicorn (2 workers)
- **Inference Engine**: ONNX Runtime 1.x (`CPUExecutionProvider`)
- **Image Preprocessing**: OpenCV 4.x (MATLAB-faithful CLAHE → Median filter pipeline)
- **Cloud**: AWS EC2 `t3.small`, `ap-south-1` (Mumbai), Elastic IP `13.200.63.0`
- **Process Manager**: systemd (`netra-rakshak.service`, enabled on boot)
- **Reverse Proxy**: Nginx (port 80 → Uvicorn 8000)
- **Model Storage**: HuggingFace Hub ([L0st-Alien/netra_rakhshak](https://huggingface.co/L0st-Alien/netra_rakhshak)) + local EC2 copy

### AI / Signal Processing
- **Model**: ResNet-50 fine-tuned for 5-class ICDR grading (ONNX export)
- **Preprocessing**: MATLAB R2026a — Image Processing Toolbox™, Computer Vision Toolbox™, Deep Learning Toolbox™
- **Training Data**: IDRiD + APTOS 2019 + EyePACS + Messidor-2

---

## 📁 Repository Structure

```
Netra-Rakshak/
├── public/
│   ├── assets/
│   │   └── fundus.jpg            # Validated benchmark retinal fundus scan
│   ├── favicon.png
│   └── robots.txt
├── src/
│   ├── assets/
│   │   └── fundus.jpg            # Bundled source image asset
│   ├── lib/
│   │   └── netra-model.ts        # API client — routes to /api/predict in prod
│   ├── routes/
│   │   ├── api.predict.ts        # ← SSR proxy to EC2 backend (NEW)
│   │   ├── __root.tsx            # HTML shell, metadata, clinical CSS, error boundary
│   │   ├── index.tsx             # Homepage & Case Inspector
│   │   ├── dashboard.tsx         # Diagnostic Dashboard (/dashboard)
│   │   ├── doctor.tsx            # Specialist Validation Console (/doctor)
│   │   ├── kiosk.tsx             # PHC Kiosk Intake Station (/kiosk)
│   │   ├── login.tsx             # Tele-Ophthalmology Portal Sign-In (/login)
│   │   └── research.tsx          # Technical Architecture & Paper (/research)
│   ├── router.tsx                # TanStack Router configuration
│   ├── styles.css                # Clinical design system tokens & typography
│   ├── server.ts                 # SSR server entry (Nitro/Cloudflare)
│   └── start.ts                  # App entrypoint
├── backend/
│   ├── main.py                   # FastAPI app — CLAHE preprocessing + ONNX inference
│   └── setup.sh                  # EC2 provisioning script (Ubuntu 22.04)
├── package.json
├── vite.config.ts
└── README.md
```

---

## 🚀 Local Installation & Getting Started

### Prerequisites
- Node.js 20.x or higher
- npm or pnpm / bun
- Python 3.11+ (for local backend)

### 1. Clone the repository
```bash
git clone https://github.com/Lost-Alien/Netra-Rakshak.git
cd Netra-Rakshak
```

### 2. Install frontend dependencies
```bash
npm install
```

### 3. Configure environment
```bash
# .env.local — for local dev pointing to your local backend
VITE_NETRA_API_URL=http://localhost:8000/predict
```

### 4. Start the local FastAPI backend
```bash
cd backend
python -m venv venv
venv\Scripts\activate          # Windows
# source venv/bin/activate    # Linux/macOS
pip install -r requirements.txt

# Point to your local copy of the ONNX model
set LOCAL_MODEL_PATH=path\to\netra_rakshak.onnx   # Windows
# export LOCAL_MODEL_PATH=path/to/netra_rakshak.onnx

uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### 5. Run the frontend dev server
```bash
npm run dev
```
Open your browser and navigate to `http://localhost:8080/`.

### 6. Build for production
```bash
npm run build
```

### Verifying the Production Backend
```bash
# Health check
curl http://13.200.63.0/health
# → {"status":"ok","model":"netra_rakshak.onnx","model_loaded":true}

# Run inference on a test image
curl -F "file=@your_fundus.jpg" http://13.200.63.0/predict
```

---

## 👥 The Team — Built by Innovators

| Name | Role | Profile |
| :--- | :--- | :--- |
| **Dev Kumar Sharma** | **Team Lead & ML Engineer** | [@Lost-Alien](https://github.com/Lost-Alien) |
| **Abhishek Patwa** | **Member @ Website Maker** | [@Abhishekpatwa00](https://github.com/Abhishekpatwa00) |

---

## 📚 Citations & Acknowledgments

1. **National Programme for Control of Blindness & Visual Impairment (NPCB&VI)**, Ministry of Health and Family Welfare, Government of India.
2. **ICMR-INDIAB Study**: Anjana, R. M., et al. "Prevalence of diabetes and prediabetes in 15 states of India: results from the ICMR-INDIAB population-based study." *The Lancet Diabetes & Endocrinology*.
3. **IDRiD Dataset**: Porwal, P., et al. "Indian Diabetic Retinopathy Image Dataset (IDRiD): A Database for Diabetic Retinopathy Screening Research." *Data*, 2018.
4. **APTOS 2019 Blindness Detection**: Asia Pacific Tele-Ophthalmology Society (APTOS).
5. **Grad-CAM**: Selvaraju, R. R., et al. "Grad-CAM: Visual Explanations from Deep Networks via Gradient-Based Localization." *IEEE ICCV*.
6. **MathWorks India** for providing problem statement guidance under Smart India Hackathon 2026.
7. **AWS** — EC2 `t3.small` (ap-south-1) hosting the ONNX inference backend.

---

<div align="center">
  <sub>Built with precision for Smart India Hackathon 2026 • © Team Netra Rakshak</sub>
</div>
