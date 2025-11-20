import React, { useState, useEffect } from 'react';
import InvoiceForm from './components/InvoiceForm';
import InvoicePreview from './components/InvoicePreview'; // Assuming this exists
import UserGuide from './components/UserGuide';
import OnboardingTour from './components/OnboardingTour';
import { Moon, Sun, Eye, Edit3, CheckCircle2 } from 'lucide-react';

function App() {
  const [darkMode, setDarkMode] = useState(false);
  const [theme, setTheme] = useState('blue');

  // New state to toggle between Form and Preview on mobile
  const [mobileView, setMobileView] = useState('editor'); // 'editor' or 'preview'
  const [formStep, setFormStep] = useState(0);
  const [signatureTrigger, setSignatureTrigger] = useState(0);

  const handleEditSignature = () => {
    setFormStep(4); // Signature step index
    setMobileView('editor');
    setSignatureTrigger(prev => prev + 1);
  };

  const [formData, setFormData] = useState({
    invoiceNumber: '',
    date: new Date().toISOString().split('T')[0],
    creatorName: '',
    creatorAddress: '',
    creatorPan: '',
    creatorGstin: '',
    clientName: 'CLYROMEDIA PRIVATE LIMITED',
    clientAddress: '01, KANKRAWA BAAS, VILLAGE-SOLIYANA, POST-THIROD, MUNDWA, Nagaur, Rajasthan, 341026',
    clientPan: '',
    clientGstin: '08AAMCC2269E1ZL',
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

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const toggleDarkMode = () => setDarkMode(!darkMode);

  const themes = [
    { id: 'blue', color: 'bg-blue-600' },
    { id: 'black', color: 'bg-zinc-800' },
    { id: 'purple', color: 'bg-purple-600' },
  ];

  return (
    <div className={`min-h-screen flex flex-col transition-colors duration-300 ${darkMode ? 'bg-slate-950 text-slate-200' : 'bg-slate-50 text-slate-800'}`}>

      {/* Minimal Navbar */}
      <nav className={`sticky top-0 z-50 border-b backdrop-blur-xl ${darkMode ? 'bg-slate-950/80 border-slate-800' : 'bg-white/80 border-slate-200'}`}>
        <div className="max-w-[1600px] mx-auto px-4 h-14 flex items-center justify-between">

          {/* Logo Area */}
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-center justify-center leading-none select-none">
              <span className={`font-black text-2xl tracking-tighter ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'League Spartan', sans-serif" }}>Creators</span>
              <span className={`text-[10px] font-medium  tracking-[0.3em] mt-[-10px] ml-1 ${darkMode ? 'text-white' : 'text-slate-900'}`} style={{ fontFamily: "'Quicksand', sans-serif" }}>Mela</span>
            </div>
            <div className={`h-8 w-[1px] ${darkMode ? 'bg-slate-800' : 'bg-slate-200'}`}></div>
            <span className="text-xs font-bold opacity-40 uppercase tracking-[0.2em]">Invoice Maker</span>
          </div>

          {/* Actions Area */}
          <div className="flex items-center gap-3">

            {/* Mobile View Toggler (Hidden on Desktop) */}
            <button
              onClick={() => setMobileView(mobileView === 'editor' ? 'preview' : 'editor')}
              className={`lg:hidden flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all ${darkMode ? 'bg-slate-800 text-white' : 'bg-slate-100 text-slate-900'
                }`}
            >
              {mobileView === 'editor' ? <><Eye size={14} /> Preview</> : <><Edit3 size={14} /> Edit</>}
            </button>

            {/* Theme Selector (Dots) */}
            <div className="flex items-center gap-1.5 px-2 py-1.5 rounded-full border bg-transparent border-slate-200 dark:border-slate-800">
              {themes.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTheme(t.id)}
                  className={`w-3 h-3 rounded-full transition-transform hover:scale-125 ${t.color} ${theme === t.id ? 'ring-2 ring-offset-1 ring-offset-white dark:ring-offset-slate-950 ring-blue-500 scale-110' : 'opacity-60 hover:opacity-100'}`}
                  aria-label={`Select ${t.id} theme`}
                />
              ))}
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={toggleDarkMode}
              className={`p-1.5 rounded-full transition-colors ${darkMode ? 'text-yellow-400 hover:bg-slate-800' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'}`}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 max-w-[1600px] mx-auto w-full">
        <div className="flex flex-col lg:flex-row h-full">

          {/* Left Column: Editor / Form */}
          {/* On Mobile: Hidden if view is 'preview' */}
          {/* On Desktop: Always visible (w-5/12) */}
          <div className={`
            w-full lg:w-5/12 xl:w-4/12 
            ${mobileView === 'preview' ? 'hidden lg:block' : 'block'}
            ${darkMode ? 'bg-slate-950' : 'bg-white'}
            border-r border-slate-200 dark:border-slate-800
          `}>
            {/* We pass the theme to the form if it needs it, generally form is neutral */}
            <InvoiceForm
              onInvoiceUpdate={setFormData}
              darkMode={darkMode}
              currentStep={formStep}
              setCurrentStep={setFormStep}
              signatureTrigger={signatureTrigger}
            />
          </div>

          {/* Right Column: Live Preview */}
          {/* On Mobile: Hidden if view is 'editor' */}
          {/* On Desktop: Always visible (w-7/12) */}
          <div className={`
            w-full lg:w-7/12 xl:w-8/12 
            bg-slate-100 dark:bg-slate-900/50
            ${mobileView === 'editor' ? 'hidden lg:flex' : 'flex'}
            flex-col items-center justify-start pt-8 pb-20 px-4 overflow-y-auto h-[calc(100vh-3.5rem)] sticky top-14
          `}>
            {/* Mobile-only prompt above preview */}
            <div className="lg:hidden w-full mb-4 flex justify-between items-center">
              <h3 className="text-xs font-bold uppercase text-slate-500">Live Preview</h3>
              <button
                onClick={() => setMobileView('editor')}
                className="text-xs text-blue-500 font-bold flex items-center gap-1"
              >
                <Edit3 size={12} /> Back to Edit
              </button>
            </div>

            <div className="w-full max-w-4xl shadow-2xl rounded-none sm:rounded-lg overflow-hidden animate-in fade-in zoom-in-80 duration-300">
              <InvoicePreview
                data={formData}
                theme={theme}
                darkMode={darkMode}
                onEditSignature={handleEditSignature}
              />
            </div>

            <div className="mt-6 text-center lg:hidden">
              <p className="text-xs text-slate-400">Tip: Switch back to Edit to sign the invoice.</p>
            </div>
          </div>

        </div>

        <UserGuide darkMode={darkMode} />
      </main>

      <OnboardingTour darkMode={darkMode} />
    </div>
  );
}

export default App;