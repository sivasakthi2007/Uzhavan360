'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

import { useApp } from '@/context/AppContext';

interface Review {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  date: string;
}

interface RatingCardProps {
  averageRating: number;
  reviewCount: number;
  reviews: Review[];
  onSubmitReview?: (rating: number, comment: string) => void;
  title?: string;
}

export default function RatingCard({
  averageRating,
  reviewCount,
  reviews,
  onSubmitReview,
  title
}: RatingCardProps) {
  const { language } = useApp();
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);

  const displayTitle = title || (language === 'ta' ? 'மதிப்புரைகள் & கருத்துகள்' : 'Reviews & Feedback');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!comment.trim()) return;
    onSubmitReview?.(rating, comment);
    setComment('');
    setRating(5);
    setIsFormOpen(false);
  };

  const renderStars = (rate: number, size = "w-3.5 h-3.5") => {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            className={`${size} ${
              i < Math.round(rate)
                ? 'text-accent-500 fill-accent-500'
                : 'text-earth-200 dark:text-earth-800'
            }`}
          />
        ))}
      </div>
    );
  };

  return (
    <div className="rounded-3xl border border-[#e6eae7] dark:border-primary-950/20 bg-white dark:bg-[#111714] p-6 shadow-sm space-y-6">
      {/* Header and Average */}
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-sm font-black text-foreground uppercase tracking-wider">{displayTitle}</h4>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-2xl font-black text-foreground">{averageRating}</span>
            <div className="space-y-0.5">
              {renderStars(averageRating, "w-4 h-4")}
              <span className="text-[10px] text-earth-400 block font-bold">
                {language === 'ta' ? `${reviewCount} மதிப்பீடுகளின் அடிப்படையில்` : `based on ${reviewCount} ratings`}
              </span>
            </div>
          </div>
        </div>

        {onSubmitReview && (
          <button
            onClick={() => setIsFormOpen(!isFormOpen)}
            className="px-4 py-2 rounded-xl border border-primary-500/20 hover:bg-primary-500/5 text-primary-500 font-bold text-xs cursor-pointer transition-all"
          >
            {isFormOpen 
              ? (language === 'ta' ? 'கருத்தை மூடு' : 'Close Review') 
              : (language === 'ta' ? 'கருத்து எழுதவும்' : 'Write Review')}
          </button>
        )}
      </div>

      {/* Review Submission Form */}
      {isFormOpen && onSubmitReview && (
        <form onSubmit={handleSubmit} className="p-4 rounded-2xl bg-earth-50/50 dark:bg-earth-950/20 border border-earth-200/55 dark:border-earth-900/30 space-y-4 animate-fade-in">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
              {language === 'ta' ? 'உங்கள் மதிப்பீடு' : 'Your Rating'}
            </label>
            <div className="flex items-center gap-1.5">
              {Array.from({ length: 5 }).map((_, i) => {
                const starVal = i + 1;
                return (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setRating(starVal)}
                    onMouseEnter={() => setHoveredStar(starVal)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-1 cursor-pointer border-0 bg-transparent text-accent-500"
                  >
                    <Star
                      className={`w-6 h-6 ${
                        starVal <= (hoveredStar !== null ? hoveredStar : rating)
                          ? 'fill-accent-500 text-accent-500'
                          : 'text-earth-300 dark:text-earth-700 fill-transparent'
                      }`}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-wider text-earth-500 dark:text-earth-400 block">
              {language === 'ta' ? 'கருத்துரை' : 'Comment'}
            </label>
            <textarea
              required
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder={language === 'ta' ? 'உங்கள் அனுபவத்தை மற்ற விவசாயிகளுடன் பகிர்ந்து கொள்ளுங்கள்...' : 'Tell other farmers about your experience...'}
              className="w-full p-3 bg-white dark:bg-earth-950/40 border border-earth-200 dark:border-earth-850 rounded-xl text-xs font-semibold text-foreground focus:outline-none focus:border-primary-500 resize-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all border-0"
          >
            {language === 'ta' ? 'கருத்தை சமர்ப்பிக்கவும்' : 'Submit Feedback'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      <div className="space-y-4 pt-2">
        {reviews.length === 0 ? (
          <div className="text-center py-6 text-earth-400 text-xs font-bold border-t border-earth-100 dark:border-earth-900/30">
            {language === 'ta' ? 'இன்னும் மதிப்புரைகள் இல்லை. உங்கள் கருத்தை முதலில் பகிர்ந்து கொள்ளுங்கள்!' : 'No reviews yet. Be the first to share your feedback!'}
          </div>
        ) : (
          <div className="divide-y divide-earth-100 dark:divide-earth-900/20 max-h-72 overflow-y-auto pr-1">
            {reviews.map((rev) => (
              <div key={rev.id} className="py-4 first:pt-0 last:pb-0 space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-black text-xs text-foreground block">{rev.reviewerName}</span>
                    <span className="text-[9px] text-earth-400 font-mono block mt-0.5">{rev.date}</span>
                  </div>
                  {renderStars(rev.rating)}
                </div>
                <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed font-semibold">
                  {rev.comment}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
