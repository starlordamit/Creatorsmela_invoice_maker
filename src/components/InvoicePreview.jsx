import React, { useEffect, useState, useRef } from 'react';
import {
    Download, Loader2, ZoomIn, ZoomOut, CheckCircle2,
    AlertTriangle, Eye, X, FileText
} from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

// --- Constants for A4 Paper (96 DPI) ---
const A4_WIDTH = 794;
const A4_HEIGHT = 1123;
const A4_RATIO = A4_WIDTH / A4_HEIGHT;

const VerificationChecklist = ({ data, isOpen, onClose, darkMode }) => {
    if (!isOpen) return null;

    const checks = [
        { label: "Invoice Number Set", valid: !!data.invoiceNumber },
        { label: "Client Details", valid: !!data.clientName },
        { label: "Items Added", valid: data.items.length > 0 },
        { label: "Bank Details", valid: !!data.accountNumber },
        { label: "Signature Added", valid: !!data.signature },
    ];
    const allValid = checks.every(c => c.valid);

    return (
        <div className={`absolute top-20 right-6 w-72 rounded-2xl shadow-2xl border backdrop-blur-xl z-40 animate-in slide-in-from-right-10 duration-300
            ${darkMode ? 'bg-zinc-900/95 border-zinc-700 shadow-black/50' : 'bg-white/95 border-slate-200 shadow-slate-200/50'}`}>

            <div className="p-4 border-b border-slate-100/10 flex justify-between items-center">
                <h3 className={`text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-100' : 'text-slate-800'}`}>
                    Pre-Flight Check
                </h3>
                <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
                    <X size={14} className={darkMode ? 'text-white' : 'text-slate-900'} />
                </button>
            </div>
            <div className="p-4 space-y-3">
                {checks.map((check, i) => (
                    <div key={i} className="flex items-center justify-between text-sm">
                        <span className={darkMode ? 'text-zinc-400' : 'text-slate-500'}>{check.label}</span>
                        {check.valid ? <CheckCircle2 size={16} className="text-emerald-500" /> : <AlertTriangle size={16} className="text-amber-500" />}
                    </div>
                ))}
            </div>
            <div className={`p-3 mx-4 mb-4 rounded-xl text-center border ${allValid ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-amber-500/10 border-amber-500/20 text-amber-600'}`}>
                <span className="text-xs font-bold uppercase tracking-wider">{allValid ? "Ready to Export" : "Action Required"}</span>
            </div>
        </div>
    );
};

const InvoicePreview = ({ data, theme, darkMode, onEditSignature, onValidate }) => {
    const [scale, setScale] = useState(0.6); // Default zoom
    const [isGenerating, setIsGenerating] = useState(false);
    const [showChecklist, setShowChecklist] = useState(false);

    const containerRef = useRef(null);
    const contentRef = useRef(null);

    // --- Smart Scaling Logic ---
    // Auto-calculates the best fit based on screen height/width on mount
    useEffect(() => {
        if (containerRef.current) {
            const { offsetWidth, offsetHeight } = containerRef.current;
            // Add padding for the 'desk' look
            const availableWidth = offsetWidth - 64;
            const availableHeight = offsetHeight - 64;

            // Calculate ratios
            const widthScale = availableWidth / A4_WIDTH;
            const heightScale = availableHeight / A4_HEIGHT;

            // Choose the smaller scale to fit entirely, or width scale for scrolling
            const fitScale = Math.min(widthScale, heightScale);

            // Set initial scale (clamped between 0.4 and 1.0 for visibility)
            setScale(Math.min(Math.max(fitScale, 0.45), 1.0));
        }
    }, []);

    const handleZoom = (dir) => setScale(prev => {
        const newScale = prev + (dir === 'in' ? 0.1 : -0.1);
        return Math.max(0.3, Math.min(newScale, 1.5));
    });

    // --- Calculations ---
    const subtotal = data.items.reduce((acc, item) => acc + item.amount, 0);
    const discountAmount = data.discountType === 'percentage' ? subtotal * (data.discount / 100) : parseFloat(data.discount) || 0;
    const taxableValue = subtotal - discountAmount;

    // TDS Calculation
    const tdsAmount = taxableValue * (data.taxRate / 100);

    // GST Calculation
    const creatorState = data.creatorGstin?.substring(0, 2);
    const clientState = data.clientGstin?.substring(0, 2);
    const isInterState = creatorState !== clientState;
    const hasGst = creatorState && clientState; // Only apply GST if both parties have GSTIN

    let cgstAmount = 0;
    let sgstAmount = 0;
    let igstAmount = 0;

    if (hasGst) {
        if (isInterState) {
            igstAmount = taxableValue * 0.18;
        } else {
            cgstAmount = taxableValue * 0.09;
            sgstAmount = taxableValue * 0.09;
        }
    }

    const totalGst = cgstAmount + sgstAmount + igstAmount;
    const total = taxableValue + totalGst - tdsAmount;

    // --- PDF Generation ---
    const handleDownloadPDF = async () => {
        // Validate before download
        if (onValidate && !onValidate()) return;

        if (!data.signature && !confirm("Signature missing. Download anyway?")) return;

        setIsGenerating(true);
        try {
            const element = contentRef.current;
            // 1. Capture at 2x resolution for crisp text
            const dataUrl = await toJpeg(element, {
                quality: 1.0,
                pixelRatio: 3,
                backgroundColor: '#ffffff',
            });

            // 2. Create PDF with exact A4 dimensions
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4'
            });

            const imgWidth = 210; // A4 width in mm
            const imgHeight = 297; // A4 height in mm

            pdf.addImage(dataUrl, 'JPEG', 0, 0, imgWidth, imgHeight);
            pdf.save(`Invoice_${data.invoiceNumber || 'Draft'}.pdf`);
        } catch (err) {
            console.error(err);
            alert("Failed to generate PDF");
        } finally {
            setIsGenerating(false);
        }
    };

    const accentColor = {
        blue: 'text-blue-600 border-blue-600',
        black: 'text-zinc-900 border-zinc-900',
        purple: 'text-purple-600 border-purple-600',
    }[theme] || 'text-blue-600 border-blue-600';

    return (
        <div className={`relative w-full h-full flex flex-col overflow-hidden transition-colors duration-500 
            ${darkMode ? 'bg-zinc-950' : 'bg-slate-100'}`}>

            {/* Desk Texture Background */}
            <div className={`absolute inset-0 pointer-events-none opacity-[0.04] 
                ${darkMode ? 'bg-[radial-gradient(#ffffff_1.5px,transparent_1.5px)]' : 'bg-[radial-gradient(#000000_1.5px,transparent_1.5px)]'} 
                [background-size:24px_24px]`}
            />

            {/* Top Bar */}
            <div className="flex items-center justify-between px-6 py-4 z-10 pointer-events-none">
                <div className="pointer-events-auto flex items-center gap-3">
                    <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border shadow-sm backdrop-blur-md
                        ${darkMode ? 'bg-zinc-900/80 border-zinc-700 text-zinc-300' : 'bg-white/80 border-slate-200 text-slate-600'}`}>
                        <FileText size={14} />
                        <span className="text-xs font-bold uppercase tracking-wider">A4 Preview</span>
                    </div>
                </div>
                <div className="pointer-events-auto">
                    <button
                        onClick={() => setShowChecklist(!showChecklist)}
                        className={`p-2 rounded-full transition-all hover:bg-black/5 dark:hover:bg-white/10 
                            ${darkMode ? 'text-zinc-400 hover:text-white' : 'text-slate-400 hover:text-slate-900'}`}>
                        <Eye size={20} />
                    </button>
                </div>
            </div>

            <VerificationChecklist data={data} isOpen={showChecklist} onClose={() => setShowChecklist(false)} darkMode={darkMode} />

            {/* Workspace: Centered & Scaled */}
            <div className="flex-1 overflow-auto flex items-center justify-center p-8 relative custom-scrollbar" ref={containerRef}>
                <div
                    style={{
                        transform: `scale(${scale})`,
                        width: A4_WIDTH,
                        height: A4_HEIGHT, // Strict height
                    }}
                    className="transition-transform duration-200 ease-out shadow-2xl shadow-black/20 flex-shrink-0 origin-center"
                >
                    {/* --- THE INVOICE PAPER --- */}
                    <div
                        ref={contentRef}
                        className="bg-white w-full h-full relative flex flex-col text-slate-900"
                        style={{ aspectRatio: '210/297' }} // Lock aspect ratio
                    >
                        {/* Content Container with Padding */}
                        <div className="flex-1 p-12 flex flex-col h-full">

                            {/* 1. Header */}
                            <div className="flex justify-between items-start mb-12">
                                <div>
                                    <h1 className={`text-5xl font-extrabold tracking-tighter mb-1 ${accentColor.split(' ')[0]}`}>INVOICE</h1>
                                    <span className="inline-block px-2 py-0.5 rounded bg-slate-100 text-slate-500 text-xs font-bold uppercase tracking-wider">
                                        #{data.invoiceNumber || 'DRAFT'}
                                    </span>
                                </div>
                                <div className="text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Date Issued</div>
                                    <div className="text-lg font-bold text-slate-800">
                                        {new Date(data.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                                    </div>
                                </div>
                            </div>

                            {/* 2. Entities */}
                            <div className="grid grid-cols-2 gap-8 mb-10">
                                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">From</div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">{data.creatorName || 'Creator Name'}</h3>
                                    <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{data.creatorAddress}</p>
                                    {data.creatorGstin && <p className="text-xs text-slate-500 mt-2 font-bold">GSTIN: {data.creatorGstin}</p>}
                                    {data.creatorPan && <p className="text-xs text-slate-500 font-bold">PAN: {data.creatorPan}</p>}
                                </div>
                                <div className="p-6 rounded-xl bg-slate-50 border border-slate-100 text-right">
                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3">Bill To</div>
                                    <h3 className="font-bold text-lg text-slate-900 mb-1">{data.clientName || 'Client Name'}</h3>
                                    <p className="text-xs text-slate-500 whitespace-pre-line leading-relaxed">{data.clientAddress}</p>
                                    {data.clientGstin && <p className="text-xs text-slate-500 mt-2 font-bold">GSTIN: {data.clientGstin}</p>}
                                    {data.clientPan && <p className="text-xs text-slate-500 font-bold">PAN: {data.clientPan}</p>}
                                </div>
                            </div>

                            {/* 3. Items Table (Fixed Height/Scroll prevention logic handled by overflow-hidden if needed, but flexible here) */}
                            <div className="flex-1">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b-2 border-slate-900">
                                            <th className="text-left py-3 text-xs font-bold uppercase tracking-wider w-[50%]">Description</th>
                                            <th className="text-center py-3 text-xs font-bold uppercase tracking-wider w-[15%]">Qty</th>
                                            <th className="text-right py-3 text-xs font-bold uppercase tracking-wider w-[15%]">Rate</th>
                                            <th className="text-right py-3 text-xs font-bold uppercase tracking-wider w-[20%]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {data.items.map((item, i) => (
                                            <tr key={i} className="border-b border-slate-100 last:border-0">
                                                <td className="py-4 pr-4 align-top">
                                                    <p className="font-bold text-slate-900">{item.name}</p>
                                                    {item.description && <p className="text-xs text-slate-500 mt-1">{item.description}</p>}
                                                    {item.hsnCode && <p className="text-[10px] text-slate-400 mt-1">HSN: {item.hsnCode}</p>}
                                                </td>
                                                <td className="py-4 text-center align-top text-slate-600">{item.quantity}</td>
                                                <td className="py-4 text-right align-top text-slate-600">
                                                    {item.rate.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                                <td className="py-4 text-right font-bold text-slate-900 align-top">
                                                    {item.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* 4. Totals & Footer (Push to bottom) */}
                            <div className="mt-auto">
                                {/* Calculation Block */}
                                <div className="flex justify-end mb-8">
                                    <div className="w-5/12 space-y-2">
                                        <div className="flex justify-between text-xs text-slate-500">
                                            <span>Subtotal</span>
                                            <span>{subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>

                                        {discountAmount > 0 && (
                                            <div className="flex justify-between text-xs text-green-600 font-medium">
                                                <span>Discount</span>
                                                <span>-{discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}

                                        {/* GST Breakdowns */}
                                        {igstAmount > 0 && (
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>IGST (18%)</span>
                                                <span>{igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        {cgstAmount > 0 && (
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>CGST (9%)</span>
                                                <span>{cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}
                                        {sgstAmount > 0 && (
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>SGST (9%)</span>
                                                <span>{sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}

                                        {/* TDS */}
                                        {tdsAmount > 0 && (
                                            <div className="flex justify-between text-xs text-red-500 font-medium">
                                                <span>TDS ({data.taxRate}%)</span>
                                                <span>-{tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                            </div>
                                        )}

                                        <div className={`flex justify-between items-center pt-3 border-t border-slate-200 text-lg font-bold ${accentColor.split(' ')[0]}`}>
                                            <span>Total</span>
                                            <span>{data.currency} {total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Bottom Strip */}
                                <div className="grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-300">
                                    <div>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Bank Details</p>
                                        <p className="text-xs text-slate-600 font-medium">{data.bankName}</p>
                                        <p className="text-xs text-slate-500">A/C: {data.accountNumber} • IFSC: {data.ifscCode}</p>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        {data.signature ? (
                                            <img src={data.signature} alt="Sign" className="h-12 object-contain mb-2" />
                                        ) : (
                                            <div className="h-12 w-32 border border-dashed border-slate-300 bg-slate-50 rounded mb-2 flex items-center justify-center text-[10px] text-slate-400">
                                                No Signature
                                            </div>
                                        )}
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
                                    </div>
                                </div>

                                {/* Branding */}
                                <div className="text-center mt-8 pt-4 border-t border-slate-100">
                                    <p className="text-[10px] text-slate-300 font-medium uppercase tracking-widest">Generated via CreatorsMela Invoice</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Floating Controls */}
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-30 flex gap-2 p-2 rounded-2xl border shadow-2xl backdrop-blur-xl 
                bg-white/90 border-white dark:bg-zinc-900/90 dark:border-zinc-700">
                <div className="flex items-center gap-1 px-2">
                    <button onClick={() => handleZoom('out')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"><ZoomOut size={18} className="text-slate-600 dark:text-zinc-400" /></button>
                    <span className="w-12 text-center text-xs font-bold text-slate-600 dark:text-zinc-400">{Math.round(scale * 100)}%</span>
                    <button onClick={() => handleZoom('in')} className="p-2 hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-lg"><ZoomIn size={18} className="text-slate-600 dark:text-zinc-400" /></button>
                </div>
                <div className="w-px bg-slate-200 dark:bg-zinc-700 mx-1"></div>
                <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition-all active:scale-95 disabled:opacity-50 disabled:scale-100">
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    <span>{isGenerating ? "Exporting..." : "Download PDF"}</span>
                </button>
            </div>

        </div>
    );
};

export default InvoicePreview;