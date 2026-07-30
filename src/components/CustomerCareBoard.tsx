'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  Headset,
  HelpCircle,
  ChevronDown,
  ChevronUp,
  MessageSquarePlus,
  Search,
  Clock,
  CheckCircle,
  AlertCircle,
  Phone,
  Mail,
  MessageCircle,
  Star,
  Send,
  ShoppingBag,
  Wrench,
  Users,
  CreditCard,
  Settings,
  User,
  Ticket,
  ThumbsUp,
  FileText,
  ArrowLeft,
  Sparkles,
  Info
} from 'lucide-react';

// ─── Types ──────────────────────────────────────────────────────────
type SupportCategory = 'account' | 'orders' | 'rentals' | 'labor' | 'payments' | 'technical';
type TicketStatus = 'open' | 'in_progress' | 'resolved';
type TicketPriority = 'low' | 'medium' | 'high';
type CareView = 'home' | 'faq' | 'create_ticket' | 'my_tickets' | 'contact' | 'feedback';

interface FAQItem {
  id: string;
  questionEn: string;
  questionTa: string;
  answerEn: string;
  answerTa: string;
  category: SupportCategory;
}

interface SupportTicket {
  id: string;
  category: SupportCategory;
  subject: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdAt: string;
  updatedAt: string;
  response?: string;
}

// ─── FAQ Data ───────────────────────────────────────────────────────
const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq_1', category: 'account',
    questionEn: 'How do I change my profile language?',
    questionTa: 'என் சுயவிவர மொழியை எப்படி மாற்றுவது?',
    answerEn: 'Click the language selector in the top navbar to switch between Tamil (தமிழ்) and English. Your preference will be saved automatically for future sessions.',
    answerTa: 'மேல் நாவிகேஷன் பாரில் உள்ள மொழி தேர்வாளரைக் கிளிக் செய்து தமிழ் மற்றும் ஆங்கிலம் இடையே மாற்றவும். உங்கள் விருப்பம் எதிர்கால அமர்வுகளுக்கு தானாகவே சேமிக்கப்படும்.',
  },
  {
    id: 'faq_2', category: 'account',
    questionEn: 'How do I add a new farm to my profile?',
    questionTa: 'என் சுயவிவரத்தில் புதிய பண்ணையை எப்படி சேர்ப்பது?',
    answerEn: 'Go to the "My Farm" tab → Click "Add Farm" → Fill in village, district, land size, soil type, water source, primary crop, and sowing date → Click "Save". Your farm will appear in the dashboard.',
    answerTa: '"என் பண்ணை" தாவலுக்கு செல்லவும் → "பண்ணை சேர்" கிளிக் செய்யவும் → கிராமம், மாவட்டம், நிலம், மண் வகை, நீர் மூலம், பயிர், விதைப்பு தேதி நிரப்பவும் → "சேமி" கிளிக் செய்யவும்.',
  },
  {
    id: 'faq_3', category: 'orders',
    questionEn: 'How does the escrow payment system work?',
    questionTa: 'எஸ்க்ரோ கட்டணமுறை எப்படி செயல்படுகிறது?',
    answerEn: 'When a buyer places an order, the payment is held in V-LINK smart escrow. Once the farmer confirms handover and the buyer acknowledges receipt, the funds are released to the farmer\'s wallet. This protects both parties.',
    answerTa: 'வாங்குபவர் ஆர்டர் செய்யும்போது, பணம் V-LINK எஸ்க்ரோவில் வைக்கப்படும். விவசாயி ஒப்படைப்பை உறுதிசெய்து, வாங்குபவர் பெற்றுக்கொண்டதை ஒப்புக்கொண்ட பிறகு, பணம் விவசாயியின் வாலட்-க்கு வரும்.',
  },
  {
    id: 'faq_4', category: 'orders',
    questionEn: 'Can I cancel an order after placing it?',
    questionTa: 'ஆர்டர் செய்த பிறகு ரத்து செய்ய முடியுமா?',
    answerEn: 'Yes, you can cancel a pending order before the farmer accepts it. Once accepted, contact the farmer directly through V-LINK to discuss cancellation. Escrow funds will be refunded within 24 hours.',
    answerTa: 'ஆம், விவசாயி ஏற்றுக்கொள்வதற்கு முன் நிலுவையில் உள்ள ஆர்டரை ரத்து செய்யலாம். ஏற்றுக்கொள்ளப்பட்ட பிறகு, V-LINK மூலம் விவசாயியை நேரடியாக தொடர்பு கொள்ளவும். எஸ்க்ரோ பணம் 24 மணி நேரத்தில் திரும்பப் பெறப்படும்.',
  },
  {
    id: 'faq_5', category: 'rentals',
    questionEn: 'What if the rented equipment breaks down?',
    questionTa: 'வாடகைக்கு எடுத்த உபகரணம் பழுதடைந்தால் என்ன செய்வது?',
    answerEn: 'Contact the equipment owner immediately. If the breakdown was due to normal use, the owner provides a replacement or refund for remaining days. Report the issue through the support ticket system for resolution.',
    answerTa: 'உபகரண உரிமையாளரை உடனடியாக தொடர்பு கொள்ளுங்கள். சாதாரண பயன்பாட்டால் பழுதடைந்தால், உரிமையாளர் மாற்று அல்லது மீதமுள்ள நாட்களுக்கு பணத்தை திரும்பப் பெறுவார்.',
  },
  {
    id: 'faq_6', category: 'labor',
    questionEn: 'How do I find workers for my farm?',
    questionTa: 'என் பண்ணைக்கு வேலையாட்களை எப்படி கண்டுபிடிப்பது?',
    answerEn: 'Go to the "Labor Board" tab → Click "Post a Job" → Fill in job title, description, daily wage, location, workers needed → Publish. Local workers will apply through V-LINK, and you can review and hire them.',
    answerTa: '"தொழிலாளர் பலகை" தாவலுக்கு செல்லவும் → "வேலை போஸ்ட் செய்" கிளிக் செய்யவும் → வேலை பெயர், விவரம், தினசரி ஊதியம், இடம், தேவையான தொழிலாளர்கள் நிரப்பவும் → வெளியிடவும்.',
  },
  {
    id: 'faq_7', category: 'payments',
    questionEn: 'How do I withdraw money from my V-LINK wallet?',
    questionTa: 'V-LINK வாலட்-ல் இருந்து பணத்தை எப்படி எடுப்பது?',
    answerEn: 'Currently, V-LINK wallet operates in sandbox mode. In production, you can link your bank account and transfer funds directly. Minimum withdrawal: ₹100. Processing time: 1-2 business days.',
    answerTa: 'தற்போது V-LINK வாலட் சான்ட்பாக்ஸ் முறையில் செயல்படுகிறது. உற்பத்தியில், உங்கள் வங்கிக் கணக்கை இணைத்து நேரடியாக பணம் பரிமாற்றம் செய்யலாம். குறைந்தபட்ச எடுப்பு: ₹100. செயலாக்க நேரம்: 1-2 வணிக நாட்கள்.',
  },
  {
    id: 'faq_8', category: 'technical',
    questionEn: 'Does V-LINK work without internet?',
    questionTa: 'V-LINK இணையம் இல்லாமல் வேலை செய்யுமா?',
    answerEn: 'Yes! V-LINK is built with offline-first architecture. You can browse market prices, weather data, schemes, and your farm details without internet. Data syncs automatically when connection is restored.',
    answerTa: 'ஆம்! V-LINK ஆஃப்லைன்-முதல் கட்டமைப்பில் கட்டப்பட்டுள்ளது. இணையம் இல்லாமல் சந்தை விலைகள், வானிலை, திட்டங்கள், பண்ணை விவரங்களைப் பார்க்கலாம். இணைப்பு மீட்டமைக்கப்படும்போது தானாகவே ஒத்திசைக்கும்.',
  },
  {
    id: 'faq_9', category: 'technical',
    questionEn: 'How do I use the crop disease scanner?',
    questionTa: 'பயிர் நோய் ஸ்கேனரை எப்படி பயன்படுத்துவது?',
    answerEn: 'Go to "Crop Diagnosis" tab → Take a photo or upload from gallery → Click "Analyze Crop Health". The AI will identify the disease, give confidence level, and recommend chemical and organic treatments.',
    answerTa: '"பயிர் நோயறிதல்" தாவலுக்கு செல்லவும் → புகைப்படம் எடுக்கவும் அல்லது கேலரியில் இருந்து பதிவேற்றவும் → "பயிர் ஆரோக்கியத்தை பகுப்பாய்வு செய்" கிளிக் செய்யவும். AI நோயை அடையாளம் கண்டு, நம்பிக்கை நிலை மற்றும் சிகிச்சை பரிந்துரைக்கும்.',
  },
];

// ─── Mock Tickets ───────────────────────────────────────────────────
const SEED_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-001', category: 'orders', subject: 'Order ORD-002 not delivered',
    description: 'My order for Red Onions from Dindigul has been pending for 3 days. No update from farmer.',
    priority: 'high', status: 'in_progress',
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    response: 'We have contacted the farmer and the order will be dispatched tomorrow. Apologies for the delay.',
  },
  {
    id: 'TKT-002', category: 'payments', subject: 'Wallet credit not received',
    description: 'I sold 120kg of tomatoes but the wallet credit of ₹4,200 has not appeared.',
    priority: 'medium', status: 'resolved',
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    response: 'The credit has been processed and ₹4,200 is now in your wallet. The delay was due to escrow verification.',
  },
];

// ─── Helper ─────────────────────────────────────────────────────────
const categoryConfig: Record<SupportCategory, { labelEn: string; labelTa: string; icon: React.ElementType; color: string }> = {
  account: { labelEn: 'Account', labelTa: 'கணக்கு', icon: User, color: 'text-blue-500 bg-blue-500/10' },
  orders: { labelEn: 'Orders', labelTa: 'ஆர்டர்கள்', icon: ShoppingBag, color: 'text-emerald-500 bg-emerald-500/10' },
  rentals: { labelEn: 'Rentals', labelTa: 'வாடகை', icon: Wrench, color: 'text-amber-500 bg-amber-500/10' },
  labor: { labelEn: 'Labor', labelTa: 'தொழிலாளர்', icon: Users, color: 'text-purple-500 bg-purple-500/10' },
  payments: { labelEn: 'Payments', labelTa: 'பணம்', icon: CreditCard, color: 'text-teal-500 bg-teal-500/10' },
  technical: { labelEn: 'Technical', labelTa: 'தொழில்நுட்பம்', icon: Settings, color: 'text-slate-500 bg-slate-500/10' },
};

// ─── Main Component ─────────────────────────────────────────────────
export default function CustomerCareBoard() {
  const { t, language, userName, addToast } = useApp();
  const isTamil = language === 'ta';

  const [view, setView] = useState<CareView>('home');
  const [faqSearch, setFaqSearch] = useState('');
  const [faqCategory, setFaqCategory] = useState<SupportCategory | 'all'>('all');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);

  // Create ticket form
  const [ticketCategory, setTicketCategory] = useState<SupportCategory>('orders');
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketDesc, setTicketDesc] = useState('');
  const [ticketPriority, setTicketPriority] = useState<TicketPriority>('medium');
  const [tickets, setTickets] = useState<SupportTicket[]>([...SEED_TICKETS]);

  // Feedback
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackHover, setFeedbackHover] = useState(0);
  const [feedbackText, setFeedbackText] = useState('');
  const [feedbackSubmitted, setFeedbackSubmitted] = useState(false);

  // Filter FAQs
  const filteredFaqs = FAQ_DATA.filter((faq) => {
    const matchesCategory = faqCategory === 'all' || faq.category === faqCategory;
    const q = faqSearch.toLowerCase();
    const matchesSearch = !q || (isTamil ? faq.questionTa : faq.questionEn).toLowerCase().includes(q)
      || (isTamil ? faq.answerTa : faq.answerEn).toLowerCase().includes(q);
    return matchesCategory && matchesSearch;
  });

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject.trim() || !ticketDesc.trim()) return;
    const newTicket: SupportTicket = {
      id: `TKT-${String(tickets.length + 1).padStart(3, '0')}`,
      category: ticketCategory,
      subject: ticketSubject,
      description: ticketDesc,
      priority: ticketPriority,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setTickets(prev => [newTicket, ...prev]);
    setTicketSubject('');
    setTicketDesc('');
    setTicketPriority('medium');
    addToast(isTamil ? '✅ சப்போர்ட் டிக்கெட் உருவாக்கப்பட்டது!' : '✅ Support ticket created successfully!', 'success');
    setView('my_tickets');
  };

  const handleFeedbackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (feedbackRating === 0) return;
    setFeedbackSubmitted(true);
    addToast(isTamil ? '🙏 உங்கள் கருத்துக்கு நன்றி!' : '🙏 Thank you for your feedback!', 'success');
  };

  // ─── Render Views ─────────────────────────────────────────────────
  const renderHome = () => (
    <div className="space-y-6 animate-fade-in">
      {/* Category Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <button onClick={() => setView('faq')} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] hover:border-primary-500/30 hover:shadow-md cursor-pointer transition-all duration-300 text-left group">
          <div className="w-11 h-11 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <HelpCircle className="w-5 h-5 text-blue-500" />
          </div>
          <p className="text-xs font-black text-foreground">{isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'FAQ'}</p>
          <p className="text-[10px] font-semibold text-earth-400 mt-0.5">{isTamil ? 'பொதுவான கேள்விகள் & பதில்கள்' : 'Common questions & answers'}</p>
        </button>

        <button onClick={() => setView('create_ticket')} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] hover:border-primary-500/30 hover:shadow-md cursor-pointer transition-all duration-300 text-left group">
          <div className="w-11 h-11 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <MessageSquarePlus className="w-5 h-5 text-emerald-500" />
          </div>
          <p className="text-xs font-black text-foreground">{isTamil ? 'டிக்கெட் உருவாக்கு' : 'Create Ticket'}</p>
          <p className="text-[10px] font-semibold text-earth-400 mt-0.5">{isTamil ? 'புதிய சப்போர்ட் கோரிக்கை' : 'New support request'}</p>
        </button>

        <button onClick={() => setView('my_tickets')} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] hover:border-primary-500/30 hover:shadow-md cursor-pointer transition-all duration-300 text-left group">
          <div className="w-11 h-11 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Ticket className="w-5 h-5 text-amber-500" />
          </div>
          <p className="text-xs font-black text-foreground">{isTamil ? 'என் டிக்கெட்கள்' : 'My Tickets'}</p>
          <p className="text-[10px] font-semibold text-earth-400 mt-0.5">
            {tickets.filter(t => t.status !== 'resolved').length} {isTamil ? 'செயலில்' : 'active'}
          </p>
        </button>

        <button onClick={() => setView('contact')} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] hover:border-primary-500/30 hover:shadow-md cursor-pointer transition-all duration-300 text-left group">
          <div className="w-11 h-11 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <Phone className="w-5 h-5 text-purple-500" />
          </div>
          <p className="text-xs font-black text-foreground">{isTamil ? 'தொடர்பு கொள்ள' : 'Contact Us'}</p>
          <p className="text-[10px] font-semibold text-earth-400 mt-0.5">{isTamil ? 'நேரடி உதவி' : 'Direct support'}</p>
        </button>

        <button onClick={() => setView('feedback')} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] hover:border-primary-500/30 hover:shadow-md cursor-pointer transition-all duration-300 text-left group">
          <div className="w-11 h-11 rounded-2xl bg-teal-500/10 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
            <ThumbsUp className="w-5 h-5 text-teal-500" />
          </div>
          <p className="text-xs font-black text-foreground">{isTamil ? 'கருத்து தெரிவிக்க' : 'Feedback'}</p>
          <p className="text-[10px] font-semibold text-earth-400 mt-0.5">{isTamil ? 'உங்கள் அனுபவம்' : 'Share your experience'}</p>
        </button>

        <div className="p-5 rounded-2xl border border-primary-500/15 bg-primary-500/5 dark:bg-primary-950/20">
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="w-4 h-4 text-primary-500" />
            <span className="text-[9px] font-mono font-black text-primary-600 dark:text-primary-400 uppercase tracking-wider">
              {isTamil ? 'நிலை' : 'Status'}
            </span>
          </div>
          <p className="text-2xl font-black text-primary-600 dark:text-primary-400">{tickets.length}</p>
          <p className="text-[10px] font-bold text-earth-500 mt-0.5">{isTamil ? 'மொத்த டிக்கெட்கள்' : 'Total tickets'}</p>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: isTamil ? 'திறந்தவை' : 'Open', count: tickets.filter(t => t.status === 'open').length, color: 'text-blue-500 bg-blue-500/10' },
          { label: isTamil ? 'செயலில்' : 'In Progress', count: tickets.filter(t => t.status === 'in_progress').length, color: 'text-amber-500 bg-amber-500/10' },
          { label: isTamil ? 'தீர்வு' : 'Resolved', count: tickets.filter(t => t.status === 'resolved').length, color: 'text-emerald-500 bg-emerald-500/10' },
        ].map((stat) => (
          <div key={stat.label} className="p-4 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] text-center">
            <p className="text-2xl font-black text-foreground">{stat.count}</p>
            <p className={`text-[10px] font-black uppercase tracking-wider mt-1 ${stat.color.split(' ')[0]}`}>{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderFAQ = () => (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={faqSearch}
            onChange={(e) => setFaqSearch(e.target.value)}
            placeholder={isTamil ? 'கேள்விகளைத் தேடுங்கள்...' : 'Search questions...'}
            className="w-full h-11 pl-10 pr-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-900/20 text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
          />
          <Search className="w-4 h-4 text-earth-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        </div>
        <select
          value={faqCategory}
          onChange={(e) => setFaqCategory(e.target.value as SupportCategory | 'all')}
          className="h-11 px-4 rounded-2xl bg-white dark:bg-[#111714] border border-earth-200/50 dark:border-earth-900/20 text-xs font-bold text-foreground cursor-pointer focus:outline-none"
        >
          <option value="all">{isTamil ? 'அனைத்து வகைகள்' : 'All Categories'}</option>
          {Object.entries(categoryConfig).map(([key, cfg]) => (
            <option key={key} value={key}>{isTamil ? cfg.labelTa : cfg.labelEn}</option>
          ))}
        </select>
      </div>

      <div className="space-y-2">
        {filteredFaqs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714]">
            <HelpCircle className="w-8 h-8 text-earth-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-earth-400">{isTamil ? 'கேள்விகள் எதுவும் கிடைக்கவில்லை' : 'No matching questions found'}</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const cfg = categoryConfig[faq.category];
            const isExpanded = expandedFaq === faq.id;
            return (
              <div key={faq.id} className="rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] overflow-hidden transition-all duration-300">
                <button
                  onClick={() => setExpandedFaq(isExpanded ? null : faq.id)}
                  className="w-full p-4 flex items-center gap-3 text-left cursor-pointer bg-transparent border-0 hover:bg-earth-50/30 dark:hover:bg-earth-950/10 transition-colors"
                >
                  <div className={`w-8 h-8 rounded-xl ${cfg.color} flex items-center justify-center shrink-0`}>
                    <cfg.icon className="w-4 h-4" />
                  </div>
                  <p className="text-xs font-bold text-foreground flex-1">{isTamil ? faq.questionTa : faq.questionEn}</p>
                  {isExpanded ? <ChevronUp className="w-4 h-4 text-earth-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-earth-400 shrink-0" />}
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 pt-0 border-t border-earth-100/30 dark:border-earth-900/10 animate-fade-in">
                    <div className="ml-11 text-xs font-medium text-earth-600 dark:text-earth-400 leading-relaxed pt-3">
                      {isTamil ? faq.answerTa : faq.answerEn}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const renderCreateTicket = () => (
    <div className="animate-fade-in">
      <form onSubmit={handleCreateTicket} className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs space-y-5">
        <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
          <MessageSquarePlus className="w-4 h-4 text-primary-500" />
          {isTamil ? 'புதிய சப்போர்ட் டிக்கெட்' : 'New Support Ticket'}
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
              {isTamil ? 'வகை' : 'Category'}
            </label>
            <select value={ticketCategory} onChange={(e) => setTicketCategory(e.target.value as SupportCategory)}
              className="w-full h-11 px-3 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              {Object.entries(categoryConfig).map(([key, cfg]) => (
                <option key={key} value={key}>{isTamil ? cfg.labelTa : cfg.labelEn}</option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
              {isTamil ? 'முன்னுரிமை' : 'Priority'}
            </label>
            <select value={ticketPriority} onChange={(e) => setTicketPriority(e.target.value as TicketPriority)}
              className="w-full h-11 px-3 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 text-xs font-bold text-foreground focus:outline-none focus:border-primary-500 cursor-pointer"
            >
              <option value="low">{isTamil ? 'குறைந்தது' : 'Low'}</option>
              <option value="medium">{isTamil ? 'நடுத்தரம்' : 'Medium'}</option>
              <option value="high">{isTamil ? 'அதிகம்' : 'High'}</option>
            </select>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
            {isTamil ? 'தலைப்பு' : 'Subject'}
          </label>
          <input type="text" required value={ticketSubject} onChange={(e) => setTicketSubject(e.target.value)}
            placeholder={isTamil ? 'பிரச்சனையை சுருக்கமாக விவரிக்கவும்' : 'Briefly describe the issue'}
            className="w-full h-11 px-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500"
          />
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
            {isTamil ? 'விவரம்' : 'Description'}
          </label>
          <textarea required value={ticketDesc} onChange={(e) => setTicketDesc(e.target.value)}
            placeholder={isTamil ? 'பிரச்சனையை விரிவாக விவரிக்கவும்...' : 'Describe the issue in detail...'}
            rows={4}
            className="w-full px-4 py-3 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 resize-none"
          />
        </div>

        <button type="submit"
          className="w-full h-12 bg-primary-500 hover:bg-primary-600 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all duration-200 border-0 flex items-center justify-center gap-2"
        >
          <Send className="w-4 h-4" />
          {isTamil ? 'டிக்கெட் சமர்ப்பி' : 'Submit Ticket'}
        </button>
      </form>
    </div>
  );

  const renderMyTickets = () => (
    <div className="space-y-4 animate-fade-in">
      {tickets.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714]">
          <Ticket className="w-10 h-10 text-earth-300 mx-auto mb-3" />
          <p className="text-sm font-bold text-earth-400">{isTamil ? 'டிக்கெட்கள் இல்லை' : 'No tickets yet'}</p>
          <p className="text-[11px] text-earth-400 mt-1">{isTamil ? 'புதிய டிக்கெட் உருவாக்க மேலே கிளிக் செய்யவும்' : 'Create a new ticket to get support'}</p>
        </div>
      ) : (
        tickets.map((ticket) => {
          const cfg = categoryConfig[ticket.category];
          return (
            <div key={ticket.id} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-9 h-9 rounded-xl ${cfg.color} flex items-center justify-center shrink-0`}>
                    <cfg.icon className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-black text-foreground">{ticket.subject}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-[9px] font-mono font-bold text-earth-400">{ticket.id}</span>
                      <span className="text-earth-300">·</span>
                      <span className="text-[9px] font-mono font-bold text-earth-400">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider ${
                    ticket.priority === 'high' ? 'bg-red-500/10 text-red-600 dark:text-red-400' :
                    ticket.priority === 'medium' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                  }`}>
                    {ticket.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-lg text-[8px] font-black uppercase tracking-wider flex items-center gap-1 ${
                    ticket.status === 'open' ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400' :
                    ticket.status === 'in_progress' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' :
                    'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  }`}>
                    {ticket.status === 'open' ? <AlertCircle className="w-3 h-3" /> :
                     ticket.status === 'in_progress' ? <Clock className="w-3 h-3" /> :
                     <CheckCircle className="w-3 h-3" />}
                    {ticket.status === 'open' ? (isTamil ? 'திறந்தது' : 'Open') :
                     ticket.status === 'in_progress' ? (isTamil ? 'செயலில்' : 'In Progress') :
                     (isTamil ? 'தீர்வு' : 'Resolved')}
                  </span>
                </div>
              </div>
              <p className="text-[11px] font-medium text-earth-500 dark:text-earth-400 leading-relaxed">{ticket.description}</p>
              {ticket.response && (
                <div className="p-3 rounded-xl bg-primary-500/5 dark:bg-primary-950/15 border border-primary-500/10">
                  <p className="text-[9px] font-mono font-bold text-primary-600 dark:text-primary-400 uppercase tracking-wider mb-1">
                    {isTamil ? '💬 சப்போர்ட் பதில்' : '💬 Support Response'}
                  </p>
                  <p className="text-[11px] font-medium text-foreground leading-relaxed">{ticket.response}</p>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  const renderContact = () => (
    <div className="space-y-4 animate-fade-in">
      {[
        {
          icon: Phone, color: 'bg-emerald-500/10 text-emerald-500', labelEn: 'Phone Support', labelTa: 'தொலைபேசி ஆதரவு',
          valueEn: '1800-VLINK-HELP (Toll Free)', valueTa: '1800-VLINK-HELP (இலவச அழைப்பு)',
          descEn: 'Mon-Sat, 7 AM - 9 PM IST', descTa: 'திங்கள்-சனி, காலை 7 - இரவு 9',
        },
        {
          icon: Mail, color: 'bg-blue-500/10 text-blue-500', labelEn: 'Email Support', labelTa: 'மின்னஞ்சல் ஆதரவு',
          valueEn: 'support@vlink-agri.in', valueTa: 'support@vlink-agri.in',
          descEn: 'Response within 24 hours', descTa: '24 மணி நேரத்தில் பதில்',
        },
        {
          icon: MessageCircle, color: 'bg-green-500/10 text-green-500', labelEn: 'WhatsApp', labelTa: 'வாட்ஸ்அப்',
          valueEn: '+91 98765 43210', valueTa: '+91 98765 43210',
          descEn: 'Send photos of crop issues directly', descTa: 'பயிர் பிரச்சனைகளின் புகைப்படங்களை நேரடியாக அனுப்புங்கள்',
        },
      ].map((contact) => (
        <div key={contact.labelEn} className="p-5 rounded-2xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] flex items-start gap-4 hover:shadow-sm transition-shadow duration-300">
          <div className={`w-12 h-12 rounded-2xl ${contact.color} flex items-center justify-center shrink-0`}>
            <contact.icon className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-black text-foreground">{isTamil ? contact.labelTa : contact.labelEn}</p>
            <p className="text-sm font-bold text-primary-600 dark:text-primary-400 mt-1">{isTamil ? contact.valueTa : contact.valueEn}</p>
            <p className="text-[10px] font-semibold text-earth-400 mt-1">{isTamil ? contact.descTa : contact.descEn}</p>
          </div>
        </div>
      ))}

      <div className="p-5 rounded-2xl border border-primary-500/15 bg-primary-500/5 dark:bg-primary-950/20">
        <div className="flex items-center gap-2 mb-2">
          <Info className="w-4 h-4 text-primary-500" />
          <p className="text-xs font-black text-foreground">{isTamil ? 'குறிப்பு' : 'Note'}</p>
        </div>
        <p className="text-[11px] font-medium text-earth-500 dark:text-earth-400 leading-relaxed">
          {isTamil
            ? 'தமிழில் பேச முடியும். கிராமப்புற விவசாயிகளுக்கு முன்னுரிமை ஆதரவு கிடைக்கும். வாட்ஸ்அப் மூலம் பயிர் புகைப்படம் அனுப்பி உடனடி நோயறிதல் பெறலாம்.'
            : 'Tamil language support available. Priority support for rural farmers. Send crop photos via WhatsApp for instant disease diagnosis assistance.'}
        </p>
      </div>
    </div>
  );

  const renderFeedback = () => (
    <div className="animate-fade-in">
      <div className="p-6 rounded-3xl border border-earth-200/60 dark:border-primary-950/20 bg-white dark:bg-[#111714] shadow-xs">
        {feedbackSubmitted ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-primary-500/10 flex items-center justify-center mx-auto mb-4">
              <ThumbsUp className="w-8 h-8 text-primary-500" />
            </div>
            <h3 className="text-lg font-black text-foreground">{isTamil ? '🙏 நன்றி!' : '🙏 Thank You!'}</h3>
            <p className="text-xs font-semibold text-earth-500 dark:text-earth-400 mt-2">
              {isTamil ? 'உங்கள் கருத்து எங்களுக்கு மிகவும் மதிப்புள்ளது. V-LINK-ஐ மேம்படுத்த இது உதவும்.' : 'Your feedback is valuable to us. It helps us improve V-LINK for all farmers.'}
            </p>
            <button onClick={() => { setFeedbackSubmitted(false); setFeedbackRating(0); setFeedbackText(''); }}
              className="mt-4 px-6 py-2 rounded-xl bg-primary-500/10 text-primary-600 dark:text-primary-400 text-xs font-bold cursor-pointer border-0"
            >
              {isTamil ? 'மீண்டும் கருத்து தெரிவிக்க' : 'Submit Another'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleFeedbackSubmit} className="space-y-5">
            <h3 className="text-sm font-black text-foreground uppercase tracking-wider flex items-center gap-2">
              <ThumbsUp className="w-4 h-4 text-primary-500" />
              {isTamil ? 'உங்கள் கருத்து' : 'Your Feedback'}
            </h3>

            <div>
              <p className="text-xs font-bold text-earth-500 dark:text-earth-400 mb-3">
                {isTamil ? 'V-LINK அனுபவத்தை மதிப்பிடுங்கள்' : 'Rate your V-LINK experience'}
              </p>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button key={star} type="button"
                    onClick={() => setFeedbackRating(star)}
                    onMouseEnter={() => setFeedbackHover(star)}
                    onMouseLeave={() => setFeedbackHover(0)}
                    className="cursor-pointer border-0 bg-transparent p-0.5 transition-transform hover:scale-125"
                  >
                    <Star className={`w-8 h-8 transition-colors ${
                      star <= (feedbackHover || feedbackRating)
                        ? 'text-amber-400 fill-amber-400'
                        : 'text-earth-200 dark:text-earth-800'
                    }`} />
                  </button>
                ))}
                {feedbackRating > 0 && (
                  <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-2">
                    {feedbackRating}/5
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
                {isTamil ? 'கருத்துகள் (விரும்பினால்)' : 'Comments (Optional)'}
              </label>
              <textarea value={feedbackText} onChange={(e) => setFeedbackText(e.target.value)}
                placeholder={isTamil ? 'உங்கள் அனுபவத்தை பகிர்ந்து கொள்ளுங்கள்...' : 'Share your experience with V-LINK...'}
                rows={4}
                className="w-full px-4 py-3 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200 dark:border-earth-800 text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 resize-none"
              />
            </div>

            <button type="submit" disabled={feedbackRating === 0}
              className="w-full h-12 bg-primary-500 hover:bg-primary-600 disabled:bg-earth-300 dark:disabled:bg-earth-800 text-white rounded-2xl text-xs font-bold shadow-md cursor-pointer transition-all duration-200 border-0 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              {isTamil ? 'கருத்தை அனுப்பு' : 'Submit Feedback'}
            </button>
          </form>
        )}
      </div>
    </div>
  );

  // ─── Main Render ──────────────────────────────────────────────────
  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {view !== 'home' && (
            <button onClick={() => setView('home')}
              className="w-9 h-9 rounded-xl bg-earth-100/60 dark:bg-earth-950/30 hover:bg-earth-200/60 dark:hover:bg-earth-900/30 flex items-center justify-center cursor-pointer border-0 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 text-earth-500" />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2.5">
              <Headset className="w-7 h-7 text-primary-500" />
              {t('support_title') || 'Customer Care'}
            </h1>
            <p className="text-xs text-earth-500 dark:text-earth-400 mt-1">
              {view === 'home' ? (t('support_desc') || 'Help center, FAQ, tickets & feedback') :
               view === 'faq' ? (isTamil ? 'அடிக்கடி கேட்கப்படும் கேள்விகள்' : 'Frequently Asked Questions') :
               view === 'create_ticket' ? (isTamil ? 'புதிய சப்போர்ட் கோரிக்கை' : 'Create a new support request') :
               view === 'my_tickets' ? (isTamil ? 'உங்கள் சப்போர்ட் டிக்கெட்கள்' : 'Your support tickets') :
               view === 'contact' ? (isTamil ? 'எங்களை தொடர்பு கொள்ளுங்கள்' : 'Get in touch with our team') :
               (isTamil ? 'உங்கள் அனுபவத்தை பகிருங்கள்' : 'Share your experience')}
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Content */}
      {view === 'home' && renderHome()}
      {view === 'faq' && renderFAQ()}
      {view === 'create_ticket' && renderCreateTicket()}
      {view === 'my_tickets' && renderMyTickets()}
      {view === 'contact' && renderContact()}
      {view === 'feedback' && renderFeedback()}
    </div>
  );
}
