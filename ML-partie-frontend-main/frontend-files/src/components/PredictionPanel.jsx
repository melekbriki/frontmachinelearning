import React, { useState } from "react";
import { predict } from "../services/api";

export default function PredictionPanel({ trainedResults, onNotify }) {
  const [inputs, setInputs] = useState({});
  const [modelId, setModelId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const modelIds = Object.keys(trainedResults || {});
  const activeId = modelId || modelIds[0];

  const set = (key, value) =>
    setInputs((prev) => ({ ...prev, [key]: parseFloat(value) || 0 }));

  const handlePredict = async () => {
    if (!activeId) {
      onNotify("⚠️ Aucun modèle entraîné", "warning");
      return;
    }

    setLoading(true);

    try {
      const res = await predict({
        model_id: activeId,
        features: inputs,
      });

      setResult(res);
    } catch (err) {
      onNotify("❌ Erreur prédiction", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">

      <h2 className="text-white font-bold">Prediction Panel</h2>

      {/* model selector */}
      <select
        value={activeId || ""}
        onChange={(e) => setModelId(e.target.value)}
        className="bg-gray-800 text-white p-2 rounded"
      >
        <option value="">Select model</option>
        {modelIds.map((id) => (
          <option key={id} value={id}>
            {id}
          </option>
        ))}
      </select>

      {/* input simple test */}
      <input
        placeholder="feature value"
        onChange={(e) => set("test", e.target.value)}
        className="bg-gray-800 text-white p-2 rounded w-full"
      />

      <button
        onClick={handlePredict}
        disabled={loading}
        className="bg-green-600 text-white px-4 py-2 rounded"
      >
        {loading ? "Predicting..." : "Predict"}
      </button>

      {result && (
        <div className="text-white">
          <p>Prediction: {result.prediction}</p>
          <p>Risk: {result.risk_probability}</p>
        </div>
      )}
    </div>
  );
}