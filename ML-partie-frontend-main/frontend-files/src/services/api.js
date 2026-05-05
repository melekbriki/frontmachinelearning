const BASE_URL = "http://localhost:8000";

// ── helper ──
const post = async (url, data) => {
  const res = await fetch(BASE_URL + url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

const get = async (url) => {
  const res = await fetch(BASE_URL + url);
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// ── EXPORTS FIXED ──
export const ping = () => get("/ping");

export const trainModel = (data) => post("/train", data);

export const predict = (data) => post("/predict", data);

export const getHistory = () => get("/history");

// upload FIX
export const uploadDataset = async (formData) => {
  const res = await fetch(BASE_URL + "/upload", {
    method: "POST",
    body: formData,
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
};

// optional placeholders (avoid errors)
export const autoTune = async () => ({ best_params: {} });

export const downloadModel = async () => {
  window.open(BASE_URL + "/download", "_blank");
};