'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, MicOff, Square, Sparkles, Volume2, Play, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, audioFile?: File) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({ onTranscriptComplete, disabled }: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState(true);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    // Check Web Speech API support
    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (_) {}
      }
    };
  }, []);

  const startRecording = async () => {
    try {
      setLiveTranscript('');
      setAudioUrl(null);
      audioChunksRef.current = [];

      // 1. Initialize Speech Recognition if supported
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-IN'; // Indian English / general English

        recognition.onresult = (event: any) => {
          let current = '';
          for (let i = 0; i < event.results.length; i++) {
            current += event.results[i][0].transcript;
          }
          setLiveTranscript(current);
        };

        recognition.onerror = (err: any) => {
          console.warn('Speech recognition warning:', err);
        };

        recognition.start();
        recognitionRef.current = recognition;
      }

      // 2. Initialize MediaStream audio recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const audioFile = new File([audioBlob], `civic-voice-note-${Date.now()}.webm`, {
          type: 'audio/webm',
        });

        // Pass finalized transcript
        onTranscriptComplete(liveTranscript || 'Civic issue reported via voice note.', audioFile);

        // Stop all audio tracks
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start(200);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      // Fallback message
      alert('Could not access microphone. Please check browser permissions or use the quick sample buttons below.');
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (_) {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
    setIsRecording(false);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const sampleVoicePrompts = [
    {
      title: 'Khandepar Pipe Burst',
      text: 'Major drinking water pipeline rupture near Curti Junction opposite Khandepar Water Works in Ward 3. Potable water is flooding the road.',
    },
    {
      title: 'Tisk Hospital Streetlights',
      text: 'Four consecutive streetlights on Tisk to Ponda Sub-District Hospital access road in Ward 2 are completely dark, unsafe for ambulances and pedestrians.',
    },
    {
      title: 'Upper Bazar Pothole',
      text: 'Deep monsoon pothole crater on Old Bus Stand to Kranti Maidan road in Upper Bazar, Ward 1. Two-wheelers are skidding.',
    },
  ];

  return (
    <div className="bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200 dark:border-slate-800 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center ${
              isRecording
                ? 'bg-red-500 text-white animate-pulse'
                : 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400'
            }`}
          >
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Voice Note Recording
            </h4>
            <p className="text-[11px] text-slate-500">
              Speak in English or local dialect. AI structures your grievance automatically.
            </p>
          </div>
        </div>

        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            Stop ({formatTimer(recordingSeconds)})
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            Record Audio
          </button>
        )}
      </div>

      {/* Recording in progress indicator */}
      {isRecording && (
        <div className="p-3 bg-red-50 dark:bg-red-950/30 rounded-lg border border-red-200 dark:border-red-900/40 space-y-2">
          <div className="flex items-center justify-between text-xs text-red-700 dark:text-red-300 font-medium">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              Listening & Transcribing...
            </span>
            <span className="font-mono">{formatTimer(recordingSeconds)}</span>
          </div>

          <p className="text-xs text-slate-700 dark:text-slate-300 italic min-h-[20px]">
            {liveTranscript || 'Start speaking your civic complaint now...'}
          </p>
        </div>
      )}

      {/* Audio Playback preview */}
      {audioUrl && !isRecording && (
        <div className="flex items-center gap-2 p-2 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <Volume2 className="w-4 h-4 text-slate-500" />
          <audio src={audioUrl} controls className="h-7 w-full text-xs" />
        </div>
      )}

      {/* Quick Sample Voice Note Prompts (Useful for zero-mic instant testing) */}
      <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
        <span className="text-[10px] uppercase font-bold text-slate-400 block mb-1.5">
          One-Click Demo Voice Simulators (Click to Autofill)
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleVoicePrompts.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onTranscriptComplete(sample.text)}
              className="text-[11px] px-2.5 py-1 rounded-md bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:border-blue-400 text-slate-700 dark:text-slate-300 hover:text-blue-600 transition-colors cursor-pointer flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              {sample.title}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
