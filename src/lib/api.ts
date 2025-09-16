// AyurTrace Farmer API utility functions
// Centralizes all API calls for use in components

const BASE_URL = "https://ayurtrace-farmer.onrender.com";


export async function healthCheck() {
  const res = await fetch(`${BASE_URL}/healthz`);
  return res.json();
}

export async function seedSpecies(scientificName: string, speciesCode: string) {
  const res = await fetch(`${BASE_URL}/dev/seed-species`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ scientificName, speciesCode })
  });
  return res.json();
}

export async function createCollectionEvent(data: {
  scientificName: string;
  collectorId: string;
  geo: { lat: number; lng: number };
  timestamp: string;
  clientEventId: string;
  ai_verified_confidence?: number;
}) {
  const res = await fetch(`${BASE_URL}/collection`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function getCollectionEvent(id: string) {
  const res = await fetch(`${BASE_URL}/collection/${id}`);
  return res.json();
}

export async function listCollectionEvents(params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}/collections`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

export async function addProcessingStep(data: {
  batch_id: string;
  step_type: string;
  status: string;
}) {
  const res = await fetch(`${BASE_URL}/processing`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function listBatches(params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}/batches`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

export async function addLabTest(data: {
  batch_id: string;
  moisture_pct: number;
  pesticide_pass: boolean;
}) {
  const res = await fetch(`${BASE_URL}/labtest`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  });
  return res.json();
}

export async function listLabTests(params?: Record<string, string>) {
  const url = new URL(`${BASE_URL}/labtests`);
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.append(k, v));
  const res = await fetch(url.toString());
  return res.json();
}

export async function getProvenance(batchId: string) {
  const res = await fetch(`${BASE_URL}/provenance/${batchId}`, { cache: 'no-store' });
  // Debug logging to help diagnose empty/304 responses
  console.log('[API] getProvenance status:', res.status, res.statusText);
  try {
    // log some headers
    console.log('[API] getProvenance headers:', {
      'content-type': res.headers.get('content-type'),
      'cache-control': res.headers.get('cache-control'),
      'etag': res.headers.get('etag'),
      'last-modified': res.headers.get('last-modified'),
    });
  } catch (e) {
    // ignore header read errors in older browsers
  }

  if (!res.ok) {
    throw new Error(`Server responded with status ${res.status}`);
  }

  const text = await res.text();
  console.log('[API] getProvenance raw body length:', text?.length ?? 0);
  if (!text) {
    throw new Error('No provenance data returned (empty response)');
  }
  try {
    const parsed = JSON.parse(text);
    console.log('[API] getProvenance parsed:', parsed);
    return parsed;
  } catch (err) {
    console.error('[API] getProvenance JSON parse error', err, text);
    throw new Error('Invalid JSON response from server');
  }
}

// Blockchain endpoints
export async function listReadyCollectionEvents() {
  const res = await fetch(`${BASE_URL}/collections/chain?status=READY`);
  return res.json();
}
export async function listReadyProcessingSteps() {
  const res = await fetch(`${BASE_URL}/processing/chain?status=READY`);
  return res.json();
}
export async function listReadyLabTests() {
  const res = await fetch(`${BASE_URL}/labtests/chain?status=READY`);
  return res.json();
}
export async function updateCollectionBlockchain(id: string, status: string, hash: string) {
  const res = await fetch(`${BASE_URL}/collection/${id}/blockchain`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, hash })
  });
  return res.json();
}
export async function updateProcessingBlockchain(id: string, status: string, hash: string) {
  const res = await fetch(`${BASE_URL}/processing/${id}/blockchain`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, hash })
  });
  return res.json();
}
export async function updateLabTestBlockchain(id: string, status: string, hash: string) {
  const res = await fetch(`${BASE_URL}/labtest/${id}/blockchain`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ status, hash })
  });
  return res.json();
}
