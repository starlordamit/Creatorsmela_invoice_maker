import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { fetchInvoiceDetails } from '../api/invoiceApi'; // Assumed path based on context
import {
    Loader2, Plus, Check, PenTool, X, ArrowRight, ChevronDown,
    Info, ShieldCheck, Sparkles, CreditCard, User, FileText, Layers,
    Save, Trash2, Banknote
} from 'lucide-react';
import SignatureModal from './SignatureCanvas';
import DatePicker from './DatePicker';
import ScrollIndicator from './ScrollIndicator';

// --- Doodle SVGs ---
const ScribbleUnderline = ({ className }) => (
    <svg viewBox="0 0 200 10" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M2,8 Q 100,-2 198,8" />
    </svg>
);

const CircleDoodle = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M10,50 Q 25,25 50,10 T 90,50 T 50,90 T 10,50" strokeLinecap="round" />
    </svg>
);

// --- 1. Sketchy UI Components ---

// A "Sticky Note" style Tip Component
const SketchGuide = ({ step, darkMode }) => {
    const guides = [
        {
            icon: FileText,
            title: "The Basics",
            desc: "Give it a number. Make it real.",
            color: "text-blue-600",
            bg: "bg-blue-100",
            rotate: "rotate-1"
        },
        {
            icon: User,
            title: "Who & Where",
            desc: "Your details vs. Their details.",
            color: "text-indigo-600",
            bg: "bg-indigo-100",
            rotate: "-rotate-1"
        },
        {
            icon: Sparkles,
            title: "The Goods",
            desc: "What did you sell? List it out!",
            color: "text-violet-600",
            bg: "bg-violet-100",
            rotate: "rotate-1"
        },
        {
            icon: CreditCard,
            title: "Money Talks",
            desc: "Bank info & tax stuff goes here.",
            color: "text-pink-600",
            bg: "bg-pink-100",
            rotate: "-rotate-1"
        },
        {
            icon: ShieldCheck,
            title: "Sign It",
            desc: "Autograph time. Make it official.",
            color: "text-emerald-600",
            bg: "bg-emerald-100",
            rotate: "rotate-2"
        }
    ];

    const activeGuide = guides[step] || guides[0];
    const Icon = activeGuide.icon;

    return (
        <motion.div
            key={step}
            initial={{ opacity: 0, y: -20, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: activeGuide.rotate === 'rotate-1' ? 1 : -1 }}
            className={`mb-8 p-5 rounded-xl border-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] transition-all duration-300
            ${darkMode
                    ? 'bg-[#1e1e1e] border-zinc-700 text-zinc-200'
                    : `${activeGuide.bg} border-black text-slate-900`}`}
        >
            <div className="flex items-start gap-4">
                <div className={`p-2 rounded-lg border-2 ${darkMode ? 'bg-black border-zinc-600' : 'bg-white border-black'}`}>
                    <Icon size={24} strokeWidth={2.5} className={activeGuide.color} />
                </div>
                <div>
                    <h4 className="font-black text-sm uppercase tracking-wider mb-1">
                        Step {step + 1}: {activeGuide.title}
                    </h4>
                    <p className={`text-sm font-medium ${darkMode ? 'text-zinc-400' : 'text-slate-700'}`}>
                        {activeGuide.desc}
                    </p>
                </div>
            </div>
        </motion.div>
    );
};

// Input that looks like writing on a line
const SketchInput = ({ label, value, onChange, name, type = "text", placeholder, darkMode, error, className = "", ...props }) => (
    <div className={`relative pt-5 pb-2 ${className}`}>
        <label className={`absolute top-0 left-0 text-xs font-bold uppercase tracking-widest 
            ${error ? 'text-red-500' : (darkMode ? 'text-zinc-500' : 'text-slate-500')}`}>
            {label} {error && '*'}
        </label>
        <div className="relative">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className={`w-full py-2 bg-transparent border-b-2 outline-none font-bold transition-colors
                ${error
                        ? 'border-red-500 text-red-500 placeholder-red-300'
                        : (darkMode
                            ? 'border-zinc-700 text-zinc-100 focus:border-blue-400 placeholder-zinc-800'
                            : 'border-slate-300 text-slate-900 focus:border-blue-500 placeholder-slate-200')
                    }`}
                {...props}
            />
        </div>
        {error && typeof error === 'string' && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block animate-pulse">{error}</span>
        )}
    </div>
);

const SketchSelect = ({ label, value, onChange, options, darkMode, error }) => (
    <div className="relative pt-5 pb-2">
        <label className={`absolute top-0 left-0 text-xs font-bold uppercase tracking-widest ${error ? 'text-red-500' : (darkMode ? 'text-zinc-500' : 'text-slate-500')}`}>
            {label} {error && '*'}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className={`w-full py-2 bg-transparent border-b-2 font-bold outline-none appearance-none cursor-pointer
                ${error
                        ? 'border-red-500 text-red-500'
                        : (darkMode
                            ? 'border-zinc-700 text-zinc-200 focus:border-blue-400'
                            : 'border-slate-300 text-slate-900 focus:border-blue-500')
                    }`}
            >
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value} className={darkMode ? 'bg-zinc-900' : 'bg-white'}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className={`absolute right-0 top-3 pointer-events-none ${error ? 'text-red-500' : (darkMode ? 'text-zinc-500' : 'text-slate-400')}`}>
                <ChevronDown size={20} strokeWidth={3} />
            </div>
        </div>
        {error && typeof error === 'string' && (
            <span className="text-[10px] font-bold text-red-500 mt-1 block animate-pulse">{error}</span>
        )}
    </div>
);

const SketchSectionHeader = ({ title, icon: Icon, darkMode }) => (
    <div className="flex items-center gap-4 mt-8 mb-6">
        <div className={`p-1.5 rounded border-2 ${darkMode ? 'bg-zinc-800 border-zinc-600' : 'bg-blue-100 border-black'}`}>
            {Icon && <Icon size={16} className={darkMode ? 'text-zinc-300' : 'text-blue-600'} strokeWidth={3} />}
        </div>
        <h3 className={`font-black text-lg uppercase tracking-tight ${darkMode ? 'text-zinc-200' : 'text-slate-900'}`}>
            {title}
        </h3>
        <div className={`h-0.5 flex-1 rounded-full ${darkMode ? 'bg-zinc-800' : 'bg-slate-200'}`}></div>
    </div>
);

// --- Main Component ---

const InvoiceFormDoodle = ({ onInvoiceUpdate, darkMode, currentStep, setCurrentStep, signatureTrigger, validationErrors = {} }) => {
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState(null);
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [selectedKycIndex, setSelectedKycIndex] = useState(0);

    // NEW: Ref for the guide to scroll to
    const guideRef = useRef(null);

    // NEW: Function to scroll to guide
    const scrollToGuide = () => {
        guideRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    };

    // Init logic
    const urlParams = new URLSearchParams(window.location.search);
    const billTo = urlParams.get('billto');
    let clientName = '', clientAddress = '', clientPan = '', clientGstin = '';

    if (billTo === 'clyromedia') {
        clientName = 'CLYROMEDIA PRIVATE LIMITED';
        clientAddress = '01, KANKRAWA BAAS, VILLAGE-SOLIYANA, POST-THIROD, MUNDWA, Nagaur, Rajasthan, 341026';
        clientPan = 'AAMCC2269E';
        clientGstin = '08AAMCC2269E1ZL';
    } else {
        clientName = 'Company Name';
        clientAddress = 'Company Address';
        clientPan = 'Company Pan';
        clientGstin = 'Company Gstin';
    }

    const [formData, setFormData] = useState({
        invoiceNumber: '',
        date: new Date().toISOString().split('T')[0],
        creatorName: '',
        creatorAddress: '',
        creatorPan: '',
        creatorGstin: '',
        clientName: clientName,
        clientAddress: clientAddress,
        clientPan: clientPan,
        clientGstin: clientGstin,
        items: [{ name: 'Advertisement Services', description: '', quantity: 1, rate: 1000, amount: 1000, hsnCode: '998361' }],
        taxRate: 0,
        discount: 0,
        discountType: 'percentage',
        currency: 'INR',
        bankName: '',
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        signature: null,
    });

    useEffect(() => {
        if (signatureTrigger > 0 && !formData.signature) setShowSignatureModal(true);
    }, [signatureTrigger, formData.signature]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const accessKey = urlParams.get('key');
        if (accessKey && accessKey !== 'invoice-maker') handleFetch(accessKey);
    }, []);

    const handleFetch = async (accessKey) => {
        setLoading(true);
        try {
            const data = await fetchInvoiceDetails(accessKey);
            setApiData(data);
            const kycIndex = data.kyc_records.findIndex(k => k.kyc_status === 'approved');
            const finalIndex = kycIndex >= 0 ? kycIndex : 0;
            setSelectedKycIndex(finalIndex);
            if (data.kyc_records[finalIndex]) populateForm(data, data.kyc_records[finalIndex]);
        } catch (error) { console.error("Fetch failed", error); }
        finally { setLoading(false); }
    };

    const populateForm = (data, kyc) => {
        const newFormData = {
            ...formData,
            invoiceNumber: data.campaign.purchase_order_code || 'N/A',
            creatorName: data.creator.name,
            creatorAddress: kyc ? `${kyc.company_legal_name}\n${kyc.contact_email}` : '',
            creatorPan: kyc?.pancard_number || '',
            creatorGstin: kyc?.gstin_number || '',
            items: [{
                name: 'Advertisement Services',
                description: `PO: ${data.campaign.purchase_order_code}\nCampaign: ${data.campaign.name} \n ${data.creator.name}`,
                quantity: 1,
                rate: data.financials.commercials,
                amount: data.financials.commercials,
                hsnCode: '998361'
            }],
            taxRate: kyc?.tds_rate || 0,
            discount: data.financials.platform_fees || 0,
            bankName: kyc?.bank_name || '',
            accountNumber: kyc?.bank_account_number || '',
            ifscCode: kyc?.bank_ifsc_code || '',
            accountHolderName: kyc?.bank_account_holder_name || '',
        };
        setFormData(newFormData);
        onInvoiceUpdate(newFormData);
    };

    const updateFromKyc = (kyc) => {
        const updated = {
            ...formData,
            creatorAddress: kyc ? `${kyc.company_legal_name}\n${kyc.contact_email}` : '',
            creatorPan: kyc?.pancard_number || '',
            creatorGstin: kyc?.gstin_number || '',
            taxRate: kyc?.tds_rate || 0,
            bankName: kyc?.bank_details?.bank_name || '',
            accountNumber: kyc?.bank_account_number || '',
            ifscCode: kyc?.bank_ifsc_code || '',
            accountHolderName: kyc?.bank_account_holder_name || '',
        };
        setFormData(updated);
        onInvoiceUpdate(updated);
    };

    const handleKycChange = (e) => {
        const index = parseInt(e.target.value);
        setSelectedKycIndex(index);
        if (apiData?.kyc_records?.[index]) updateFromKyc(apiData.kyc_records[index]);
    };

    const handleInputChange = (e) => {
        const updated = { ...formData, [e.target.name]: e.target.value };
        setFormData(updated);
        onInvoiceUpdate(updated);
    };

    const handleItemChange = (index, field, value) => {
        const newItems = [...formData.items];
        newItems[index][field] = value;
        if (field === 'quantity' || field === 'rate') newItems[index].amount = newItems[index].quantity * newItems[index].rate;
        const updated = { ...formData, items: newItems };
        setFormData(updated);
        onInvoiceUpdate(updated);
    };

    const steps = ['Basics', 'People', 'Items', 'Bank', 'Done'];

    // --- Sketch Progress Bar ---
    const SketchProgress = () => (
        <div className="w-full flex items-center justify-between mb-8 px-2 relative">
            {/* The "Hand-drawn" Line behind */}
            <div className={`absolute top-1/2 left-0 w-full h-0.5 -z-10 ${darkMode ? 'bg-zinc-700' : 'bg-slate-300'}`} />

            {steps.map((stepName, idx) => {
                const isActive = idx === currentStep;
                const isCompleted = idx < currentStep;

                return (
                    <div key={idx} className="flex flex-col items-center gap-2 relative group cursor-pointer" onClick={() => idx < currentStep && setCurrentStep(idx)}>
                        <motion.div
                            initial={false}
                            animate={{ scale: isActive ? 1.2 : 1 }}
                            className={`w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black z-10 transition-colors
                            ${isActive
                                    ? (darkMode ? 'bg-blue-500 border-blue-300 text-white' : 'bg-blue-500 border-black text-white shadow-[3px_3px_0px_0px_rgba(0,0,0,1)]')
                                    : isCompleted
                                        ? (darkMode ? 'bg-emerald-900 border-emerald-500 text-emerald-500' : 'bg-emerald-100 border-black text-emerald-600')
                                        : (darkMode ? 'bg-zinc-900 border-zinc-700 text-zinc-600' : 'bg-white border-slate-300 text-slate-400')
                                }`}
                        >
                            {isCompleted ? <Check size={18} strokeWidth={3} /> : idx + 1}
                        </motion.div>

                        {/* Label that appears on hover or active */}
                        <span className={`absolute -bottom-6 text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-opacity
                            ${isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}
                            ${darkMode ? 'text-zinc-400' : 'text-slate-600'}
                        `}>
                            {stepName}
                        </span>
                    </div>
                );
            })}
        </div>
    );

    // --- Sketch Nav Buttons ---
    const NavButtons = ({ step, totalSteps, onNext, onBack }) => (
        <div className="mt-10 pt-6 border-t-2 border-dashed border-slate-200/20 flex gap-4">
            {step > 0 && (
                <button
                    onClick={onBack}
                    className={`px-6 py-3 rounded-xl font-bold border-2 transition-transform active:scale-95
                    ${darkMode
                            ? 'border-zinc-600 text-zinc-400 hover:text-white hover:border-zinc-400'
                            : 'border-black text-slate-600 bg-white hover:bg-slate-50 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] hover:translate-x-[2px] hover:translate-y-[2px]'}`}
                >
                    Back
                </button>
            )}
            <button
                onClick={onNext}
                className={`flex-1 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform active:scale-95 border-2
                ${step === totalSteps - 1
                        ? (darkMode ? 'bg-emerald-600 border-emerald-400 text-white' : 'bg-emerald-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]')
                        : (darkMode ? 'bg-blue-600 border-blue-400 text-white' : 'bg-blue-400 border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]')}
                hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[2px] hover:translate-y-[2px]`}
            >
                {step === totalSteps - 1 ? 'Finish & Download' : 'Next Step'}
                {step === totalSteps - 1 ? <Check size={18} strokeWidth={3} /> : <ArrowRight size={18} strokeWidth={3} />}
            </button>
        </div>
    );

    return (
        <div className={`relative h-screen flex flex-col font-sans transition-colors duration-300 
            ${darkMode ? 'bg-[#121212] text-zinc-200' : 'bg-[#f8f9fa] text-slate-900'}`}>

            {/* --- Background Grid Texture (Notebook paper style) --- */}
            <div className={`absolute inset-0 opacity-30 pointer-events-none
                ${darkMode
                    ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]'
                    : 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]'
                }`}
            />

            <div className="relative flex-1 overflow-y-auto px-4 py-8">
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 gap-6">
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                            className="text-blue-500"
                        >
                            <Loader2 size={48} strokeWidth={2.5} />
                        </motion.div>
                        <p className="font-bold text-lg opacity-50">Drawing your data...</p>
                    </div>
                ) : (
                    <div className="max-w-xl mx-auto pb-20">

                        <SketchProgress />

                        {/* Wrapper with REF for scrolling */}
                        <div ref={guideRef} className="scroll-mt-10">
                            <SketchGuide step={currentStep} darkMode={darkMode} />
                        </div>

                        <AnimatePresence mode='wait'>
                            <motion.div
                                key={currentStep}
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                transition={{ duration: 0.2 }}
                                className={`relative p-1 rounded-2xl`}
                            >
                                {/* --- STEP 0: BASICS --- */}
                                {currentStep === 0 && (
                                    <div className="space-y-6">
                                        {/* NEW: How To Use Button */}
                                        {/* <div className="flex justify-end -mb-4">
                                            <button
                                                onClick={scrollToGuide}
                                                className={`flex items-center gap-2 text-xs font-bold uppercase tracking-widest transition-colors
                                                ${darkMode
                                                        ? 'text-blue-400 hover:text-blue-300'
                                                        : 'text-blue-600 hover:text-blue-800'}`}
                                            >
                                                <Info size={14} strokeWidth={2.5} />
                                                How to use this?
                                            </button>
                                        </div> */}

                                        <SketchSectionHeader title="Invoice Info" icon={FileText} darkMode={darkMode} />
                                        <SketchInput label="Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} placeholder="INV-001" darkMode={darkMode} autoFocus error={validationErrors.invoiceNumber} />
                                        <DatePicker label="Date of Issue" value={formData.date} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.date} />
                                    </div>
                                )}

                                {/* --- STEP 1: ENTITIES --- */}
                                {currentStep === 1 && (
                                    <div className="space-y-4">
                                        <SketchSectionHeader title="Billed By (You)" icon={User} darkMode={darkMode} />

                                        {apiData?.kyc_records?.length > 0 && (
                                            <SketchSelect
                                                label="Auto-fill Identity"
                                                value={selectedKycIndex}
                                                onChange={handleKycChange}
                                                options={apiData.kyc_records.map((k, i) => ({ label: `${k.company_legal_name} (KYC)`, value: i }))}
                                                darkMode={darkMode}
                                            />
                                        )}
                                        <SketchInput label="Your Name / Business" name="creatorName" value={formData.creatorName} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.creatorName} />
                                        <SketchInput label="Address" name="creatorAddress" value={formData.creatorAddress} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.creatorAddress} />
                                        <div className="grid grid-cols-2 gap-6">
                                            <SketchInput label="PAN No." name="creatorPan" value={formData.creatorPan} onChange={handleInputChange} darkMode={darkMode} />
                                            <SketchInput label="GSTIN (Opt)" name="creatorGstin" value={formData.creatorGstin} onChange={handleInputChange} darkMode={darkMode} />
                                        </div>

                                        <SketchSectionHeader title="Billed To (Client)" icon={Layers} darkMode={darkMode} />
                                        <SketchInput label="Client Name" name="clientName" value={formData.clientName} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.clientName} />
                                        <SketchInput label="Client Address" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.clientAddress} />
                                        <div className="grid grid-cols-2 gap-6">
                                            <SketchInput label="Client PAN" name="clientPan" value={formData.clientPan} onChange={handleInputChange} darkMode={darkMode} />
                                            <SketchInput label="Client GSTIN" name="clientGstin" value={formData.clientGstin} onChange={handleInputChange} darkMode={darkMode} />
                                        </div>





                                    </div>
                                )}

                                {/* --- STEP 2: ITEMS --- */}
                                {currentStep === 2 && (
                                    <div className="space-y-8">
                                        <SketchSectionHeader title="Line Items" icon={Sparkles} darkMode={darkMode} />

                                        {formData.items.map((item, index) => (
                                            <div key={index} className={`relative p-6 rounded-2xl border-2 transition-all group
                                                ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]'}`}>

                                                {/* Item Number Badge */}
                                                <div className={`absolute -top-3 -left-3 w-8 h-8 flex items-center justify-center rounded-full border-2 font-bold text-sm
                                                    ${darkMode ? 'bg-zinc-800 border-zinc-600' : 'bg-yellow-300 border-black'}`}>
                                                    {index + 1}
                                                </div>

                                                {/* Delete Button */}
                                                <button onClick={() => {
                                                    const newItems = formData.items.filter((_, i) => i !== index);
                                                    const updated = { ...formData, items: newItems };
                                                    setFormData(updated);
                                                    onInvoiceUpdate(updated);
                                                }} className="absolute -top-3 -right-3 p-2 rounded-full border-2 bg-red-100 border-black text-red-600 opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110">
                                                    <X size={14} strokeWidth={3} />
                                                </button>

                                                <div className="space-y-5">
                                                    <SketchInput
                                                        label="Service / Product"
                                                        value={item.name}
                                                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                        darkMode={darkMode}
                                                        placeholder="e.g. Creative Design"
                                                        error={validationErrors[`item_name_${index}`]}
                                                    />

                                                    <div className="relative pt-5">
                                                        <label className={`absolute top-0 left-0 text-xs font-bold uppercase tracking-widest ${darkMode ? 'text-zinc-500' : 'text-slate-500'}`}>Description</label>
                                                        <textarea
                                                            value={item.description}
                                                            onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                            className={`w-full bg-transparent text-sm font-medium outline-none p-3 border-l-4 min-h-[80px] resize-none 
                                                            ${darkMode ? 'text-zinc-300 border-zinc-700 focus:border-blue-500' : 'text-slate-600 border-slate-300 focus:border-blue-500'}`}
                                                            placeholder="Add details..."
                                                        />
                                                    </div>

                                                    <div className="grid grid-cols-3 gap-4 items-end bg-slate-50/50 dark:bg-zinc-800/50 p-3 rounded-lg">
                                                        <SketchInput label="Qty" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} darkMode={darkMode} className="text-center" error={validationErrors[`item_amount_${index}`]} />
                                                        <SketchInput label="Rate (₹)" type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} darkMode={darkMode} error={validationErrors[`item_amount_${index}`]} />
                                                        <div className="pb-2 text-right">
                                                            <span className={`text-xs font-bold uppercase block mb-1 ${darkMode ? 'text-zinc-500' : 'text-slate-400'}`}>Total</span>
                                                            <span className={`text-xl font-black ${darkMode ? 'text-white' : 'text-slate-900'}`}>₹{item.amount}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}

                                        <button
                                            onClick={() => {
                                                const updated = { ...formData, items: [...formData.items, { name: '', quantity: 1, rate: 0, amount: 0 }] };
                                                setFormData(updated);
                                                onInvoiceUpdate(updated);
                                            }}
                                            className={`w-full py-4 rounded-xl border-2 border-dashed flex items-center justify-center gap-2 font-bold uppercase tracking-widest transition-all
                                            ${validationErrors.items
                                                    ? 'border-red-500 text-red-500 bg-red-50 dark:bg-red-900/10'
                                                    : (darkMode ? 'border-zinc-700 hover:border-zinc-500 text-zinc-500 hover:text-zinc-300' : 'border-slate-300 hover:border-blue-400 text-slate-400 hover:text-blue-500 hover:bg-blue-50')}`}
                                        >
                                            <Plus size={20} /> {validationErrors.items ? validationErrors.items : 'Add Item'}
                                        </button>
                                    </div>
                                )}

                                {/* --- STEP 3: PAYMENT --- */}
                                {currentStep === 3 && (
                                    <div className="space-y-6">
                                        <SketchSectionHeader title="Bank Details" icon={Banknote} darkMode={darkMode} />

                                        <div className={`p-4 rounded-lg border-l-4 text-sm font-medium mb-6
                                            ${darkMode ? 'bg-amber-900/20 border-amber-600 text-amber-500' : 'bg-amber-50 border-amber-400 text-amber-800'}`}>
                                            ⚠️ Double check your Account Number & IFSC.
                                        </div>

                                        <SketchInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.bankName} />
                                        <SketchInput label="Account Holder" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.accountHolderName} />
                                        <div className="grid grid-cols-2 gap-6">
                                            <SketchInput label="Account No." name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.accountNumber} />
                                            <SketchInput label="IFSC Code" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} darkMode={darkMode} error={validationErrors.ifscCode} />
                                        </div>

                                        <SketchSectionHeader title="Adjustments" icon={CreditCard} darkMode={darkMode} />
                                        <div className="grid grid-cols-2 gap-6">
                                            <SketchInput label="TDS / Tax (%)" type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange} darkMode={darkMode} />
                                            <div className="flex gap-3">
                                                <SketchInput label="Discount" type="number" name="discount" value={formData.discount} onChange={handleInputChange} darkMode={darkMode} className="flex-1" />
                                                <div className="w-24 pt-5">
                                                    <select
                                                        name="discountType"
                                                        value={formData.discountType}
                                                        onChange={handleInputChange}
                                                        className={`w-full py-2 bg-transparent border-b-2 font-bold outline-none ${darkMode ? 'border-zinc-700 text-zinc-200' : 'border-slate-300 text-slate-900'}`}
                                                    >
                                                        <option value="percentage">%</option>
                                                        <option value="fixed">Flat</option>
                                                    </select>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* --- STEP 4: FINALIZE --- */}
                                {currentStep === 4 && (
                                    <div className="flex flex-col items-center pt-4">
                                        <SketchSectionHeader title="Sign & Seal" icon={ShieldCheck} darkMode={darkMode} />

                                        {formData.signature ? (
                                            <div className="w-full space-y-4">
                                                <div className={`relative p-8 rounded-xl border-2 border-dashed flex justify-center items-center 
                                                    ${darkMode ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-black'}`}>
                                                    <img src={formData.signature} alt="Sign" className="h-20 object-contain" />
                                                    <div className={`absolute top-3 right-3 text-[10px] font-bold px-2 py-1 rounded border border-current flex items-center gap-1
                                                        ${darkMode ? 'text-emerald-400 border-emerald-400' : 'text-emerald-600 border-emerald-600 bg-emerald-50'}`}>
                                                        <Check size={10} /> SIGNED
                                                    </div>
                                                </div>
                                                <button onClick={() => {
                                                    const updated = { ...formData, signature: null };
                                                    setFormData(updated);
                                                    onInvoiceUpdate(updated);
                                                }} className="w-full py-3 text-xs font-bold uppercase tracking-widest text-red-500 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100">
                                                    <Trash2 size={14} className="inline mb-0.5 mr-1" /> Clear & Resign
                                                </button>
                                            </div>
                                        ) : (
                                            <button onClick={() => setShowSignatureModal(true)} className={`group w-full aspect-[2/1] rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-4 transition-all hover:scale-[1.01]
                                                ${validationErrors.signature
                                                    ? 'border-red-500 bg-red-50 dark:bg-red-900/10'
                                                    : (darkMode ? 'border-zinc-600 hover:border-blue-400 hover:bg-zinc-800' : 'border-slate-400 hover:border-blue-500 hover:bg-blue-50')}`}>
                                                <div className={`p-4 rounded-full border-2 transition-transform group-hover:-rotate-12
                                                    ${validationErrors.signature
                                                        ? 'bg-red-100 border-red-500 text-red-500'
                                                        : (darkMode ? 'bg-zinc-800 border-zinc-500 text-zinc-300' : 'bg-white border-black text-blue-500 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]')}`}>
                                                    <PenTool size={32} />
                                                </div>
                                                <span className={`text-sm font-black uppercase tracking-widest ${validationErrors.signature ? 'text-red-500' : (darkMode ? 'text-zinc-500 group-hover:text-blue-400' : 'text-slate-400 group-hover:text-blue-600')}`}>
                                                    {validationErrors.signature ? 'Signature Required' : 'Click to Sign'}
                                                </span>
                                            </button>
                                        )}
                                    </div>
                                )}

                                <NavButtons
                                    step={currentStep}
                                    totalSteps={steps.length}
                                    onBack={() => setCurrentStep(currentStep - 1)}
                                    onNext={() => currentStep === steps.length - 1 ? console.log("Final Submit", formData) : setCurrentStep(currentStep + 1)}
                                />
                                {/* how to use button only show in step 1 */}
                                {currentStep === 0 && (
                                    <>

                                        <ScrollIndicator text="Instructions.." darkMode={darkMode} />


                                    </>
                                )}

                            </motion.div>
                        </AnimatePresence>

                    </div>
                )}
            </div>

            {/* Modals */}
            {showSignatureModal && (
                <SignatureModal
                    onSave={(dataUrl) => {
                        setFormData(prev => { const n = { ...prev, signature: dataUrl }; onInvoiceUpdate(n); return n; });
                        setShowSignatureModal(false);
                    }}
                    onClose={() => setShowSignatureModal(false)}
                    darkMode={darkMode}
                />
            )}
        </div>
    );
};

export default InvoiceFormDoodle;