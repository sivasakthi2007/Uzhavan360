'use client';

import React, { useState } from 'react';
import { PhoneCall, ShieldCheck, Users, Radio, Smartphone, RefreshCw, CheckCircle2 } from 'lucide-react';
import { ooruConnectBackend, IVRResponse, VLinkSyncReceipt } from '../services/ooruConnectService';

export const FOSAndIVRBoard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'fos' | 'ivr' | 'vlink'>('fos');
  const [selectedDigit, setSelectedDigit] = useState<number | null>(null);
  const [ivrResponse, setIvrResponse] = useState<IVRResponse | null>(null);

  // FOS Form State
  const [fosUserPhone, setFosUserPhone] = useState<string>('');
  const [fosActionType, setFosActionType] = useState<'REGISTER' | 'CREATE_REQUEST' | 'UPDATE_AVAILABILITY'>('CREATE_REQUEST');
  const [fosSuccessMsg, setFosSuccessMsg] = useState<string>('');

  // V-LINK Receipts
  const [syncReceipts, setSyncReceipts] = useState<VLinkSyncReceipt[]>([
    { eventId: 'evt_98124', status: 'CLOUD_SYNCED', timestamp: '2 mins ago', retryCount: 0 },
    { eventId: 'evt_98125', status: 'GATEWAY_RECEIVED', timestamp: 'Just now', retryCount: 0 },
    { eventId: 'evt_98126', status: 'RELAYED', timestamp: 'Just now', retryCount: 1 },
  ]);

  const handleIVRKeypress = (digit: number) => {
    setSelectedDigit(digit);
    const res = ooruConnectBackend.processIVRInput(digit, '9842100000');
    setIvrResponse(res);
  };

  const handleFOSSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fosUserPhone) return;
    const res = ooruConnectBackend.processFOSAssistedAction({
      fosId: 'FOS_OFFICER_12',
      targetUserPhone: fosUserPhone,
      actionType: fosActionType,
      payload: {},
    });
    setFosSuccessMsg(res.messageTa);
    setFosUserPhone('');
    setTimeout(() => setFosSuccessMsg(''), 4000);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-24 text-slate-800">
      {/* Header */}
      <div className="bg-emerald-900 text-white p-6 shadow-md">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <span className="text-xs font-mono bg-emerald-800 text-emerald-300 px-3 py-1 rounded-full uppercase tracking-wider">
              Accessibility & Connectivity Bridge
            </span>
            <h1 className="text-2xl font-extrabold mt-2">Same Service. Multiple Interactions.</h1>
            <p className="text-sm text-emerald-200">
              App, Voice, IVR, and FOS assisted access — powered by One Unified Backend.
            </p>
          </div>

          {/* Sub-Tabs */}
          <div className="flex bg-emerald-950/60 p-1.5 rounded-2xl border border-emerald-700/50">
            <button
              onClick={() => setActiveTab('fos')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'fos' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white'
              }`}
            >
              👷 FOS Assistant
            </button>
            <button
              onClick={() => setActiveTab('ivr')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'ivr' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white'
              }`}
            >
              📞 IVR Phone Menu
            </button>
            <button
              onClick={() => setActiveTab('vlink')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'vlink' ? 'bg-emerald-600 text-white shadow-md' : 'text-emerald-300 hover:text-white'
              }`}
            >
              📡 V-LINK Sync Layer
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6">
        {/* TAB 1: FOS ASSISTED ACCESS WORKFLOW */}
        {activeTab === 'fos' && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                <Users className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">FOS (Field Officer) Assisted Portal</h3>
                <p className="text-xs text-slate-500">
                  ஸ்மார்ட்போன் பயன்படுத்த இயலாத கிராம மக்களுக்கு உதவி செய்யும் களப்பணியாளர் பக்கம்
                </p>
              </div>
            </div>

            {fosSuccessMsg && (
              <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl mb-6 flex items-center gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span className="text-sm font-bold">{fosSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleFOSSubmit} className="space-y-4 max-w-lg">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  பயனாளி கைப்பேசி எண் (Villager Phone):
                </label>
                <input
                  type="text"
                  placeholder="9842100000"
                  value={fosUserPhone}
                  onChange={(e) => setFosUserPhone(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase mb-2">
                  உதவி செயல்பாடு (Assisted Action):
                </label>
                <select
                  value={fosActionType}
                  onChange={(e: any) => setFosActionType(e.target.value)}
                  className="w-full p-3 rounded-xl border border-slate-300 font-bold text-sm bg-white focus:ring-2 focus:ring-emerald-500 outline-none"
                >
                  <option value="CREATE_REQUEST">வேலை கோரிக்கை பதிவு செய்தல் (Create Request)</option>
                  <option value="REGISTER">புதிய பயனாளி பதிவு (User Registration)</option>
                  <option value="UPDATE_AVAILABILITY">வேலை வாய்ப்பு நிலை புதுப்பித்தல் (Update Availability)</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-700 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-emerald-800 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-5 h-5" />
                FOS மூலம் பதிவு செய்ய (Submit Assisted Action)
              </button>
            </form>
          </div>
        )}

        {/* TAB 2: FEATURE PHONE / IVR SIMULATION */}
        {activeTab === 'ivr' && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold">
                <PhoneCall className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">IVR Feature Phone Service (1800-425-0000)</h3>
                <p className="text-xs text-slate-500">
                  பட்டன் போன் மூலமாகவே குரல் வழி மற்றும் எண்கள் மூலம் சேவை பெறும் அமைப்பு
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Dialpad Simulator */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl flex flex-col items-center">
                <div className="text-xs font-mono text-indigo-400 mb-2">IVR Touch-Tone Dialpad</div>
                <div className="w-full bg-slate-800 p-3 rounded-xl text-center mb-6 font-mono text-lg text-emerald-400 font-bold border border-slate-700">
                  {selectedDigit !== null ? `Pressed Digit: [${selectedDigit}]` : 'Press 1 to 5'}
                </div>

                <div className="grid grid-cols-3 gap-3 w-48 mb-4">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
                    <button
                      key={digit}
                      onClick={() => handleIVRKeypress(digit)}
                      className="w-14 h-14 rounded-2xl bg-slate-800 hover:bg-indigo-600 text-white font-bold text-xl flex items-center justify-center shadow-md active:scale-95 transition-all border border-slate-700"
                    >
                      {digit}
                    </button>
                  ))}
                </div>
              </div>

              {/* Live IVR Response Output */}
              <div className="bg-indigo-50/50 p-6 rounded-3xl border border-indigo-100 flex flex-col justify-between">
                <div>
                  <h4 className="font-bold text-indigo-950 mb-3 flex items-center gap-2">
                    <Smartphone className="w-5 h-5 text-indigo-600" />
                    IVR Voice Response (குரல் பதில்):
                  </h4>

                  {ivrResponse ? (
                    <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm animate-in fade-in">
                      <span className="text-[10px] font-mono bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold uppercase">
                        Action: {ivrResponse.actionTaken}
                      </span>
                      <p className="text-base font-bold text-slate-900 mt-2">
                        🔊 "{ivrResponse.voicePromptTa}"
                      </p>
                      <p className="text-xs text-slate-500 italic mt-1">
                        "{ivrResponse.voicePromptEn}"
                      </p>
                    </div>
                  ) : (
                    <p className="text-xs text-slate-500 italic">
                      பட்டன் போன் எண்களை அழுத்தி சேவையை சோதிக்கவும்.
                    </p>
                  )}
                </div>

                {/* IVR Legend */}
                <div className="mt-6 pt-4 border-t border-indigo-100 text-xs space-y-1 text-slate-600 font-medium">
                  <p>1 ➔ வேலை ஆட்கள் தேவை</p>
                  <p>2 ➔ மெக்கானிக் சேவை தேவை</p>
                  <p>3 ➔ கோரிக்கை நிலை அறிய</p>
                  <p>4 ➔ வேலை வாய்ப்பு நிலை புதுப்பிக்க</p>
                  <p>5 ➔ கள அதிகாரி (FOS) தொடர்பு கொள்ள</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: V-LINK SYNC & CONTINUITY LAYER */}
        {activeTab === 'vlink' && (
          <div className="bg-white rounded-3xl p-6 shadow-lg border border-slate-200">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
                <Radio className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-900">V-LINK Mesh & Offline Sync Layer</h3>
                <p className="text-xs text-slate-500">
                  இணைய சேவை இல்லாத நேரங்களில் தரவுகளை பாதுகாப்பாக சேமித்து இணைக்கும் தளம்
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center gap-3">
                  <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm">Offline Queue Sync Status</h4>
                    <p className="text-xs text-slate-500">Automatic store-carry-forward deduplication enabled</p>
                  </div>
                </div>
                <span className="text-xs font-mono font-bold bg-amber-100 text-amber-800 px-3 py-1 rounded-full">
                  Deduplication Active
                </span>
              </div>

              {/* Sync Receipts Table */}
              <div className="divide-y divide-slate-100">
                {syncReceipts.map((rcpt) => (
                  <div key={rcpt.eventId} className="py-3 flex justify-between items-center">
                    <div>
                      <p className="text-xs font-mono font-bold text-slate-800">{rcpt.eventId}</p>
                      <p className="text-[11px] text-slate-400">{rcpt.timestamp}</p>
                    </div>
                    <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      {rcpt.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
