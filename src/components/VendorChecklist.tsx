import React, { useState } from 'react';
import { EventPlan, VendorItem, VendorStatus } from '../types/event';
import { formatINR } from '../utils/formatters';
import {
  Users,
  PlusCircle,
  Phone,
  Mail,
  HelpCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Check,
  Search,
  Filter,
} from 'lucide-react';

interface VendorChecklistProps {
  event: EventPlan;
  onUpdateVendors: (vendors: VendorItem[]) => void;
}

export const VendorChecklist: React.FC<VendorChecklistProps> = ({
  event,
  onUpdateVendors,
}) => {
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modal states
  const [showModal, setShowModal] = useState(false);
  const [editingVendorId, setEditingVendorId] = useState<string | null>(null);

  // Form State
  const [formCategory, setFormCategory] = useState('Venue');
  const [formServiceTitle, setFormServiceTitle] = useState('');
  const [formVendorName, setFormVendorName] = useState('');
  const [formContactPerson, setFormContactPerson] = useState('');
  const [formPhoneOrEmail, setFormPhoneOrEmail] = useState('');
  const [formEstimatedCost, setFormEstimatedCost] = useState(100000);
  const [formFinalCost, setFormFinalCost] = useState(0);
  const [formStatus, setFormStatus] = useState<VendorStatus>('Not Contacted');
  const [formNotes, setFormNotes] = useState('');
  const [formQuestions, setFormQuestions] = useState<string[]>([]);
  const [newQuestionInput, setNewQuestionInput] = useState('');

  const vendors = event.vendorChecklist || [];
  const totalVendors = vendors.length;
  const bookedCount = vendors.filter((v) => v.status === 'Booked' || v.status === 'Completed').length;
  const totalCommitted = vendors.reduce((acc, curr) => acc + (curr.finalCostINR > 0 ? curr.finalCostINR : curr.estimatedCostINR), 0);

  // Categories list
  const uniqueCategories = Array.from(new Set(vendors.map((v) => v.category)));

  const handleOpenAdd = () => {
    setEditingVendorId(null);
    setFormCategory('Venue');
    setFormServiceTitle('');
    setFormVendorName('');
    setFormContactPerson('');
    setFormPhoneOrEmail('');
    setFormEstimatedCost(100000);
    setFormFinalCost(0);
    setFormStatus('Not Contacted');
    setFormNotes('');
    setFormQuestions([]);
    setShowModal(true);
  };

  const handleOpenEdit = (v: VendorItem) => {
    setEditingVendorId(v.id);
    setFormCategory(v.category);
    setFormServiceTitle(v.serviceTitle);
    setFormVendorName(v.vendorName || '');
    setFormContactPerson(v.contactPerson || '');
    setFormPhoneOrEmail(v.phoneOrEmail || '');
    setFormEstimatedCost(v.estimatedCostINR || 0);
    setFormFinalCost(v.finalCostINR || 0);
    setFormStatus(v.status);
    setFormNotes(v.notes || '');
    setFormQuestions(v.suggestedQuestions || []);
    setShowModal(true);
  };

  const handleToggleComplete = (id: string) => {
    const updated = vendors.map((v) =>
      v.id === id ? { ...v, completed: !v.completed, status: !v.completed ? ('Completed' as const) : v.status } : v
    );
    onUpdateVendors(updated);
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this vendor record?')) {
      const updated = vendors.filter((v) => v.id !== id);
      onUpdateVendors(updated);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formServiceTitle.trim()) return;

    if (editingVendorId) {
      // Edit existing
      const updated = vendors.map((v) => {
        if (v.id === editingVendorId) {
          return {
            ...v,
            category: formCategory,
            serviceTitle: formServiceTitle.trim(),
            vendorName: formVendorName.trim(),
            contactPerson: formContactPerson.trim(),
            phoneOrEmail: formPhoneOrEmail.trim(),
            estimatedCostINR: Number(formEstimatedCost) || 0,
            finalCostINR: Number(formFinalCost) || 0,
            status: formStatus,
            notes: formNotes.trim(),
            suggestedQuestions: formQuestions,
            completed: formStatus === 'Completed',
          };
        }
        return v;
      });
      onUpdateVendors(updated);
    } else {
      // Add new
      const newVendor: VendorItem = {
        id: `v-custom-${Date.now()}`,
        category: formCategory,
        serviceTitle: formServiceTitle.trim(),
        vendorName: formVendorName.trim(),
        contactPerson: formContactPerson.trim(),
        phoneOrEmail: formPhoneOrEmail.trim(),
        estimatedCostINR: Number(formEstimatedCost) || 0,
        finalCostINR: Number(formFinalCost) || 0,
        status: formStatus,
        notes: formNotes.trim(),
        suggestedQuestions: formQuestions.length > 0 ? formQuestions : [
          'What is included in the baseline package?',
          'What are the payment milestone dates?',
          'What is your cancellation and contingency policy?',
        ],
        completed: formStatus === 'Completed',
      };
      onUpdateVendors([...vendors, newVendor]);
    }

    setShowModal(false);
  };

  const handleAddQuestion = () => {
    if (newQuestionInput.trim()) {
      setFormQuestions([...formQuestions, newQuestionInput.trim()]);
      setNewQuestionInput('');
    }
  };

  // Filtered list
  const filteredVendors = vendors.filter((v) => {
    if (filterCategory !== 'all' && v.category.toLowerCase() !== filterCategory.toLowerCase()) {
      return false;
    }
    if (filterStatus !== 'all' && v.status.toLowerCase() !== filterStatus.toLowerCase()) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.serviceTitle.toLowerCase().includes(q) ||
        v.vendorName.toLowerCase().includes(q) ||
        v.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (status: VendorStatus) => {
    switch (status) {
      case 'Booked':
      case 'Completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'In Discussion':
      case 'Quote Received':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="bg-white p-6 rounded-2xl border border-[#2A1625]/10 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="font-serif text-2xl font-bold text-[#2A1625]">
            Vendor Operations & Directory
          </h2>
          <p className="text-xs text-[#2A1625]/60 mt-1">
            Track vendor negotiations, quote comparisons, contacts, and contract execution
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenAdd}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs sm:text-sm font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg shadow-sm transition-colors"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add New Vendor</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm">
          <span className="text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            Booking Completion
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1625] font-mono tabular-nums mt-2">
            {bookedCount} of {totalVendors}
          </div>
          <p className="text-xs text-[#2A1625]/60 mt-1">
            {totalVendors > 0 ? Math.round((bookedCount / totalVendors) * 100) : 0}% vendors confirmed
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm">
          <span className="text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            Committed Vendor Spend
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#2A1625] font-mono tabular-nums mt-2">
            {formatINR(totalCommitted, true)}
          </div>
          <p className="text-xs text-[#2A1625]/60 mt-1 font-mono">
            {formatINR(totalCommitted)} across active contracts
          </p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-[#2A1625]/10 shadow-sm">
          <span className="text-xs font-semibold text-[#2A1625]/60 uppercase tracking-wider">
            Open Inquiries
          </span>
          <div className="font-serif text-2xl sm:text-3xl font-bold text-[#E05A47] font-mono tabular-nums mt-2">
            {totalVendors - bookedCount}
          </div>
          <p className="text-xs text-[#2A1625]/60 mt-1">
            Pending negotiation or quote approvals
          </p>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white p-4 rounded-xl border border-[#2A1625]/10 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-[#2A1625]/40 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search vendor or service..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs sm:text-sm border border-[#2A1625]/15 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#2A1625]/15 rounded-lg text-[#2A1625] focus:outline-none"
          >
            <option value="all">All Categories</option>
            {uniqueCategories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white border border-[#2A1625]/15 rounded-lg text-[#2A1625] focus:outline-none"
          >
            <option value="all">All Statuses</option>
            <option value="not contacted">Not Contacted</option>
            <option value="in discussion">In Discussion</option>
            <option value="quote received">Quote Received</option>
            <option value="booked">Booked</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Vendor Cards List */}
      <div className="space-y-4">
        {filteredVendors.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border border-[#2A1625]/10 text-center text-sm text-[#2A1625]/60">
            No vendors found matching your filter.
          </div>
        ) : (
          filteredVendors.map((vendor) => (
            <div
              key={vendor.id}
              className={`bg-white rounded-xl border p-5 transition-all shadow-sm ${
                vendor.completed
                  ? 'border-emerald-200/60 bg-emerald-50/10'
                  : 'border-[#2A1625]/10 hover:border-[#2A1625]/25'
              }`}
            >
              <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                
                {/* Left Column: Service Details & Status */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                      {vendor.category}
                    </span>
                    <h3 className="font-serif text-lg font-bold text-[#2A1625]">
                      {vendor.serviceTitle}
                    </h3>
                    <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${getStatusBadge(vendor.status)}`}>
                      {vendor.status}
                    </span>
                  </div>

                  {vendor.vendorName ? (
                    <p className="text-sm font-semibold text-[#2A1625]/90 flex items-center gap-1.5">
                      <span>Business: {vendor.vendorName}</span>
                      {vendor.contactPerson && (
                        <span className="text-xs font-normal text-[#2A1625]/60">({vendor.contactPerson})</span>
                      )}
                    </p>
                  ) : (
                    <p className="text-xs text-[#2A1625]/50 italic">
                      No specific vendor assigned yet
                    </p>
                  )}

                  {vendor.phoneOrEmail && (
                    <div className="flex items-center gap-4 text-xs text-[#2A1625]/70">
                      <span className="flex items-center gap-1">
                        <Phone className="w-3.5 h-3.5 text-[#E05A47]" />
                        <span>{vendor.phoneOrEmail}</span>
                      </span>
                    </div>
                  )}

                  {vendor.notes && (
                    <p className="text-xs text-[#2A1625]/70 bg-[#FAF7F2] p-2.5 rounded-lg border border-[#2A1625]/10">
                      <span className="font-semibold text-[#2A1625]">Organizer Note: </span>
                      {vendor.notes}
                    </p>
                  )}

                  {/* Gemini Suggested Questions to Ask */}
                  {vendor.suggestedQuestions && vendor.suggestedQuestions.length > 0 && (
                    <div className="pt-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-[#2A1625]/70 mb-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-[#E05A47]" />
                        <span>AI Vendor Screening Questions to Ask:</span>
                      </div>
                      <ul className="space-y-1 text-xs text-[#2A1625]/80 list-disc list-inside pl-1">
                        {vendor.suggestedQuestions.map((q, qIdx) => (
                          <li key={qIdx} className="leading-relaxed">
                            {q}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Right Column: Pricing & Quick Actions */}
                <div className="flex lg:flex-col items-center lg:items-end justify-between gap-3 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-[#2A1625]/10">
                  <div className="text-right">
                    <span className="text-[11px] text-[#2A1625]/50 block">Financial Commitment</span>
                    <p className="font-serif text-lg font-bold text-[#2A1625] font-mono tabular-nums">
                      {formatINR(vendor.finalCostINR > 0 ? vendor.finalCostINR : vendor.estimatedCostINR)}
                    </p>
                    {vendor.finalCostINR > 0 && vendor.estimatedCostINR > 0 && (
                      <p className="text-[11px] text-[#2A1625]/50 font-mono">
                        Est: {formatINR(vendor.estimatedCostINR, true)}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleComplete(vendor.id)}
                      className={`px-3 py-1.5 text-xs font-medium rounded-lg border flex items-center gap-1.5 transition-colors ${
                        vendor.completed
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-[#2A1625] border-[#2A1625]/20 hover:border-[#2A1625]/40'
                      }`}
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>{vendor.completed ? 'Contract Completed' : 'Mark Done'}</span>
                    </button>

                    <button
                      onClick={() => handleOpenEdit(vendor)}
                      className="p-1.5 text-[#2A1625]/60 hover:text-[#2A1625] hover:bg-slate-100 rounded-lg transition-colors"
                      title="Edit vendor"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>

                    <button
                      onClick={() => handleDelete(vendor.id)}
                      className="p-1.5 text-[#2A1625]/30 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete vendor"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                </div>

              </div>
            </div>
          ))
        )}
      </div>

      {/* Add / Edit Vendor Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full shadow-2xl border border-[#2A1625]/15 p-6 animate-in fade-in duration-150 max-h-[90vh] overflow-y-auto">
            <h3 className="font-serif text-lg font-bold text-[#2A1625] mb-4">
              {editingVendorId ? 'Edit Vendor Record' : 'Add New Vendor Service'}
            </h3>
            
            <form onSubmit={handleSaveForm} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Category *
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none"
                  >
                    <option value="Venue">Venue</option>
                    <option value="Catering">Catering</option>
                    <option value="Decoration">Decoration & Florals</option>
                    <option value="Photography">Photography & Film</option>
                    <option value="Entertainment">Entertainment & Sound</option>
                    <option value="Transport">Transport & Logistics</option>
                    <option value="Attire">Attire & Styling</option>
                    <option value="Bakery">Bakery & Cake</option>
                    <option value="Stationery">Invitations & Stationery</option>
                    <option value="Sanitation">Sanitation & Security</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Contract Status *
                  </label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as VendorStatus)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none"
                  >
                    <option value="Not Contacted">Not Contacted</option>
                    <option value="In Discussion">In Discussion</option>
                    <option value="Quote Received">Quote Received</option>
                    <option value="Booked">Booked</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Service / Role Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Royal Shehnai Ensemble or Drone Pilot"
                  value={formServiceTitle}
                  onChange={(e) => setFormServiceTitle(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Vendor Business Name
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Golden Flute Artists"
                    value={formVendorName}
                    onChange={(e) => setFormVendorName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Contact Person
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Ramesh Bhai"
                    value={formContactPerson}
                    onChange={(e) => setFormContactPerson(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Phone / Email / WhatsApp
                </label>
                <input
                  type="text"
                  placeholder="+91 98765 43210 or bookings@vendor.com"
                  value={formPhoneOrEmail}
                  onChange={(e) => setFormPhoneOrEmail(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none focus:ring-2 focus:ring-[#E05A47]/40"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Estimated Cost (INR)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formEstimatedCost}
                    onChange={(e) => setFormEstimatedCost(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] font-mono tabular-nums focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                    Final Negotiated Cost (INR)
                  </label>
                  <input
                    type="number"
                    step="1000"
                    min="0"
                    value={formFinalCost}
                    onChange={(e) => setFormFinalCost(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] font-mono tabular-nums focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#2A1625] uppercase tracking-wider mb-1">
                  Negotiation Notes / Contract Terms
                </label>
                <textarea
                  rows={2}
                  placeholder="Advance paid, delivery deadline, cancellation clause..."
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-[#2A1625]/20 rounded-lg text-[#2A1625] focus:outline-none resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#2A1625]/10">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 text-xs font-medium text-[#2A1625]/70 hover:text-[#2A1625]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-semibold text-white bg-[#E05A47] hover:bg-[#d44e3b] rounded-lg transition-colors"
                >
                  Save Vendor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
