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
    clientName = 'Enter Company Name';
    clientAddress = 'Enter Company Address';
    clientPan = 'Enter Company Pan';
    clientGstin = 'Enter Company Gstin';
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
            flex-col h-[calc(100vh-3.5rem)] sticky top-14
          `}>
            {/* Mobile-only prompt above preview */}
            <div className="lg:hidden w-full p-4 flex justify-between items-center bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-zinc-800 shrink-0 z-20">
              <h3 className="text-xs font-bold uppercase text-slate-500">Live Preview</h3>
              <button
                onClick={() => setMobileView('editor')}
                className="text-xs text-blue-500 font-bold flex items-center gap-1"
              >
                <Edit3 size={12} /> Back to Edit
              </button>
            </div>

            <div className="flex-1 w-full overflow-hidden relative">
              <InvoicePreview
                data={formData}
                theme={theme}
                darkMode={darkMode}
                onEditSignature={handleEditSignature}
              />
            </div>

            <div className="p-4 text-center lg:hidden bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0">
              <p className="text-xs text-slate-400">Tip: Switch back to Edit to sign the invoice.</p>
            </div>
          </div>

        </div>

        <UserGuide darkMode={darkMode} />
      </main>

      {/* Mobile Floating Preview Button */}
      <div className={`lg:hidden fixed bottom-6 right-6 z-50 transition-transform duration-300 ${mobileView === 'editor' ? 'translate-y-0' : 'translate-y-24'}`}>
        <button
          onClick={() => setMobileView('preview')}
          className="flex items-center gap-2 px-6 py-3.5 rounded-full font-bold shadow-xl shadow-blue-600/30 bg-blue-600 text-white active:scale-95 transition-all hover:bg-blue-700"
        >
          <Eye size={20} />
          <span>Preview</span>
        </button>
      </div>

      <OnboardingTour darkMode={darkMode} />
    </div>
  );
}

export default App;