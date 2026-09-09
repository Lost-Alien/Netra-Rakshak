import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/research")({
  head: () => ({
    meta: [
      { title: "Technical Plan — Netra Rakshak" },
    ],
  }),
  component: ResearchPage,
});

function ResearchPage() {
  return (
    <main className="min-h-screen bg-[var(--color-paper)]">
      <nav className="border-b border-[var(--color-gray-line)] bg-[var(--color-paper)]">
        <div className="mx-auto flex max-w-[800px] items-center px-6 py-4">
          <Link to="/" className="inline-flex items-center gap-2 text-[var(--color-teal)] hover:underline font-medium">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </nav>

      <article className="mx-auto max-w-[800px] px-6 py-16">
        <h1 className="font-serif text-[44px] font-semibold text-[var(--color-ink)] mb-8 leading-tight">
          Explainable AI for Diabetic Retinopathy Screening in Rural India
        </h1>
        
        <div className="prose prose-slate max-w-none prose-headings:font-serif prose-headings:text-[var(--color-ink)] prose-p:text-[var(--color-gray)] prose-a:text-[var(--color-teal)] prose-strong:text-[var(--color-ink)]">
          <p className="text-[18px] leading-relaxed mb-6">
            <strong>Problem Statement ID:</strong> 26038<br/>
            <strong>Title:</strong> Explainable AI for Diabetic Retinopathy Screening in Rural India<br/>
            <strong>Domain:</strong> MedTech / BioTech / HealthTech
          </p>

          <h2 className="text-[28px] mt-12 mb-4">Background</h2>
          <p className="text-[16px] leading-relaxed mb-6">
            India has over 77 million diabetic adults - the second highest globally. Diabetic Retinopathy (DR) affects ~18% of this population and is a leading cause of preventable blindness. Early screening can prevent 90% of vision loss, but India has only ~1 ophthalmologist per 100,000 rural population, making mass manual screening infeasible. Existing AI solutions function as black boxes, lack clinical validation rigor, and fail with variable image quality from portable fundus cameras in field conditions. A robust, explainable, and validated screening system is essential for deployment in primary healthcare centres across rural India.
          </p>

          <h2 className="text-[28px] mt-12 mb-4">Proposed Solution Architecture</h2>
          
          <h3 className="text-[22.5px] mt-8 mb-3">1. Image Quality Assessment and Enhancement</h3>
          <p className="text-[16px] leading-relaxed mb-6">
            Automatically evaluate fundus images for adequate focus, illumination, and field of view using MATLAB's Image Processing Toolbox. Low-quality images trigger a "recapture" alert, while borderline images are enhanced using Contrast-Limited Adaptive Histogram Equalization (CLAHE).
          </p>

          <h3 className="text-[22.5px] mt-8 mb-3">2. Retinal Landmark and Lesion Segmentation</h3>
          <p className="text-[16px] leading-relaxed mb-6">
            Implement morphological operations to segment the optic disc, macula, and blood vessels. Identify early pathological signs such as microaneurysms and hard exudates to provide a deterministic baseline for grading.
          </p>

          <h3 className="text-[22.5px] mt-8 mb-3">3. Deep Learning Severity Grading</h3>
          <p className="text-[16px] leading-relaxed mb-6">
            Utilize Deep Learning Toolbox to train/fine-tune Convolutional Neural Networks (CNNs) on validated public datasets (e.g., EyePACS, APTOS 2019, IDRiD). The model classifies images into the 5 standard severity levels (No DR, Mild, Moderate, Severe, Proliferative DR).
          </p>

          <h3 className="text-[22.5px] mt-8 mb-3">4. Explainability (Grad-CAM)</h3>
          <p className="text-[16px] leading-relaxed mb-6">
            Generate Gradient-weighted Class Activation Mapping (Grad-CAM) visualizations overlaying the original image. This highlights the exact regions (e.g., hemorrhages) the model used to make its prediction, building trust with clinicians.
          </p>
        </div>
      </article>
    </main>
  );
}
