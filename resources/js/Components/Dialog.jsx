import { useRef, useEffect, useState } from 'react';

export default function Modal({
  open,
  onOpenChange,
  title,
  children,
  footer,
}) {
  const dialogRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    if (open && dialogRef.current && !dialogRef.current.open) {
      setIsAnimating(false);
      dialogRef.current.showModal();
      // Trigger animation on next frame
      requestAnimationFrame(() => {
        requestAnimationFrame(() => setIsAnimating(true));
      });
    } else if (!open && dialogRef.current && dialogRef.current.open) {
      setIsAnimating(false);
      // Add closing class for better close animation
      if (dialogRef.current) {
        dialogRef.current.dataset.closing = 'true';
      }
      // Wait for animation to finish before closing
      const timer = setTimeout(() => {
        try {
          if (dialogRef.current?.open) {
            dialogRef.current.dataset.closing = 'false';
            dialogRef.current.close();
          }
        } catch (e) {
          // Dialog already closed
        }
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      className="rounded-lg p-0 shadow-2xl border-0 backdrop:bg-black/40 backdrop:backdrop-blur-sm max-w-md w-full"
      onClose={() => onOpenChange(false)}
      style={{
        animation: isAnimating
          ? 'none'
          : 'none',
      }}
    >
      <style>{`
        @keyframes slideInScale {
          0% {
            opacity: 0;
            transform: scale(0.75) translateY(-60px) rotateX(20deg);
            filter: blur(12px);
          }
          40% {
            opacity: 0.5;
          }
          100% {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0);
            filter: blur(0px);
          }
        }

        @keyframes slideOutScale {
          0% {
            opacity: 1;
            transform: scale(1) translateY(0) rotateX(0);
            filter: blur(0px);
          }
          30% {
            opacity: 0.6;
            transform: scale(0.95) translateY(-10px) rotateX(5deg);
          }
          100% {
            opacity: 0;
            transform: scale(0.60) translateY(-80px) rotateX(25deg);
            filter: blur(16px);
          }
        }

        @keyframes backdropFadeIn {
          0% {
            opacity: 0;
            filter: blur(0px);
          }
          100% {
            opacity: 1;
            filter: blur(4px);
          }
        }

        @keyframes backdropFadeOut {
          0% {
            opacity: 1;
            filter: blur(4px);
          }
          100% {
            opacity: 0;
            filter: blur(0px);
          }
        }

        @keyframes glow {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(79, 70, 229, 0.1);
          }
          50% {
            box-shadow: 0 0 0 10px rgba(79, 70, 229, 0);
          }
        }

        @keyframes contentFadeOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(-20px);
          }
        }

        @keyframes footerFadeOut {
          0% {
            opacity: 1;
            transform: translateY(0);
          }
          100% {
            opacity: 0;
            transform: translateY(20px);
          }
        }

        dialog {
          transition: none;
        }

        dialog[open] {
          animation: slideInScale 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) forwards !important;
        }

        dialog[data-closing="true"] {
          animation: slideOutScale 0.35s cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards !important;
        }

        dialog::backdrop {
          opacity: 0;
          transition: opacity 0.35s ease-out, filter 0.35s ease-out;
        }

        dialog[open]::backdrop {
          animation: backdropFadeIn 0.55s ease-out forwards;
          opacity: 1;
        }

        dialog[data-closing="true"]::backdrop {
          animation: backdropFadeOut 0.35s ease-in forwards;
          opacity: 0;
        }

        .dialog-header-glow {
          animation: glow 2.5s infinite;
        }

        .dialog-content-fade {
          animation: fadeInUp 0.7s ease-out 0.1s both;
        }

        dialog[data-closing="true"] .dialog-content-fade {
          animation: contentFadeOut 0.3s ease-in forwards;
        }

        @keyframes fadeInUp {
          0% {
            opacity: 0;
            transform: translateY(20px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }

        .dialog-footer-fade {
          animation: fadeInDown 0.7s ease-out 0.2s both;
        }

        dialog[data-closing="true"] .dialog-footer-fade {
          animation: footerFadeOut 0.25s ease-in forwards;
        }

        @keyframes fadeInDown {
          0% {
            opacity: 0;
            transform: translateY(-20px);
            filter: blur(4px);
          }
          100% {
            opacity: 1;
            transform: translateY(0);
            filter: blur(0px);
          }
        }
      `}</style>

      <div className="bg-white rounded-lg overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
        {/* Header with Gradient and Glow */}
        <div className="dialog-header-glow bg-gradient-to-r from-indigo-600 via-indigo-700 to-purple-700 px-6 py-5 flex items-center justify-between border-b-4 border-indigo-800">
          <div className="flex items-center gap-3">
            <div className="w-1 h-6 bg-indigo-200 rounded-full"></div>
            <h2 className="text-lg font-bold text-white truncate drop-shadow-lg">{title}</h2>
          </div>
          <button
            onClick={() => onOpenChange(false)}
            className="text-indigo-100 hover:text-white hover:bg-indigo-600 transition-all duration-200 p-2 rounded-full hover:scale-110 active:scale-95"
            aria-label="Close dialog"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content with Fade Animation */}
        <div className="dialog-content-fade flex-1 overflow-y-auto p-6 bg-gradient-to-b from-white to-gray-50">
          <div className="space-y-4">
            {children}
          </div>
        </div>

        {/* Footer with Enhanced Styling */}
        {footer && (
          <div className="dialog-footer-fade border-t-2 border-gray-200 bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 flex items-center justify-end space-x-3 shadow-inner">
            {footer}
          </div>
        )}
      </div>
    </dialog>
  );
}
