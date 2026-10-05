'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { SwipeToConnect } from './SwipeToConnect';
import {
  Truck,
  MapPin,
  Calendar,
  CheckCircle2,
  Navigation,
  Phone,
  ShieldCheck,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function DriverBoard() {
  const {
    user,
    language,
    fpoTransactions,
    advanceFPOTransactionStatus,
    wallets
  } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'assigned' | 'history'>('assigned');
  const [signatureModalTxnId, setSignatureModalTxnId] = useState<string | null>(null);
  const [driverSignatureName, setDriverSignatureName] = useState('');

  // Default driver name matching seed or user session
  const activeDriverName = user?.displayName || 'Suresh Kumar';

  // Filter transactions assigned to this driver
  const assignedJobs = fpoTransactions.filter(t => 
    (t.driverName === activeDriverName || t.driverName === 'Suresh Kumar') &&
    t.status !== 'COMPLETED' && t.status !== 'REJECTED'
  );

  const historyJobs = fpoTransactions.filter(t => 
    (t.driverName === activeDriverName || t.driverName === 'Suresh Kumar') &&
    t.status === 'COMPLETED'
  );

  const handleSignatureSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!signatureModalTxnId || !driverSignatureName) return;

    // Advance status to DELIVERED / COMPLETED
    advanceFPOTransactionStatus(signatureModalTxnId);
    setSignatureModalTxnId(null);
    setDriverSignatureName('');
    alert(language === 'ta' ? 'விநியோகம் உறுதிசெய்யப்பட்டது! எஸ்க்ரோ விடுவிக்கப்பட்டது.' : 'Delivery verified successfully! Escrow cleared.');
  };

  return (
    <div className="space-y-6 animate-fade-in text-foreground">
      
      {/* Driver Header Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-900/30 bg-white dark:bg-[#111714] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-650 flex items-center justify-center">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-earth-400 block">Assigned Vehicle</span>
            <span className="text-sm font-black text-foreground block mt-0.5">TN-59-AX-1234 (Bolero Pickup)</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-900/30 bg-white dark:bg-[#111714] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-earth-400 block">Completed Trips</span>
            <span className="text-sm font-black text-foreground block mt-0.5">{historyJobs.length} dispatches</span>
          </div>
        </div>

        <div className="p-5 rounded-3xl border border-earth-200 dark:border-earth-900/30 bg-white dark:bg-[#111714] shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50/10 text-purple-650 flex items-center justify-center">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[9px] font-black uppercase tracking-wider text-earth-400 block">Driver Ledger Earnings</span>
            <span className="text-sm font-black text-emerald-500 block mt-0.5">₹{(historyJobs.length * 1500).toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Sub tabs switcher */}
      <div className="flex border-b border-earth-200 dark:border-earth-900/30 pb-px">
        <button
          onClick={() => setActiveSubTab('assigned')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
            activeSubTab === 'assigned'
              ? 'border-teal-500 text-teal-650 font-black'
              : 'border-transparent text-earth-455 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'ஒதுக்கப்பட்ட பயணங்கள்' : 'Active Dispatches'} ({assignedJobs.length})
        </button>
        <button
          onClick={() => setActiveSubTab('history')}
          className={`pb-3 px-4 font-bold text-xs border-b-2 transition-all cursor-pointer bg-transparent border-0 ${
            activeSubTab === 'history'
              ? 'border-teal-500 text-teal-650 font-black'
              : 'border-transparent text-earth-455 hover:text-foreground'
          }`}
        >
          {language === 'ta' ? 'பயண வரலாறு' : 'Dispatch History'} ({historyJobs.length})
        </button>
      </div>

      {/* Main List */}
      <div className="space-y-4">
        {activeSubTab === 'assigned' && (
          assignedJobs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-earth-200 dark:border-earth-855 bg-white dark:bg-[#111714] text-earth-400 font-bold text-xs">
              No active deliveries assigned to you at the moment.
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {assignedJobs.map(txn => {
                const isAccepted = ['PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(txn.status);
                return (
                  <div key={txn.id} className="p-5 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200 dark:border-earth-850 shadow-xs space-y-4 text-left">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-earth-100 dark:border-earth-900/10 pb-3">
                      <div>
                        <span className="font-mono text-xs font-black text-teal-650 block">{txn.id}</span>
                        <h4 className="text-sm font-black text-foreground mt-0.5">{txn.cropName} - {txn.quantity.toLocaleString()} kg</h4>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider bg-teal-500/10 text-teal-600 dark:text-teal-400">
                          {txn.status}
                        </span>
                        
                        {/* Status advancement actions for driver */}
                        {txn.status === 'LOGISTICS_ASSIGNED' && (
                          <button
                            onClick={() => advanceFPOTransactionStatus(txn.id)}
                            className="h-8 px-4 rounded-xl bg-teal-650 hover:bg-teal-700 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>Accept Dispatch Trip</span>
                          </button>
                        )}

                        {txn.status === 'PICKUP' && (
                          <button
                            onClick={() => advanceFPOTransactionStatus(txn.id)}
                            className="h-8 px-4 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>Start Transit (Loaded)</span>
                          </button>
                        )}

                        {txn.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => advanceFPOTransactionStatus(txn.id)}
                            className="h-8 px-4 rounded-xl bg-purple-650 hover:bg-purple-700 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <span>Mark Arrived / Delivered</span>
                          </button>
                        )}

                        {txn.status === 'DELIVERED' && (
                          <button
                            onClick={() => setSignatureModalTxnId(txn.id)}
                            className="h-8 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-[10px] cursor-pointer border-0 shadow-xs flex items-center gap-1.5 transition-colors"
                          >
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Confirm Buyer OTP / Signature</span>
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-semibold">
                      <div className="p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 rounded-xl">
                        <span className="text-[9px] text-earth-450 uppercase block font-bold">Pick-Up Hub (FPO)</span>
                        <span className="text-foreground block mt-1">📍 Madurai FPO Cooperative, Melur Hub</span>
                        <span className="text-[10px] text-earth-450 block mt-0.5">📞 +91 94432 10987</span>
                      </div>
                      <div className="p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 rounded-xl">
                        <span className="text-[9px] text-earth-450 uppercase block font-bold">Delivery Destination (Buyer)</span>
                        <span className="text-foreground block mt-1">📍 {txn.buyerName} Wholesale Warehouse</span>
                        <span className="text-[10px] text-earth-450 block mt-0.5">📞 +91 95555 12345</span>
                      </div>
                      <div className="p-3 bg-earth-50/50 dark:bg-earth-950/20 border border-earth-150 rounded-xl">
                        <span className="text-[9px] text-earth-450 uppercase block font-bold">Trip Financial Details</span>
                        <span className="text-teal-650 font-black block mt-1">Allowance: ₹1,500 (Escrow cleared)</span>
                        <span className="text-[10px] text-earth-455 block mt-0.5">Toll & Fuel Included</span>
                      </div>
                    </div>

                    {/* Progress tracking visual stages for Driver */}
                    <div className="grid grid-cols-4 gap-2 pt-2 text-[8px] font-black uppercase text-center font-mono tracking-wider">
                      {[
                        { label: 'Assigned', active: ['LOGISTICS_ASSIGNED', 'PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(txn.status) },
                        { label: 'Loaded', active: ['PICKUP', 'IN_TRANSIT', 'DELIVERED'].includes(txn.status) },
                        { label: 'In Transit', active: ['IN_TRANSIT', 'DELIVERED'].includes(txn.status) },
                        { label: 'Delivered', active: ['DELIVERED'].includes(txn.status) }
                      ].map((step) => (
                        <div key={step.label} className="space-y-1">
                          <div className={`h-1.5 rounded-full ${step.active ? 'bg-teal-500' : 'bg-earth-200'}`} />
                          <span className={step.active ? 'text-teal-600' : 'text-earth-400'}>{step.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )
        )}

        {activeSubTab === 'history' && (
          historyJobs.length === 0 ? (
            <div className="p-12 text-center rounded-3xl border border-earth-200 dark:border-earth-855 bg-white dark:bg-[#111714] text-earth-400 font-bold text-xs">
              No completed delivery runs in your log history.
            </div>
          ) : (
            <div className="space-y-3">
              {historyJobs.map(txn => (
                <div key={txn.id} className="p-4 rounded-xl border border-earth-150 bg-earth-50/20 dark:bg-earth-950/5 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-teal-650 font-bold block">{txn.id}</span>
                    <h4 className="font-bold text-foreground mt-0.5">{txn.cropName} ({txn.quantity} kg)</h4>
                    <span className="text-[10px] text-earth-450 block">Delivered to: {txn.buyerName}</span>
                  </div>
                  <div className="text-right">
                    <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-600">
                      COMPLETED
                    </span>
                    <span className="font-mono text-emerald-500 font-bold block mt-1.5">Earnings: ₹1,500</span>
                  </div>
                </div>
              ))}
            </div>
          )
        )}
      </div>

      {/* Signature Simulation Modal */}
      {signatureModalTxnId && (
        <div className="fixed inset-0 bg-black/60 dark:bg-black/80 backdrop-blur-xs flex items-center justify-center p-6 z-50 animate-scale-up">
          <div className="bg-white dark:bg-[#111714] border border-earth-200/60 dark:border-primary-950/20 w-full max-w-md rounded-[24px] p-6 shadow-2xl space-y-5 text-left">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-foreground uppercase tracking-widest font-display">Confirm Secure Delivery</h3>
              <button
                onClick={() => setSignatureModalTxnId(null)}
                className="p-1 text-earth-400 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSignatureSubmit} className="space-y-4">
              <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl flex gap-2 text-xs text-amber-600">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <p className="font-semibold leading-normal">
                  Secured release: Entering the buyer validation name releases B2B Escrow funds directly to the FPO cooperative ledger.
                </p>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-black uppercase text-earth-455 block mb-1">Receiver Name / Signature *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Raza Grocers Manager"
                  value={driverSignatureName}
                  onChange={e => setDriverSignatureName(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#070b09] border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold focus:outline-none focus:border-teal-500 text-foreground"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setSignatureModalTxnId(null)}
                  className="h-10 px-4 rounded-xl border border-earth-200 text-earth-650 hover:bg-earth-50 text-xs font-bold cursor-pointer bg-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-10 px-6 rounded-xl bg-emerald-500 hover:bg-emerald-650 text-white font-bold text-xs cursor-pointer border-0 shadow-sm flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Verify Delivery & Release Escrow</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Context-Aware Connection */}
      <div className="mt-8">
        <SwipeToConnect currentScreen="DriverBoard" currentFeature="Freight Transport" />
      </div>
    </div>
  );
}
