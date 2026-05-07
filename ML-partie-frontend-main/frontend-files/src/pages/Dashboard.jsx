import React, { useState } from "react";
import ModelSelector from "../components/ModelSelector";
import HyperParameters from "../components/HyperParameters";
import TrainingResults from "../components/TrainingResults";
import RandomForestAnalysis from "../components/RandomForestAnalysis";
import { trainModel, uploadDataset } from "../services/api";

const NAV_TABS = [
  { id: "train", label: "Entraînement", icon: "🚀" },
  { id: "tache4", label: "Tâche 4 — RF", icon: "🌲" },
  { id: "history", label: "Historique", icon: "📜" },
];

export default function Dashboard({
  allResults,
  onTrainComplete,
  onNotify,
}) {
  const [selectedModels, setSelectedModels] = useState([
    "random_forest",
  ]);

  const [compareMode, setCompareMode] = useState(false);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);
  const [params, setParams] = useState({});
  const [navTab, setNavTab] = useState("train");

  const activeModel = selectedModels[0];

  const updateParams = (newParams) =>
    setParams((prev) => ({
      ...prev,
      [activeModel]: newParams,
    }));

  const handleTrain = async () => {
    setTraining(true);
    setProgress(0);

    try {
      const results = {};

      for (const m of selectedModels) {
        const res = await trainModel({
          model: m,
          hyperparams: params[m] || {},
        });

        results[m] = res;

        setProgress(
          (prev) => prev + 100 / selectedModels.length
        );
      }

      setProgress(100);

      onTrainComplete(results);

      onNotify(
        "✅ Entraînement terminé !",
        "success"
      );
    } catch (err) {
      onNotify(
        "❌ Erreur d'entraînement",
        "error"
      );
    } finally {
      setTraining(false);
      setProgress(0);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];

    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await uploadDataset(formData);

      onNotify(
        "✅ Dataset uploadé !",
        "success"
      );
    } catch {
      onNotify(
        "❌ Échec de l'upload",
        "error"
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0b1120] to-[#111827] text-white overflow-hidden relative">

      {/* Background Effects */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/20 blur-[120px] rounded-full" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-emerald-500/20 blur-[120px] rounded-full" />

      {/* NAVBAR */}
      <div className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* Logo */}
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              ML Dashboard
            </h1>

            <p className="text-xs text-gray-400">
              Machine Learning Training Platform
            </p>
          </div>

          {/* Tabs */}
          <div className="flex items-center gap-2">
            {NAV_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setNavTab(tab.id)}
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  navTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/20 scale-105"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="mr-2">
                  {tab.icon}
                </span>

                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {/* ================= TRAIN TAB ================= */}
        {navTab === "train" && (
          <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-8">

            {/* LEFT PANEL */}
            <div className="space-y-6">

              {/* MODEL SELECTOR */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    🤖 Models
                  </h2>

                  <p className="text-sm text-gray-400">
                    Select and configure your models
                  </p>
                </div>

                <ModelSelector
                  selected={selectedModels}
                  onChange={setSelectedModels}
                  compareMode={compareMode}
                  onCompareModeChange={
                    setCompareMode
                  }
                />
              </div>

              {/* HYPERPARAMETERS */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <div className="mb-4">
                  <h2 className="text-lg font-bold">
                    ⚙ Hyperparameters
                  </h2>

                  <p className="text-sm text-gray-400">
                    Fine tune training settings
                  </p>
                </div>

                <HyperParameters
                  modelId={activeModel}
                  params={
                    params[activeModel] || {}
                  }
                  onChange={updateParams}
                  onNotify={onNotify}
                />
              </div>

              {/* DATASET */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
                <h2 className="text-lg font-bold mb-4">
                  📂 Dataset Upload
                </h2>

                <label className="group flex flex-col items-center justify-center gap-3 border-2 border-dashed border-white/10 hover:border-blue-500 rounded-2xl p-8 transition-all cursor-pointer bg-white/5 hover:bg-blue-500/5">

                  <div className="text-5xl group-hover:scale-110 transition-all">
                    ☁️
                  </div>

                  <div className="text-center">
                    <p className="font-semibold">
                      Upload Dataset
                    </p>

                    <p className="text-sm text-gray-400">
                      CSV or DATA file
                    </p>
                  </div>

                  <input
                    type="file"
                    className="hidden"
                    onChange={handleUpload}
                    accept=".csv,.data"
                  />
                </label>
              </div>

              {/* TRAIN BUTTON */}
              <button
                onClick={handleTrain}
                disabled={training}
                className="relative overflow-hidden w-full py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-emerald-500 font-bold text-lg shadow-2xl shadow-blue-500/20 hover:scale-[1.02] transition-all duration-300 disabled:opacity-50"
              >
                <span className="relative z-10 flex items-center justify-center gap-3">
                  {training ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        viewBox="0 0 24 24"
                        fill="none"
                      >
                        <circle
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeOpacity="0.3"
                          strokeWidth="3"
                        />

                        <path
                          d="M12 2a10 10 0 0 1 10 10"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeLinecap="round"
                        />
                      </svg>

                      Training...
                      {Math.round(progress)}%
                    </>
                  ) : (
                    <>
                      🚀 Launch Training
                    </>
                  )}
                </span>
              </button>

              {/* PROGRESS BAR */}
              {training && (
                <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-400 transition-all duration-300"
                    style={{
                      width: `${progress}%`,
                    }}
                  />
                </div>
              )}
            </div>

            {/* RIGHT PANEL */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">

              <div className="flex items-center justify-between mb-6">

                <div>
                  <h2 className="text-2xl font-bold">
                    📊 Training Results
                  </h2>

                  <p className="text-sm text-gray-400">
                    Real-time metrics and evaluation
                  </p>
                </div>

                <div className="px-4 py-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-semibold">
                  LIVE
                </div>
              </div>

              <TrainingResults
                results={allResults}
                onNotify={onNotify}
              />
            </div>
          </div>
        )}

        {/* ================= TASK 4 ================= */}
        {navTab === "tache4" && (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">

            {/* ANALYSIS */}
            <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
              <RandomForestAnalysis
                trainingResults={allResults}
              />
            </div>

            {/* SIDEBAR */}
            <div className="space-y-6">

              {/* METRICS */}
              <div className="backdrop-blur-xl bg-emerald-500/10 border border-emerald-500/20 rounded-3xl p-6 shadow-2xl">

                <h3 className="text-xl font-bold text-emerald-400 mb-6">
                  🌲 RF Metrics
                </h3>

                <div className="space-y-4">

                  {[
                    {
                      label: "Accuracy",
                      val:
                        allResults
                          ?.random_forest
                          ?.accuracy ?? 69.5,
                    },

                    {
                      label: "F1 Score",
                      val:
                        allResults
                          ?.random_forest
                          ?.f1 ?? 82.01,
                    },

                    {
                      label: "ROC AUC",
                      val:
                        allResults
                          ?.random_forest
                          ?.roc_auc ?? 74.3,
                    },

                    {
                      label: "Precision",
                      val:
                        allResults
                          ?.random_forest
                          ?.precision ?? 70.2,
                    },

                    {
                      label: "Recall",
                      val:
                        allResults
                          ?.random_forest
                          ?.recall ?? 98.58,
                    },
                  ].map((m) => (
                    <div
                      key={m.label}
                      className="bg-white/5 rounded-2xl p-4 border border-white/5"
                    >
                      <div className="flex justify-between items-center">

                        <span className="text-gray-400 text-sm">
                          {m.label}
                        </span>

                        <span className="text-2xl font-black">
                          {m.val?.toFixed
                            ? m.val.toFixed(1)
                            : m.val}
                          %
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* MLFLOW */}
              <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 flex items-center justify-center text-2xl">
                    📡
                  </div>

                  <div>
                    <h3 className="font-bold">
                      MLflow Tracking
                    </h3>

                    <p className="text-sm text-gray-400">
                      localhost:5000
                    </p>
                  </div>

                  <div className="ml-auto w-3 h-3 bg-emerald-400 rounded-full animate-pulse" />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= HISTORY ================= */}
        {navTab === "history" && (
          <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl">
            <TrainingResults
              results={allResults}
              onNotify={onNotify}
            />
          </div>
        )}
      </div>
    </div>
  );
}