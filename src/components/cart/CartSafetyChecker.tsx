import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { checkCartSafety, DrugSafetyResult } from '../../lib/aiService';
import { 
  ShieldCheck, 
  AlertTriangle, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  Utensils, 
  Loader2, 
  ChevronDown, 
  ChevronUp, 
  Info,
  RefreshCw
} from 'lucide-react';

export const CartSafetyChecker: React.FC = () => {
  const { cart } = useApp();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DrugSafetyResult | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (cart.length === 0) return null;

  const handleRunCheck = async () => {
    setLoading(true);
    setError(null);

    try {
      const itemsPayload = cart.map(item => ({
        id: item.medicine.id,
        name: item.medicine.name,
        genericName: item.medicine.genericName,
        dosage: item.medicine.dosage,
      }));

      const data = await checkCartSafety(itemsPayload);
      setResult(data);
      setExpanded(true);
    } catch (err: any) {
      console.error(err);
      setError('Could not complete safety audit at this moment.');
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level?: string) => {
    switch (level) {
      case 'High':
        return 'bg-rose-100 text-rose-800 border-rose-200';
      case 'Moderate':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'Low':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-200';
    }
  };

  return (
    <div className="bg-gradient-to-br from-emerald-50/70 to-teal-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
      {/* Header bar */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="font-bold text-slate-900 text-xs sm:text-sm">AI Drug Safety & Interaction Check</h4>
              <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded uppercase">
                Gemini 3.7
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Audit {cart.length} item{cart.length > 1 ? 's' : ''} in cart for dosage timing & contraindications
            </p>
          </div>
        </div>

        <button
          onClick={handleRunCheck}
          disabled={loading}
          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-xs cursor-pointer shrink-0"
        >
          {loading ? (
            <>
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
              <span>Analyzing...</span>
            </>
          ) : result ? (
            <>
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Re-check</span>
            </>
          ) : (
            <>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Check Safety</span>
            </>
          )}
        </button>
      </div>

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
          <span>{error}</span>
        </div>
      )}

      {/* RESULT PANEL */}
      {result && (
        <div className="space-y-3 pt-2 border-t border-emerald-200/60 animate-in fade-in duration-150">
          {/* Status summary pill */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${getRiskColor(result.riskLevel)}`}>
                Risk Level: {result.riskLevel}
              </span>
              <span className="text-xs font-semibold text-slate-800">{result.summary}</span>
            </div>

            <button
              onClick={() => setExpanded(!expanded)}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-0.5 cursor-pointer"
            >
              <span>{expanded ? 'Hide Details' : 'View Schedule'}</span>
              {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {expanded && (
            <div className="space-y-3 pt-2">
              {/* Interaction warnings if any */}
              {result.interactions && result.interactions.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Pharmacological Interactions Detected
                  </div>
                  {result.interactions.map((int, i) => (
                    <div key={i} className="p-3 rounded-xl bg-amber-50/90 border border-amber-200 text-xs space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-amber-900">
                          {int.medicinesInvolved.join(' + ')}
                        </span>
                        <span className="bg-amber-200 text-amber-900 text-[10px] font-bold px-1.5 py-0.5 rounded">
                          {int.severity} Alert
                        </span>
                      </div>
                      <p className="text-amber-900/90">{int.effect}</p>
                      <p className="text-emerald-800 font-semibold">Tip: {int.recommendation}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-2.5 rounded-xl bg-white border border-emerald-100 flex items-center gap-2 text-xs text-emerald-900">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>No adverse drug interactions detected between the items in your cart.</span>
                </div>
              )}

              {/* Best Time & Dosage Schedule Guidance */}
              {result.dosageScheduleTips && result.dosageScheduleTips.length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                    Suggested Consumption Schedule
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {result.dosageScheduleTips.map((tip, i) => (
                      <div key={i} className="p-2.5 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                        <div className="font-bold text-slate-900 truncate">{tip.medicineName}</div>
                        <div className="flex items-center gap-1.5 text-[11px] text-slate-600">
                          <Clock className="w-3 h-3 text-emerald-600 shrink-0" />
                          <span>{tip.bestTime}</span>
                        </div>
                        {tip.dietTip && (
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                            <Utensils className="w-3 h-3 text-amber-600 shrink-0" />
                            <span>{tip.dietTip}</span>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
