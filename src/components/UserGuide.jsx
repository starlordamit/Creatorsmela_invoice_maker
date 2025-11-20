import React from 'react';
import { FileText, Users, ShoppingCart, CreditCard, PenTool, Download } from 'lucide-react';

const UserGuide = ({ darkMode }) => {
    const steps = [
        {
            icon: FileText,
            title: "1. Invoice Details",
            description: "Start by entering the Invoice Number and Date. Fill in your details under 'Billed By', including your address and tax IDs (PAN/GSTIN)."
        },
        {
            icon: Users,
            title: "2. Client Information",
            description: "Enter your client's details under 'Billed To'. Ensure their address and GSTIN are correct for tax compliance."
        },
        {
            icon: ShoppingCart,
            title: "3. Add Items",
            description: "List your services or products. Give each item a clear name and description. You can add multiple items and set quantities."
        },
        {
            icon: CreditCard,
            title: "4. Financials & Bank",
            description: "Set tax rates (TDS/GST) and discounts. Enter your Bank Details so the client knows where to send the payment."
        },
        {
            icon: PenTool,
            title: "5. Add Signature",
            description: "Make it official! Click 'Add Signature' to draw, type, or upload your signature image."
        },
        {
            icon: Download,
            title: "6. Download PDF",
            description: "Review the preview on the right. Once everything looks perfect, click 'Download PDF' to save your professional invoice."
        }
    ];

    return (
        <div className={`w-full py-16 mt-16 border-t ${darkMode ? 'border-slate-800 bg-slate-900/30' : 'border-slate-200 bg-slate-50/50'}`}>
            <div className="max-w-6xl mx-auto px-4">
                <div className="text-center mb-12">
                    <h2 className={`text-3xl font-bold mb-4 ${darkMode ? 'text-white' : 'text-slate-900'}`}>
                        How to create a Professional Invoice
                    </h2>
                    <p className={`text-lg ${darkMode ? 'text-slate-400' : 'text-slate-600'}`}>
                        Follow these simple steps to generate a compliant and beautiful invoice in minutes.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {steps.map((step, index) => (
                        <div key={index} className={`flex flex-col items-start p-6 rounded-2xl transition-all duration-300 group hover:-translate-y-1 ${darkMode ? 'bg-slate-800/50 hover:bg-slate-800 border border-slate-700' : 'bg-white hover:shadow-xl shadow-sm border border-slate-100'}`}>
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-6 transition-colors ${darkMode ? 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-100'}`}>
                                <step.icon size={24} />
                            </div>
                            <h3 className={`font-bold text-xl mb-3 ${darkMode ? 'text-slate-200' : 'text-slate-800'}`}>{step.title}</h3>
                            <p className={`text-sm leading-relaxed ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                                {step.description}
                            </p>
                        </div>
                    ))}
                </div>


            </div>
        </div>
    );
};

export default UserGuide;
