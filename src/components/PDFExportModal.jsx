import { motion, AnimatePresence } from 'framer-motion'
import { Download, X, FileText } from 'lucide-react'

export default function PDFExportModal({ isOpen, onClose, pdfData, title = "Curriculum Document Export" }) {
  const handleDownload = () => {
    if (pdfData?.doc) {
      pdfData.doc.save(pdfData.filename)
    }
  }

  if (!isOpen || !pdfData) return null

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-background/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-card border border-border rounded-3xl p-6 shadow-2xl max-w-md w-full text-center relative overflow-hidden"
        >
          {/* Header branding overlay background effect */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-full pointer-events-none" />
          
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-text-secondary hover:text-text-primary hover:bg-primary/5 rounded-xl transition-colors cursor-pointer"
          >
            <X size={15} />
          </button>

          <div className="w-12 h-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto mb-4">
            <FileText size={22} />
          </div>
          
          <h3 className="text-base font-extrabold text-text-primary mb-1">{title}</h3>
          <p className="text-xs text-text-secondary mb-6 leading-relaxed">
            Your curriculum document has been successfully generated. Click the button below to download the official PDF to your local drive.
          </p>

          <div className="flex flex-col gap-3">
            <button
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 w-full py-3.5 bg-primary text-white font-bold rounded-xl text-xs shadow-md shadow-primary/20 hover:opacity-95 transition-all cursor-pointer active:scale-98"
            >
              <Download size={14} />
              <span>Download PDF Document</span>
            </button>

            <button
              onClick={onClose}
              className="w-full py-3 border border-border rounded-xl text-xs font-semibold text-text-secondary hover:bg-primary/5 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
