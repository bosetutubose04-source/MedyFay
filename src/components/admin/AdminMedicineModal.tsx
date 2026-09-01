import React, { useState, useEffect } from 'react';
import { Medicine, Category } from '../../types';
import { CATEGORIES } from '../../data/medicines';
import { X, Plus, Trash2, Sparkles, Image as ImageIcon, AlertCircle } from 'lucide-react';

interface AdminMedicineModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (med: Medicine) => void;
  medicineToEdit?: Medicine | null;
}

const SAMPLE_IMAGES = [
  { label: 'Tablet / Strip', url: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80' },
  { label: 'Syrup / Bottle', url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=600&auto=format&fit=crop&q=80' },
  { label: 'Capsules', url: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=600&auto=format&fit=crop&q=80' },
  { label: 'Ointment / Gel', url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80' },
  { label: 'Inhaler / Device', url: 'https://images.unsplash.com/photo-1584017911766-d451b3d0e843?w=600&auto=format&fit=crop&q=80' },
  { label: 'Vitamins & Zinc', url: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=600&auto=format&fit=crop&q=80' },
];

export const AdminMedicineModal: React.FC<AdminMedicineModalProps> = ({
  isOpen,
  onClose,
  onSave,
  medicineToEdit,
}) => {
  const [formData, setFormData] = useState<Partial<Medicine>>({
    name: '',
    genericName: '',
    category: 'Pain & Fever',
    price: 99,
    originalPrice: 120,
    inStock: true,
    prescriptionRequired: false,
    dosage: '1 tablet twice daily after meals',
    packSize: '10 Tablets Strip',
    image: SAMPLE_IMAGES[0].url,
    description: '',
    uses: ['Fever', 'Pain Relief'],
    sideEffects: ['Mild nausea', 'Drowsiness'],
    manufacturer: 'MedyFay Healthcare Ltd',
    rating: 4.8,
    reviewCount: 42,
  });

  const [useInput, setUseInput] = useState('');
  const [sideEffectInput, setSideEffectInput] = useState('');

  useEffect(() => {
    if (medicineToEdit) {
      setFormData(medicineToEdit);
    } else {
      setFormData({
        id: `med-${Date.now()}`,
        name: '',
        genericName: '',
        category: 'Pain & Fever',
        price: 99,
        originalPrice: 120,
        inStock: true,
        prescriptionRequired: false,
        dosage: '1 tablet daily after food',
        packSize: '10 Tablets Strip',
        image: SAMPLE_IMAGES[0].url,
        description: 'Standard clinical grade pharmaceutical formulation.',
        uses: ['Fever', 'Body Ache'],
        sideEffects: ['Consult physician if symptoms persist'],
        manufacturer: 'MedyFay Certified Pharma',
        rating: 4.8,
        reviewCount: 12,
      });
    }
  }, [medicineToEdit, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const finalMed: Medicine = {
      id: formData.id || `med-${Date.now()}`,
      name: formData.name.trim(),
      genericName: formData.genericName?.trim() || formData.name.trim(),
      category: (formData.category as Category) || 'Pain & Fever',
      price: Number(formData.price) || 50,
      originalPrice: formData.originalPrice ? Number(formData.originalPrice) : undefined,
      inStock: formData.inStock ?? true,
      prescriptionRequired: formData.prescriptionRequired ?? false,
      dosage: formData.dosage?.trim() || 'As directed by physician',
      packSize: formData.packSize?.trim() || '1 Strip',
      image: formData.image || SAMPLE_IMAGES[0].url,
      description: formData.description?.trim() || 'High quality approved pharmaceutical product.',
      uses: formData.uses && formData.uses.length > 0 ? formData.uses : ['General Healthcare'],
      sideEffects: formData.sideEffects || [],
      manufacturer: formData.manufacturer?.trim() || 'MedyFay Pharma',
      rating: Number(formData.rating) || 4.8,
      reviewCount: Number(formData.reviewCount) || 25,
    };

    onSave(finalMed);
    onClose();
  };

  const handleAddUse = () => {
    if (useInput.trim()) {
      setFormData(prev => ({
        ...prev,
        uses: [...(prev.uses || []), useInput.trim()]
      }));
      setUseInput('');
    }
  };

  const handleRemoveUse = (index: number) => {
    setFormData(prev => ({
      ...prev,
      uses: (prev.uses || []).filter((_, i) => i !== index)
    }));
  };

  const handleAddSideEffect = () => {
    if (sideEffectInput.trim()) {
      setFormData(prev => ({
        ...prev,
        sideEffects: [...(prev.sideEffects || []), sideEffectInput.trim()]
      }));
      setSideEffectInput('');
    }
  };

  const handleRemoveSideEffect = (index: number) => {
    setFormData(prev => ({
      ...prev,
      sideEffects: (prev.sideEffects || []).filter((_, i) => i !== index)
    }));
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              {medicineToEdit ? 'Edit Medicine Details' : 'Add New Medicine to Catalog'}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Live updates to Cloud SQL & Firestore database inventory
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          
          {/* Basic Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Brand / Trade Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Dolo 650mg Tablet"
                value={formData.name || ''}
                onChange={e => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Generic / Salt Composition <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Paracetamol IP 650mg"
                value={formData.genericName || ''}
                onChange={e => setFormData({ ...formData, genericName: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600"
              />
            </div>
          </div>

          {/* Category & Pack Size */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <select
                value={formData.category || 'Pain & Fever'}
                onChange={e => setFormData({ ...formData, category: e.target.value as Category })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
              >
                {CATEGORIES.filter(c => c.id !== 'All').map(c => (
                  <option key={c.id} value={c.id}>{c.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Pack Size / Packaging
              </label>
              <input
                type="text"
                placeholder="e.g. Strip of 15 Tablets, 100ml Bottle"
                value={formData.packSize || ''}
                onChange={e => setFormData({ ...formData, packSize: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Pricing & Manufacturer */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <input
                type="number"
                required
                min="1"
                step="0.5"
                value={formData.price ?? 99}
                onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 font-bold text-emerald-800"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                MRP / Original Price (₹)
              </label>
              <input
                type="number"
                min="1"
                step="0.5"
                value={formData.originalPrice ?? ''}
                onChange={e => setFormData({ ...formData, originalPrice: parseFloat(e.target.value) || undefined })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Micro Labs Ltd"
                value={formData.manufacturer || ''}
                onChange={e => setFormData({ ...formData, manufacturer: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>
          </div>

          {/* Toggles: Stock & Prescription */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-3.5 bg-slate-50 rounded-xl border border-slate-200/80">
            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.inStock ?? true}
                onChange={e => setFormData({ ...formData, inStock: e.target.checked })}
                className="w-4 h-4 text-emerald-600 rounded border-slate-300 focus:ring-emerald-500"
              />
              <div>
                <span className="text-xs font-bold text-slate-800 block">In Stock & Available</span>
                <span className="text-[11px] text-slate-500">Customers can purchase this item</span>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.prescriptionRequired ?? false}
                onChange={e => setFormData({ ...formData, prescriptionRequired: e.target.checked })}
                className="w-4 h-4 text-amber-600 rounded border-slate-300 focus:ring-amber-500"
              />
              <div>
                <span className="text-xs font-bold text-amber-900 block">Rx Prescription Required</span>
                <span className="text-[11px] text-slate-500">Mandates doctor prescription upload</span>
              </div>
            </label>
          </div>

          {/* Dosage & Description */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Recommended Dosage Instructions
              </label>
              <input
                type="text"
                placeholder="e.g. 1 tablet every 6 hours or as advised by physician"
                value={formData.dosage || ''}
                onChange={e => setFormData({ ...formData, dosage: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clinical Description & Indications
              </label>
              <textarea
                rows={2}
                placeholder="Brief clinical description of the medication, mechanisms, and precautions..."
                value={formData.description || ''}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 resize-none"
              />
            </div>
          </div>

          {/* Product Image Selection */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center justify-between">
              <span>Product Image URL</span>
              <span className="text-[11px] text-slate-400 font-normal">Pick preset or paste custom URL</span>
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={formData.image || ''}
                onChange={e => setFormData({ ...formData, image: e.target.value })}
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                placeholder="https://..."
              />
            </div>
            
            {/* Quick preset thumbnail pills */}
            <div className="flex flex-wrap gap-2">
              {SAMPLE_IMAGES.map((img, i) => (
                <button
                  type="button"
                  key={i}
                  onClick={() => setFormData({ ...formData, image: img.url })}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border flex items-center gap-1.5 transition-colors ${
                    formData.image === img.url
                      ? 'bg-emerald-50 border-emerald-500 text-emerald-800 font-bold'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <img src={img.url} alt={img.label} className="w-3.5 h-3.5 rounded object-cover" />
                  <span>{img.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Uses Tags */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Indications & Uses
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={useInput}
                onChange={e => setUseInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddUse(); } }}
                placeholder="e.g. Headaches, Joint Pain, Fever"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddUse}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(formData.uses || []).map((u, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                  {u}
                  <button type="button" onClick={() => handleRemoveUse(i)} className="hover:text-rose-600 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Side Effects */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Known Side Effects
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={sideEffectInput}
                onChange={e => setSideEffectInput(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddSideEffect(); } }}
                placeholder="e.g. Mild stomach upset, Dizziness"
                className="flex-1 px-3 py-1.5 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
              />
              <button
                type="button"
                onClick={handleAddSideEffect}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-semibold cursor-pointer"
              >
                Add
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(formData.sideEffects || []).map((se, i) => (
                <span key={i} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-50 text-rose-800 text-[11px] font-medium border border-rose-200">
                  {se}
                  <button type="button" onClick={() => handleRemoveSideEffect(i)} className="hover:text-rose-600 cursor-pointer">
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* Submit and Actions */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{medicineToEdit ? 'Save Changes' : 'Add to Inventory'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
