import React, { useState, useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

const DatePicker = ({ value, onChange, label, darkMode }) => {
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
        // Adjust for timezone offset to ensure the string is correct YYYY-MM-DD
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

        // Empty cells for days before start of month
        for (let i = 0; i < startDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-8 w-8"></div>);
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
                    className={`h-8 w-8 rounded-full flex items-center justify-center text-sm transition-colors
                        ${isSelected
                            ? 'bg-blue-600 text-white font-bold'
                            : isToday
                                ? (darkMode ? 'bg-slate-700 text-blue-400 font-bold' : 'bg-blue-50 text-blue-600 font-bold')
                                : (darkMode ? 'text-slate-300 hover:bg-slate-700' : 'text-slate-700 hover:bg-slate-100')
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
        <div className="relative w-full" ref={containerRef}>
            {label && <label className={`block text-xs font-semibold uppercase tracking-wider mb-1.5 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>{label}</label>}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2.5 rounded-lg border text-sm flex items-center justify-between transition-all duration-200 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none ${darkMode ? 'bg-slate-900 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'}`}
            >
                <span>{value ? new Date(value).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Select Date'}</span>
                <CalendarIcon size={18} className="text-slate-400" />
            </button>

            {isOpen && (
                <div className={`absolute z-50 mt-2 p-4 rounded-xl shadow-xl border w-[300px] ${darkMode ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}`}>
                    <div className="flex justify-between items-center mb-4">
                        <button onClick={handlePrevMonth} className={`p-1 rounded-full ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
                            <ChevronLeft size={20} />
                        </button>
                        <span className={`font-semibold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
                        </span>
                        <button onClick={handleNextMonth} className={`p-1 rounded-full ${darkMode ? 'hover:bg-slate-700 text-slate-300' : 'hover:bg-slate-100 text-slate-600'}`}>
                            <ChevronRight size={20} />
                        </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                        {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
                            <div key={day} className={`text-center text-xs font-medium ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>
                                {day}
                            </div>
                        ))}
                    </div>
                    <div className="grid grid-cols-7 gap-1">
                        {renderCalendar()}
                    </div>
                </div>
            )}
        </div>
    );
};

export default DatePicker;
