import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Medicine, Category } from '../../types';
import { CATEGORIES } from '../../data/medicines';
import { 
  Package, 
  Search, 
  Plus, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Filter,
  FileText,
  AlertCircle
} from 'lucide-react';
import { AdminMedicineModal } from './AdminMedicineModal';

export const AdminInventoryTab: React.FC = () => {
  const { medicines, addMedicine, updateMedicine, deleteMedicine } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'in_stock' | 'out_of_stock'>('all');
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [medicineToEdit, setMedicineToEdit] = useState<Medicine | null>(null);

  // Filter medicines
  const filteredMedicines = medicines.filter(med => {
    const matchesCat = selectedCategory === 'All' || med.category === selectedCategory;
    const matchesStock = 
      stockFilter === 'all' || 
      (stockFilter === 'in_stock' && med.inStock) || 
      (stockFilter === 'out_of_stock' && !med.inStock);
    
    const q = searchQuery.toLowerCase().trim();
    const matchesQuery = !q || 
      med.name.toLowerCase().includes(q) || 
      med.genericName.toLowerCase().includes(q) ||
      med.manufacturer.toLowerCase().includes(q);
    
    return matchesCat && matchesStock && matchesQuery;
  });

  const handleOpenAddModal = () => {
    setMedicineToEdit(null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (med: Medicine) => {
    setMedicineToEdit(med);
    setIsModalOpen(true);
  };

  const handleSaveMedicine = async (med: Medicine) => {
    if (medicineToEdit) {
      await updateMedicine(med.id, med);
    } else {
      await addMedicine(med);
    }
  };

  const handleToggleStock = async (med: Medicine) => {
    await updateMedicine(med.id, { inStock: !med.inStock });
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to remove this medicine from inventory?')) {
      await deleteMedicine(id);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* Top Header & Action Controls */}
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-extrabold text-slate-900 text-base">Medicine Inventory Catalog</h3>
            <p className="text-xs text-slate-500">Manage pharmaceutical inventory, prices, prescriptions & stock status</p>
          </div>

          <button
            onClick={handleOpenAddModal}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-700/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Medicine</span>
          </button>
        </div>

        {/* Search & Filter Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          
          {/* Search */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by brand name, salt composition, company..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-slate-50/50"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={selectedCategory}
            onChange={e => setSelectedCategory(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
          >
            <option value="All">All Categories ({medicines.length})</option>
            {CATEGORIES.filter(c => c.id !== 'All').map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>

          {/* Stock Filter */}
          <select
            value={stockFilter}
            onChange={e => setStockFilter(e.target.value as any)}
            className="px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600 bg-white"
          >
            <option value="all">All Availability Status</option>
            <option value="in_stock">In Stock Only</option>
            <option value="out_of_stock">Out of Stock Alert Only</option>
          </select>

        </div>

      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        
        {filteredMedicines.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <Package className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h4 className="font-bold text-slate-800 text-sm">No medicines found</h4>
            <p className="text-xs text-slate-400 mt-1">Try resetting the filter or add a new medicine.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="py-3.5 px-4">Medicine Item</th>
                  <th className="py-3.5 px-3">Category</th>
                  <th className="py-3.5 px-3">Price (₹)</th>
                  <th className="py-3.5 px-3">Rx Rule</th>
                  <th className="py-3.5 px-3">Stock State</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredMedicines.map(med => (
                  <tr key={med.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    {/* Item */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={med.image}
                          alt={med.name}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                        />
                        <div>
                          <div className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                            <span>{med.name}</span>
                            {med.prescriptionRequired && (
                              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded font-mono font-bold text-[9px]">Rx</span>
                            )}
                          </div>
                          <div className="text-[11px] text-slate-400">{med.genericName} • {med.packSize}</div>
                          <div className="text-[10px] text-slate-500 font-medium">{med.manufacturer}</div>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 font-semibold text-[11px]">
                        {med.category}
                      </span>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <div className="font-extrabold text-slate-900 text-sm">₹{med.price}</div>
                      {med.originalPrice && (
                        <div className="text-[10px] text-slate-400 line-through">₹{med.originalPrice}</div>
                      )}
                    </td>

                    {/* Rx Requirement */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      {med.prescriptionRequired ? (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-[10px] font-bold">
                          Doctor Rx Required
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] font-medium">
                          OTC Free
                        </span>
                      )}
                    </td>

                    {/* Stock State */}
                    <td className="py-3.5 px-3 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleStock(med)}
                        className={`px-3 py-1 rounded-xl text-[11px] font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                          med.inStock
                            ? 'bg-emerald-100 hover:bg-emerald-200 text-emerald-900'
                            : 'bg-rose-100 hover:bg-rose-200 text-rose-900'
                        }`}
                        title="Click to toggle stock state"
                      >
                        {med.inStock ? (
                          <>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700" />
                            <span>In Stock</span>
                          </>
                        ) : (
                          <>
                            <XCircle className="w-3.5 h-3.5 text-rose-700" />
                            <span>Out of Stock</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleOpenEditModal(med)}
                          className="p-2 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-800 rounded-xl transition-colors cursor-pointer"
                          title="Edit Medicine"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(med.id)}
                          className="p-2 bg-slate-100 hover:bg-rose-100 text-slate-700 hover:text-rose-800 rounded-xl transition-colors cursor-pointer"
                          title="Delete Medicine"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Add / Edit Medicine Modal */}
      <AdminMedicineModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveMedicine}
        medicineToEdit={medicineToEdit}
      />

    </div>
  );
};
