import React, { useEffect, useState, useRef } from 'react';
import { Download, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { toJpeg } from 'html-to-image';
import jsPDF from 'jspdf';

const InvoicePreview = ({ data, theme, darkMode, onEditSignature }) => {
    const [scale, setScale] = useState(1);
    const [containerHeight, setContainerHeight] = useState(0);
    const [isGenerating, setIsGenerating] = useState(false);
    const [manualZoom, setManualZoom] = useState(false);

    const containerRef = useRef(null);
    const contentRef = useRef(null);

    // A4 Dimensions in Pixels (96 DPI)
    const A4_WIDTH = 794;

    // Responsive Scaling Logic
    useEffect(() => {
        const calculateDimensions = () => {
            if (!containerRef.current || !contentRef.current || manualZoom) return;

            const containerWidth = containerRef.current.offsetWidth;
            // Add padding based on view
            const padding = window.innerWidth > 768 ? 64 : 12;
            // different scales for the different screen sizes
            const scale = window.innerWidth > 768 ? 0.8 : 0.5;
            const newScale = Math.max((containerWidth - padding) / A4_WIDTH, scale);

            setScale(newScale);

            // Update height wrapper based on actual content
            if (contentRef.current) {
                const actualHeight = contentRef.current.scrollHeight;
                setContainerHeight(actualHeight * newScale);
            }
        };

        calculateDimensions();
        window.addEventListener('resize', calculateDimensions);

        const observer = new ResizeObserver(() => {
            if (contentRef.current) {
                const actualHeight = contentRef.current.scrollHeight;
                setContainerHeight(actualHeight * scale);
            }
        });

        if (contentRef.current) observer.observe(contentRef.current);

        return () => {
            window.removeEventListener('resize', calculateDimensions);
            observer.disconnect();
        };
    }, [data, scale, manualZoom, window.innerWidth]);

    const handleZoom = (direction) => {
        setManualZoom(true);
        setScale(prev => {
            const newScale = direction === 'in' ? prev + 0.1 : prev - 0.1;
            if (contentRef.current) {
                setContainerHeight(contentRef.current.scrollHeight * newScale);
            }
            return Math.max(0.3, Math.min(newScale, 3));
        });
    };

    // Pinch to zoom logic
    const touchStartDist = useRef(null);
    const startScale = useRef(1);

    const handleTouchStart = (e) => {
        if (e.touches.length === 2) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            touchStartDist.current = dist;
            startScale.current = scale;
        }
    };

    const handleTouchMove = (e) => {
        if (e.touches.length === 2 && touchStartDist.current) {
            const dist = Math.hypot(
                e.touches[0].pageX - e.touches[1].pageX,
                e.touches[0].pageY - e.touches[1].pageY
            );
            const delta = dist / touchStartDist.current;
            const newScale = Math.min(Math.max(startScale.current * delta, 0.3), 3);
            setScale(newScale);
            setManualZoom(true);

            if (contentRef.current) {
                setContainerHeight(contentRef.current.scrollHeight * newScale);
            }
        }
    };

    const handleTouchEnd = () => {
        touchStartDist.current = null;
    };

    // --- MATH LOGIC ---
    const calculateTax = (amount, taxRate) => amount * (taxRate / 100);
    const subtotal = data.items.reduce((acc, item) => acc + item.amount, 0);
    const tdsAmount = calculateTax(subtotal, data.taxRate);

    let discountAmount = 0;
    if (data.discountType === 'percentage') {
        discountAmount = subtotal * (data.discount / 100);
    } else {
        discountAmount = parseFloat(data.discount) || 0;
    }

    const creatorStateCode = data.creatorGstin ? data.creatorGstin.substring(0, 2) : '';
    const clientStateCode = data.clientGstin ? data.clientGstin.substring(0, 2) : '';

    const isIntraState = creatorStateCode && clientStateCode && creatorStateCode === clientStateCode;
    const taxableValue = subtotal - discountAmount;
    const gstRate = 18;
    let gstAmount = 0;
    if (!creatorStateCode || !clientStateCode) {
        gstAmount = 0;
    }
    else {
        gstAmount = taxableValue * (gstRate / 100);
    }

    const total = taxableValue + gstAmount - tdsAmount;

    // --- PDF GENERATION ---
    const handleDownloadPDF = async () => {
        if (!data.signature) {
            if (onEditSignature) {
                onEditSignature();
            }
            return;
        }
        if (!contentRef.current) return;

        setIsGenerating(true);
        try {
            const element = contentRef.current;
            const actualHeight = element.scrollHeight;
            const actualWidth = element.scrollWidth;

            const dataUrl = await toJpeg(element, {
                quality: 1.0, // Max quality
                pixelRatio: 2, // High res for clear text
                backgroundColor: '#ffffff', // FORCE WHITE BACKGROUND FOR PDF
                width: actualWidth,
                height: actualHeight,
                style: {
                    transform: 'none',
                    transformOrigin: 'top left',
                    margin: '0'
                }
            });

            const pdfWidth = 210; // A4 mm
            const pdfHeight = (actualHeight / actualWidth) * pdfWidth;

            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: [pdfWidth, pdfHeight],
                compress: true
            });

            pdf.addImage(dataUrl, 'JPEG', 0, 0, pdfWidth, pdfHeight, '', 'FAST');
            const safeInvoiceNumber = (data.invoiceNumber || 'draft').replace(/[^a-zA-Z0-9-_]/g, '_');
            pdf.save(`Invoice_${safeInvoiceNumber}.pdf`);
        } catch (error) {
            console.error("Error generating PDF:", error);
            alert("Failed to generate PDF.");
        } finally {
            setIsGenerating(false);
        }
    };

    // Theme Colors - Only affects accents now, not the background
    const themes = {
        blue: { text: 'text-blue-600', border: 'border-blue-600', bg: 'bg-blue-600' },
        black: { text: 'text-zinc-900', border: 'border-zinc-900', bg: 'bg-zinc-900' },
        purple: { text: 'text-purple-600', border: 'border-purple-600', bg: 'bg-purple-600' },
    };
    // Default to user selection or Blue, but ONLY for accents.
    // If you want to ignore the passed 'theme' prop entirely, replace 'theme' with 'black' below.
    const t = themes[theme] || themes.blue;

    return (
        // OUTER WRAPPER: Respects Dark Mode (UI Context)
        // OUTER WRAPPER: Full height, no borders
        <div className={`flex flex-col items-center w-full h-full transition-colors duration-300 ${darkMode ? 'bg-zinc-950' : 'bg-slate-100'}`}>

            {/* TOOLBAR: Respects Dark Mode (UI Context) */}
            {/* TOOLBAR: Full width, sticky top */}
            <div className={`w-full flex flex-col md:flex-row justify-between items-center gap-4 p-4 border-b sticky top-0 z-10 ${darkMode ? 'bg-zinc-900 border-zinc-800 text-white' : 'bg-white border-slate-200 text-slate-800'}`}>

                <div className="flex items-center gap-2 text-sm font-medium opacity-70">
                    <span className="hidden md:inline">Zoom: {Math.round(scale * 100)}%</span>
                    <div className={`flex items-center rounded-lg overflow-hidden border ${darkMode ? 'bg-zinc-800 border-zinc-700' : 'bg-slate-100 border-slate-200'}`}>
                        <button onClick={() => handleZoom('out')} className="p-1.5 hover:opacity-70 transition-opacity"><ZoomOut size={14} /></button>
                        <button onClick={() => handleZoom('in')} className="p-1.5 hover:opacity-70 transition-opacity"><ZoomIn size={14} /></button>
                    </div>
                </div>

                <button
                    onClick={handleDownloadPDF}
                    disabled={isGenerating}
                    className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    {isGenerating ? <Loader2 size={16} className="animate-spin" /> : <Download size={16} />}
                    {isGenerating ? 'Processing...' : 'Download Invoice'}
                </button>
            </div>

            {/* SCROLLABLE WORKSPACE */}
            <div
                className="w-full h-full flex-1 overflow-auto relative flex pb-20"
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >

                {/* SCALING CONTAINER */}
                <div
                    ref={containerRef}
                    className="relative transition-transform duration-75 ease-out flex-shrink-0 m-auto"
                    style={{
                        width: `${A4_WIDTH * scale}px`,
                        height: containerHeight > 0 ? `${containerHeight}px` : 'auto'
                    }}
                >
                    {/* INVOICE PAPER: FORCED LIGHT MODE 
                        We hardcode bg-white and text-slate-900 here regardless of 'darkMode' prop.
                    */}
                    <div
                        id="invoice-content"
                        ref={contentRef}
                        style={{
                            width: '794px', // A4 Width
                            minHeight: '1123px', // A4 Height
                            transform: `scale(${scale})`,
                            transformOrigin: 'top left',
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            backgroundColor: 'white', // FORCE WHITE
                        }}
                        className="shadow-2xl shadow-slate-400/20 bg-white text-slate-900"
                    >

                        {/* INVOICE CONTENT - STRICTLY LIGHT MODE STYLES */}
                        <div className="flex flex-col p-10 h-full font-sans relative text-slate-900">

                            {/* Header */}
                            <div className="flex justify-between items-start mb-10">
                                <div className="max-w-[60%]">
                                    <h1 className={`text-5xl font-bold tracking-tight mb-3 ${t.text}`}>INVOICE</h1>
                                    <p className="text-base text-slate-500 font-medium">#{data.invoiceNumber}</p>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Date</div>
                                    <div className="text-xl font-semibold">{new Date(data.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                                </div>
                            </div>

                            {/* Addresses */}
                            <div className="grid grid-cols-2 gap-12 mb-10">
                                <div className="break-words pr-4">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed By</div>
                                    <h3 className="font-bold text-xl mb-2 leading-tight text-slate-900">{data.creatorName}</h3>
                                    <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed mb-3 max-w-[300px]">{data.creatorAddress}</p>
                                    {(data.creatorPan || data.creatorGstin) && (
                                        <div className="space-y-1 text-xs text-slate-500">
                                            {data.creatorPan && <p><span className="font-semibold text-slate-700">PAN:</span> {data.creatorPan}</p>}
                                            {data.creatorGstin && <p><span className="font-semibold text-slate-700">GSTIN:</span> {data.creatorGstin}</p>}
                                        </div>
                                    )}
                                </div>
                                <div className="break-words pl-4">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Billed To</div>
                                    <h3 className="font-bold text-xl mb-2 leading-tight text-slate-900">{data.clientName}</h3>
                                    <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed mb-3 max-w-[300px]">{data.clientAddress}</p>
                                    {(data.clientPan || data.clientGstin) && (
                                        <div className="space-y-1 text-xs text-slate-500">
                                            {data.clientPan && <p><span className="font-semibold text-slate-700">PAN:</span> {data.clientPan}</p>}
                                            {data.clientGstin && <p><span className="font-semibold text-slate-700">GSTIN:</span> {data.clientGstin}</p>}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Items Table */}
                            <div className="mb-8">
                                <table className="w-full table-fixed">
                                    <thead>
                                        <tr className="border-b-2 border-slate-100">
                                            <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-[45%]">Description</th>
                                            <th className="text-left py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%]">HSN</th>
                                            <th className="text-center py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-[10%]">Qty</th>
                                            <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%]">Rate</th>
                                            <th className="text-right py-3 text-xs font-bold text-slate-400 uppercase tracking-wider w-[15%]">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="text-sm">
                                        {data.items.map((item, index) => (
                                            <tr key={index} className="border-b border-slate-50 last:border-0">
                                                <td className="py-4 pr-4 align-top break-words">
                                                    <p className="font-bold mb-1 text-slate-900">{item.name}</p>
                                                    <p className="text-slate-500 whitespace-pre-wrap text-xs leading-relaxed">{item.description}</p>
                                                </td>
                                                <td className="py-4 align-top text-slate-500 break-all">{item.hsnCode}</td>
                                                <td className="py-4 align-top text-center text-slate-500">{item.quantity}</td>
                                                <td className="py-4 align-top text-right text-slate-500 whitespace-nowrap">
                                                    {data.currency === 'INR' ? '₹' : data.currency} {item.rate.toLocaleString()}
                                                </td>
                                                <td className="py-4 align-top text-right font-medium whitespace-nowrap text-slate-900">
                                                    {data.currency === 'INR' ? '₹' : data.currency} {item.amount.toLocaleString()}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Financials - Condensed 3-Row Layout with Red Negatives & Percentages */}
                            <div className="flex justify-end mb-10 mt-0 pt-2">
                                <div className="w-[55%] md:w-[50%]">
                                    <table className="w-full border-collapse">
                                        <tbody>

                                            {/* --- ROW 1: Base Value (Subtotal - Discount = Taxable) --- */}
                                            <tr className="border-b border-slate-100">
                                                <td className="py-2 text-right pr-4 align-top">
                                                    <div className="text-slate-600 font-medium text-xs">Taxable Amount</div>
                                                    {/* Breakdown */}
                                                    <div className="text-[10px] mt-0.5 flex flex-col items-end gap-0.5">
                                                        <span className="text-slate-400">
                                                            Subtotal: {subtotal.toLocaleString()}
                                                        </span>
                                                        {discountAmount > 0 && (
                                                            <span className="text-red-500 font-medium">
                                                                {/* Calculate Discount %: (Amt / Subtotal * 100) */}
                                                                Discount ({((discountAmount / (subtotal || 1)) * 100).toFixed(0)}%): -{discountAmount.toFixed(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right text-slate-700 font-medium text-xs align-top pt-2">
                                                    {data.currency === 'INR' ? '₹' : data.currency} {taxableValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>

                                            {/* --- ROW 2: Taxes & Deductions (GST - TDS) --- */}
                                            <tr className="border-b border-slate-100">
                                                <td className="py-2 text-right pr-4 align-top">
                                                    <div className="text-slate-600 font-medium text-xs">Taxes & Deductions</div>
                                                    {/* Breakdown */}
                                                    <div className="text-[10px] mt-0.5 flex flex-col items-end gap-0.5">
                                                        {gstAmount > 0 && (
                                                            isIntraState ? (
                                                                <span className="text-slate-400">
                                                                    CGST (9%) + SGST (9%): +{gstAmount.toFixed(0)}
                                                                </span>
                                                            ) : (
                                                                <span className="text-slate-400">
                                                                    IGST (18%): +{gstAmount.toFixed(0)}
                                                                </span>
                                                            ))}

                                                        {tdsAmount > 0 && (
                                                            <span className="text-red-500 font-medium">
                                                                {/* Use data.taxRate or calculate percentage */}
                                                                TDS ({data.taxRate || ((tdsAmount / taxableValue) * 100).toFixed(0)}%): -{tdsAmount.toFixed(0)}
                                                            </span>
                                                        )}
                                                    </div>
                                                </td>
                                                <td className="py-2 text-right text-slate-700 font-medium text-xs align-top pt-2">
                                                    {/* Shows the net tax adjustment (GST - TDS) */}
                                                    + {data.currency === 'INR' ? '₹' : data.currency} {(gstAmount - tdsAmount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>

                                            {/* --- ROW 3: Grand Total --- */}
                                            <tr>
                                                <td className="py-3 text-slate-900 font-bold text-right pr-4 text-sm align-bottom">Total</td>
                                                <td className={`py-3 text-right font-bold text-base align-bottom ${t.text}`}>
                                                    {data.currency === 'INR' ? '₹' : data.currency} {total.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                                                </td>
                                            </tr>

                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Footer: Bank & Signature */}
                            <div className="mt-auto grid grid-cols-2 gap-8 pt-6 border-t border-dashed border-slate-200">
                                <div>
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Bank Details</div>
                                    <div className="space-y-1.5 text-sm text-slate-600">
                                        <p className="break-words"><span className="font-bold text-slate-900">Bank:</span> {data.bankName}</p>
                                        <p className="break-all"><span className="font-bold text-slate-900">Acc No:</span> {data.accountNumber}</p>
                                        <p><span className="font-bold text-slate-900">IFSC:</span> {data.ifscCode}</p>
                                        <p className="break-words"><span className="font-bold text-slate-900">Holder:</span> {data.accountHolderName}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end justify-end">
                                    {data.signature && (
                                        <div className="mb-4">
                                            {/* Removed 'invert' logic - signature is always normal */}
                                            <img src={data.signature} alt="Signature" className="h-16 object-contain" />
                                        </div>
                                    )}
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider border-t border-slate-200 pt-3 w-40 text-center">
                                        Authorized Signatory
                                    </div>
                                </div>
                            </div>

                            <div className="text-center mt-[25%] opacity-50">
                                {/*make it good for the footer*/}

                                <div className="text-[12px] text-slate-400 font-bold">Generated via Creatorsmela's Invoice Maker</div>
                                <div className="text-[12px] text-slate-400 font-bold">wwwCreatorsmela.com</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default InvoicePreview;