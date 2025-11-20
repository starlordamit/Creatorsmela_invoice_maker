import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview';
import UserGuide from './components/UserGuide';
import OnboardingTour from './components/OnboardingTour';
import { Moon, Sun, Eye, Edit3, Palette } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState('blue');

  // View State
  const [mobileView, setMobileView] = useState('editor'); // 'editor' | 'preview'
  const [formStep, setFormStep] = useState(0);
  const [signatureTrigger, setSignatureTrigger] = useState(0);

  // URL Params Logic
  const urlParams = new URLSearchParams(window.location.search);
  const billTo = urlParams.get('billto');

  // Defaults
  let defaultClient = { name: '', address: '', pan: '', gstin: '' };
  if (billTo === 'clyromedia') {
    defaultClient = {
      name: 'CLYROMEDIA PRIVATE LIMITED',
      address: '01, KANKRAWA BAAS, VILLAGE-SOLIYANA, POST-THIROD, MUNDWA, Nagaur, Rajasthan, 341026',
      pan: 'AAMCC2269E',
      gstin: '08AAMCC2269E1ZL'
    };
  }

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    creatorName: '',
    creatorAddress: '',
    creatorPan: '',
    creatorGstin: '',
    clientName: defaultClient.name,
    clientAddress: defaultClient.address,
    clientPan: defaultClient.pan,
    clientGstin: defaultClient.gstin,
    hsnCode: '998361',
    items: [{ name: 'Advertisement Services', description: '', quantity: 1, rate: 0, amount: 0 }],
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

  const [validationErrors, setValidationErrors] = useState({});

  const handleEditSignature = () => {
    setFormStep(4);
    setMobileView('editor');
    setSignatureTrigger(prev => prev + 1);
  };

  const validateInvoice = () => {
    const newErrors = {};
    let firstErrorStep = null;

    // Step 0: Basics
    if (!formData.invoiceNumber) { newErrors.invoiceNumber = "Required"; if (firstErrorStep === null) firstErrorStep = 0; }
    if (!formData.date) { newErrors.date = "Required"; if (firstErrorStep === null) firstErrorStep = 0; }

    // Step 1: Entities
    if (!formData.creatorName) { newErrors.creatorName = "Required"; if (firstErrorStep === null) firstErrorStep = 1; }
    if (!formData.creatorAddress) { newErrors.creatorAddress = "Required"; if (firstErrorStep === null) firstErrorStep = 1; }
    if (!formData.clientName) { newErrors.clientName = "Required"; if (firstErrorStep === null) firstErrorStep = 1; }
    if (!formData.clientAddress) { newErrors.clientAddress = "Required"; if (firstErrorStep === null) firstErrorStep = 1; }

    // Step 2: Items
    if (formData.items.length === 0) { newErrors.items = "Add at least one item"; if (firstErrorStep === null) firstErrorStep = 2; }
    formData.items.forEach((item, index) => {
      if (!item.name) { newErrors[`item_name_${index}`] = "Required"; if (firstErrorStep === null) firstErrorStep = 2; }
      if (item.amount <= 0) { newErrors[`item_amount_${index}`] = "Invalid Amount"; if (firstErrorStep === null) firstErrorStep = 2; }
    });

    // Step 3: Payment
    if (!formData.bankName) { newErrors.bankName = "Required"; if (firstErrorStep === null) firstErrorStep = 3; }
    if (!formData.accountNumber) { newErrors.accountNumber = "Required"; if (firstErrorStep === null) firstErrorStep = 3; }
    if (!formData.ifscCode) { newErrors.ifscCode = "Required"; if (firstErrorStep === null) firstErrorStep = 3; }
    if (!formData.accountHolderName) { newErrors.accountHolderName = "Required"; if (firstErrorStep === null) firstErrorStep = 3; }

    // Step 4: Signature
    if (!formData.signature) { newErrors.signature = "Signature Required"; if (firstErrorStep === null) firstErrorStep = 4; }

    setValidationErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      if (firstErrorStep !== null) {
        setFormStep(firstErrorStep);
        setMobileView('editor'); // Switch to editor to show errors
      }
      return false;
    }
    return true;
  };

  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const themes = [
    { id: 'blue', color: 'bg-blue-600' },
    { id: 'black', color: 'bg-zinc-800' },
    { id: 'purple', color: 'bg-purple-600' },
  ];

  return (
    <div className={`h-screen flex flex-col overflow-hidden transition-colors duration-300 selection:bg-blue-500/30 
      ${darkMode ? 'bg-zinc-950 text-zinc-200' : 'bg-blue-50 text-slate-800'}`}>

      {/* --- Navbar --- */}
      <nav className={`shrink-0 border-b-2 z-50 transition-colors duration-300
        ${darkMode ? 'bg-zinc-950 border-blue-400' : 'bg-white border-black'}`}>

        <div className="max-w-[1800px] mx-auto px-4 h-18 py-3 flex items-center justify-between">

          {/* Logo Area (Unchanged as requested, just updated separator color to match theme) */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center leading-none select-none">
              <span className={`font-black text-2xl tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'League Spartan', sans-serif" }}>Creators</span>
              <span className={`text-[10px] font-medium  tracking-[0.3em] mt-[-10px] ml-1 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Quicksand', sans-serif" }}>Mela</span>
            </div>
            <div className={`h-8 w-[2px] ${darkMode ? 'bg-blue-400' : 'bg-black'}`}></div>
            <span className={`text-xs font-bold opacity-60 uppercase tracking-[0.2em] hidden sm:block ${darkMode ? 'text-blue-300' : 'text-slate-900'}`}>
              Invoice Maker
            </span>
          </div>

          {/* Actions Area */}
          <div className="flex items-center gap-4">

            {/* Theme Selector - Brutalist Style */}
            <div className={`hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border-2 transition-colors
              ${darkMode
                ? 'bg-zinc-900 border-blue-400 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)]'
                : 'bg-white border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'
              }`}>
              <Palette size={16} className={`${darkMode ? 'text-blue-400' : 'text-black'} mr-1`} strokeWidth={2.5} />
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-5 h-5 rounded-full border-2 transition-all duration-200 ${t.color} ${darkMode ? 'border-zinc-300' : 'border-black'}
                    ${theme === t.id ? 'scale-125 ring-2 ring-offset-2 ring-blue-400 dark:ring-offset-zinc-900' : 'hover:scale-110 opacity-70 hover:opacity-100'}`}
                  aria-label={`Select ${t.id} theme`}
                />
              ))}
            </div>

            {/* Dark Mode Toggle - Brutalist Button */}
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-lg border-2 transition-all duration-200 active:translate-y-1 active:shadow-none
                ${darkMode
                  ? 'bg-zinc-800 border-blue-400 text-yellow-400 shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:bg-zinc-700'
                  : 'bg-white border-black text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-50'}`}
            >
              {darkMode ? <Sun size={20} strokeWidth={2.5} /> : <Moon size={20} strokeWidth={2.5} />}
            </button>

            {/* Mobile: Current View Indicator */}
            <div className="lg:hidden">
              <span className={`text-xs font-black uppercase tracking-wider px-3 py-1.5 rounded border-2 ${darkMode ? 'bg-blue-900/30 border-blue-400 text-blue-300' : 'bg-blue-100 border-black text-blue-800'}`}>
                {mobileView === 'editor' ? 'Editor' : 'Preview'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* --- Main Workspace (Split View) --- */}
      <main className="flex-1 flex overflow-hidden relative max-w-[1800px] mx-auto w-full">

        {/* Left Column: Editor (Scrollable) */}
        <div className={`
          flex-1 flex flex-col h-full overflow-y-auto scroll-smooth custom-scrollbar transition-transform duration-500 ease-in-out
          ${mobileView === 'preview' ? '-translate-x-full absolute lg:static lg:translate-x-0 w-full' : 'translate-x-0 relative w-full'}
          ${darkMode ? 'bg-zinc-950' : 'bg-white'}
          lg:border-r-2 lg:w-5/12 xl:w-4/12 z-10
          ${darkMode ? 'border-blue-400' : 'border-black'}
        `}>
          <div className="p-1">
            {/* Wrapper p-1 to avoid scrollbar overlapping border if needed */}
            <InvoiceForm
              onInvoiceUpdate={(data) => {
                setFormData(data);
                // Clear errors for fields being updated
                if (Object.keys(validationErrors).length > 0) {
                  setValidationErrors({});
                }
              }}
              darkMode={darkMode}
              currentStep={formStep}
              setCurrentStep={setFormStep}
              signatureTrigger={signatureTrigger}
              validationErrors={validationErrors}
            />

            <div className="">
              <UserGuide darkMode={darkMode} />
            </div>
          </div>
        </div>

        {/* Right Column: Preview (Fixed/Sticky on Desktop) */}
        <div className={`
          flex-1 h-full transition-transform duration-500 ease-in-out
          ${mobileView === 'editor' ? 'translate-x-full absolute lg:static lg:translate-x-0 w-full' : 'translate-x-0 relative w-full'}
          ${darkMode ? 'bg-zinc-900/50' : 'bg-slate-100'}
          lg:w-7/12 xl:w-8/12 z-0 flex flex-col
        `}>
          {/* Mobile Header for Preview */}
          <div className={`lg:hidden p-4 flex justify-between items-center border-b-2 shrink-0 z-20 ${darkMode ? 'bg-zinc-900 border-blue-400' : 'bg-white border-black'}`}>
            <button
              onClick={() => setMobileView('editor')}
              className={`text-xs font-bold flex items-center gap-2 transition-colors ${darkMode ? 'text-blue-300' : 'text-slate-700'}`}
            >
              <Edit3 size={14} strokeWidth={2.5} /> Return to Editor
            </button>
            <span className={`text-[10px] font-bold uppercase tracking-widest ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>Live Preview</span>
          </div>

          {/* The Preview Component */}
          <div className="flex-1 w-full h-full overflow-hidden relative p-4 lg:p-8 flex items-center justify-center">
            {/* Added a decorative background pattern for empty space around preview */}
            <div className={`absolute inset-0 opacity-10 pointer-events-none ${darkMode ? 'bg-[radial-gradient(#3b82f6_1px,transparent_1px)] [background-size:16px_16px]' : 'bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px]'}`}></div>

            <div className="w-full h-full relative z-10">
              <InvoicePreview
                data={formData}
                theme={theme}
                darkMode={darkMode}
                onEditSignature={handleEditSignature}
                onValidate={validateInvoice}
              />
            </div>
          </div>
        </div>

      </main>

      {/* --- Mobile Floating Action Button (FAB) --- */}
      <div className="lg:hidden fixed bottom-8 right-6 z-50 pointer-events-none">
        <div className={`pointer-events-auto transition-all duration-300 transform ${mobileView === 'editor' ? 'translate-y-0 opacity-100' : 'translate-y-32 opacity-0'}`}>
          <button
            onClick={() => setMobileView('preview')}
            className={`
              flex items-center gap-3 pl-6 pr-8 py-4 rounded-xl font-bold border-2 transition-all active:translate-y-1 active:shadow-none
              ${darkMode
                ? 'bg-blue-600 border-blue-400 text-white shadow-[6px_6px_0px_0px_rgba(30,41,59,1)] hover:bg-blue-500'
                : 'bg-blue-500 border-black text-white shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600'
              }
            `}
          >
            <Eye size={22} strokeWidth={3} />
            <span className="tracking-wide text-lg font-hand">Preview PDF</span>
          </button>
        </div>
      </div>

      {/* Global Tour Component */}
      <OnboardingTour darkMode={darkMode} />

    </div>
  );
}

export default App;