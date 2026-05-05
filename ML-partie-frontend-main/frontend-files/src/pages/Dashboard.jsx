import React, { useState } from "react";
import ModelSelector from "../components/ModelSelector";
import HyperParameters, { MODEL_PARAMS } from "../components/HyperParameters";
import TrainingResults from "../components/TrainingResults";
import { trainModel, uploadDataset } from "../services/api";

export default function Dashboard({ allResults, onTrainComplete, onNotify }) {
  const [selectedModels, setSelectedModels] = useState(["random_forest"]);
  const [compareMode, setCompareMode] = useState(false);
  const [training, setTraining] = useState(false);
  const [progress, setProgress] = useState(0);

  const [params, setParams] = useState({});

  const activeModel = selectedModels[0];

  const updateParams = (newParams) => {
    setParams((prev) => ({ ...prev, [activeModel]: newParams }));
  };

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
      }

      setProgress(100);
      onTrainComplete(results);
      onNotify("Training completed", "success");
    } catch (err) {
      onNotify("Training error", "error");
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
      onNotify("Dataset uploaded", "success");
    } catch {
      onNotify("Upload failed", "error");
    }
  };

  return (
    <div>
      <h2 className="text-white">Dashboard</h2>

      <ModelSelector
        selected={selectedModels}
        onChange={setSelectedModels}
        compareMode={compareMode}
        onCompareModeChange={setCompareMode}
      />

      <HyperParameters
        modelId={activeModel}
        params={params[activeModel] || {}}
        onChange={updateParams}
        onNotify={onNotify}
      />

      <button
        onClick={handleTrain}
        className="bg-blue-600 text-white px-4 py-2 rounded"
      >
        Train
      </button>

      <input type="file" onChange={handleUpload} />

      <TrainingResults results={allResults} onNotify={onNotify} />
    </div>
  );
}