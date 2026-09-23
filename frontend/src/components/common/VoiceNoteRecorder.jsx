import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Volume2, AlertCircle } from 'lucide-react';
import { sound } from '../../utils/soundFx';

export const VoiceNoteRecorder = ({ onRecorded, onDiscard, isUploading }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [recordDuration, setRecordDuration] = useState(0);
  const [audioUrl, setAudioUrl] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const timerRef = useRef(null);
  const audioPlayerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  const startRecording = async () => {
    setErrorMsg(null);
    try {
      sound.playPop();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        onRecorded({ blob: audioBlob, previewUrl: url, duration: recordDuration });
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordDuration(0);

      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied:', err);
      setErrorMsg('Microphone access was denied. Please allow microphone permissions.');
    }
  };

  const stopRecording = () => {
    sound.playPop();
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) clearInterval(timerRef.current);
    }
  };

  const handleDiscard = () => {
    sound.playPop();
    if (audioUrl) URL.revokeObjectURL(audioUrl);
    setAudioUrl(null);
    setRecordDuration(0);
    setIsPlaying(false);
    onDiscard?.();
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatSecs = (sec) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="p-3 rounded-2xl border border-slate-200 bg-slate-50/80 space-y-2.5">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-700 flex items-center gap-1.5">
          <Mic className={`w-3.5 h-3.5 ${isRecording ? 'text-rose-500 animate-pulse' : 'text-orange-600'}`} />
          <span>Voice Note Memo (Rule 09 Standup)</span>
        </span>
        {isRecording && (
          <span className="flex items-center gap-1 text-[11px] font-mono font-bold text-rose-600">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
            <span>Recording {formatSecs(recordDuration)}</span>
          </span>
        )}
      </div>

      {errorMsg && (
        <div className="p-2 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-[11px] flex items-center gap-1.5">
          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* State 1: Idle (Not recording, no audio recorded yet) */}
      {!isRecording && !audioUrl && (
        <button
          type="button"
          onClick={startRecording}
          className="w-full py-2.5 px-3 rounded-xl border border-dashed border-orange-300 hover:border-orange-500 hover:bg-orange-50/50 bg-white text-orange-800 text-xs font-semibold flex items-center justify-center gap-2 transition-all shadow-2xs group cursor-pointer"
        >
          <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Mic className="w-3.5 h-3.5 text-orange-600" />
          </div>
          <span>Tap to Record Voice Update</span>
        </button>
      )}

      {/* State 2: Actively Recording */}
      {isRecording && (
        <div className="flex items-center justify-between p-2.5 rounded-xl bg-rose-50/80 border border-rose-200 gap-3">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-full bg-rose-500 animate-pulse" />
            <div className="flex gap-1 items-center">
              <span className="w-1 h-3 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <span className="w-1 h-5 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <span className="w-1 h-2 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              <span className="w-1 h-6 bg-rose-600 rounded-full animate-bounce" style={{ animationDelay: '200ms' }} />
              <span className="w-1 h-4 bg-rose-500 rounded-full animate-bounce" style={{ animationDelay: '100ms' }} />
            </div>
            <span className="text-xs font-mono font-bold text-rose-700 ml-1">
              {formatSecs(recordDuration)}
            </span>
          </div>

          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition-colors shadow-xs"
          >
            <Square className="w-3 h-3 fill-current" />
            <span>Finish Recording</span>
          </button>
        </div>
      )}

      {/* State 3: Audio Recorded - Playback & Discard */}
      {audioUrl && !isRecording && (
        <div className="p-2.5 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-between gap-3">
          <audio
            ref={audioPlayerRef}
            src={audioUrl}
            onEnded={() => setIsPlaying(false)}
            className="hidden"
          />

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={togglePlayback}
              className="w-8 h-8 rounded-full bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white flex items-center justify-center transition-transform active:scale-95 shadow-xs cursor-pointer"
            >
              {isPlaying ? <Pause className="w-3.5 h-3.5 fill-current" /> : <Play className="w-3.5 h-3.5 ml-0.5 fill-current" />}
            </button>

            <div>
              <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Volume2 className="w-3.5 h-3.5 text-orange-600" />
                <span>Voice Note Ready ({formatSecs(recordDuration)})</span>
              </div>
              <p className="text-[10px] text-slate-500">
                {isUploading ? 'Uploading to cloud...' : 'Will be attached with your update'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleDiscard}
            title="Delete & Re-record"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};
