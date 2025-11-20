import React, { useState, useEffect } from 'react';
import { fetchInvoiceDetails } from '../api/invoiceApi';
import {
    Loader2, Plus, Check, PenTool, X, ArrowRight, ChevronDown
} from 'lucide-react';
import SignatureModal from './SignatureCanvas';
import DatePicker from './DatePicker';

// --- Minimal UI Components ---

const MinimalInput = ({ label, value, onChange, name, type = "text", placeholder, darkMode, className = "", ...props }) => (
    <div className={`relative pt-4 pb-1 ${className}`}>
        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {label}
        </label>
        <input
            type={type}
            name={name}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className={`w-full py-1.5 bg-transparent border-b text-sm font-medium outline-none transition-colors rounded-none
            ${darkMode
                    ? 'border-slate-800 text-slate-200 placeholder-slate-700 focus:border-blue-500'
                    : 'border-slate-200 text-slate-900 placeholder-slate-300 focus:border-blue-600'
                }`}
            {...props}
        />
    </div>
);

const MinimalSelect = ({ label, value, onChange, options, darkMode }) => (
    <div className="relative pt-4 pb-1">
        <label className={`block text-[10px] font-bold uppercase tracking-wider mb-1 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
            {label}
        </label>
        <div className="relative">
            <select
                value={value}
                onChange={onChange}
                className={`w-full py-1.5 bg-transparent border-b text-sm font-medium outline-none transition-colors rounded-none appearance-none
            ${darkMode
                        ? 'border-slate-800 text-slate-200 focus:border-blue-500'
                        : 'border-slate-200 text-slate-900 focus:border-blue-600'
                    }`}
            >
                {options.map((opt, idx) => (
                    <option key={idx} value={opt.value} className={darkMode ? 'bg-slate-900' : 'bg-white'}>
                        {opt.label}
                    </option>
                ))}
            </select>
            <div className={`absolute right-0 top-2 pointer-events-none ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                <ChevronDown size={14} />
            </div>
        </div>
    </div>
);

const SectionHeader = ({ title, darkMode }) => (
    <h3 className={`text-[10px] font-bold uppercase tracking-widest mb-2 mt-6 opacity-60 ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
        {title}
    </h3>
);

// --- Main Component ---

const InvoiceForm = ({ onInvoiceUpdate, darkMode, currentStep, setCurrentStep, signatureTrigger }) => {
    const [loading, setLoading] = useState(false);
    const [apiData, setApiData] = useState(null);
    // currentStep is now a prop
    const [showSignatureModal, setShowSignatureModal] = useState(false);
    const [selectedKycIndex, setSelectedKycIndex] = useState(0);
    // set the client details for the clyromedia private limited if the param is billto=clyromedia
    const urlParams = new URLSearchParams(window.location.search);
    const billTo = urlParams.get('billto');
    let clientName = '', clientAddress = '', clientPan = '', clientGstin = '';

    if (billTo === 'clyromedia') {
        clientName = 'CLYROMEDIA PRIVATE LIMITED';
        clientAddress = '01, KANKRAWA BAAS, VILLAGE-SOLIYANA, POST-THIROD, MUNDWA, Nagaur, Rajasthan, 341026';
        clientPan = 'AAMCC2269E';
        clientGstin = '08AAMCC2269E1ZL';
    }
    else {
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
        if (signatureTrigger > 0 && !formData.signature) {
            setShowSignatureModal(true);
        }
    }, [signatureTrigger, formData.signature]);

    useEffect(() => {
        //use it from the param key=somekey
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
        if (apiData?.kyc_records?.[index]) {
            updateFromKyc(apiData.kyc_records[index]);
        }
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

    const steps = ['Basic Info', 'Entities', 'Items', 'Payment', 'Finalize'];

    // --- Inline Navigation Component ---
    const NavButtons = ({ step, totalSteps, onNext, onBack }) => (
        <div className="mt-10 pt-6 border-t border-dashed border-slate-200 dark:border-slate-800">
            <div className="flex gap-3">
                {step > 0 && (
                    <button
                        onClick={onBack}
                        className={`px-6 py-3 rounded-lg text-sm font-bold transition-colors ${darkMode ? 'text-slate-400 hover:text-white bg-slate-900' : 'text-slate-500 hover:text-slate-900 bg-slate-100'}`}
                    >
                        Back
                    </button>
                )}
                <button
                    onClick={onNext}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold text-white flex items-center justify-center gap-2 transition-all active:scale-95
                    ${step === totalSteps - 1 ? 'bg-green-600 hover:bg-green-700' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {step === totalSteps - 1 ? 'Sign & Download' : 'Continue'}
                    {step === totalSteps - 1 ? <Check size={16} /> : <ArrowRight size={16} />}
                </button>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen flex flex-col font-sans ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-white text-slate-900'}`}>

            <div className="flex-1 overflow-y-auto px-6 py-8">
                {loading ? (
                    <div className="flex justify-center pt-20"><Loader2 className="animate-spin" /></div>
                ) : (
                    <div className="max-w-sm mx-auto animate-in fade-in duration-300">
                        {/* Minimal Header */}
                        <div className="mb-8">
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-xs font-bold px-2 py-0.5 rounded ${darkMode ? 'bg-slate-800 text-slate-400' : 'bg-slate-100 text-slate-500'}`}>
                                    Step {currentStep + 1}/{steps.length}
                                </span>
                            </div>
                            <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{steps[currentStep]}</h1>
                        </div>

                        {currentStep === 0 && (
                            <div className="space-y-2">
                                <MinimalInput label="Invoice Number" name="invoiceNumber" value={formData.invoiceNumber} onChange={handleInputChange} placeholder="INV-001" darkMode={darkMode} />
                                <DatePicker label="Invoice Date" value={formData.date} onChange={handleInputChange} darkMode={darkMode} />
                                <NavButtons step={0} totalSteps={steps.length} onNext={() => setCurrentStep(1)} />
                            </div>
                        )}

                        {currentStep === 1 && (
                            <div className="space-y-2">
                                <SectionHeader title="From (Creator)" darkMode={darkMode} />
                                {apiData?.kyc_records?.length > 0 && (
                                    <MinimalSelect
                                        label="Select KYC Profile"
                                        value={selectedKycIndex}
                                        onChange={handleKycChange}
                                        options={apiData.kyc_records.map((k, i) => ({ label: `${k.company_legal_name} (${k.pancard_number})`, value: i }))}
                                        darkMode={darkMode}
                                    />
                                )}
                                <MinimalInput label="Your Name" name="creatorName" value={formData.creatorName} onChange={handleInputChange} darkMode={darkMode} />
                                <MinimalInput label="Address" name="creatorAddress" value={formData.creatorAddress} onChange={handleInputChange} darkMode={darkMode} />
                                <div className="grid grid-cols-2 gap-4">
                                    <MinimalInput label="PAN" name="creatorPan" value={formData.creatorPan} onChange={handleInputChange} darkMode={darkMode} />
                                    <MinimalInput label="GSTIN" name="creatorGstin" value={formData.creatorGstin} onChange={handleInputChange} darkMode={darkMode} />
                                </div>

                                <SectionHeader title="To (Client)" darkMode={darkMode} />
                                <MinimalInput label="Client Name" name="clientName" value={formData.clientName} onChange={handleInputChange} darkMode={darkMode} />
                                <MinimalInput label="Address" name="clientAddress" value={formData.clientAddress} onChange={handleInputChange} darkMode={darkMode} />
                                <div className="grid grid-cols-2 gap-4">
                                    <MinimalInput label="Client PAN" name="clientPan" value={formData.clientPan} onChange={handleInputChange} darkMode={darkMode} />
                                    <MinimalInput label="Client GSTIN" name="clientGstin" value={formData.clientGstin} onChange={handleInputChange} darkMode={darkMode} />
                                </div>

                                <NavButtons step={1} totalSteps={steps.length} onBack={() => setCurrentStep(0)} onNext={() => setCurrentStep(2)} />
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-8">
                                {formData.items.map((item, index) => (
                                    <div key={index} className="relative group animate-in slide-in-from-right-4 duration-200">
                                        <div className="flex justify-between items-start mb-2">
                                            <input
                                                value={item.name}
                                                onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                                                className={`w-full bg-transparent font-bold text-lg outline-none ${darkMode ? 'text-white placeholder-slate-600' : 'text-slate-900 placeholder-slate-300'}`}
                                                placeholder="Item Name"
                                            />
                                            <button onClick={() => {
                                                const newItems = formData.items.filter((_, i) => i !== index);
                                                const updated = { ...formData, items: newItems };
                                                setFormData(updated);
                                                onInvoiceUpdate(updated);
                                            }} className="p-1 text-slate-300 hover:text-red-500">
                                                <X size={16} />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-12 gap-4">
                                            <div className="col-span-12">
                                                <input
                                                    value={item.description}
                                                    onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                                                    className={`w-full bg-transparent text-xs outline-none pb-2 border-b ${darkMode ? 'text-slate-400 border-slate-800' : 'text-slate-500 border-slate-100'}`}
                                                    placeholder="Description (Optional)"
                                                />
                                            </div>
                                            <div className="col-span-4">
                                                <MinimalInput label="Qty" type="number" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)} darkMode={darkMode} className="text-center" />
                                            </div>
                                            <div className="col-span-4">
                                                <MinimalInput label="Rate" type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} darkMode={darkMode} />
                                            </div>
                                            <div className="col-span-4 text-right pt-5">
                                                <span className={`text-sm font-bold ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>₹{item.amount}</span>
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
                                    className="w-full py-3 rounded-lg border border-dashed flex items-center justify-center gap-2 text-xs font-bold uppercase tracking-widest transition-all hover:border-blue-500 hover:text-blue-500 opacity-60 hover:opacity-100"
                                >
                                    <Plus size={14} /> Add Item
                                </button>

                                <NavButtons step={2} totalSteps={steps.length} onBack={() => setCurrentStep(1)} onNext={() => setCurrentStep(3)} />
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-4">
                                <MinimalInput label="Bank Name" name="bankName" value={formData.bankName} onChange={handleInputChange} darkMode={darkMode} />
                                <MinimalInput label="Account Holder" name="accountHolderName" value={formData.accountHolderName} onChange={handleInputChange} darkMode={darkMode} />
                                <div className="grid grid-cols-2 gap-4">
                                    <MinimalInput label="Account No." name="accountNumber" value={formData.accountNumber} onChange={handleInputChange} darkMode={darkMode} />
                                    <MinimalInput label="IFSC" name="ifscCode" value={formData.ifscCode} onChange={handleInputChange} darkMode={darkMode} />
                                </div>

                                <div className="pt-4 grid grid-cols-2 gap-4">
                                    <MinimalInput label="Tax / TDS (%)" type="number" name="taxRate" value={formData.taxRate} onChange={handleInputChange} darkMode={darkMode} />
                                    <div className="flex gap-2">
                                        <MinimalInput label="Discount" type="number" name="discount" value={formData.discount} onChange={handleInputChange} darkMode={darkMode} className="flex-1" />
                                        <div className="w-16 pt-4">
                                            <select
                                                name="discountType"
                                                value={formData.discountType}
                                                onChange={handleInputChange}
                                                className={`w-full py-1.5 bg-transparent border-b text-xs font-bold outline-none ${darkMode ? 'border-slate-800 text-slate-200' : 'border-slate-200 text-slate-900'}`}
                                            >
                                                <option value="percentage">%</option>
                                                <option value="fixed">FIX</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <NavButtons step={3} totalSteps={steps.length} onBack={() => setCurrentStep(2)} onNext={() => setCurrentStep(4)} />
                            </div>
                        )}

                        {currentStep === 4 && (
                            <div className="flex flex-col items-center space-y-8 pt-4">
                                {formData.signature ? (
                                    <div className="w-full space-y-4">
                                        <div className={`p-6 rounded-xl border border-dashed ${darkMode ? 'bg-slate-900 border-slate-700' : 'bg-slate-50 border-slate-200'}`}>
                                            <img src={formData.signature} alt="Sign" className="h-24 mx-auto object-contain" />
                                        </div>
                                        <button onClick={() => {
                                            const updated = { ...formData, signature: null };
                                            setFormData(updated);
                                            onInvoiceUpdate(updated);
                                        }} className="w-full py-2 text-xs text-red-500 font-bold uppercase tracking-widest hover:bg-red-50 dark:hover:bg-red-900/10 rounded">
                                            Remove Signature
                                        </button>
                                    </div>
                                ) : (
                                    <button onClick={() => setShowSignatureModal(true)} className={`group w-full aspect-[3/2] rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-3 transition-all active:scale-95 ${darkMode ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-900' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                                        <div className="p-3 rounded-full bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                                            <PenTool size={24} />
                                        </div>
                                        <span className="text-xs font-bold uppercase text-slate-400 group-hover:text-blue-500">Tap to Sign</span>
                                    </button>
                                )}

                                <div className="w-full">
                                    <NavButtons
                                        step={4}
                                        totalSteps={steps.length}
                                        onBack={() => setCurrentStep(3)}
                                        onNext={() => console.log("Submit", formData)}
                                    />
                                </div>
                            </div>
                        )}
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

export default InvoiceForm;