import React from 'react';
import { Printer, Check, Download, FileText } from 'lucide-react';
import { Sheet } from '../types';
import { ModalWrapper } from './ui/ModalWrapper';
import { formatRupees, getAutoDateTime } from '../utils/formatters';

interface PrintReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  sheet: Sheet;
}

export const PrintReportModal: React.FC<PrintReportModalProps> = ({
  isOpen,
  onClose,
  sheet,
}) => {
  const products = sheet.products || [];
  const totalAmount = products.reduce((acc, p) => acc + p.price, 0);
  const printDate = getAutoDateTime().fullDisplay;

  const handleTriggerPrint = () => {
    window.print();
  };

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      title="Hospital Audit Expense Report"
      subtitle={`Official printable expense breakdown for ${sheet.name}`}
      icon={
        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-[#1A2A4A] border border-transparent dark:border-[rgba(79,124,255,0.25)] text-[#4F7CFF] flex items-center justify-center shrink-0">
          <Printer className="w-4 h-4" />
        </div>
      }
      maxWidth="3xl"
      footer={
        <div className="flex items-center justify-between w-full">
          <span className="text-[11px] text-slate-500 dark:text-[#718096]">
            Formatted for A4 / Letter Print Out
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-[#A7B2C4] hover:text-slate-900 dark:hover:text-[#F1F5F9] rounded-lg transition-colors cursor-pointer"
            >
              Close
            </button>
            <button
              type="button"
              onClick={handleTriggerPrint}
              className="px-5 py-2 rounded-[9px] bg-[#4F7CFF] hover:bg-[#638DFF] active:scale-[0.98] text-white text-xs font-semibold transition-all shadow-[0_2px_8px_rgba(79,124,255,0.25)] cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Report</span>
            </button>
          </div>
        </div>
      }
    >
      {/* Printable Paper Preview Box */}
      <div className="p-6 sm:p-8 bg-white text-slate-900 rounded-2xl border border-stone-200 shadow-sm space-y-6 font-sans">
        {/* Letterhead Header */}
        <div className="flex items-start justify-between border-b border-slate-200 pb-5">
          <div>
            <h2 className="text-xl font-bold font-display tracking-tight text-slate-900">
              Eyevista Superspeciality Eye Hospital
            </h2>
            <p className="text-xs text-slate-600 font-medium">
              Medical Products &amp; Departmental Consumables Expense Log
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Official Accounting &amp; Administrative Document
            </p>
          </div>
          <div className="text-right">
            <span className="inline-block px-3 py-1 bg-stone-100 border border-stone-200 text-slate-800 text-xs font-bold font-mono rounded-lg">
              {sheet.name}
            </span>
            <p className="text-[11px] font-mono text-slate-500 mt-1">
              Generated: {printDate}
            </p>
          </div>
        </div>

        {/* Expense Summary Chips */}
        <div className="grid grid-cols-3 gap-3 p-3 bg-stone-50 rounded-xl border border-stone-200 text-xs">
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Entries:</span>
            <p className="text-base font-bold font-mono text-slate-900">{products.length} Items</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Total Spent:</span>
            <p className="text-base font-bold font-mono text-emerald-700">{formatRupees(totalAmount)}</p>
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold text-slate-400">Currency:</span>
            <p className="text-base font-bold font-mono text-slate-900">Indian Rupees (₹)</p>
          </div>
        </div>

        {/* Printable Itemized Table */}
        <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-100 border-b border-slate-200 text-slate-600 font-bold font-mono text-[11px]">
                <th className="p-2.5">#</th>
                <th className="p-2.5">Product Name &amp; Info</th>
                <th className="p-2.5">Category</th>
                <th className="p-2.5">Logged Date/Time</th>
                <th className="p-2.5 text-right">Price (₹)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-800">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-6 text-center text-slate-400 italic">
                    No product entries logged in this sheet.
                  </td>
                </tr>
              ) : (
                products.map((item, idx) => (
                  <tr key={item.id}>
                    <td className="p-2.5 text-slate-400 font-mono">{idx + 1}</td>
                    <td className="p-2.5">
                      <p className="font-bold text-slate-900">{item.productName}</p>
                      {item.additionalInfo && (
                        <p className="text-[11px] text-slate-500 font-sans">{item.additionalInfo}</p>
                      )}
                    </td>
                    <td className="p-2.5 font-medium text-slate-600">{item.category || 'General'}</td>
                    <td className="p-2.5 font-mono text-slate-500">{item.date} {item.time}</td>
                    <td className="p-2.5 text-right font-bold font-mono text-emerald-700">
                      {formatRupees(item.price)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            <tfoot>
              <tr className="bg-stone-100 border-t border-slate-300 font-bold font-mono text-sm text-slate-900">
                <td colSpan={4} className="p-3 text-right uppercase text-xs">Grand Total:</td>
                <td className="p-3 text-right text-emerald-700">{formatRupees(totalAmount)}</td>
              </tr>
            </tfoot>
          </table>
        </div>

        {/* Administrative Signature Block */}
        <div className="pt-8 border-t border-slate-200 flex justify-between text-xs text-slate-500">
          <div className="space-y-6">
            <p className="font-semibold text-slate-700">Prepared By:</p>
            <div className="border-b border-slate-300 w-40" />
            <p className="text-[10px] text-slate-400">Department Supervisor Sign</p>
          </div>

          <div className="space-y-6 text-right">
            <p className="font-semibold text-slate-700">Approved By:</p>
            <div className="border-b border-slate-300 w-40 ml-auto" />
            <p className="text-[10px] text-slate-400">Hospital Administration Sign</p>
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
};
