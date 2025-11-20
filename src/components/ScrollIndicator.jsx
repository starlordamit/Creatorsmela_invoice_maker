import React from 'react';
import { motion } from 'framer-motion';

const ScrollIndicator = ({ text = "scroll down...", darkMode = false }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-1 py-12">
            {/* Text Label - Tilted and Handwriting Style */}
            <motion.div
                initial={{ opacity: 0, rotate: -5 }}
                animate={{ opacity: 1, rotate: -6 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className={`font-hand text-xl font-medium lowercase tracking-wide ${darkMode ? 'text-blue-300' : 'text-gray-600'
                    }`}
            >
                {text}
            </motion.div>

            {/* Bouncing Loopy Arrow */}
            <motion.div
                animate={{
                    y: [0, 12, 0],
                }}
                transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
                className={`w-20 h-32 ${darkMode ? 'text-white' : 'text-black'}`}
            >
                <svg
                    viewBox="0 0 100 150"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-full h-full overflow-visible"
                    style={{ filter: 'drop-shadow(1px 2px 0px rgba(0,0,0,0.1))' }}
                >
                    {/* The Loopy Shaft */}
                    <path
                        d="M 50 10 C 80 25, 80 50, 50 60 C 20 70, 20 95, 50 110 C 65 118, 60 135, 50 140"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        fill="none"
                    />

                    {/* The Arrow Head - Messy/Asymmetric */}
                    <path
                        d="M 35 125 C 40 130, 45 135, 50 140"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                    <path
                        d="M 70 120 C 65 128, 60 135, 50 140"
                        stroke="currentColor"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                    />
                </svg>
            </motion.div>
        </div>
    );
};

export default ScrollIndicator;