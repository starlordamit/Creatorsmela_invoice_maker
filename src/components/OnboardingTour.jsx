import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Check } from 'lucide-react';

const steps = [
    {
        target: null, // Welcome modal (center)
        title: "Welcome to Invoice Maker!",
        description: "Create professional, beautiful invoices in seconds. Let's take a quick tour to get you started.",
        position: "center"
    },
    {
        target: "invoice-form-container",
        title: "Edit Your Details",
        description: "Fill in your invoice information here. You can add items, change tax rates, and update client details. The preview updates automatically!",
        position: "right"
    },
    {
        target: "invoice-preview-container",
        title: "Live Preview",
        description: "See exactly how your invoice will look. This A4 preview ensures your PDF looks perfect when printed or shared.",
        position: "left"
    },
    {
        target: "signature-section",
        title: "Add Your Signature",
        description: "Authenticity matters. Upload or draw your signature here to make your invoice official.",
        position: "right"
    },
    {
        target: "download-pdf-btn",
        title: "Download PDF",
        description: "Once you're ready, click here to generate a high-quality PDF invoice instantly.",
        position: "bottom-left"
    }
];

const OnboardingTour = ({ darkMode }) => {
    const [currentStep, setCurrentStep] = useState(-1); // -1 means checking localStorage
    const [coords, setCoords] = useState({ top: 0, left: 0, width: 0, height: 0 });
    const [isVisible, setIsVisible] = useState(false);

    // useEffect(() => {
    //     const hasSeenTour = localStorage.getItem('hasSeenInvoiceTour');
    //     if (!hasSeenTour) {
    //         setCurrentStep(0);
    //         setIsVisible(true);
    //     }
    // }, []);

    useEffect(() => {
        if (currentStep >= 0 && currentStep < steps.length) {
            const step = steps[currentStep];
            if (step.target) {
                const element = document.getElementById(step.target);
                if (element) {
                    // Scroll with margin for better visibility on mobile
                    element.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                    updateCoords(element);
                    // Update coords on resize
                    window.addEventListener('resize', () => updateCoords(element));
                    return () => window.removeEventListener('resize', () => updateCoords(element));
                }
            } else {
                // Center step (welcome)
                setCoords({ top: window.innerHeight / 2, left: window.innerWidth / 2, width: 0, height: 0 });
            }
        }
    }, [currentStep]);

    const updateCoords = (element) => {
        const rect = element.getBoundingClientRect();
        setCoords({
            top: rect.top + window.scrollY,
            left: rect.left + window.scrollX,
            width: rect.width,
            height: rect.height,
            // Store raw rect for fixed positioning calculations
            rect: rect
        });
    };

    const handleNext = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            handleClose();
        }
    };

    const handlePrev = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const handleClose = () => {
        setIsVisible(false);
        localStorage.setItem('hasSeenInvoiceTour', 'true');
    };

    if (!isVisible) return null;

    const step = steps[currentStep];
    const isCenter = !step.target;

    // Calculate Tooltip Position
    let tooltipStyle = {};
    if (isCenter) {
        tooltipStyle = {
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)'
        };
    } else {
        // Simple positioning logic
        const gap = 12;
        const rect = coords.rect || { top: 0, left: 0, width: 0, height: 0, bottom: 0, right: 0 };

        // Default to bottom if mobile, otherwise follow preference
        const isMobile = window.innerWidth < 768;

        if (isMobile) {
            tooltipStyle = {
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                width: '100%',
                maxWidth: '100%',
                borderRadius: '20px 20px 0 0',
                margin: 0,
                transform: 'none',
                zIndex: 102 // Ensure it's above the highlight box and overlay
            };
        } else {
            if (step.position === 'right') {
                tooltipStyle = {
                    top: rect.top,
                    left: rect.right + gap,
                    width: '300px'
                };
            } else if (step.position === 'left') {
                tooltipStyle = {
                    top: rect.top,
                    right: window.innerWidth - rect.left + gap,
                    width: '300px'
                };
            } else if (step.position === 'bottom-left') {
                tooltipStyle = {
                    top: rect.bottom + gap,
                    right: window.innerWidth - rect.right,
                    width: '300px'
                };
            }
        }
    }

    return createPortal(
        <div className="fixed inset-0 z-[100] overflow-hidden">
            {/* Backdrop with cutout effect */}
            {/* If center (Welcome), show full backdrop. If targeting an element, the highlight box shadow handles the dimming. */}
            {isCenter && <div className="absolute inset-0 bg-black/60 transition-opacity duration-300" />}

            {/* Highlight Box (Only if not center) */}
            {!isCenter && (
                <div
                    className="absolute transition-all duration-500 ease-in-out border-2 border-blue-500 rounded-xl shadow-[0_0_0_9999px_rgba(0,0,0,0.6)]"
                    style={{
                        top: coords.rect?.top,
                        left: coords.rect?.left,
                        width: coords.width,
                        height: coords.height,
                        pointerEvents: 'none'
                    }}
                >
                    {/* Pulse animation to draw attention */}
                    <div className="absolute inset-0 rounded-xl animate-ping border border-blue-400 opacity-30"></div>
                </div>
            )}

            {/* Tooltip Card */}
            <div
                className={`absolute flex flex-col p-6 rounded-2xl shadow-2xl transition-all duration-500 ${darkMode ? 'bg-slate-800 text-white border border-slate-700' : 'bg-white text-slate-900'}`}
                style={tooltipStyle}
            >
                <button
                    onClick={handleClose}
                    className={`absolute top-4 right-4 p-1 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-700 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}
                >
                    <X size={16} />
                </button>

                {/* Progress Dots */}
                <div className="flex gap-1.5 mb-4">
                    {steps.map((_, idx) => (
                        <div
                            key={idx}
                            className={`h-1.5 rounded-full transition-all duration-300 ${idx === currentStep ? 'w-6 bg-blue-500' : `w-1.5 ${darkMode ? 'bg-slate-700' : 'bg-slate-200'}`}`}
                        />
                    ))}
                </div>

                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className={`text-sm mb-6 leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>
                    {step.description}
                </p>

                <div className="flex items-center justify-between mt-auto">
                    <button
                        onClick={handlePrev}
                        disabled={currentStep === 0}
                        className={`text-sm font-medium px-3 py-2 rounded-lg transition-colors ${currentStep === 0 ? 'opacity-0 cursor-default' : (darkMode ? 'text-slate-400 hover:text-white' : 'text-slate-500 hover:text-slate-900')}`}
                    >
                        Back
                    </button>
                    <button
                        onClick={handleNext}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 active:scale-95"
                    >
                        {currentStep === steps.length - 1 ? 'Get Started' : 'Next'}
                        {currentStep === steps.length - 1 ? <Check size={16} /> : <ChevronRight size={16} />}
                    </button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export default OnboardingTour;
