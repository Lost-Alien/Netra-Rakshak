import { createAPIFileRoute } from "@tanstack/react-start/api";

/**
 * Server-side proxy for Netra Rakshak ONNX backend.
 *
 * WHY THIS EXISTS:
 *   - Vercel serves the frontend over HTTPS.
 *   - Browsers block HTTP requests from HTTPS pages (Mixed Content).
 *   - The EC2 backend runs on HTTP at a static Elastic IP: 13.200.63.0
 *   - This server-side route proxies the image to the EC2 backend,
 *     so the browser only ever talks to the Vercel HTTPS endpoint.
 *   - The EC2 Elastic IP is static and NEVER changes, making this
 *     a permanent, free, domain-free HTTPS solution.
 *
 * FLOW:
 *   Browser → POST /api/predict (HTTPS, Vercel) →
 *   Vercel serverless → POST http://13.200.63.0/predict (server-side) →
 *   FastAPI ONNX backend → JSON response
 */

const EC2_BACKEND_URL =
  process.env["NETRA_BACKEND_URL"] || "http://13.200.63.0";

export const APIRoute = createAPIFileRoute("/api/predict")({
  POST: async ({ request }) => {
    // Forward the multipart/form-data body as-is to EC2
    const formData = await request.formData();

    const response = await fetch(`${EC2_BACKEND_URL}/predict`, {
      method: "POST",
      body: formData,
      // 60 second timeout — model inference + biomarker segmentation takes ~800ms
      signal: AbortSignal.timeout(60_000),
    });

    const data = await response.json();
    return new Response(JSON.stringify(data), {
      status: response.status,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  },

  // Health probe — checks EC2 backend is up
  GET: async () => {
    try {
      const res = await fetch(`${EC2_BACKEND_URL}/health`, {
        signal: AbortSignal.timeout(5_000),
      });
      const data = await res.json();
      return new Response(
        JSON.stringify({ proxy: "ok", backend: data }),
        {
          status: 200,
          headers: { "Content-Type": "application/json" },
        },
      );
    } catch (err) {
      return new Response(
        JSON.stringify({ proxy: "error", message: String(err) }),
        {
          status: 503,
          headers: { "Content-Type": "application/json" },
        },
      );
    }
  },
});
