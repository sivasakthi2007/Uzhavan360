'use client';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isConfirming?: boolean;
}

export default function ConfirmationDialog({
  isOpen,
  title,
  description,
  confirmText,
  cancelText = 'Cancel',
  onConfirm,
  onCancel,
  isConfirming = false
}: ConfirmationDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 dark:bg-black/85 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
      <div 
        className="fixed inset-0" 
        onClick={onCancel}
      />
      <div className="relative bg-white dark:bg-[#111714] border border-earth-200 dark:border-primary-950/20 w-full max-w-sm rounded-3xl p-6 shadow-2xl space-y-5 animate-slide-up">
        <div className="space-y-2">
          <h3 className="text-base font-black text-foreground tracking-tight">{title}</h3>
          <p className="text-xs text-earth-500 dark:text-earth-400 leading-relaxed font-medium">
            {description}
          </p>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <button
            onClick={onCancel}
            disabled={isConfirming}
            className="flex-1 h-10 rounded-xl border border-earth-200 dark:border-primary-950/20 hover:bg-earth-50 dark:hover:bg-earth-900/40 text-earth-700 dark:text-earth-300 font-bold text-xs cursor-pointer transition-all disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 h-10 rounded-xl bg-primary-500 hover:bg-primary-600 text-white font-bold text-xs shadow-md transition-all duration-200 cursor-pointer border-0 disabled:opacity-50"
          >
            {isConfirming ? 'Processing...' : confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
