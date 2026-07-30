'use client';

import React, { useState } from 'react';
import { LaborJob, useApp } from '@/context/AppContext';
import { X, MapPin, Calendar, Clock, DollarSign, UserCheck, Star, Phone, MessageSquare, Tag, Bookmark } from 'lucide-react';
import WorkerCard from './WorkerCard';

interface JobDetailsProps {
  jobId: string;
  onClose: () => void;
  onApply: (jobId: string) => void;
}

export default function JobDetails({
  jobId,
  onClose,
  onApply
}: JobDetailsProps) {
  const { laborJobs, activeRole, hireLaborWorker, toggleSaveJob, userName } = useApp();
  const [contactMode, setContactMode] = useState<string | null>(null);

  const job = laborJobs.find(j => j.id === jobId);

  if (!job) return null;

  const isFarmer = activeRole === 'farmer';
  const isLabor = activeRole === 'labor';
  const isApplied = job.status === 'applied';

  // Mock applicants data for farmer side view
  const mockApplicants = [
    { id: 'w1', name: 'Karuppiah Swamy', rating: 4.8, experience: '5 years', skills: ['Harvesting', 'Pruning'], village: 'Melur, Madurai' },
    { id: 'w2', name: 'Muthu Selvan', rating: 4.6, experience: '3 years', skills: ['Ploughing', 'Sowing'], village: 'Vadipatti, Madurai' }
  ];

  const handleHire = () => {
    hireLaborWorker(job.id);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex justify-end animate-fade-in">
      {/* Click outside backdrop */}
      <div className="fixed inset-0 cursor-pointer" onClick={onClose} />

      {/* Slide-over Container */}
      <div className="relative w-full max-w-xl bg-[#fafbfa] dark:bg-[#111613] h-full flex flex-col shadow-2xl animate-slide-up md:animate-fade-in md:rounded-l-3xl overflow-hidden z-10">
        
        {/* Header */}
        <div className="h-16 px-6 border-b border-earth-150 dark:border-earth-900/40 bg-white dark:bg-[#111714] flex items-center justify-between sticky top-0 z-20">
          <div>
            <span className="text-[10px] font-bold text-primary-500 uppercase tracking-widest block">
              Job Requirements
            </span>
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider truncate max-w-sm">
              {job.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-earth-500 hover:text-foreground hover:bg-earth-100 dark:hover:bg-earth-900 rounded-xl cursor-pointer border-0 bg-transparent"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 pb-24">
          {/* Main Card */}
          <div className="p-6 rounded-3xl border border-earth-150 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs space-y-4">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-1">
                <h2 className="text-lg font-black text-foreground leading-tight tracking-tight">
                  {job.title}
                </h2>
                <span className="text-xs font-semibold text-primary-500 block">
                  Employer: {job.farmerName}
                </span>
              </div>
              
              {isLabor && (
                <button
                  onClick={() => toggleSaveJob(job.id)}
                  className={`p-2 rounded-xl border transition-all cursor-pointer border-0 ${
                    job.saved
                      ? 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                      : 'bg-earth-50 dark:bg-earth-900 text-earth-400 hover:text-foreground'
                  }`}
                  title={job.saved ? 'Unsave Job' : 'Save Job'}
                >
                  <Bookmark className={`w-5 h-5 ${job.saved ? 'fill-amber-500' : ''}`} />
                </button>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs font-semibold text-earth-500 dark:text-earth-400">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary-500 shrink-0" />
                <span>{job.village}, {job.district}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary-500 shrink-0" />
                <span>Starts: {job.date}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-primary-500 shrink-0" />
                <span>Duration: {job.duration}</span>
              </div>
              <div className="flex items-center gap-2">
                <UserCheck className="w-4 h-4 text-primary-500 shrink-0" />
                <span>Needs {job.workersNeeded} Workers</span>
              </div>
            </div>

            <div className="pt-4 border-t border-earth-100 dark:border-earth-900/30 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-earth-400 uppercase font-mono block">Compensation</span>
                <span className="text-xl font-black text-primary-600 dark:text-primary-400 font-mono mt-0.5 block">
                  ₹{job.wages} <span className="text-xs font-semibold text-earth-450 dark:text-earth-550">/ day</span>
                </span>
              </div>
              
              <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                job.status === 'open' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400' :
                job.status === 'applied' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                'bg-stone-100 text-stone-600 dark:bg-stone-900 dark:text-stone-400'
              }`}>
                {job.status === 'open' ? 'Hiring Open' : job.status === 'applied' ? 'Applied' : 'Position Filled'}
              </span>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Job Description
            </h4>
            <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed font-semibold p-4 rounded-2xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714]">
              {job.description}
            </p>
          </div>

          {/* Required Skills */}
          <div className="space-y-2">
            <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
              Required Skills
            </h4>
            <div className="flex flex-wrap gap-2">
              {job.skills.map((skill) => (
                <span
                  key={skill}
                  className="flex items-center gap-1 px-3 py-1 rounded-xl bg-primary-50/50 dark:bg-primary-950/20 text-primary-700 dark:text-primary-400 text-xs font-bold border border-primary-500/10"
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{skill}</span>
                </span>
              ))}
            </div>
          </div>

          {/* Contact Employer */}
          <div className="p-4 rounded-3xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] flex items-center justify-between">
            <div>
              <span className="text-[10px] text-earth-400 font-bold uppercase tracking-wider block">Employer Contact</span>
              <span className="text-xs font-black text-foreground mt-0.5 block">{job.farmerName}</span>
            </div>
            
            {contactMode ? (
              <div className="text-[11px] font-black text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/20 px-3 py-1.5 rounded-xl border border-primary-500/10 text-center animate-fade-in">
                {contactMode === 'call' ? 'Call: +91 98456 78120' : 'In-App Message Sent!'}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setContactMode('call')}
                  className="p-2.5 rounded-xl bg-earth-100 hover:bg-earth-200 dark:bg-earth-900 dark:hover:bg-earth-850 text-earth-700 dark:text-earth-300 cursor-pointer border-0"
                >
                  <Phone className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setContactMode('message')}
                  className="p-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white cursor-pointer border-0"
                >
                  <MessageSquare className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Farmer View: Candidates List */}
          {isFarmer && job.farmerId === 'farmer_1' && (
            <div className="space-y-3.5">
              <div className="flex items-center justify-between border-b border-earth-150 dark:border-earth-900/40 pb-2">
                <h4 className="text-xs font-black text-foreground uppercase tracking-widest">
                  Applicants Registry ({mockApplicants.length})
                </h4>
                <span className="text-[10px] text-earth-400 font-bold uppercase tracking-wider">
                  Hiring status: {job.status}
                </span>
              </div>

              {job.status === 'accepted' ? (
                <div className="p-4 text-center rounded-2xl border border-emerald-500/20 bg-emerald-500/5 text-emerald-800 dark:text-emerald-400 text-xs font-bold">
                  ✓ Candidate hired successfully! Wage will settle on job completion.
                </div>
              ) : (
                <div className="space-y-4">
                  {mockApplicants.map((appl) => (
                    <div key={appl.id} className="p-4 rounded-2xl border border-earth-150 dark:border-earth-900/30 bg-white dark:bg-[#111714] flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-xs text-foreground">{appl.name}</span>
                          <span className="flex items-center gap-0.5 text-[10px] font-bold text-accent-500 bg-accent-50 dark:bg-amber-950/20 px-1.5 py-0.5 rounded">
                            ★ {appl.rating}
                          </span>
                        </div>
                        <p className="text-[10px] text-earth-400 font-bold mt-1">
                          Experience: {appl.experience} • Village: {appl.village}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {appl.skills.map(s => (
                            <span key={s} className="text-[9px] bg-earth-100 dark:bg-earth-900 text-earth-500 px-1.5 py-0.5 rounded-md font-bold">
                              {s}
                            </span>
                          ))}
                        </div>
                      </div>
                      
                      <button
                        onClick={handleHire}
                        className="py-1.5 px-3 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs cursor-pointer border-0 shadow-sm self-end md:self-center"
                      >
                        Hire Worker
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Worker View: Sticky bottom Action Bar */}
        {isLabor && job.status === 'open' && (
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-earth-150 dark:border-earth-900/40 bg-white/95 dark:bg-[#111714]/95 backdrop-blur-md flex items-center justify-between gap-4 z-20 shadow-lg animate-fade-in">
            <div>
              <span className="text-[9px] text-earth-400 font-bold block uppercase tracking-wider">Estimated Total</span>
              <span className="text-base font-black text-foreground font-mono">
                ₹{(job.wages * parseInt(job.duration || '1')).toLocaleString()}
              </span>
            </div>

            <button
              onClick={() => onApply(job.id)}
              className="px-8 py-3 rounded-2xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-sm shadow-md transition-all duration-200 cursor-pointer border-0 flex items-center gap-1"
            >
              <span>Apply for Position</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
