import React, { useState } from "react";
import { predict } from "../services/api";

export default function PredictionPanel({
  trainedResults,
  onNotify,
}) {
  const [inputs, setInputs] = useState({});
  const [modelId, setModelId] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const modelIds = Object.keys(
    trainedResults || {}
  );

  const activeId = modelId || modelIds[0];

  const set = (key, value) =>
    setInputs((prev) => ({
      ...prev,
      [key]: parseFloat(value) || 0,
    }));

  const handlePredict = async () => {
    if (!activeId) {
      onNotify(
        "⚠️ Aucun modèle entraîné",
        "warning"
      );

      return;
    }

    setLoading(true);

    try {
      const res = await predict({
        model_id: activeId,
        features: inputs,
      });

      setResult(res);

      onNotify(
        "✅ Prediction completed",
        "success"
      );
    } catch (err) {
      onNotify(
        "❌ Erreur prédiction",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-2xl p-6 shadow-2xl">

      {/* background effects */}
      <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/20 blur-[100px] rounded-full" />

      <div className="absolute bottom-0 left-0 w-40 h-40 bg-blue-500/20 blur-[100px] rounded-full" />

      <div className="relative z-10 space-y-6">

        {/* header */}
        <div className="flex items-center justify-between">

          <div>
            <h2 className="text-2xl font-black bg-gradient-to-r from-emerald-400 to-blue-400 bg-clip-text text-transparent">
              🔮 Prediction Panel
            </h2>

            <p className="text-sm text-gray-400 mt-1">
              Real-time AI prediction system
            </p>
          </div>

          <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
            LIVE
          </div>
        </div>

        {/* model selector */}
        <div className="space-y-2">

          <label className="text-sm text-gray-400 font-medium">
            Select Model
          </label>

          <select
            value={activeId || ""}
            onChange={(e) =>
              setModelId(e.target.value)
            }
            className="w-full bg-[#111827]/80 border border-white/10 rounded-2xl px-4 py-3 text-white outline-none focus:border-emerald-500 transition-all"
          >
            <option value="">
              Select model
            </option>

            {modelIds.map((id) => (
              <option key={id} value={id}>
                {id}
              </option>
            ))}
          </select>
        </div>

        {/* input */}
        <div className="space-y-2">

          <label className="text-sm text-gray-400 font-medium">
            Feature Value
          </label>

          <input
            type="number"
            placeholder="Enter feature value..."
            onChange={(e) =>
              set("test", e.target.value)
            }
            className="w-full bg-[#111827]/80 border border-white/10 rounded-2xl px-4 py-3 text-white placeholder-gray-500 outline-none focus:border-blue-500 transition-all"
          />
        </div>

        {/* button */}
        <button
          onClick={handlePredict}
          disabled={loading}
          className="relative overflow-hidden w-full py-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-blue-600 font-bold text-lg shadow-2xl shadow-emerald-500/20 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
        >
          <span className="relative z-10 flex items-center justify-center gap-3">

            {loading ? (
              <>
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100" />
                  <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200" />
                </div>

                Predicting...
              </>
            ) : (
              <>
                🔥 Launch Prediction
              </>
            )}
          </span>
        </button>

        {/* result */}
        {result && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">

            {/* prediction */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:scale-[1.02] transition-all">

              <p className="text-sm text-gray-400 mb-2">
                Prediction
              </p>

              <h3 className="text-3xl font-black text-emerald-400">
                {result.prediction}
              </h3>
            </div>

            {/* risk */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:scale-[1.02] transition-all">

              <p className="text-sm text-gray-400 mb-2">
                Risk Probability
              </p>

              <h3 className="text-3xl font-black text-blue-400">
                {result.risk_probability}%
              </h3>
            </div>
          </div>
        )}

        {/* empty state */}
        {!result && (
          <div className="h-40 flex flex-col items-center justify-center border border-dashed border-white/10 rounded-2xl bg-white/[0.02]">

            <div className="text-5xl mb-3 opacity-70">
              🤖
            </div>

            <p className="text-gray-400 text-sm">
              No prediction generated yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
}