import React, { useEffect } from 'react';
import 'regenerator-runtime/runtime'; // Required for react-speech-recognition
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import { Mic, Square, X, Check, Copy, RotateCcw, Loader2 } from 'lucide-react';

const AudioRecorder = ({ isOpen, onClose, onInsert, darkMode }) => {
  const {
    transcript,
    interimTranscript,
    listening,
    resetTranscript,
    browserSupportsSpeechRecognition,
    isMicrophoneAvailable
  } = useSpeechRecognition();

  useEffect(() => {
    if (isOpen) {
      startRecording();
    } else {
      stopRecording();
    }
    // Cleanup on unmount
    return () => {
      SpeechRecognition.stopListening();
    };
  }, [isOpen]);

  const startRecording = () => {
    if (!browserSupportsSpeechRecognition) {
      return;
    }
    // continuous: true prevents it from stopping when the user pauses
    SpeechRecognition.startListening({ continuous: true, language: 'en-US' });
  };

  const stopRecording = () => {
    SpeechRecognition.stopListening();
  };

  const handleClose = () => {
    stopRecording();
    resetTranscript();
    onClose();
  };

  const handleInsert = () => {
    // combine if there is interim but mostly react-speech-recognition handles transcript
    const fullText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    if (fullText) {
      onInsert(fullText);
    }
    handleClose();
  };

  const handleCopy = () => {
    const fullText = (transcript + (interimTranscript ? ' ' + interimTranscript : '')).trim();
    navigator.clipboard.writeText(fullText);
  };

  const handleClear = () => {
    resetTranscript();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`relative w-full max-w-lg mx-auto rounded-3xl shadow-2xl border flex flex-col overflow-hidden transition-all duration-300 scale-100 animate-slide-up max-h-[85vh] ${darkMode
          ? 'bg-[#1a1a1a] border-gray-700 text-white'
          : 'bg-white border-gray-200 text-gray-900'
          }`}
      >
        {/* Header */}
        <div className={`flex items-center justify-between px-6 py-4 border-b ${darkMode ? 'border-gray-800' : 'border-gray-100'
          }`}>
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-full ${listening ? 'bg-red-500/10 text-red-500 animate-pulse' : 'bg-gray-100 text-gray-500'
              }`}>
              <Mic size={20} />
            </div>
            <h3 className="font-semibold text-lg">
              {listening ? 'Listening...' : 'Microphone Paused'}
            </h3>
          </div>
          <button
            onClick={handleClose}
            className={`p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-gray-800 text-gray-400' : 'hover:bg-gray-100 text-gray-500'
              }`}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content Area - Visualizer & Text */}
        <div className="flex-1 p-6 flex flex-col min-h-[300px]">

          {/* Waveform Visualizer (Simulated) */}
          {listening && (
            <div className="flex items-center justify-center gap-1 h-12 mb-6">
              {[...Array(12)].map((_, i) => (
                <div
                  key={i}
                  className="w-1.5 bg-blue-500 rounded-full animate-wave"
                  style={{
                    animationDelay: `${i * 0.1}s`,
                    height: '20%',
                    animationDuration: '0.8s'
                  }}
                />
              ))}
            </div>
          )}

          {/* Transcript Display */}
          <div className={`flex-1 p-4 rounded-xl border overflow-y-auto mb-6 transition-colors ${darkMode
            ? 'bg-[#111] border-gray-800 text-gray-200'
            : 'bg-gray-50 border-gray-200 text-gray-800'
            }`}>
            {transcript || interimTranscript ? (
              <p className="text-lg leading-relaxed whitespace-pre-wrap">
                {transcript}
                <span className="text-blue-500 opacity-80">{interimTranscript ? ' ' + interimTranscript : ''}</span>
              </p>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center opacity-50">
                {!browserSupportsSpeechRecognition ? (
                  <p className="text-red-500">Speech recognition is not supported in your browser.</p>
                ) : isMicrophoneAvailable === false ? (
                  <p className="text-red-500">Microphone access denied. Please allow microphone access.</p>
                ) : (
                  <p>Start speaking to transcribe...</p>
                )}
              </div>
            )}
          </div>

          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                title="Clear Text"
                className={`p-3 rounded-xl flex items-center justify-center transition-all active:scale-95 ${darkMode ? 'hover:bg-gray-800 bg-gray-900 text-gray-400' : 'hover:bg-gray-100 bg-gray-50 text-gray-600'
                  }`}
              >
                <RotateCcw size={20} />
              </button>
              <button
                onClick={handleCopy}
                title="Copy to Clipboard"
                className={`p-3 rounded-xl flex items-center justify-center transition-all active:scale-95 ${darkMode ? 'hover:bg-gray-800 bg-gray-900 text-gray-400' : 'hover:bg-gray-100 bg-gray-50 text-gray-600'
                  }`}
              >
                <Copy size={20} />
              </button>
            </div>

            <div className="flex gap-3">
              <button
                onClick={listening ? stopRecording : startRecording}
                disabled={!browserSupportsSpeechRecognition}
                className={`px-6 py-3 rounded-xl font-medium flex items-center gap-2 transition-all active:scale-95 ${listening
                  ? 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
                  : darkMode ? 'bg-gray-800 text-gray-200 hover:bg-gray-700' : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {listening ? (
                  <>
                    <Square size={18} className="fill-current" />
                    Stop
                  </>
                ) : (
                  <>
                    <Mic size={18} />
                    Start
                  </>
                )}
              </button>

              <button
                onClick={handleInsert}
                disabled={!transcript && !interimTranscript}
                className="px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium flex items-center gap-2 shadow-lg shadow-blue-600/20 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Check size={18} />
                Insert Text
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes wave {
            0%, 100% { height: 20%; }
            50% { height: 100%; }
        }
        .animate-wave {
            animation-name: wave;
            animation-timing-function: ease-in-out;
            animation-iteration-count: infinite;
        }
        @keyframes fade-in {
            from { opacity: 0; }
            to { opacity: 1; }
        }
        .animate-fade-in {
            animation: fade-in 0.2s ease-out forwards;
        }
         @keyframes slide-up {
            from { opacity: 0; transform: scale(0.95) translateY(10px); }
            to { opacity: 1; transform: scale(1) translateY(0); }
        }
        .animate-slide-up {
            animation: slide-up 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
};

export default AudioRecorder;
