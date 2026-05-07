import React, { useState, useEffect } from 'react';

// ── Couleurs modèles ──────────────────────────────────────────────
const MODEL_COLORS = {
  random_forest:       { hex: '#10b981', text: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' },
  logistic_regression: { hex: '#3b82f6', text: 'text-blue-400',    bg: 'bg-blue-500/10',    border: 'border-blue-500/30'    },
  decision_tree:       { hex: '#f59e0b', text: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/30'   },
  svm:                 { hex: '#8b5cf6', text: 'text-purple-400',  bg: 'bg-purple-500/10',  border: 'border-purple-500/30'  },
  knn:                 { hex: '#ec4899', text: 'text-pink-400',    bg: 'bg-pink-500/10',    border: 'border-pink-500/30'    },
};

// ── Données simulées tâche 4 (remplace par appel API réel si disponible) ───
const MOCK_DATA = {
  feature_importance: [
    { feature: 'CreditAmount',    importance: 0.1002 },
    { feature: 'Duration',        importance: 0.0913 },
    { feature: 'Age',             importance: 0.0851 },
    { feature: 'InstallmentRate', importance: 0.0612 },
    { feature: 'ResidenceDuration', importance: 0.0544 },
    { feature: 'ExistingCredits', importance: 0.0498 },
    { feature: 'PeopleLiable',    importance: 0.0421 },
    { feature: 'Status_A12',      importance: 0.0388 },
    { feature: 'Savings_A62',     importance: 0.0351 },
    { feature: 'Purpose_A41',     importance: 0.0312 },
  ],
  stability: [
    { seed: 0,   accuracy: 69.50, f1: 82.01 },
    { seed: 1,   accuracy: 70.00, f1: 82.50 },
    { seed: 7,   accuracy: 68.50, f1: 81.31 },
    { seed: 21,  accuracy: 69.00, f1: 81.80 },
    { seed: 42,  accuracy: 70.50, f1: 82.94 },
    { seed: 99,  accuracy: 71.00, f1: 83.10 },
    { seed: 123, accuracy: 69.50, f1: 82.20 },
    { seed: 256, accuracy: 70.00, f1: 82.60 },
    { seed: 500, accuracy: 69.00, f1: 81.90 },
    { seed: 999, accuracy: 70.50, f1: 82.80 },
  ],
  misclassified: [
    { id: 1, true_label: 0, pred_label: 1, confidence: 0.61, reason: 'Montant faible (1200€) mais mauvais historique de crédit. Le modèle a été trompé par les caractéristiques similaires aux bons clients.', features: { CreditAmount: 1200, Duration: 12, Age: 34 }, type: 'fp' },
    { id: 2, true_label: 0, pred_label: 1, confidence: 0.57, reason: 'Durée courte (6 mois) et âge élevé (58 ans) — profil perçu comme faible risque mais statut de compte négatif non détecté.', features: { CreditAmount: 2500, Duration: 6, Age: 58 }, type: 'fp' },
    { id: 3, true_label: 1, pred_label: 0, confidence: 0.48, reason: 'Confiance limite (48%). Montant élevé (15000€) avec longue durée (60 mois) — profil ambigu malgré bon historique.', features: { CreditAmount: 15000, Duration: 60, Age: 29 }, type: 'fn' },
  ],
  bias_variance: [
    { n: 10,  d: 2,    train: 70.38, test: 70.50, bias: 29.62, variance: -0.12 },
    { n: 10,  d: 5,    train: 71.75, test: 70.00, bias: 28.25, variance: 1.75  },
    { n: 50,  d: 3,    train: 70.38, test: 70.50, bias: 29.62, variance: -0.12 },
    { n: 50,  d: 10,   train: 97.12, test: 68.50, bias: 2.88,  variance: 28.62 },
    { n: 100, d: null, train: 100.0, test: 69.50, bias: 0.00,  variance: 30.50 },
    { n: 100, d: 5,    train: 70.38, test: 70.50, bias: 29.62, variance: -0.12 },
    { n: 200, d: 10,   train: 98.38, test: 70.50, bias: 1.62,  variance: 27.88 },
    { n: 200, d: null, train: 100.0, test: 70.00, bias: 0.00,  variance: 30.00 },
  ],
  comparison: {
    random_forest:       { accuracy: 69.50, f1: 82.01, precision: 70.20, recall: 98.58, roc_auc: 74.30 },
    decision_tree:       { accuracy: 59.50, f1: 71.38, precision: 71.13, recall: 71.63, roc_auc: 59.50 },
  },
};

// ── Composant FeatureImportance ───────────────────────────────────
function FeatureImportance({ data }) {
  const max = Math.max(...data.map(d => d.importance));
  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-bold text-white">Feature Importance</h3>
          <p className="text-xs text-gray-500 mt-0.5">Réduction moyenne de l'impureté de Gini</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <span className="text-xs text-emerald-400 font-bold">Top 3 Features</span>
        </div>
      </div>
      {data.map((d, i) => (
        <div key={d.feature} className="group">
          <div className="flex items-center justify-between mb-1">
            <div className="flex items-center gap-2">
              {i < 3 && <span className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-xs text-emerald-400 font-bold">{i+1}</span>}
              {i >= 3 && <span className="w-5 h-5 rounded-full bg-white/5 flex items-center justify-center text-xs text-gray-500">{i+1}</span>}
              <span className={`text-xs font-mono ${i < 3 ? 'text-white font-bold' : 'text-gray-400'}`}>{d.feature}</span>
            </div>
            <span className={`text-xs font-mono font-bold ${i < 3 ? 'text-emerald-400' : 'text-gray-500'}`}>
              {(d.importance * 100).toFixed(2)}%
            </span>
          </div>
          <div className="h-2 bg-white/5 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-700"
              style={{
                width: `${(d.importance / max) * 100}%`,
                background: i < 3
                  ? `linear-gradient(90deg, #10b981, #34d399)`
                  : `rgba(255,255,255,0.1)`
              }}
            />
          </div>
        </div>
      ))}
      <div className="mt-4 p-3 bg-white/3 border border-white/5 rounded-xl">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-emerald-400 font-bold">CreditAmount</span>, <span className="text-emerald-400 font-bold">Duration</span> et <span className="text-emerald-400 font-bold">Age</span> sont les 3 variables les plus discriminantes — cohérent avec la théorie du risque bancaire.
        </p>
      </div>
    </div>
  );
}

// ── Composant Stability ───────────────────────────────────────────
function StabilityChart({ data }) {
  const accMean = data.reduce((s, d) => s + d.accuracy, 0) / data.length;
  const accStd  = Math.sqrt(data.reduce((s, d) => s + Math.pow(d.accuracy - accMean, 2), 0) / data.length);
  const f1Mean  = data.reduce((s, d) => s + d.f1, 0) / data.length;
  const f1Std   = Math.sqrt(data.reduce((s, d) => s + Math.pow(d.f1 - f1Mean, 2), 0) / data.length);

  const W = 400, H = 120;
  const minAcc = Math.min(...data.map(d => d.accuracy)) - 2;
  const maxAcc = Math.max(...data.map(d => d.accuracy)) + 2;
  const tx = (i) => 30 + (i / (data.length - 1)) * (W - 50);
  const ty = (v) => H - 20 - ((v - minAcc) / (maxAcc - minAcc)) * (H - 30);

  const accPath = data.map((d, i) => `${i === 0 ? 'M' : 'L'}${tx(i).toFixed(1)},${ty(d.accuracy).toFixed(1)}`).join(' ');
  const f1Path  = data.map((d, i) => {
    const f1Min = Math.min(...data.map(x => x.f1)) - 2;
    const f1Max = Math.max(...data.map(x => x.f1)) + 2;
    const tyF1  = (v) => H - 20 - ((v - f1Min) / (f1Max - f1Min)) * (H - 30);
    return `${i === 0 ? 'M' : 'L'}${tx(i).toFixed(1)},${tyF1(d.f1).toFixed(1)}`;
  }).join(' ');

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Stabilité des Prédictions</h3>
        <p className="text-xs text-gray-500 mt-0.5">10 random_states différents testés</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-3 text-center">
          <div className="text-xl font-black text-blue-400">{accMean.toFixed(2)}%</div>
          <div className="text-xs text-gray-500">Accuracy Moyenne</div>
          <div className="text-xs text-blue-300 mt-1">±{accStd.toFixed(2)}% std</div>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-3 text-center">
          <div className="text-xl font-black text-emerald-400">{f1Mean.toFixed(2)}%</div>
          <div className="text-xs text-gray-500">F1 Moyen</div>
          <div className="text-xs text-emerald-300 mt-1">±{f1Std.toFixed(2)}% std</div>
        </div>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H}`} className="overflow-visible">
        {data.map((d, i) => (
          <circle key={i} cx={tx(i)} cy={ty(d.accuracy)} r="3" fill="#3b82f6" opacity="0.8"/>
        ))}
        <path d={accPath} stroke="#3b82f6" strokeWidth="2" fill="none" strokeLinejoin="round"/>
        <line x1={30} y1={ty(accMean)} x2={W-20} y2={ty(accMean)} stroke="#3b82f6" strokeWidth="1" strokeDasharray="4,3" opacity="0.5"/>
        {data.map((_, i) => (
          <text key={i} x={tx(i)} y={H-5} textAnchor="middle" fill="#4b5563" fontSize="8">{data[i].seed}</text>
        ))}
      </svg>
      <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-blue-400 font-bold">Modèle très robuste</span> — std de {accStd.toFixed(2)}% seulement. Le bagging de 100 arbres réduit la sensibilité à l'initialisation aléatoire.
        </p>
      </div>
    </div>
  );
}

// ── Composant MisclassifiedSamples ───────────────────────────────
function MisclassifiedSamples({ data }) {
  const [selected, setSelected] = useState(0);
  const sample = data[selected];
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Échantillons Mal Classés</h3>
        <p className="text-xs text-gray-500 mt-0.5">Analyse des patterns d'erreur</p>
      </div>
      <div className="flex gap-2">
        {data.map((d, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg border transition-all ${
              selected === i
                ? d.type === 'fp'
                  ? 'bg-red-500/20 border-red-500/50 text-red-400'
                  : 'bg-amber-500/20 border-amber-500/50 text-amber-400'
                : 'bg-white/5 border-white/10 text-gray-400'
            }`}
          >
            {d.type === 'fp' ? '🔴 FP' : '🟡 FN'} #{d.id}
          </button>
        ))}
      </div>
      {sample && (
        <div className={`rounded-xl border p-4 space-y-3 ${sample.type === 'fp' ? 'bg-red-500/5 border-red-500/20' : 'bg-amber-500/5 border-amber-500/20'}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-bold px-2 py-1 rounded-full ${sample.type === 'fp' ? 'bg-red-500/20 text-red-400' : 'bg-amber-500/20 text-amber-400'}`}>
              {sample.type === 'fp' ? 'Faux Positif — Mauvais crédit accordé' : 'Faux Négatif — Bon crédit refusé'}
            </span>
            <span className="text-xs text-gray-500">Confiance: <span className="font-mono text-white">{(sample.confidence * 100).toFixed(1)}%</span></span>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {Object.entries(sample.features).map(([k, v]) => (
              <div key={k} className="bg-white/5 rounded-lg p-2 text-center">
                <div className="text-xs font-mono font-bold text-white">{v}</div>
                <div className="text-xs text-gray-500 mt-0.5">{k}</div>
              </div>
            ))}
          </div>
          <p className="text-xs text-gray-400 leading-relaxed border-t border-white/5 pt-3">{sample.reason}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-3 pt-1">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-red-400">59</div>
          <div className="text-xs text-gray-500 mt-1">Faux Positifs</div>
          <div className="text-xs text-red-300">Mauvais crédits accordés</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3 text-center">
          <div className="text-2xl font-black text-amber-400">2</div>
          <div className="text-xs text-gray-500 mt-1">Faux Négatifs</div>
          <div className="text-xs text-amber-300">Bons crédits refusés</div>
        </div>
      </div>
      <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-red-400 font-bold">Pattern principal :</span> déséquilibre de classes (70% bon / 30% mauvais) biaise le modèle vers l'approbation. Recommandation : utiliser <span className="text-white font-mono">class_weight='balanced'</span>.
        </p>
      </div>
    </div>
  );
}

// ── Composant BiasVariance ────────────────────────────────────────
function BiasVarianceTable({ data }) {
  const getTag = (row) => {
    if (row.variance > 20) return { label: 'Overfitting', color: 'text-red-400 bg-red-500/10 border-red-500/20' };
    if (row.bias > 25)     return { label: 'Underfitting', color: 'text-amber-400 bg-amber-500/10 border-amber-500/20' };
    return { label: 'Équilibré ✓', color: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20' };
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-white">Analyse Biais & Variance</h3>
        <p className="text-xs text-gray-500 mt-0.5">Impact des hyperparamètres</p>
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5">
              <th className="px-3 py-2.5 text-left text-gray-400 font-semibold">n_est.</th>
              <th className="px-3 py-2.5 text-left text-gray-400 font-semibold">depth</th>
              <th className="px-3 py-2.5 text-right text-gray-400 font-semibold">Train</th>
              <th className="px-3 py-2.5 text-right text-gray-400 font-semibold">Test</th>
              <th className="px-3 py-2.5 text-right text-gray-400 font-semibold">Biais</th>
              <th className="px-3 py-2.5 text-right text-gray-400 font-semibold">Variance</th>
              <th className="px-3 py-2.5 text-center text-gray-400 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => {
              const tag = getTag(row);
              return (
                <tr key={i} className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/2' : ''}`}>
                  <td className="px-3 py-2 font-mono text-gray-300">{row.n}</td>
                  <td className="px-3 py-2 font-mono text-gray-300">{row.d ?? 'None'}</td>
                  <td className="px-3 py-2 text-right font-mono text-blue-300">{row.train.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-emerald-300">{row.test.toFixed(1)}%</td>
                  <td className="px-3 py-2 text-right font-mono text-amber-300">{row.bias.toFixed(2)}</td>
                  <td className="px-3 py-2 text-right font-mono text-red-300">{row.variance.toFixed(2)}</td>
                  <td className="px-3 py-2 text-center">
                    <span className={`text-xs px-2 py-0.5 rounded-full border ${tag.color}`}>{tag.label}</span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-3">
          <div className="text-xs font-bold text-red-400 mb-1">🔴 Overfitting</div>
          <div className="text-xs text-gray-400">n=100, depth=None<br/>Train=100%, Test=69.5%</div>
        </div>
        <div className="bg-amber-500/5 border border-amber-500/20 rounded-xl p-3">
          <div className="text-xs font-bold text-amber-400 mb-1">🟡 Underfitting</div>
          <div className="text-xs text-gray-400">n=10, depth=2<br/>Biais=29.62%</div>
        </div>
        <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-xl p-3">
          <div className="text-xs font-bold text-emerald-400 mb-1">✅ Équilibré</div>
          <div className="text-xs text-gray-400">n=100, depth=5<br/>Variance≈0</div>
        </div>
      </div>
    </div>
  );
}

// ── Composant ModelComparison ─────────────────────────────────────
function ModelComparison({ data }) {
  const metrics = ['accuracy', 'f1', 'precision', 'recall', 'roc_auc'];
  const metricLabels = { accuracy: 'Accuracy', f1: 'F1 Score', precision: 'Precision', recall: 'Recall', roc_auc: 'ROC AUC' };
  const models = Object.keys(data);
  const best = models.reduce((a, b) => data[a].accuracy > data[b].accuracy ? a : b);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-white">Comparaison RF vs Decision Tree</h3>
          <p className="text-xs text-gray-500 mt-0.5">Même train/test split pour les deux modèles</p>
        </div>
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <span className="text-xs text-emerald-400 font-bold">
            🏆 {best === 'random_forest' ? 'Random Forest' : 'Decision Tree'}
          </span>
        </div>
      </div>

      {/* Header modèles */}
      <div className="grid grid-cols-2 gap-3">
        {models.map(m => {
          const c = MODEL_COLORS[m] || MODEL_COLORS.random_forest;
          const isBest = m === best;
          return (
            <div key={m} className={`rounded-xl border p-3 flex items-center gap-3 ${isBest ? `${c.bg} ${c.border}` : 'bg-white/3 border-white/10'}`}>
              <span className="text-2xl">{m === 'random_forest' ? '🌲' : '🌿'}</span>
              <div>
                <div className={`text-sm font-bold ${isBest ? c.text : 'text-gray-400'}`}>
                  {m === 'random_forest' ? 'Random Forest' : 'Decision Tree'}
                  {isBest && <span className="ml-2 text-xs">👑</span>}
                </div>
                <div className={`text-xs font-mono font-black ${isBest ? c.text : 'text-gray-500'}`}>
                  {data[m].accuracy.toFixed(1)}% acc
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Barres métriques */}
      <div className="space-y-3">
        {metrics.map(metric => (
          <div key={metric}>
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs text-gray-400 uppercase tracking-wider">{metricLabels[metric]}</span>
              <div className="flex gap-3">
                {models.map(m => {
                  const c = MODEL_COLORS[m] || MODEL_COLORS.random_forest;
                  return (
                    <span key={m} className={`text-xs font-mono font-bold ${c.text}`}>
                      {data[m][metric].toFixed(1)}%
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="space-y-1">
              {models.map(m => {
                const c = MODEL_COLORS[m] || MODEL_COLORS.random_forest;
                return (
                  <div key={m} className="h-3 bg-white/5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${data[m][metric]}%`, background: c.hex, opacity: 0.8 }}
                    />
                  </div>
                );
              })}
            </div>
            {/* Différence */}
            {models.length === 2 && (() => {
              const diff = data[models[0]][metric] - data[models[1]][metric];
              return diff !== 0 ? (
                <div className="text-right mt-0.5">
                  <span className={`text-xs font-mono ${diff > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                    {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
                  </span>
                </div>
              ) : null;
            })()}
          </div>
        ))}
      </div>

      <div className="p-3 bg-white/3 border border-white/5 rounded-xl">
        <p className="text-xs text-gray-400 leading-relaxed">
          <span className="text-emerald-400 font-bold">Random Forest surpasse</span> le Decision Tree sur tous les indicateurs. Le bagging de 100 arbres réduit la variance individuelle de chaque arbre — principe de la sagesse des foules.
        </p>
      </div>
    </div>
  );
}

// ── Composant Principal ───────────────────────────────────────────
const TABS = [
  { id: 'features',    label: 'Features',    icon: '📊' },
  { id: 'stability',   label: 'Stabilité',   icon: '📈' },
  { id: 'errors',      label: 'Erreurs',     icon: '⚠️' },
  { id: 'bias',        label: 'Biais/Var',   icon: '⚖️' },
  { id: 'comparison',  label: 'Comparaison', icon: '🔄' },
];

export default function RandomForestAnalysis({ trainingResults }) {
  const [activeTab, setActiveTab] = useState('features');
  const [data, setData] = useState(MOCK_DATA);
  const [loading, setLoading] = useState(false);

  // Si des vrais résultats d'entraînement sont passés, on les utilise
  useEffect(() => {
    if (trainingResults?.random_forest) {
      const rf = trainingResults.random_forest;
      const dt = trainingResults.decision_tree;
      if (rf && dt) {
        setData(prev => ({
          ...prev,
          comparison: {
            random_forest: { accuracy: rf.accuracy, f1: rf.f1, precision: rf.precision, recall: rf.recall, roc_auc: rf.roc_auc },
            decision_tree: { accuracy: dt.accuracy, f1: dt.f1, precision: dt.precision, recall: dt.recall, roc_auc: dt.roc_auc },
          }
        }));
      }
    }
  }, [trainingResults]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-widest">
            🌲 Tâche 4 — Random Forest
          </h2>
          <p className="text-xs text-gray-600 mt-0.5">Interprétation & Analyse</p>
        </div>
        <div className="flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-3 py-1.5">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"/>
          <span className="text-xs text-emerald-400 font-semibold">MLflow ✓</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-white/5 p-1 rounded-xl overflow-x-auto">
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg whitespace-nowrap transition-all flex-1 justify-center
              ${activeTab === tab.id
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : 'text-gray-400 hover:text-gray-200'}`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[400px]">
        {activeTab === 'features'   && <FeatureImportance data={data.feature_importance} />}
        {activeTab === 'stability'  && <StabilityChart    data={data.stability} />}
        {activeTab === 'errors'     && <MisclassifiedSamples data={data.misclassified} />}
        {activeTab === 'bias'       && <BiasVarianceTable  data={data.bias_variance} />}
        {activeTab === 'comparison' && <ModelComparison    data={data.comparison} />}
      </div>
    </div>
  );
}
