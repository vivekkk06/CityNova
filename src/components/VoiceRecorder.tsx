'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Volume2, Sparkles, AlertCircle } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscriptComplete: (transcript: string, audioFile?: File) => void;
  disabled?: boolean;
}

export default function VoiceRecorder({
  onTranscriptComplete,
  disabled = false,
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [liveTranscript, setLiveTranscript] = useState('');
  const [speechSupported, setSpeechSupported] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      return !!((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    }
    return true;
  });
  const [audioUrl, setAudioUrl] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
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
      alert('Could not access microphone. Please allow microphone permissions or click one of the sample voice prompts below.');
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
      title: 'Khandepar Water Leak',
      text: 'Major drinking water pipeline rupture near Curti Junction opposite Khandepar Water Works in Ward 3. Potable water is flooding the road.',
    },
    {
      title: 'Hospital Streetlights Dark',
      text: 'Four consecutive streetlights on Tisk to Ponda Sub-District Hospital access road in Ward 2 are completely dark, unsafe for ambulances and pedestrians.',
    },
    {
      title: 'Upper Bazar Pothole Crater',
      text: 'Deep monsoon pothole crater on Old Bus Stand to Kranti Maidan road in Upper Bazar, Ward 1. Two-wheelers are skidding.',
    },
  ];

  return (
    <div className="bg-slate-50 p-4 rounded-xl border-2 border-slate-200 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse'
                : 'bg-blue-100 text-blue-700 border border-blue-200'
            }`}
          >
            <Mic className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Voice Note Recording &bull; ऑडिओ नोंदणी</span>
              <span className="text-[10px] font-bold bg-blue-100 text-blue-800 px-2 py-0.2 rounded-full">
                ML Transcribed
              </span>
            </h4>
            <p className="text-[11px] text-slate-500">
              Speak in English, Hindi, or Konkani. The ML engine transcribes and structures your grievance.
            </p>
          </div>
        </div>

        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Finish Recording ({formatTimer(recordingSeconds)})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all hover:scale-105 cursor-pointer"
          >
            <Mic className="w-4 h-4" />
            <span>Start Voice Recording</span>
          </button>
        )}
      </div>

      {/* Recording in progress indicator */}
      {isRecording && (
        <div className="p-3 bg-red-50 rounded-xl border border-red-200 space-y-2">
          <div className="flex items-center justify-between text-xs text-red-700 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping"></span>
              Listening &amp; Live Transcribing...
            </span>
            <span className="font-mono">{formatTimer(recordingSeconds)}</span>
          </div>

          <p className="text-xs text-slate-800 italic min-h-[20px] font-sans">
            {liveTranscript || 'Please describe the problem and location clearly...'}
          </p>
        </div>
      )}

      {/* Audio Playback preview */}
      {audioUrl && !isRecording && (
        <div className="flex items-center gap-2 p-2.5 bg-white rounded-lg border border-slate-200">
          <Volume2 className="w-4 h-4 text-blue-700" />
          <audio src={audioUrl} controls className="h-7 w-full text-xs" />
        </div>
      )}

      {/* Quick Sample Voice Note Prompts */}
      <div className="pt-2 border-t border-slate-200">
        <span className="text-[10px] uppercase font-bold text-slate-500 block mb-1.5">
          Or Click A Sample Grievance Simulator:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {sampleVoicePrompts.map((sample, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onTranscriptComplete(sample.text)}
              className="text-[11px] px-2.5 py-1 rounded-lg bg-white border border-slate-300 hover:border-blue-500 text-slate-700 hover:text-blue-700 transition-colors cursor-pointer flex items-center gap-1 font-medium shadow-2xs"
            >
              <Sparkles className="w-3 h-3 text-amber-500" />
              <span>{sample.title}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
