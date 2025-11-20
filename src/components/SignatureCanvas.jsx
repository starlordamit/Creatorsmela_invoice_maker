import React, { useRef, useState, useEffect } from 'react';
import { X, PenTool, Upload, Type, Check, RotateCcw } from 'lucide-react';

const SignatureModal = ({ onSave, onClose, darkMode }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'upload', 'type'
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('Mrs Saint Delafield');
    const [uploadedImage, setUploadedImage] = useState(null);

    // Drawing Logic
    const startDrawing = (e) => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineWidth = 3; // Slightly thicker for "marker" feel
        ctx.lineCap = 'round';
        ctx.strokeStyle = '#000';
        setIsDrawing(true);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        const rect = canvas.getBoundingClientRect();
        const x = (e.clientX || e.touches[0].clientX) - rect.left;
        const y = (e.clientY || e.touches[0].clientY) - rect.top;

        ctx.lineTo(x, y);
        ctx.stroke();
    };

    const stopDrawing = () => {
        setIsDrawing(false);
    };

    const clearCanvas = () => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    const handleSave = () => {
        if (activeTab === 'draw') {
            onSave(canvasRef.current.toDataURL());
        } else if (activeTab === 'upload' && uploadedImage) {
            onSave(uploadedImage);
        } else if (activeTab === 'type' && typedName) {
            const canvas = document.createElement('canvas');
            canvas.width = 600; // Increased width for long signatures
            canvas.height = 200;
            const ctx = canvas.getContext('2d');

            // We ensure the font is loaded by waiting for the preview, 
            // but here we set it explicitly for the capture.
            ctx.font = `60px "${selectedFont}"`;
            ctx.fillStyle = 'black';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(typedName, canvas.width / 2, canvas.height / 2);

            onSave(canvas.toDataURL());
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
                setUploadedImage(event.target.result);
            };
            reader.readAsDataURL(file);
        }
    };

    // Updated font list with more realistic options
    const fonts = [
        { name: 'Mrs Saint Delafield', label: 'Vintage' },
        { name: 'Cedarville Cursive', label: 'Authentic' },
        { name: 'La Belle Aurore', label: 'Messy' },
        { name: 'Meddon', label: 'Pen' },
        { name: 'Great Vibes', label: 'Elegant' },
        { name: 'Dancing Script', label: 'Standard' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-hand">
            {/* Inject Google Fonts */}
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Cedarville+Cursive&family=Dancing+Script&family=Great+Vibes&family=La+Belle+Aurore&family=Meddon&family=Mrs+Saint+Delafield&display=swap');
                `}
            </style>

            <div className={`
                w-full max-w-md rounded-xl border-2 overflow-hidden
                ${darkMode
                    ? 'bg-slate-900 border-blue-400 shadow-[8px_8px_0px_0px_rgba(30,41,59,1)]'
                    : 'bg-white border-black shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]'
                }
            `}>
                {/* Header */}
                <div className={`flex justify-between items-center p-4 border-b-2 ${darkMode ? 'border-blue-400' : 'border-black'}`}>
                    <h3 className={`font-bold text-xl uppercase tracking-wider ${darkMode ? 'text-white' : 'text-black'}`}>
                        Sign Here
                    </h3>
                    <button
                        onClick={onClose}
                        className={`p-2 border-2 rounded-md transition-transform active:scale-90 ${darkMode ? 'border-blue-400 text-blue-400 hover:bg-slate-800' : 'border-black text-black hover:bg-red-50'}`}
                    >
                        <X size={20} strokeWidth={3} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b-2 ${darkMode ? 'border-blue-400' : 'border-black'}`}>
                    {['draw', 'type', 'upload'].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={`
                                flex-1 py-3 text-sm font-bold uppercase flex items-center justify-center gap-2 transition-colors
                                ${activeTab === tab
                                    ? (darkMode ? 'bg-blue-600 text-white' : 'bg-blue-100 text-black')
                                    : (darkMode ? 'text-slate-400 hover:text-white hover:bg-slate-800' : 'text-slate-500 hover:bg-gray-50 hover:text-black')
                                }
                                ${tab !== 'upload' ? (darkMode ? 'border-r-2 border-blue-400' : 'border-r-2 border-black') : ''}
                            `}
                        >
                            {tab === 'draw' && <PenTool size={16} strokeWidth={3} />}
                            {tab === 'type' && <Type size={16} strokeWidth={3} />}
                            {tab === 'upload' && <Upload size={16} strokeWidth={3} />}
                            {tab}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'draw' && (
                        <div className="space-y-4">
                            <div className={`border-2 border-dashed rounded-xl overflow-hidden touch-none relative ${darkMode ? 'border-blue-400 bg-white' : 'border-black bg-white'}`}>
                                <canvas
                                    ref={canvasRef}
                                    width={400}
                                    height={200}
                                    className="w-full h-[200px] cursor-crosshair"
                                    onMouseDown={startDrawing}
                                    onMouseMove={draw}
                                    onMouseUp={stopDrawing}
                                    onMouseLeave={stopDrawing}
                                    onTouchStart={startDrawing}
                                    onTouchMove={draw}
                                    onTouchEnd={stopDrawing}
                                />
                                <button
                                    onClick={clearCanvas}
                                    className="absolute top-2 right-2 p-2 border-2 border-black bg-white hover:bg-gray-100 rounded-lg text-black transition-transform active:scale-90 shadow-[2px_2px_0px_0px_rgba(0,0,0,1)]"
                                    title="Clear"
                                >
                                    <RotateCcw size={16} strokeWidth={2.5} />
                                </button>
                            </div>
                            <p className={`text-xs font-bold text-center uppercase ${darkMode ? 'text-blue-300' : 'text-slate-500'}`}>
                                Scribble above using your mouse or finger
                            </p>
                        </div>
                    )}

                    {activeTab === 'type' && (
                        <div className="space-y-6">
                            <input
                                type="text"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="Type your name..."
                                className={`
                                    w-full px-4 py-3 rounded-lg border-2 outline-none font-bold
                                    transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,0.1)]
                                    focus:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] focus:-translate-y-1
                                    ${darkMode
                                        ? 'bg-slate-800 border-blue-400 text-white placeholder:text-slate-500 focus:shadow-blue-900'
                                        : 'bg-white border-black text-black placeholder:text-slate-400'
                                    }
                                `}
                            />
                            <div className="grid grid-cols-1 gap-3 max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                                {fonts.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font.name)}
                                        className={`
                                            p-3 rounded-lg border-2 text-center transition-all active:scale-95
                                            ${selectedFont === font.name
                                                ? (darkMode ? 'bg-blue-600 border-white text-white shadow-[4px_4px_0px_0px_rgba(255,255,255,1)]' : 'bg-blue-100 border-black text-blue-900 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]')
                                                : (darkMode ? 'border-slate-700 text-slate-400 hover:border-blue-400' : 'border-slate-200 text-slate-500 hover:border-black hover:text-black')
                                            }
                                        `}
                                    >
                                        <span style={{ fontFamily: font.name, fontSize: '28px' }}>
                                            {typedName || 'Signature Preview'}
                                        </span>
                                        <div className="text-[10px] uppercase font-bold tracking-widest opacity-60 mt-1">{font.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <label className={`
                                flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all
                                ${darkMode
                                    ? 'border-blue-400 hover:bg-slate-800 text-blue-300'
                                    : 'border-black hover:bg-blue-50 text-slate-600'
                                }
                            `}>
                                {uploadedImage ? (
                                    <img src={uploadedImage} alt="Uploaded" className="h-full object-contain p-2" />
                                ) : (
                                    <>
                                        <div className={`p-4 rounded-full mb-3 border-2 ${darkMode ? 'bg-slate-800 border-blue-400 text-blue-400' : 'bg-white border-black text-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]'}`}>
                                            <Upload size={24} strokeWidth={2.5} />
                                        </div>
                                        <span className="font-bold uppercase text-sm">Click to upload image</span>
                                        <span className="text-xs opacity-70 mt-1">PNG, JPG up to 2MB</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t-2 flex justify-end gap-3 ${darkMode ? 'border-blue-400 bg-slate-800' : 'border-black bg-gray-50'}`}>
                    <button
                        onClick={onClose}
                        className={`
                            px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide border-2 border-transparent
                            ${darkMode ? 'text-slate-300 hover:text-white hover:border-slate-600' : 'text-slate-600 hover:text-black hover:border-black'}
                        `}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={activeTab === 'type' && !typedName}
                        className={`
                            px-6 py-3 rounded-lg text-sm font-bold uppercase tracking-wide flex items-center gap-2 border-2 transition-all
                            active:translate-y-1 active:shadow-none disabled:opacity-50 disabled:cursor-not-allowed disabled:active:translate-y-0 disabled:active:shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]
                            ${darkMode
                                ? 'bg-blue-600 border-blue-400 text-white shadow-[4px_4px_0px_0px_rgba(30,41,59,1)] hover:bg-blue-500'
                                : 'bg-blue-500 border-black text-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-blue-600'
                            }
                        `}
                    >
                        <Check size={18} strokeWidth={3} />
                        Use This
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignatureModal;