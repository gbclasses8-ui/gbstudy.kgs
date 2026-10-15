import React, { useState } from 'react';
import { X, Download, ExternalLink, FileText, Loader2, AlertCircle } from 'lucide-react';
import { APP_ICON } from '../constants';

interface PdfModalProps {
  pdfUrl: string | null;
  pdfTitle: string;
  onClose: () => void;
}

export const PdfModal: React.FC<PdfModalProps> = ({
  pdfUrl,
  pdfTitle,
  onClose,
}) => {
  const [loading, setLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  if (!pdfUrl) return null;

  const downloadUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}&download=true&filename=${encodeURIComponent(pdfTitle.replace(/[^a-zA-Z0-9_\u0900-\u097F\s-]/g, '') + '.pdf')}`;
  const viewUrl = `/api/pdf-proxy?url=${encodeURIComponent(pdfUrl)}`;

  const handleDownload = () => {
    const a = document.createElement('a');
    a.href = downloadUrl;
    a.download = `${pdfTitle}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-4xl h-[92vh] bg-white rounded-2xl overflow-hidden border border-pink-200 shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-3 sm:p-4 border-b border-pink-100 bg-gradient-to-r from-pink-50 to-rose-50/50">
          <div className="flex items-center gap-3 truncate">
            <img src={APP_ICON} alt="GB STUDY" className="w-8 h-8 rounded-lg border border-pink-400" />
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base truncate max-w-md">
                {pdfTitle}
              </h3>
              <span className="text-[11px] font-semibold text-pink-600">GB STUDY Classroom Note</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownload}
              className="py-1.5 px-3 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 shadow-sm flex items-center gap-1.5 transition-all"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>

            <a
              href={pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-100/60 transition-colors"
              title="Open direct file in new tab"
            >
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-600 hover:text-pink-600 hover:bg-pink-100/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="relative flex-1 bg-slate-100 overflow-hidden flex items-center justify-center">
          {loading && (
            <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/80 z-10 text-pink-600">
              <Loader2 className="w-8 h-8 animate-spin" />
              <span className="text-sm font-semibold">Loading PDF Document...</span>
            </div>
          )}

          {hasError ? (
            <div className="p-6 text-center max-w-md">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
              <h4 className="font-bold text-slate-900 mb-1">Preview Unavailable</h4>
              <p className="text-xs text-slate-600 mb-4">
                Your browser could not preview this PDF directly. You can download it or open the direct link below.
              </p>
              <div className="flex justify-center gap-3">
                <button
                  onClick={handleDownload}
                  className="py-2 px-4 rounded-xl text-xs font-bold text-white bg-pink-600 hover:bg-pink-700 inline-flex items-center gap-1.5 shadow-md"
                >
                  <Download className="w-4 h-4" />
                  <span>Download PDF</span>
                </button>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="py-2 px-4 rounded-xl text-xs font-bold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 inline-flex items-center gap-1.5"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Direct Link</span>
                </a>
              </div>
            </div>
          ) : (
            <iframe
              src={viewUrl}
              title={pdfTitle}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setHasError(true);
              }}
              className="w-full h-full border-0"
            />
          )}
        </div>
      </div>
    </div>
  );
};
