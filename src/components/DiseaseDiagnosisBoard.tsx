import React, { useState, useRef } from 'react';
import { useApp } from '@/context/AppContext';
import { diagnoseImage, ScanResult } from '@/services/scanService';
import {
  Camera,
  Upload,
  Sparkles,
  History,
  AlertCircle,
  CheckCircle2,
  HeartPulse,
  ChevronRight,
  Info,
  Calendar,
  RefreshCw,
  FileText
} from 'lucide-react';

export default function DiseaseDiagnosisBoard() {
  const { t, scanHistory, scanHistoryLoading, addScanRecord, language } = useApp();
  
  // State management
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentResult, setCurrentResult] = useState<ScanResult | null>(null);
  const [activeResultTab, setActiveResultTab] = useState<'chemical' | 'biological' | 'prevention'>('biological');
  
  // Refs
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  // Helper to get localized disease details based on active language
  const getLocalizedDetails = (name: string) => {
    let key = '';
    const norm = name.toLowerCase();
    if (norm.includes('late blight')) {
      key = 'tomato_late_blight';
    } else if (norm.includes('leaf mold')) {
      key = 'tomato_leaf_mold';
    } else if (norm.includes('healthy')) {
      key = 'healthy_plant';
    }

    if (!key) {
      // Fallback: return the original content from the scan result
      return {
        name,
        description: currentResult?.disease_name === 'Healthy Plant' 
          ? (language === 'ta' ? 'நோய் எதுவும் கண்டறியப்படவில்லை. பயிர் ஆரோக்கியமாக உள்ளது!' : 'No disease detected. Plant appears healthy!')
          : '',
        treatment: currentResult?.treatment || { chemical: [], biological: [], prevention: [] },
        prevention: currentResult?.prevention || []
      };
    }

    // Load from translations
    const localizedName = t(`disease_${key}_name`);
    const localizedDesc = t(`disease_${key}_desc`);
    
    // Dynamically retrieve list items from keys
    const biological: string[] = [];
    const chemical: string[] = [];
    const prevention: string[] = [];
    
    for (let i = 1; i <= 5; i++) {
      const bioVal = t(`disease_${key}_bio_${i}`);
      if (bioVal && bioVal !== `disease_${key}_bio_${i}`) biological.push(bioVal);
      
      const chemVal = t(`disease_${key}_chem_${i}`);
      if (chemVal && chemVal !== `disease_${key}_chem_${i}`) chemical.push(chemVal);
      
      const prevVal = t(`disease_${key}_prev_${i}`);
      if (prevVal && prevVal !== `disease_${key}_prev_${i}`) prevention.push(prevVal);
    }

    return {
      name: localizedName,
      description: localizedDesc,
      treatment: {
        biological: biological.length > 0 ? biological : (currentResult?.treatment.biological || []),
        chemical: chemical.length > 0 ? chemical : (currentResult?.treatment.chemical || []),
        prevention: prevention.length > 0 ? prevention : (currentResult?.treatment.prevention || [])
      },
      prevention: prevention.length > 0 ? prevention : (currentResult?.prevention || [])
    };
  };

  // Convert File to Base64
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setSelectedImage(reader.result as string);
      setError(null);
      setCurrentResult(null);
    };
    reader.onerror = () => {
      setError(t('error_diagnosis'));
    };
    reader.readAsDataURL(file);
  };

  // Trigger camera click
  const triggerCamera = () => {
    if (cameraInputRef.current) {
      cameraInputRef.current.click();
    }
  };

  // Trigger gallery click
  const triggerGallery = () => {
    if (galleryInputRef.current) {
      galleryInputRef.current.click();
    }
  };

  // Execute AI diagnosis
  const handleDiagnose = async () => {
    if (!selectedImage) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      // Call endpoint
      const result = await diagnoseImage(selectedImage);
      setCurrentResult(result);
      
      // Save scan record (triggers AppContext to update context state + local storage/DB)
      await addScanRecord(result);
    } catch (err: unknown) {
      console.error('[Diagnosis] Error during assessment:', err);
      const errMsg = err instanceof Error ? err.message : t('error_diagnosis');
      setError(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Clear current state and reset
  const handleReset = () => {
    setSelectedImage(null);
    setCurrentResult(null);
    setError(null);
  };

  // Display historical result in detail view
  const handleSelectHistory = (scan: ScanResult) => {
    setSelectedImage(scan.image_url);
    setCurrentResult(scan);
    setError(null);
    // Auto-scroll to top to show detail card on mobile
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const details = currentResult ? getLocalizedDetails(currentResult.disease_name) : null;

  return (
    <div className="space-y-8 animate-fade-in pb-12">
      {/* Header Banner */}
      <div>
        <div className="flex items-center gap-2 text-primary-500 mb-2">
          <HeartPulse className="w-6 h-6 animate-pulse-subtle" />
          <span className="font-extrabold text-[10px] tracking-widest uppercase font-mono bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 px-3 py-1 rounded-full">
            {t('crop_diagnosis')}
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          {t('crop_diagnosis')}
        </h1>
        <p className="text-xs text-earth-500 dark:text-earth-400 mt-1 max-w-xl">
          {t('crop_diagnosis_desc')}
        </p>
      </div>

      {/* Hidden inputs for File Picking */}
      <input
        type="file"
        ref={cameraInputRef}
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        type="file"
        ref={galleryInputRef}
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Diagnostics Input or Current Result */}
        <div className="lg:col-span-2 space-y-6">
          
          {!selectedImage && !currentResult && (
            /* ── Case 1: Upload / Capture Prompt ── */
            <div className="p-8 rounded-3xl border-2 border-dashed border-earth-200 dark:border-earth-800 bg-white dark:bg-[#111714] shadow-sm flex flex-col items-center justify-center text-center space-y-6 transition-all duration-300">
              <div className="p-5 rounded-full bg-primary-50 dark:bg-primary-950/20 text-primary-500 flex items-center justify-center">
                <Sparkles className="w-8 h-8" />
              </div>
              <div className="space-y-2">
                <h3 className="text-base font-black text-foreground">Scan Crop Foliage</h3>
                <p className="text-xs text-earth-400 max-w-sm leading-relaxed">
                  Take a clear, well-lit photo of the diseased leaves or plant stems up close to obtain an accurate diagnosis.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
                <button
                  onClick={triggerCamera}
                  className="flex-1 h-12 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer border-0"
                >
                  <Camera className="w-4 h-4" />
                  <span>{t('capture_photo')}</span>
                </button>
                <button
                  onClick={triggerGallery}
                  className="flex-1 h-12 rounded-2xl bg-earth-50 hover:bg-earth-100 dark:bg-earth-900/60 dark:hover:bg-earth-900 border border-earth-200 dark:border-earth-800 text-foreground font-bold text-xs flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
                >
                  <Upload className="w-4 h-4" />
                  <span>{t('upload_gallery')}</span>
                </button>
              </div>
            </div>
          )}

          {selectedImage && !currentResult && !isAnalyzing && (
            /* ── Case 2: Image Previewed, Ready to Analyze ── */
            <div className="rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] overflow-hidden shadow-sm animate-fade-in">
              <div className="relative aspect-video sm:aspect-[21/9] bg-earth-950 flex items-center justify-center">
                <img
                  src={selectedImage}
                  alt="Crop preview"
                  className="w-full h-full object-cover"
                />
                <button
                  onClick={handleReset}
                  className="absolute top-4 right-4 h-8 w-8 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/85 border-0 cursor-pointer text-sm font-bold shadow-md"
                >
                  ✕
                </button>
              </div>
              <div className="p-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-earth-100 dark:border-earth-900/30">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary-50 dark:bg-primary-950/20 text-primary-500">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-xs text-foreground block">Ready for Analysis</span>
                    <span className="text-[10px] text-earth-400 block mt-0.5">Ensure the infected region is fully visible.</span>
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleReset}
                    className="flex-1 sm:flex-none h-10 px-5 rounded-xl border border-earth-200 dark:border-earth-800 hover:bg-earth-100 dark:hover:bg-earth-900/40 text-foreground font-bold text-xs cursor-pointer transition-colors"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={handleDiagnose}
                    className="flex-1 sm:flex-none h-10 px-6 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm hover:shadow-md cursor-pointer border-0"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{t('diagnose_cta')}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {isAnalyzing && (
            /* ── Case 3: Scanning / Analyzing Loader ── */
            <div className="p-12 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm flex flex-col items-center justify-center text-center space-y-6 animate-pulse-subtle">
              <div className="relative flex items-center justify-center">
                <div className="w-16 h-16 rounded-full border-4 border-primary-100 dark:border-primary-950/30 border-t-primary-500 animate-spin" />
                <Sparkles className="w-6 h-6 text-primary-500 absolute animate-pulse" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">{t('loading_diagnosis')}</h3>
                <p className="text-xs text-earth-400 max-w-xs leading-relaxed">
                  Executing plant-health classification and parsing treatments from the Plant.id database...
                </p>
              </div>
            </div>
          )}

          {error && (
            /* ── Error Banner ── */
            <div className="p-5 rounded-3xl border border-red-500/20 bg-red-500/5 text-red-700 dark:text-red-400 flex items-start gap-3.5 text-xs font-semibold animate-fade-in">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
              <div className="flex-1 space-y-2">
                <span className="font-bold text-red-800 dark:text-red-300 block">Diagnosis Error</span>
                <p className="leading-relaxed">{error}</p>
                <button
                  onClick={handleDiagnose}
                  className="mt-2 text-xs font-black text-red-600 dark:text-red-400 underline cursor-pointer border-0 bg-transparent flex items-center gap-1 hover:text-red-850"
                >
                  <RefreshCw className="w-3 h-3" /> Retry Analysis
                </button>
              </div>
            </div>
          )}

          {currentResult && details && !isAnalyzing && (
            /* ── Case 4: Complete Diagnosis Result Card ── */
            <div className="rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm overflow-hidden animate-fade-in flex flex-col">
              
              {/* Image & Title Header */}
              <div className="flex flex-col sm:flex-row">
                <div className="sm:w-1/3 aspect-square max-h-48 sm:max-h-none overflow-hidden bg-earth-900 shrink-0">
                  <img
                    src={selectedImage || currentResult.image_url}
                    alt={currentResult.disease_name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-earth-400 tracking-wider block">
                      {t('disease_name')}
                    </span>
                    <h2 className="text-lg font-black text-foreground leading-tight mt-1">
                      {details.name}
                    </h2>

                    {details.description && (
                      <p className="text-xs text-earth-500 dark:text-earth-400 mt-2 leading-relaxed bg-earth-50/50 dark:bg-earth-950/20 p-3 rounded-2xl border border-earth-150/30 dark:border-earth-900/10 font-semibold">
                        {details.description}
                      </p>
                    )}
                  </div>

                  {/* Confidence Rating Progress */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold text-foreground">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className={`w-4 h-4 ${currentResult.disease_name === 'Healthy Plant' ? 'text-emerald-500' : 'text-primary-500'}`} />
                        {t('confidence')}
                      </span>
                      <span className="font-mono text-primary-600 dark:text-primary-400 text-sm">
                        {currentResult.confidence}%
                      </span>
                    </div>
                    <div className="h-2 w-full bg-earth-100 dark:bg-earth-900 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-primary-500 rounded-full transition-all duration-700"
                        style={{ width: `${currentResult.confidence}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Treatment and Prevention Tabbed Content */}
              <div className="p-6 border-t border-earth-100 dark:border-earth-900/30 flex-1 flex flex-col">
                
                {/* Tabs selection */}
                <div className="flex border-b border-earth-100 dark:border-earth-900/20 pb-3 mb-4 gap-1.5">
                  <button
                    onClick={() => setActiveResultTab('biological')}
                    className={`h-8 px-4 rounded-full text-xs font-extrabold cursor-pointer border-0 transition-all ${
                      activeResultTab === 'biological'
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'bg-earth-50 dark:bg-earth-900/40 text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
                    }`}
                  >
                    {t('biological_treatment') || 'Biological Controls'}
                  </button>
                  <button
                    onClick={() => setActiveResultTab('chemical')}
                    className={`h-8 px-4 rounded-full text-xs font-extrabold cursor-pointer border-0 transition-all ${
                      activeResultTab === 'chemical'
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'bg-earth-50 dark:bg-earth-900/40 text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
                    }`}
                  >
                    {t('chemical_treatment') || 'Chemical Controls'}
                  </button>
                  <button
                    onClick={() => setActiveResultTab('prevention')}
                    className={`h-8 px-4 rounded-full text-xs font-extrabold cursor-pointer border-0 transition-all ${
                      activeResultTab === 'prevention'
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'bg-earth-50 dark:bg-earth-900/40 text-earth-600 dark:text-earth-400 hover:bg-earth-100 dark:hover:bg-earth-900'
                    }`}
                  >
                    {t('prevention')}
                  </button>
                </div>

                {/* Tab content view */}
                <div className="flex-1 text-xs leading-relaxed text-earth-600 dark:text-earth-300 font-medium">
                  {activeResultTab === 'biological' && (
                    <div className="space-y-2">
                      {details.treatment.biological && details.treatment.biological.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {details.treatment.biological.map((item, i) => (
                            <li key={i} className="pl-1 list-none flex items-start gap-2">
                              <span className="text-primary-500 shrink-0 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-earth-400 italic">No specific biological controls suggested for this diagnosis.</p>
                      )}
                    </div>
                  )}

                  {activeResultTab === 'chemical' && (
                    <div className="space-y-2">
                      {details.treatment.chemical && details.treatment.chemical.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {details.treatment.chemical.map((item, i) => (
                            <li key={i} className="pl-1 list-none flex items-start gap-2">
                              <span className="text-red-500 shrink-0 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-earth-400 italic">No chemical application required for this diagnosis.</p>
                      )}
                    </div>
                  )}

                  {activeResultTab === 'prevention' && (
                    <div className="space-y-2">
                      {details.prevention && details.prevention.length > 0 ? (
                        <ul className="list-disc list-inside space-y-2">
                          {details.prevention.map((item, i) => (
                            <li key={i} className="pl-1 list-none flex items-start gap-2">
                              <span className="text-blue-500 shrink-0 mt-1">•</span>
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-earth-400 italic">No specific preventative measures suggested.</p>
                      )}
                    </div>
                  )}
                </div>

                {/* Reset Trigger */}
                <div className="mt-8 pt-4 border-t border-earth-100 dark:border-earth-900/35 flex justify-end">
                  <button
                    onClick={handleReset}
                    className="h-10 px-5 rounded-xl bg-earth-50 hover:bg-earth-100 dark:bg-earth-900/60 dark:hover:bg-earth-900 text-foreground font-bold text-xs cursor-pointer"
                  >
                    {t('new_scan') || 'Diagnose Another Crop'}
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Right Column: Scan History Log */}
        <div className="space-y-6">
          <div className="p-6 rounded-[24px] border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-sm flex flex-col h-full max-h-[500px]">
            
            <div className="flex items-center gap-2 border-b border-earth-100 dark:border-earth-900/30 pb-4 mb-4 shrink-0">
              <History className="w-4.5 h-4.5 text-earth-400" />
              <h3 className="text-xs font-black uppercase tracking-widest text-foreground">
                {t('scan_history')}
              </h3>
              <span className="text-[10px] font-mono text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40 px-2 py-0.5 rounded-md font-extrabold ml-auto">
                {scanHistory.length}
              </span>
            </div>

            {/* Scrollable list */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-3">
              {scanHistoryLoading ? (
                /* Loading State */
                <div className="text-center py-12 text-earth-450 font-bold text-xs animate-pulse">
                  Loading history log...
                </div>
              ) : scanHistory.length === 0 ? (
                /* Empty State */
                <div className="text-center py-16 px-4 flex flex-col items-center justify-center space-y-3">
                  <FileText className="w-8 h-8 text-earth-300" />
                  <p className="text-xs text-earth-400 font-bold">{t('no_history')}</p>
                </div>
              ) : (
                /* History Records */
                scanHistory.map((scan) => (
                  <button
                    key={scan.id}
                    onClick={() => handleSelectHistory(scan)}
                    className="w-full text-left p-3.5 bg-earth-50/30 dark:bg-earth-950/15 hover:bg-earth-50 dark:hover:bg-earth-900/40 border border-earth-150/40 dark:border-earth-900/10 rounded-2xl flex items-center gap-3 transition-all cursor-pointer hover:border-primary-500/20"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-earth-900 shrink-0">
                      <img
                        src={scan.image_url}
                        alt={scan.disease_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-black text-foreground truncate">
                        {getLocalizedDetails(scan.disease_name).name}
                      </h4>
                      
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] font-bold text-primary-500 bg-primary-500/5 px-1.5 py-0.2 rounded-md shrink-0">
                          {scan.confidence}%
                        </span>
                        
                        {scan.created_at && (
                          <span className="text-[9px] font-semibold text-earth-400 font-mono flex items-center gap-1 truncate">
                            <Calendar className="w-2.5 h-2.5" />
                            {new Date(scan.created_at).toLocaleDateString(
                              language === 'ta' ? 'ta-IN' : 'en-US',
                              { month: 'short', day: 'numeric' }
                            )}
                          </span>
                        )}
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-earth-300 shrink-0" />
                  </button>
                ))
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  );
}
