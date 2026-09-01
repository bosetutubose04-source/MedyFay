import React, { useState, useRef } from 'react';
import { useApp } from '../../context/AppContext';
import { 
  analyzePrescriptionImage, 
  PrescriptionAnalysisResult 
} from '../../lib/aiService';
import { 
  FileText, 
  Upload, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  X, 
  ShoppingCart, 
  Plus, 
  Loader2, 
  ArrowRight, 
  Pill, 
  ShieldCheck, 
  Info, 
  RefreshCw,
  Image as ImageIcon,
  Check
} from 'lucide-react';

// Sample prescription base64/data URLs for instant 1-click testing
const SAMPLE_PRESCRIPTIONS = [
  {
    id: 'sample-1',
    title: 'Fever & Throat Infection Rx',
    doctor: 'Dr. S. Mukherjee, MD (Medicine)',
    description: 'Paracetamol 650mg + Azithromycin 500mg + Pan-D',
    imageUrl: 'https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=800&auto=format&fit=crop&q=80',
    promptNote: 'Prescribed: Paracetamol 650mg TDS x 3 days, Azithromycin 500mg OD x 5 days, Pantoprazole DSR OD before breakfast.'
  },
  {
    id: 'sample-2',
    title: 'Acidity & Allergy Relief Rx',
    doctor: 'Dr. A. Sen, MBBS, General Physician',
    description: 'Cetirizine 10mg + Ranitidine 150mg + Benadryl DR',
    imageUrl: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?w=800&auto=format&fit=crop&q=80',
    promptNote: 'Prescribed: Cetirizine 10mg HS, Ranitidine 150mg BD before food, Benadryl DR syrup 10ml TDS.'
  },
  {
    id: 'sample-3',
    title: 'Hypertension & Vitamin Health Rx',
    doctor: 'Dr. R. Bannerjee, MD (Cardiology)',
    description: 'Amlodipine 5mg + Vitamin D3 60K + Evion 400mg',
    imageUrl: 'https://images.unsplash.com/photo-1588776814546-1ffcf47267a5?w=800&auto=format&fit=crop&q=80',
    promptNote: 'Prescribed: Amlodipine 5mg OD morning, Calcirol 60K softgel once weekly, Evion 400mg once daily.'
  }
];

export const PrescriptionScannerModal: React.FC = () => {
  const { 
    prescriptionModalOpen, 
    setPrescriptionModalOpen, 
    medicines, 
    addToCart, 
    addToast 
  } = useApp();

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [selectedFileMime, setSelectedFileMime] = useState<string>('image/jpeg');
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<PrescriptionAnalysisResult | null>(null);
  const [addedIds, setAddedIds] = useState<string[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!prescriptionModalOpen) return null;

  const handleFileUpload = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    setSelectedFileMime(file.type);
    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSelectedImage(base64);
      setError(null);
      setAnalysisResult(null);
      setAddedIds([]);
      runAnalysis(base64, file.type);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (sample: typeof SAMPLE_PRESCRIPTIONS[0]) => {
    setError(null);
    setAnalysisResult(null);
    setAddedIds([]);
    setLoading(true);

    try {
      // Convert sample image URL to base64
      const response = await fetch(sample.imageUrl);
      const blob = await response.blob();
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        setSelectedImage(base64data);
        setSelectedFileMime(blob.type || 'image/jpeg');
        runAnalysis(base64data, blob.type || 'image/jpeg');
      };
      reader.readAsDataURL(blob);
    } catch (err: any) {
      setLoading(false);
      setError('Failed to load sample image. Please try uploading an image.');
    }
  };

  const runAnalysis = async (base64: string, mime: string) => {
    setLoading(true);
    setError(null);

    try {
      const result = await analyzePrescriptionImage(base64, mime);
      setAnalysisResult(result);
      addToast('Prescription analyzed successfully by Gemini Vision AI!', 'success');
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Could not analyze prescription. Please ensure the image is clear and readable.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSingleItem = (medId: string) => {
    const med = medicines.find(m => m.id === medId);
    if (med) {
      addToCart(med, 1);
      setAddedIds(prev => [...prev, medId]);
    }
  };

  const handleAddAllMatched = () => {
    if (!analysisResult?.prescribedMedicines) return;

    let count = 0;
    analysisResult.prescribedMedicines.forEach(item => {
      if (item.matchedCatalogId) {
        const med = medicines.find(m => m.id === item.matchedCatalogId);
        if (med) {
          addToCart(med, 1);
          setAddedIds(prev => [...prev, med.id]);
          count++;
        }
      }
    });

    if (count > 0) {
      addToast(`Added ${count} prescribed medicines to your cart!`, 'success');
    }
  };

  const resetModal = () => {
    setSelectedImage(null);
    setAnalysisResult(null);
    setError(null);
    setAddedIds([]);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className="relative bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-200"
        id="prescription-scanner-modal"
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white">AI Prescription Scanner</h3>
                <span className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Gemini 3.7 Vision
                </span>
              </div>
              <p className="text-xs text-emerald-200/80">
                Upload handwritten or printed Rx. AI extracts medicines & adds directly to your cart.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPrescriptionModalOpen(false);
              resetModal();
            }}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {/* UPLOAD / SAMPLE SELECTION AREA */}
          {!selectedImage ? (
            <div className="space-y-6">
              {/* Drag and Drop Zone */}
              <div
                onDragOver={(e) => e.preventDefault()}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className="border-2 border-dashed border-emerald-300 hover:border-emerald-500 bg-emerald-50/40 hover:bg-emerald-50/80 transition-all rounded-3xl p-8 sm:p-12 text-center cursor-pointer group"
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                  className="hidden"
                />
                
                <div className="w-16 h-16 rounded-2xl bg-white text-emerald-600 shadow-md group-hover:scale-110 group-hover:shadow-lg transition-all flex items-center justify-center mx-auto mb-4 border border-emerald-100">
                  <Upload className="w-8 h-8" />
                </div>

                <h4 className="text-base sm:text-lg font-bold text-slate-900 mb-1">
                  Upload Doctor's Prescription or Medicine Box
                </h4>
                <p className="text-xs text-slate-500 max-w-md mx-auto mb-4">
                  Drag & drop your prescription image here, or click to browse. Supports JPG, PNG, WEBP.
                </p>

                <div className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs group-hover:bg-emerald-700 transition-colors shadow-sm">
                  <FileText className="w-4 h-4" />
                  <span>Choose Image from Device</span>
                </div>
              </div>

              {/* Sample Prescriptions (Instant Testing) */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>Or Test Instantly with Sample Prescriptions</span>
                  </div>
                  <span className="text-[11px] text-slate-400">1-click AI demo</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {SAMPLE_PRESCRIPTIONS.map((sample) => (
                    <button
                      key={sample.id}
                      onClick={() => handleSampleSelect(sample)}
                      disabled={loading}
                      className="text-left p-3.5 rounded-2xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/50 bg-white transition-all shadow-2xs group flex flex-col justify-between cursor-pointer"
                    >
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <span className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                            {sample.title}
                          </span>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded font-medium">
                            Demo
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 leading-snug line-clamp-2">
                          {sample.description}
                        </p>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] text-emerald-700 font-bold">
                        <span>Scan this Sample</span>
                        <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            /* ACTIVE SCAN PREVIEW & RESULTS */
            <div className="space-y-6">
              {/* Image Preview & Scan Toolbar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3 rounded-2xl bg-slate-100 border border-slate-200">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-12 h-12 rounded-xl overflow-hidden bg-white border border-slate-200 shrink-0">
                    <img
                      src={selectedImage}
                      alt="Scanned Prescription"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-900 truncate">Prescription Image Loaded</span>
                      {analysisResult && (
                        <span className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Processed
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500 truncate">
                      {loading ? 'AI is extracting medicine text...' : 'Ready for verification & cart addition'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                  <button
                    onClick={() => runAnalysis(selectedImage, selectedFileMime)}
                    disabled={loading}
                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors disabled:opacity-50 cursor-pointer"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
                    <span>Re-Analyze</span>
                  </button>
                  <button
                    onClick={resetModal}
                    className="px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                  >
                    Upload Another
                  </button>
                </div>
              </div>

              {/* LOADING STATE */}
              {loading && (
                <div className="py-12 text-center space-y-4 bg-emerald-50/50 rounded-3xl border border-emerald-200/60 p-8">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-200 animate-ping" />
                    <div className="relative w-16 h-16 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg">
                      <Sparkles className="w-8 h-8 animate-spin" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-bold text-slate-900 text-base">Gemini 3.7 Flash is analyzing your prescription...</h4>
                    <p className="text-xs text-slate-500 max-w-md mx-auto">
                      Reading doctor's notes, matching active chemical salts, checking dosages, and finding items in MedyFay's catalog.
                    </p>
                  </div>
                </div>
              )}

              {/* ERROR STATE */}
              {error && (
                <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <strong className="block font-bold">Analysis Warning</strong>
                    <span>{error}</span>
                  </div>
                  <button
                    onClick={() => runAnalysis(selectedImage, selectedFileMime)}
                    className="px-3 py-1 bg-rose-600 text-white rounded-lg font-bold text-xs hover:bg-rose-700 cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* ANALYSIS SUCCESS RESULTS */}
              {analysisResult && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-200">
                  
                  {/* Summary Bar */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Patient / Case</span>
                      <span className="font-bold text-slate-900 text-sm">{analysisResult.patientName || 'Patient Record'}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Prescribing Physician</span>
                      <span className="font-bold text-slate-900 text-sm">{analysisResult.doctorName || 'Verified Practitioner'}</span>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200">
                      <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block">Diagnosis / Symptoms</span>
                      <span className="font-bold text-emerald-800 text-sm truncate block">{analysisResult.diagnosis || 'Clinical Prescription'}</span>
                    </div>
                  </div>

                  {/* Medicines Table & Match Cards */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-slate-900 text-sm sm:text-base flex items-center gap-2">
                        <Pill className="w-4 h-4 text-emerald-600" />
                        <span>Prescribed Medicines ({analysisResult.prescribedMedicines?.length || 0})</span>
                      </h4>

                      {analysisResult.prescribedMedicines?.some(m => m.matchedCatalogId) && (
                        <button
                          onClick={handleAddAllMatched}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" />
                          <span>Add All Matched to Cart</span>
                        </button>
                      )}
                    </div>

                    <div className="space-y-2.5">
                      {analysisResult.prescribedMedicines?.map((item, index) => {
                        const isAdded = item.matchedCatalogId ? addedIds.includes(item.matchedCatalogId) : false;
                        const catalogMed = item.matchedCatalogId 
                          ? medicines.find(m => m.id === item.matchedCatalogId)
                          : null;

                        return (
                          <div 
                            key={index}
                            className={`p-4 rounded-2xl border transition-all ${
                              catalogMed 
                                ? 'bg-white border-emerald-200 shadow-2xs' 
                                : 'bg-slate-50/80 border-slate-200'
                            }`}
                          >
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                              {/* Left details */}
                              <div className="space-y-1">
                                <div className="flex items-center gap-2 flex-wrap">
                                  <span className="font-extrabold text-slate-900 text-sm">
                                    {item.medicineName}
                                  </span>
                                  {item.dosage && (
                                    <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px] font-semibold">
                                      {item.dosage}
                                    </span>
                                  )}
                                  {catalogMed ? (
                                    <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                                      <Check className="w-3 h-3 text-emerald-600" /> In MedyFay Catalog
                                    </span>
                                  ) : (
                                    <span className="bg-amber-100 text-amber-800 text-[10px] font-semibold px-2 py-0.5 rounded-full">
                                      Generic substitute suggested
                                    </span>
                                  )}
                                </div>

                                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                                  {item.frequency && (
                                    <span>Frequency: <strong className="text-slate-800">{item.frequency}</strong></span>
                                  )}
                                  {item.duration && (
                                    <span>Duration: <strong className="text-slate-800">{item.duration}</strong></span>
                                  )}
                                  {item.instructions && (
                                    <span>Instructions: <strong className="text-emerald-700">{item.instructions}</strong></span>
                                  )}
                                </div>
                              </div>

                              {/* Right Match & Add CTA */}
                              <div className="shrink-0 flex items-center gap-3 justify-between sm:justify-end border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100">
                                {catalogMed ? (
                                  <div className="flex items-center gap-3">
                                    <div className="text-right">
                                      <span className="font-extrabold text-slate-900 text-sm">₹{catalogMed.price}</span>
                                      <span className="block text-[10px] text-slate-400 line-through">₹{catalogMed.originalPrice || catalogMed.price + 15}</span>
                                    </div>
                                    <button
                                      onClick={() => handleAddSingleItem(catalogMed.id)}
                                      disabled={isAdded}
                                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-colors flex items-center gap-1 cursor-pointer ${
                                        isAdded 
                                          ? 'bg-emerald-100 text-emerald-800 cursor-default' 
                                          : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                      }`}
                                    >
                                      {isAdded ? (
                                        <>
                                          <Check className="w-3.5 h-3.5" />
                                          <span>Added</span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3.5 h-3.5" />
                                          <span>Add to Cart</span>
                                        </>
                                      )}
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-slate-400 italic">Pharmacist will verify substitute</span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Pharmacist Advice & Precautions */}
                  {analysisResult.pharmacistAdvice && analysisResult.pharmacistAdvice.length > 0 && (
                    <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-2">
                      <div className="font-bold text-emerald-900 flex items-center gap-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-600" />
                        <span>AI Pharmacist Safety Insights</span>
                      </div>
                      <ul className="space-y-1 text-emerald-950/90 pl-5 list-disc">
                        {analysisResult.pharmacistAdvice.map((adv, i) => (
                          <li key={i}>{adv}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Warnings if any */}
                  {analysisResult.warnings && analysisResult.warnings.length > 0 && (
                    <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs space-y-1">
                      <div className="font-bold text-amber-900 flex items-center gap-1.5">
                        <AlertTriangle className="w-4 h-4 text-amber-600" />
                        <span>Important Medical Notes</span>
                      </div>
                      <ul className="space-y-0.5 text-amber-900 pl-5 list-disc">
                        {analysisResult.warnings.map((w, i) => (
                          <li key={i}>{w}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* Bottom Footer Actions */}
                  <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="text-[11px] text-slate-500">
                      Our licensed pharmacists perform physical verification of all prescription orders prior to dispatch.
                    </div>
                    <button
                      onClick={() => setPrescriptionModalOpen(false)}
                      className="w-full sm:w-auto px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
                    >
                      Done & Continue Shopping
                    </button>
                  </div>

                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
