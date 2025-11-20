import React from 'react';
import { motion } from 'framer-motion';
import {
    FileText, Users, ShoppingCart, CreditCard,
    PenTool, Download, ArrowRight, Star
} from 'lucide-react';

// --- Custom Doodle SVGs (Hand-drawn feel) ---
const DoodleArrow = ({ className }) => (
    <svg viewBox="0 0 100 30" className={className} fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 15 Q 50 5, 90 15" />
        <path d="M80 5 L 90 15 L 80 25" />
    </svg>
);

const DoodleCircle = ({ className }) => (
    <svg viewBox="0 0 100 100" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10,50 Q 20,10 50,10 T 90,50 T 50,90 T 10,50" />
    </svg>
);

const DoodleUnderline = ({ className }) => (
    <svg viewBox="0 0 200 20" className={className} fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5,10 Q 50,15 100,5 T 195,10" />
    </svg>
);

const UserGuideDoodle = ({ darkMode }) => {
    const steps = [
        {
            icon: FileText,
            title: "The Basics",
            description: "Fill in the Invoice # and Date. Who is this invoice from? (That's you!).",
            rotate: "rotate-1",
            color: "bg-yellow-100",
            darkColor: "bg-yellow-900/30",
            accent: "text-yellow-600"
        },
        {
            icon: Users,
            title: "Who's Paying?",
            description: "Add your client's details. Double-check that email address!",
            rotate: "-rotate-1",
            color: "bg-green-100",
            darkColor: "bg-green-900/30",
            accent: "text-green-600"
        },
        {
            icon: ShoppingCart,
            title: "What's Sold?",
            description: "List your items. Be descriptive so they know exactly what they bought.",
            rotate: "rotate-2",
            color: "bg-blue-100",
            darkColor: "bg-blue-900/30",
            accent: "text-blue-600"
        },
        {
            icon: CreditCard,
            title: "Get Paid",
            description: "Add your bank info and tax details. Don't forget to set a due date!",
            rotate: "-rotate-2",
            color: "bg-purple-100",
            darkColor: "bg-purple-900/30",
            accent: "text-purple-600"
        },
        {
            icon: PenTool,
            title: "Sign It",
            description: "Make it official. Draw your signature or upload a picture of it.",
            rotate: "rotate-1",
            color: "bg-pink-100",
            darkColor: "bg-pink-900/30",
            accent: "text-pink-600"
        },
        {
            icon: Download,
            title: "Save & Send",
            description: "You're done! Download the PDF and send it off to get paid.",
            rotate: "-rotate-1",
            color: "bg-orange-100",
            darkColor: "bg-orange-900/30",
            accent: "text-orange-600"
        }
    ];

    return (
        <section className={`relative w-full py-24 overflow-hidden transition-colors duration-500 font-sans
            ${darkMode ? 'bg-[#1a1a1a] text-gray-200' : 'bg-[#f8f9fa] text-gray-800'}`}>

            {/* --- Background Grid Texture (Notebook paper style) --- */}
            <div className={`absolute inset-0 opacity-30 pointer-events-none
                ${darkMode
                    ? 'bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px]'
                    : 'bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] [background-size:24px_24px]'
                }`}
            />

            <div className="relative max-w-7xl mx-auto px-6">

                {/* --- Fun Header --- */}
                <div className="text-center max-w-3xl mx-auto mb-20 relative">
                    {/* Floating Star Doodle */}
                    <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                        className="absolute -top-10 right-10 text-yellow-400 opacity-50 hidden md:block"
                    >
                        <Star size={64} fill="currentColor" />
                    </motion.div>

                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        whileInView={{ scale: 1, opacity: 1 }}
                        className="inline-block relative"
                    >
                        <h2 className={`text-5xl md:text-7xl font-black mb-4 tracking-tight relative z-10
                            ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                            How it Works
                        </h2>
                        {/* Scribble Underline */}
                        <div className={`absolute -bottom-2 left-0 w-full h-6 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`}>
                            <DoodleUnderline className="w-full h-full" />
                        </div>
                    </motion.div>

                    <p className={`mt-8 text-xl font-medium ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                        No boring forms here. Just <span className="font-bold text-blue-500">6 simple steps</span> to your money.
                    </p>
                </div>

                {/* --- Cards Layout --- */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
                    {steps.map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 50 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true, margin: "-50px" }}
                            transition={{ delay: index * 0.1, type: "spring", bounce: 0.4 }}
                            className="relative group"
                        >
                            {/* Connector Arrow (Desktop only, skips last item) */}
                            {index !== steps.length - 1 && (
                                <div className={`hidden lg:block absolute -right-10 top-1/2 w-16 h-8 z-0 
                                    ${(index + 1) % 3 === 0 ? 'hidden' : ''} 
                                    ${darkMode ? 'text-gray-600' : 'text-gray-300'}`}>
                                    <DoodleArrow className="w-full h-full transform rotate-0" />
                                </div>
                            )}

                            {/* The Card */}
                            <motion.div
                                whileHover={{ scale: 1.02, rotate: 0 }}
                                className={`
                                    relative h-full p-8 rounded-3xl border-2 flex flex-col items-start transition-all duration-300
                                    ${step.rotate}
                                    ${darkMode
                                        ? `${step.darkColor} border-gray-700 hover:border-gray-500`
                                        : `${step.color} border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,1)] hover:translate-x-[4px] hover:translate-y-[4px]`
                                    }
                                `}
                            >
                                {/* Step Number Circle */}
                                <div className="absolute -top-4 -left-4 w-12 h-12">
                                    <div className={`relative w-full h-full flex items-center justify-center font-black text-lg rounded-full border-2
                                        ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-black text-black'}`}>
                                        {index + 1}
                                        {/* Imperfect circle doodle behind number */}
                                        <DoodleCircle className={`absolute inset-0 w-full h-full scale-125 ${step.accent} opacity-50`} />
                                    </div>
                                </div>

                                {/* Icon */}
                                <div className={`mb-6 p-3 rounded-xl border-2 
                                    ${darkMode ? 'bg-gray-800 border-gray-600 text-white' : 'bg-white border-black text-black'}`}>
                                    <step.icon size={28} strokeWidth={2.5} />
                                </div>

                                <h3 className={`text-2xl font-bold mb-3 ${darkMode ? 'text-white' : 'text-black'}`}>
                                    {step.title}
                                </h3>

                                <p className={`font-medium leading-relaxed ${darkMode ? 'text-gray-300' : 'text-gray-700'}`}>
                                    {step.description}
                                </p>

                            </motion.div>
                        </motion.div>
                    ))}
                </div>

                {/* --- Bottom Action --- */}
                <motion.div
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    className="mt-20 text-center"
                >
                    {/* <button className={`
                        relative inline-flex items-center gap-3 px-8 py-4 text-lg font-bold rounded-full border-2 transition-transform active:scale-95
                        ${darkMode
                            ? 'bg-blue-600 border-blue-400 text-white hover:bg-blue-500'
                            : 'bg-blue-500 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:-translate-y-1'
                        }
                    `}>
                        Start Creating Now
                        <ArrowRight size={20} strokeWidth={3} />
                    </button> */}

                    <p className={`mt-4 text-sm font-hand ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                        (It's free, we promise!)
                    </p>
                </motion.div>

            </div>
        </section>
    );
};

export default UserGuideDoodle;