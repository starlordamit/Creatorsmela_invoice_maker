import React, { useRef, useState, useEffect } from 'react';
import { X, PenTool, Upload, Type, Check, RotateCcw } from 'lucide-react';

const SignatureModal = ({ onSave, onClose, darkMode }) => {
    const canvasRef = useRef(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [activeTab, setActiveTab] = useState('draw'); // 'draw', 'upload', 'type'
    const [typedName, setTypedName] = useState('');
    const [selectedFont, setSelectedFont] = useState('Dancing Script');
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
        ctx.lineWidth = 2;
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
            // Convert text to image
            const canvas = document.createElement('canvas');
            canvas.width = 400;
            canvas.height = 150;
            const ctx = canvas.getContext('2d');

            // Background
            // ctx.fillStyle = 'white';
            // ctx.fillRect(0, 0, canvas.width, canvas.height);

            // Text
            ctx.font = `48px "${selectedFont}"`;
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

    const fonts = [
        { name: 'Dancing Script', label: 'Handwritten' },
        { name: 'Great Vibes', label: 'Elegant' },
        { name: 'Sacramento', label: 'Monoline' },
    ];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className={`w-full max-w-md rounded-2xl shadow-2xl overflow-hidden ${darkMode ? 'bg-slate-900 border border-slate-700' : 'bg-white'}`}>
                {/* Header */}
                <div className={`flex justify-between items-center p-4 border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <h3 className={`font-bold text-lg ${darkMode ? 'text-white' : 'text-slate-800'}`}>Add Signature</h3>
                    <button onClick={onClose} className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-slate-800 text-slate-400' : 'hover:bg-slate-100 text-slate-500'}`}>
                        <X size={20} />
                    </button>
                </div>

                {/* Tabs */}
                <div className={`flex border-b ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                        onClick={() => setActiveTab('draw')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'draw' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <PenTool size={16} /> Draw
                    </button>
                    <button
                        onClick={() => setActiveTab('type')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'type' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Type size={16} /> Type
                    </button>
                    <button
                        onClick={() => setActiveTab('upload')}
                        className={`flex-1 py-3 text-sm font-medium flex items-center justify-center gap-2 transition-colors ${activeTab === 'upload' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Upload size={16} /> Upload
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {activeTab === 'draw' && (
                        <div className="space-y-4">
                            <div className={`border-2 border-dashed rounded-xl overflow-hidden touch-none relative ${darkMode ? 'border-slate-700 bg-white' : 'border-slate-200 bg-white'}`}>
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
                                    className="absolute top-2 right-2 p-2 bg-slate-100 hover:bg-slate-200 rounded-lg text-slate-600 transition-colors"
                                    title="Clear"
                                >
                                    <RotateCcw size={16} />
                                </button>
                            </div>
                            <p className="text-xs text-center text-slate-400">Sign above using your mouse or finger</p>
                        </div>
                    )}

                    {activeTab === 'type' && (
                        <div className="space-y-6">
                            <input
                                type="text"
                                value={typedName}
                                onChange={(e) => setTypedName(e.target.value)}
                                placeholder="Type your name..."
                                className={`w-full px-4 py-3 rounded-xl border outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all ${darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'}`}
                            />
                            <div className="grid grid-cols-1 gap-3">
                                {fonts.map((font) => (
                                    <button
                                        key={font.name}
                                        onClick={() => setSelectedFont(font.name)}
                                        className={`p-4 rounded-xl border text-center transition-all ${selectedFont === font.name ? 'border-blue-500 bg-blue-50 text-blue-700 ring-1 ring-blue-500' : 'border-slate-200 hover:border-slate-300'}`}
                                    >
                                        <span style={{ fontFamily: font.name, fontSize: '24px' }}>{typedName || 'Signature Preview'}</span>
                                        <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-1">{font.label}</div>
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {activeTab === 'upload' && (
                        <div className="space-y-4">
                            <label className={`flex flex-col items-center justify-center h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all ${darkMode ? 'border-slate-700 hover:border-blue-500 hover:bg-slate-800' : 'border-slate-300 hover:border-blue-500 hover:bg-blue-50'}`}>
                                {uploadedImage ? (
                                    <img src={uploadedImage} alt="Uploaded" className="h-full object-contain p-2" />
                                ) : (
                                    <>
                                        <div className="p-4 rounded-full bg-blue-100 text-blue-600 mb-3">
                                            <Upload size={24} />
                                        </div>
                                        <span className="font-medium text-slate-600">Click to upload image</span>
                                        <span className="text-xs text-slate-400 mt-1">PNG, JPG up to 2MB</span>
                                    </>
                                )}
                                <input type="file" className="hidden" accept="image/*" onChange={handleFileUpload} />
                            </label>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className={`p-4 border-t flex justify-end gap-3 ${darkMode ? 'border-slate-800' : 'border-slate-100'}`}>
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${darkMode ? 'text-slate-300 hover:bg-slate-800' : 'text-slate-600 hover:bg-slate-100'}`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSave}
                        disabled={activeTab === 'type' && !typedName}
                        className="px-6 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        <Check size={16} /> Use Signature
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SignatureModal;
