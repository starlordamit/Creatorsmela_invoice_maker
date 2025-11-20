import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const DatePicker = ({ value, onChange, label, darkMode, error }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [currentDate, setCurrentDate] = useState(new Date());
    const containerRef = useRef(null);

    // Initialize with value prop
    useEffect(() => {
        if (value) {
            setCurrentDate(new Date(value));
        }
    }, [value]);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const daysInMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
    };

    const firstDayOfMonth = (date) => {
        return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const handleDateClick = (day) => {
        const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const offset = newDate.getTimezoneOffset();
        const adjustedDate = new Date(newDate.getTime() - (offset * 60 * 1000));
        onChange({ target: { name: 'date', value: adjustedDate.toISOString().split('T')[0] } });
        setIsOpen(false);
    };

    const monthNames = ["January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December"
    ];

    const renderCalendar = () => {
        const totalDays = daysInMonth(currentDate);
        const startDay = firstDayOfMonth(currentDate);
        const days = [];

        // Empty cells
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-9 w-9"></div>);
        }

        // Days of the month
        for (let i = 1; i <= totalDays; i++) {
            const isSelected = value &&
                new Date(value).getDate() === i &&
                new Date(value).getMonth() === currentDate.getMonth() &&
                new Date(value).getFullYear() === currentDate.getFullYear();

            const isToday = new Date().getDate() === i &&
                new Date().getMonth() === currentDate.getMonth() &&
                new Date().getFullYear() === currentDate.getFullYear();

            days.push(
                <button
                    key={i}
                    onClick={() => handleDateClick(i)}
                    // Changed rounded-full to rounded-md for a blockier/doodle look
                    // Added borders to individual days
                    className={`h-9 w-9 text-sm font-hand border-2 transition-all active:scale-95 rounded-md
                        ${isSelected
                            ? (darkMode
                                ? 'bg-blue-600 text-white border-blue-300'
                                : 'bg-blue-500 text-white border-black shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]')
                            : isToday
                                ? (darkMode
                                    ? 'bg-slate-800 text-blue-400 border-blue-400 border-dashed'
                                    : 'bg-blue-50 text-blue-600 border-black border-dashed')
                                : (darkMode
                                    ? 'border-transparent text-slate-300 hover:bg-slate-700 hover:border-slate-500'
                                    : 'border-transparent text-slate-700 hover:bg-blue-100 hover:border-black')
                        }
                    `}
                >
                    {i}
                </button>
            );
        }

        return days;
    };

    return (
        <div className="relative w-full font-hand" ref={containerRef}>
            {label && (
                <label className={`block text-sm font-bold uppercase tracking-wider mb-2 ${error ? 'text-red-500' : (darkMode ? 'text-blue-300' : 'text-black')}`}>
                    {label} {error && '*'}
                </label>
            )}

            {/* --- Main Trigger Button --- */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`
                    w-full px-4 py-3 rounded-lg border-2 text-sm flex items-center justify-between 
                    transition-all duration-200 outline-none
                    active:translate-y-1 active:shadow-none
                    ${isOpen ? 'translate-y-1 shadow-none' : ''}
                    ${error
                        ? 'border-red-500 text-red-500'
                        : (darkMode
                            ? 'bg-slate-900 border-blue-400 text-white hover:bg-slate-800'
                            : 'bg-white border-black text-slate-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-50')
                    }
                `}
            >
                <span className="font-bold">
                    {value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date'}
                </span>
                <CalendarIcon size={20} className={darkMode ? "text-blue-400" : "text-black"} strokeWidth={2.5} />
            </button>

            {
                error && typeof error === 'string' && (
                    <span className="text-[10px] font-bold text-red-500 mt-1 block animate-pulse">{error}</span>
                )
            }

            {
                isOpen && (
                    <div className={`
                    absolute z-50 mt-3 p-4 rounded-xl border-2 w-[320px]
                    ${darkMode
                            ? 'bg-slate-800 border-blue-400 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)]'
                            : 'bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                        }
                `}>
                        {/* --- Header --- */}
                        <div className="flex justify-between items-center mb-4 px-2">
                            <button
                                onClick={handlePrevMonth}
                                className={`p-1 border-2 rounded-md transition-transform active:scale-90 ${darkMode ? 'border-slate-600 text-white hover:bg-slate-700' : 'border-black text-black hover:bg-blue-100'}`}
                            >
                                <ChevronLeft size={20} strokeWidth={3} />
                            </button>

                            <span className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-black'}`}>
                                {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                            </span>

                            <button
                                onClick={handleNextMonth}
                                className={`p-1 border-2 rounded-md transition-transform active:scale-90 ${darkMode ? 'border-slate-600 text-white hover:bg-slate-700' : 'border-black text-black hover:bg-blue-100'}`}
                            >
                                <ChevronRight size={20} strokeWidth={3} />
                            </button>
                        </div>

                        {/* --- Weekday Names --- */}
                        <div className="grid grid-cols-7 gap-1 mb-2 border-b-2 border-dashed pb-2 ${darkMode ? 'border-slate-600' : 'border-slate-200'}">
                            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                                <div key={day} className={`text-center text-xs font-bold ${darkMode ? 'text-blue-400' : 'text-slate-500'}`}>
                                    {day}
                                </div>
                            ))}
                        </div>

                        {/* --- Calendar Grid --- */}
                        <div className="grid grid-cols-7 gap-1">
                            {renderCalendar()}
                        </div>
                    </div>
                )
            }
        </div >
    );
};

export default DatePicker;