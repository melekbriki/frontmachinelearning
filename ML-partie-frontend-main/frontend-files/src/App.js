import React, {
  useState,
  useEffect,
} from "react";

import Dashboard from "./pages/Dashboard";
import PredictionPanel from "./components/PredictionPanel";

import {
  ping,
  getHistory,
} from "./services/api";

const BASE_URL =
  process.env.REACT_APP_API_URL ||
  "http://localhost:8000";

/* ───────────────── TOAST ───────────────── */

function Toast({
  message,
  type,
  onClose,
}) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);

    return () => clearTimeout(t);
  }, [onClose]);

  const styles = {
    success:
      "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",

    error:
      "border-red-500/30 bg-red-500/10 text-red-300",

    info:
      "border-blue-500/30 bg-blue-500/10 text-blue-300",

    warning:
      "border-yellow-500/30 bg-yellow-500/10 text-yellow-300",
  };

  return (
    <div
      onClick={onClose}
      className={`fixed top-6 right-6 z-[100] px-5 py-4 rounded-2xl backdrop-blur-xl border shadow-2xl cursor-pointer animate-[fadeIn_0.3s_ease] ${styles[type]}`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">
          {type === "success"
            ? "✅"
            : type === "error"
            ? "❌"
            : type === "warning"
            ? "⚠️"
            : "ℹ️"}
        </span>

        <span className="font-medium text-sm">
          {message}
        </span>
      </div>
    </div>
  );
}

/* ───────────────── MLFLOW BUTTON ───────────────── */

function MLflowButton({
  runId,
  onNotify,
}) {
  const [loading, setLoading] =
    useState(false);

  const openMlflow = async () => {
    if (!runId) {
      window.open(
        "http://localhost:5000",
        "_blank"
      );

      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${BASE_URL}/mlflow/run/${runId}`
      );

      if (!res.ok) throw new Error();

      const data = await res.json();

      window.open(
        data.mlflow_url ||
          "http://localhost:5000",
        "_blank"
      );
    } catch {
      window.open(
        "http://localhost:5000",
        "_blank"
      );

      onNotify(
        "🔬 MLflow UI ouverte",
        "info"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={openMlflow}
      disabled={loading}
      className="px-4 py-2 rounded-xl border border-orange-500/30 bg-orange-500/10 hover:bg-orange-500/20 transition-all text-orange-300 text-sm font-semibold flex items-center gap-2"
    >
      {loading ? (
        <div className="flex gap-1">
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce" />
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce delay-100" />
          <div className="w-2 h-2 bg-orange-300 rounded-full animate-bounce delay-200" />
        </div>
      ) : (
        "🔬"
      )}

      MLflow
    </button>
  );
}

/* ───────────────── HISTORY ───────────────── */

function HistoryPage({
  onNotify,
}) {
  const [runs, setRuns] =
    useState([]);

  const [loading, setLoad] =
    useState(true);

  const [open, setOpen] =
    useState(null);

  useEffect(() => {
    getHistory()
      .then((data) =>
        setRuns(
          Array.isArray(data)
            ? data
            : data?.runs || []
        )
      )

      .catch(() =>
        onNotify(
          "⚠️ Impossible de charger l'historique",
          "warning"
        )
      )

      .finally(() => setLoad(false));
  }, []);

  const MODEL_ICON = {
    logistic_regression: "⚡",
    random_forest: "🌲",
    svm: "🔷",
    knn: "🎯",
  };

  if (loading)
    return (
      <div className="h-[400px] flex items-center justify-center text-gray-400">
        <div className="flex gap-2">
          <div className="w-3 h-3 bg-blue-400 rounded-full animate-bounce" />
          <div className="w-3 h-3 bg-emerald-400 rounded-full animate-bounce delay-100" />
          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-200" />
        </div>
      </div>
    );

  return (
    <div className="space-y-6">

      {/* header */}
      <div className="flex items-center justify-between flex-wrap gap-4">

        <div>
          <h1 className="text-3xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
            📜 Experiment History
          </h1>

          <p className="text-gray-400 text-sm mt-1">
            {runs.length} saved runs
          </p>
        </div>

        <button
          onClick={() =>
            window.open(
              "http://localhost:5000",
              "_blank"
            )
          }
          className="px-5 py-3 rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 text-white font-bold shadow-xl hover:scale-[1.02] transition-all"
        >
          🔬 Open MLflow
        </button>
      </div>

      {/* empty */}
      {runs.length === 0 && (
        <div className="h-[400px] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
          <div className="text-6xl mb-4">
            🤖
          </div>

          <p className="text-gray-400">
            No experiments yet
          </p>
        </div>
      )}

      {/* runs */}
      {runs.map((run, i) => {
        const isOpen = open === i;

        return (
          <div
            key={i}
            className="bg-white/5 border border-white/10 rounded-3xl backdrop-blur-xl overflow-hidden hover:border-blue-500/30 transition-all"
          >
            {/* top */}
            <div
              onClick={() =>
                setOpen(
                  isOpen ? null : i
                )
              }
              className="p-5 flex items-center justify-between cursor-pointer"
            >
              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-emerald-500/20 flex items-center justify-center text-2xl border border-white/10">
                  {MODEL_ICON[
                    run.model
                  ] || "🤖"}
                </div>

                <div>
                  <h3 className="font-bold text-lg">
                    {run.model}
                  </h3>

                  <p className="text-sm text-gray-400">
                    {run.date || "—"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-8">

                {[
                  [
                    "Accuracy",
                    run.accuracy,
                  ],

                  ["F1", run.f1],

                  [
                    "ROC",
                    run.roc_auc,
                  ],
                ].map(
                  ([label, val]) => (
                    <div
                      key={label}
                      className="text-center"
                    >
                      <p className="text-2xl font-black text-white">
                        {val?.toFixed
                          ? val.toFixed(
                              1
                            )
                          : "--"}
                        %
                      </p>

                      <p className="text-xs text-gray-500">
                        {label}
                      </p>
                    </div>
                  )
                )}

                <div className="text-gray-500 text-sm">
                  {isOpen
                    ? "▲"
                    : "▼"}
                </div>
              </div>
            </div>

            {/* dropdown */}
            {isOpen && (
              <div className="border-t border-white/10 p-5 bg-black/20 space-y-5">

                {/* params */}
                <div>
                  <p className="text-sm text-gray-400 mb-3">
                    Hyperparameters
                  </p>

                  <div className="flex flex-wrap gap-2">

                    {Object.entries(
                      run.params || {}
                    ).map(
                      ([k, v]) => (
                        <div
                          key={k}
                          className="px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-sm"
                        >
                          <span className="text-gray-500">
                            {k}:
                          </span>{" "}

                          <span className="text-blue-400 font-mono">
                            {String(v)}
                          </span>
                        </div>
                      )
                    )}
                  </div>
                </div>

                {/* actions */}
                <div className="flex gap-3 flex-wrap">

                  <MLflowButton
                    runId={run.id}
                    onNotify={
                      onNotify
                    }
                  />

                  <button
                    onClick={() =>
                      onNotify(
                        "🔄 Rollback feature",
                        "info"
                      )
                    }
                    className="px-4 py-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 hover:bg-emerald-500/20 transition-all text-sm font-semibold"
                  >
                    🔄 Rollback
                  </button>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ───────────────── APP ───────────────── */

const NAV = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: "⚡",
  },

  {
    id: "predict",
    label: "Prediction",
    icon: "🎯",
  },

  {
    id: "history",
    label: "History",
    icon: "📜",
  },
];

export default function App() {
  const [page, setPage] =
    useState("dashboard");

  const [allResults, setResults] =
    useState({});

  const [toast, setToast] =
    useState(null);

  const [apiStatus, setApiStatus] =
    useState("checking");

  useEffect(() => {
    ping()
      .then(() =>
        setApiStatus("ok")
      )
      .catch(() =>
        setApiStatus("error")
      );
  }, []);

  const notify = (
    msg,
    type = "success"
  ) =>
    setToast({
      msg,
      type,
    });

  const handleTrainComplete = (
    results
  ) =>
    setResults((prev) => ({
      ...prev,
      ...results,
    }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050816] via-[#0b1120] to-[#111827] text-white overflow-hidden relative">

      {/* bg effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-500/20 blur-[150px] rounded-full" />

      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-emerald-500/20 blur-[150px] rounded-full" />

      {/* grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />

      {/* toast */}
      {toast && (
        <Toast
          message={toast.msg}
          type={toast.type}
          onClose={() =>
            setToast(null)
          }
        />
      )}

      {/* navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/5 border-b border-white/10">

        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">

          {/* logo */}
          <div>
            <h1 className="text-2xl font-black bg-gradient-to-r from-blue-400 to-emerald-400 bg-clip-text text-transparent">
              CreditGuard
            </h1>

            <p className="text-xs text-gray-400">
              Platform
            </p>
          </div>

          {/* nav */}
          <nav className="flex items-center gap-2">

            {NAV.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  setPage(item.id)
                }
                className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all duration-300
                ${
                  page === item.id
                    ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white shadow-lg shadow-blue-500/20 scale-105"
                    : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white"
                }`}
              >
                <span className="mr-2">
                  {item.icon}
                </span>

                {item.label}
              </button>
            ))}
          </nav>

          {/* api */}
          <div className="flex items-center gap-3">

            <div
              className={`w-3 h-3 rounded-full ${
                apiStatus === "ok"
                  ? "bg-emerald-400 animate-pulse"
                  : apiStatus ===
                    "error"
                  ? "bg-red-500"
                  : "bg-yellow-400"
              }`}
            />

            <span
              className={`text-sm font-semibold ${
                apiStatus === "ok"
                  ? "text-emerald-400"
                  : apiStatus ===
                    "error"
                  ? "text-red-400"
                  : "text-yellow-400"
              }`}
            >
              {apiStatus === "ok"
                ? "API Online"
                : apiStatus ===
                  "error"
                ? "API Offline"
                : "Connecting..."}
            </span>
          </div>
        </div>
      </header>

      {/* pages */}
      <main className="max-w-7xl mx-auto px-6 py-8 relative z-10">

        {page ===
          "dashboard" && (
          <Dashboard
            allResults={
              allResults
            }
            onTrainComplete={
              handleTrainComplete
            }
            onNotify={notify}
          />
        )}

        {page === "predict" && (
          <PredictionPanel
            trainedResults={
              allResults
            }
            onNotify={notify}
          />
        )}

        {page === "history" && (
          <HistoryPage
            onNotify={notify}
          />
        )}
      </main>
    </div>
  );
}