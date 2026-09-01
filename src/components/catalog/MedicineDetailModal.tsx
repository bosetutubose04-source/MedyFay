import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  X, 
  ShieldAlert, 
  Star, 
  CheckCircle, 
  AlertTriangle, 
  Building2, 
  Package, 
  Plus, 
  Minus,
  Sparkles,
  Bot,
  Clock,
  Utensils,
  HelpCircle,
  Loader2,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { explainMedicineWithAi, MedicineExplanationResult } from '../../lib/aiService';

export const MedicineDetailModal: React.FC = () => {
  const { 
    selectedMedicine, 
    setSelectedMedicine, 
    addToCart, 
    getItemQuantity, 
    updateQuantity,
    openDrMedyWithPrompt 
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'ai_insights'>('overview');
  const [aiExplanation, setAiExplanation] = useState<MedicineExplanationResult | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);

  // Reset tab and AI explanation when selected medicine changes
  useEffect(() => {
    setActiveTab('overview');
    setAiExplanation(null);
  }, [selectedMedicine?.id]);

  if (!selectedMedicine) return null;

  const quantity = getItemQuantity(selectedMedicine.id);

  const fetchAiExplanation = async () => {
    if (aiExplanation || loadingAi) return;
    setLoadingAi(true);
    try {
      const data = await explainMedicineWithAi({
        medicineName: selectedMedicine.name,
        genericName: selectedMedicine.genericName,
        dosage: selectedMedicine.dosage,
        category: selectedMedicine.category,
      });
      setAiExplanation(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingAi(false);
    }
  };

  const handleTabChange = (tab: 'overview' | 'ai_insights') => {
    setActiveTab(tab);
    if (tab === 'ai_insights' && !aiExplanation) {
      fetchAiExplanation();
    }
  };

  const handleAskDrMedy = () => {
    const medName = selectedMedicine.name;
    setSelectedMedicine(null);
    openDrMedyWithPrompt(`Can you explain the best timing, side effects, and precautions for ${medName}?`);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
        >
          {/* Header Image banner */}
          <div className="relative h-56 sm:h-64 bg-slate-100 shrink-0">
            <img
              src={selectedMedicine.image}
              alt={selectedMedicine.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=700&auto=format&fit=crop&q=80';
              }}
            />
            <button
              onClick={() => setSelectedMedicine(null)}
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-slate-900/70 hover:bg-slate-900 text-white flex items-center justify-center transition-colors shadow-md cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="absolute bottom-4 left-4 flex gap-2">
              <span className="bg-emerald-600 text-white text-xs font-semibold px-3 py-1 rounded-full shadow-md">
                {selectedMedicine.category}
              </span>
              {selectedMedicine.prescriptionRequired && (
                <span className="bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                  <ShieldAlert className="w-3.5 h-3.5" /> Prescription Required
                </span>
              )}
            </div>
          </div>

          {/* Modal Header Title & Tabs */}
          <div className="px-6 pt-5 pb-3 border-b border-slate-100 shrink-0 bg-white">
            <div className="flex items-start justify-between gap-4 mb-3">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900">{selectedMedicine.name}</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-mono mt-0.5">{selectedMedicine.genericName}</p>
              </div>
              <div className="text-right shrink-0">
                <div className="text-2xl font-extrabold text-slate-900">₹{selectedMedicine.price}</div>
                {selectedMedicine.originalPrice && (
                  <div className="text-xs text-slate-400 line-through">MRP ₹{selectedMedicine.originalPrice}</div>
                )}
              </div>
            </div>

            {/* Tab switch */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleTabChange('overview')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Overview & Uses
              </button>
              <button
                onClick={() => handleTabChange('ai_insights')}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'ai_insights'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-200/80'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>AI Pharmacist Guide</span>
              </button>

              <button
                onClick={handleAskDrMedy}
                className="ml-auto text-xs text-emerald-700 hover:text-emerald-800 font-bold flex items-center gap-1 hover:underline cursor-pointer"
              >
                <Bot className="w-3.5 h-3.5" />
                <span>Ask Dr. Medy</span>
              </button>
            </div>
          </div>

          {/* Modal Scrollable Body */}
          <div className="p-6 overflow-y-auto flex-1 space-y-5">
            {activeTab === 'overview' ? (
              <>
                {/* Quick meta row */}
                <div className="flex flex-wrap gap-4 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <span>Mfg: <strong className="text-slate-800">{selectedMedicine.manufacturer}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Package className="w-4 h-4 text-slate-400" />
                    <span>Pack: <strong className="text-slate-800">{selectedMedicine.packSize}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5 text-amber-500 font-bold">
                    <Star className="w-4 h-4 fill-amber-400" />
                    <span>{selectedMedicine.rating} ({selectedMedicine.reviewCount} reviews)</span>
                  </div>
                </div>

                {/* Description */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">Description & Action</h4>
                  <p className="text-sm text-slate-700 leading-relaxed">{selectedMedicine.description}</p>
                </div>

                {/* Uses list */}
                <div>
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Therapeutic Uses</h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {selectedMedicine.uses.map((use, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-700 bg-emerald-50/70 p-2.5 rounded-xl border border-emerald-100">
                        <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>{use}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Side effects notice */}
                {selectedMedicine.sideEffects && selectedMedicine.sideEffects.length > 0 && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200">
                    <div className="flex items-center gap-2 text-xs font-bold text-amber-800 mb-1">
                      <AlertTriangle className="w-4 h-4 text-amber-600" /> Possible Side Effects / Advisory
                    </div>
                    <p className="text-xs text-amber-700">
                      {selectedMedicine.sideEffects.join(' • ')}. Consult your physician if symptoms persist.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* AI PHARMACIST INSIGHTS TAB */
              <div className="space-y-4 animate-in fade-in duration-150">
                {loadingAi && (
                  <div className="py-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-600 mx-auto" />
                    <p className="text-xs text-slate-500 font-medium">
                      Gemini 3.7 AI is preparing clinical monograph insights for {selectedMedicine.name}...
                    </p>
                  </div>
                )}

                {aiExplanation && (
                  <div className="space-y-4">
                    {/* Simplified explanation */}
                    <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>How it works in plain language</span>
                      </div>
                      <p className="text-xs sm:text-sm text-emerald-950 leading-relaxed">
                        {aiExplanation.simplifiedExplanation}
                      </p>
                    </div>

                    {/* Timing & Food Tips Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Clock className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Optimal Timing</span>
                        </div>
                        <p className="text-xs text-slate-600">{aiExplanation.bestTimeToTake}</p>
                      </div>

                      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-1">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-slate-800">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          <span>Foods & Drinks Caution</span>
                        </div>
                        <ul className="text-xs text-slate-600 list-disc pl-4 space-y-0.5">
                          {aiExplanation.foodsToAvoid?.map((food, i) => (
                            <li key={i}>{food}</li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Special precautions */}
                    {aiExplanation.specialPrecautions && aiExplanation.specialPrecautions.length > 0 && (
                      <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          <span>Special Precautions</span>
                        </div>
                        <ul className="text-xs text-amber-900 list-disc pl-4 space-y-0.5">
                          {aiExplanation.specialPrecautions.map((prec, i) => (
                            <li key={i}>{prec}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* FAQs */}
                    {aiExplanation.faq && aiExplanation.faq.length > 0 && (
                      <div className="space-y-2">
                        <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                          <HelpCircle className="w-3.5 h-3.5" />
                          <span>Frequently Asked Clinical Questions</span>
                        </div>
                        <div className="space-y-2">
                          {aiExplanation.faq.map((item, idx) => (
                            <div key={idx} className="p-3 rounded-xl bg-white border border-slate-200 text-xs space-y-1">
                              <span className="font-bold text-slate-900 block">{item.question}</span>
                              <p className="text-slate-600">{item.answer}</p>
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

          {/* Modal Bottom CTA */}
          <div className="flex items-center justify-between p-4 px-6 border-t border-slate-100 bg-white shrink-0">
            <div>
              <span className="text-xs text-slate-500 block">Dosage Guidance:</span>
              <span className="text-sm font-semibold text-slate-800">{selectedMedicine.dosage}</span>
            </div>

            {quantity === 0 ? (
              <button
                onClick={() => addToCart(selectedMedicine)}
                className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md transition-colors flex items-center gap-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" /> Add to Cart (₹{selectedMedicine.price})
              </button>
            ) : (
              <div className="flex items-center gap-3 bg-emerald-700 text-white rounded-xl px-3 py-1.5 shadow-md">
                <span className="text-xs font-medium">In Cart:</span>
                <button
                  onClick={() => updateQuantity(selectedMedicine.id, -1)}
                  className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="text-sm font-bold w-4 text-center">{quantity}</span>
                <button
                  onClick={() => updateQuantity(selectedMedicine.id, 1)}
                  className="w-7 h-7 rounded-lg bg-emerald-800 hover:bg-emerald-900 flex items-center justify-center transition-colors cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

