/**
 * Same-origin proxy for the Netra Rakshak FastAPI inference service.
 *
 * Vercel discovers functions in the repository-root `api` directory. Keeping
 * this proxy on the public app origin lets an HTTPS browser call the HTTP-only
 * EC2 service without mixed-content failures.
 */

const backendUrl = (process.env["NETRA_BACKEND_URL"] || "http://13.200.63.0")
  .replace(/\/+$/, "");

function jsonResponse(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "Cache-Control": "no-store",
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function proxyHealth() {
  try {
    const upstream = await fetch(`${backendUrl}/health`, {
      signal: AbortSignal.timeout(5_000),
    });
    const data = await upstream.json();
    return jsonResponse({ proxy: "ok", backend: data }, upstream.status);
  } catch {
    return jsonResponse(
      { proxy: "unavailable", message: "Diagnostic backend is unavailable." },
      503,
    );
  }
}

async function proxyPrediction(request: Request) {
  if (!request.headers.get("content-type")?.includes("multipart/form-data")) {
    return jsonResponse(
      { detail: "Upload a retinal image as multipart/form-data." },
      415,
    );
  }

  try {
    const upstream = await fetch(`${backendUrl}/predict`, {
      method: "POST",
      body: await request.formData(),
      signal: AbortSignal.timeout(60_000),
    });
    const responseBody = await upstream.text();

    return new Response(responseBody, {
      status: upstream.status,
      headers: {
        "Cache-Control": "no-store",
        "Content-Type": upstream.headers.get("content-type") || "application/json; charset=utf-8",
      },
    });
  } catch {
    return jsonResponse(
      { detail: "Diagnostic backend is unavailable. Please retry shortly." },
      503,
    );
  }
}

export default {
  async fetch(request: Request) {
    if (request.method === "GET") return proxyHealth();
    if (request.method === "POST") return proxyPrediction(request);

    return jsonResponse({ detail: "Method not allowed." }, 405);
  },
};
