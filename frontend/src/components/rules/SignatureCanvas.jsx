import React, { useRef, useState, useEffect } from 'react';
import { Eraser, Undo, Check, RotateCcw } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const SignatureCanvas = ({ onSave, initialData, isLocked = false }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    // Handle high DPI displays
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    ctx.strokeStyle = '#0F172A'; // deep slate ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // If initial image exists, draw it
    if (initialData) {
      const img = new Image();
      img.onload = () => {
        ctx.drawImage(img, 0, 0, rect.width, rect.height);
        setHasDrawn(true);
      };
      img.src = initialData;
    }
  }, [initialData]);

  const startDrawing = (e) => {
    if (isLocked) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    // Save history state for undo
    setHistory(prev => [...prev, canvas.toDataURL()]);

    ctx.beginPath();
    ctx.moveTo(clientX - rect.left, clientY - rect.top);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e) => {
    if (!isDrawing || isLocked) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;

    ctx.lineTo(clientX - rect.left, clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleClear = () => {
    if (isLocked) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    ctx.clearRect(0, 0, rect.width, rect.height);
    setHasDrawn(false);
    setHistory([]);
    sound.playPop();
  };

  const handleUndo = () => {
    if (isLocked || history.length === 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();

    const prevState = history[history.length - 1];
    setHistory(history.slice(0, -1));

    const img = new Image();
    img.onload = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      ctx.drawImage(img, 0, 0, rect.width, rect.height);
    };
    img.src = prevState;
  };

  const handleSaveSignature = () => {
    if (!hasDrawn || isLocked) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    sound.playChime();
    onSave(dataUrl);
  };

  return (
    <div className="space-y-3">
      {/* Canvas Drawing Area */}
      <div className="relative rounded-2xl border-2 border-dashed border-slate-300 bg-white overflow-hidden shadow-inner touch-none">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className={`w-full h-36 cursor-crosshair ${isLocked ? 'pointer-events-none opacity-80' : ''}`}
        />

        {!hasDrawn && !isLocked && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-slate-300 text-xs italic">
            Draw your signature here with finger or mouse...
          </div>
        )}

        {isLocked && (
          <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold font-mono">
            Signed & Locked ✓
          </div>
        )}
      </div>

      {/* Sketchpad Control Bar */}
      {!isLocked && (
        <div className="flex items-center justify-between text-xs pt-1">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleClear}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1"
              title="Clear Canvas"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Clear</span>
            </button>

            <button
              type="button"
              onClick={handleUndo}
              disabled={history.length === 0}
              className="p-1.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100 flex items-center gap-1 disabled:opacity-40"
              title="Undo last stroke"
            >
              <Undo className="w-3.5 h-3.5" />
              <span>Undo</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleSaveSignature}
            disabled={!hasDrawn}
            className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white font-semibold flex items-center gap-1.5 shadow-md shadow-orange-600/20 disabled:opacity-50 transition-all cursor-pointer"
          >
            <Check className="w-4 h-4" />
            <span>Apply Signature</span>
          </button>
        </div>
      )}
    </div>
  );
};
