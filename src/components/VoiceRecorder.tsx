'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic,
  Square,
  Volume2,
  Sparkles,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Play,
  Pause,
} from 'lucide-react';

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
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcribeSuccess, setTranscribeSuccess] = useState(false);
  const [transcribeError, setTranscribeError] = useState('');
  const [liveTranscript, setLiveTranscript] = useState('');
  const [audioLevel, setAudioLevel] = useState(0);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);
  const liveTranscriptRef = useRef<string>('');

  useEffect(() => {
    return () => {
      cleanupResources();
    };
  }, []);

  const cleanupResources = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
  };

  // Sound wave meter loop
  const updateAudioMeter = useCallback(() => {
    if (!analyserRef.current) return;
    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount);
    analyserRef.current.getByteFrequencyData(dataArray);

    let sum = 0;
    for (let i = 0; i < dataArray.length; i++) {
      sum += dataArray[i];
    }
    const average = sum / dataArray.length;
    // Map volume to 0 - 100
    setAudioLevel(Math.min(100, Math.round((average / 128) * 100)));

    animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
  }, []);

  const startRecording = async () => {
    try {
      cleanupResources();
      setAudioUrl(null);
      setLiveTranscript('');
      liveTranscriptRef.current = '';
      setTranscribeSuccess(false);
      setTranscribeError('');
      audioChunksRef.current = [];

      // 1. Obtain Microphone stream with standard voice processing
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });
      streamRef.current = stream;

      // 2. Set up AudioContext Analyser for visual volume level meter
      try {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          const audioCtx = new AudioContextClass();
          audioContextRef.current = audioCtx;
          const source = audioCtx.createMediaStreamSource(stream);
          const analyser = audioCtx.createAnalyser();
          analyser.fftSize = 64;
          source.connect(analyser);
          analyserRef.current = analyser;
          animationFrameRef.current = requestAnimationFrame(updateAudioMeter);
        }
      } catch (e) {
        console.warn('AudioContext volume meter initialization skipped:', e);
      }

      // 3. Detect best supported MIME type
      let chosenMimeType = '';
      if (typeof MediaRecorder !== 'undefined') {
        const candidates = [
          'audio/webm;codecs=opus',
          'audio/webm',
          'audio/ogg;codecs=opus',
          'audio/ogg',
          'audio/mp4',
        ];
        for (const type of candidates) {
          if (MediaRecorder.isTypeSupported(type)) {
            chosenMimeType = type;
            break;
          }
        }
      }

      const recorderOptions = chosenMimeType ? { mimeType: chosenMimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, recorderOptions);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const actualMime = mediaRecorder.mimeType || chosenMimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: actualMime });

        if (audioBlob.size === 0) {
          setTranscribeError('No audio was captured. Please check your microphone.');
          return;
        }

        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);

        const ext = actualMime.includes('mp4') ? 'mp4' : actualMime.includes('ogg') ? 'ogg' : 'webm';
        const audioFile = new File([audioBlob], `civic-voice-note-${Date.now()}.${ext}`, {
          type: actualMime,
        });

        // 4. Send recorded audio to AI Transcriber
        await transcribeAudioWithAI(audioFile, audioBlob);
      };

      // 5. Optional Client-side SpeechRecognition live interim preview
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.lang = 'en-IN';

          recognition.onresult = (event: any) => {
            let current = '';
            for (let i = 0; i < event.results.length; i++) {
              current += event.results[i][0].transcript;
            }
            if (current.trim()) {
              setLiveTranscript(current.trim());
              liveTranscriptRef.current = current.trim();
            }
          };

          recognition.onerror = (err: any) => {
            console.warn('SpeechRecognition interim event warning:', err?.error);
          };

          recognition.start();
          recognitionRef.current = recognition;
        } catch (recognitionErr) {
          console.warn('Live SpeechRecognition not supported or blocked:', recognitionErr);
        }
      }

      mediaRecorder.start(250);
      setIsRecording(true);
      setRecordingSeconds(0);

      timerIntervalRef.current = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Microphone access denied or error:', err);
      alert(
        'Could not access microphone. Please check your browser microphone permissions or type your complaint description directly.'
      );
    }
  };

  const stopRecording = () => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    setAudioLevel(0);

    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch {}
    }

    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      try {
        mediaRecorderRef.current.stop();
      } catch {}
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
  };

  // Perform AI Speech Detection & Transcription via server endpoint
  const transcribeAudioWithAI = async (audioFile: File, audioBlob: Blob) => {
    setIsTranscribing(true);
    setTranscribeError('');

    try {
      const formData = new FormData();
      formData.append('audio', audioFile);

      const res = await fetch('/api/ai/transcribe', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success && data.transcript && data.transcript.trim()) {
        const aiText = data.transcript.trim();
        setLiveTranscript(aiText);
        setTranscribeSuccess(true);
        onTranscriptComplete(aiText, audioFile);
      } else if (liveTranscriptRef.current && liveTranscriptRef.current.trim()) {
        // Fallback to client speech recognition if AI server returned empty or offline
        const clientText = liveTranscriptRef.current.trim();
        setLiveTranscript(clientText);
        setTranscribeSuccess(true);
        onTranscriptComplete(clientText, audioFile);
      } else {
        // No speech detected in audio
        setTranscribeError('No clear speech was detected. You can re-record or type your description.');
        onTranscriptComplete('', audioFile);
      }
    } catch (err: any) {
      console.warn('AI transcription error, checking client fallback:', err);
      if (liveTranscriptRef.current && liveTranscriptRef.current.trim()) {
        const clientText = liveTranscriptRef.current.trim();
        setLiveTranscript(clientText);
        setTranscribeSuccess(true);
        onTranscriptComplete(clientText, audioFile);
      } else {
        setTranscribeError('Could not transcribe audio. Please type your problem description directly.');
        onTranscriptComplete('', audioFile);
      }
    } finally {
      setIsTranscribing(false);
    }
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.currentTime = 0;
      audioPlayerRef.current.volume = 1.0;
      audioPlayerRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch((e) => console.error('Audio play error:', e));
    }
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-slate-50/90 p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
      {/* Top Header Row */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${
              isRecording
                ? 'bg-red-600 text-white animate-pulse shadow-md shadow-red-200'
                : 'bg-blue-600 text-white shadow-xs'
            }`}
          >
            <Mic className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
              <span>Voice Note Recording &bull; ऑडिओ नोंदणी</span>
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.2 rounded-md bg-purple-100 text-purple-700 border border-purple-200 flex items-center gap-0.5">
                <Sparkles className="w-2.5 h-2.5" /> AI Speech Detection
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Speak in English, Hindi (हिंदी), or Konkani. AI will listen and transcribe your exact words below.
            </p>
          </div>
        </div>

        {/* Action Button: Start / Finish */}
        {isRecording ? (
          <button
            type="button"
            onClick={stopRecording}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md shadow-red-200 transition-all cursor-pointer animate-pulse"
          >
            <Square className="w-3.5 h-3.5 fill-current" />
            <span>Finish Recording ({formatTimer(recordingSeconds)})</span>
          </button>
        ) : (
          <button
            type="button"
            onClick={startRecording}
            disabled={disabled || isTranscribing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-700 hover:bg-blue-800 disabled:opacity-50 text-white text-xs font-bold shadow-xs transition-all hover:scale-102 cursor-pointer"
          >
            <Mic className="w-3.5 h-3.5" />
            <span>{audioUrl ? 'Re-record Voice Note' : 'Start Voice Recording'}</span>
          </button>
        )}
      </div>

      {/* Recording In-Progress Banner with dynamic Audio Visualizer */}
      {isRecording && (
        <div className="p-3.5 bg-red-50/90 rounded-xl border border-red-200 space-y-2.5 animate-fadeIn">
          <div className="flex items-center justify-between text-xs text-red-700 font-bold">
            <span className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-red-600 animate-ping" />
              Recording &amp; Capturing Audio...
            </span>

            {/* Bouncing Audio Equalizer Waves */}
            <div className="flex items-center gap-1 h-4 px-2 bg-red-100/80 rounded-md">
              {[0.4, 0.7, 1.0, 0.6, 0.3].map((multiplier, idx) => {
                const dynamicHeight = Math.max(3, Math.min(16, (audioLevel * multiplier) / 3));
                return (
                  <span
                    key={idx}
                    className="w-1 bg-red-600 rounded-full transition-all duration-75"
                    style={{ height: `${dynamicHeight}px` }}
                  />
                );
              })}
            </div>

            <span className="font-mono text-red-800 font-extrabold">{formatTimer(recordingSeconds)}</span>
          </div>

          <p className="text-xs text-slate-700 italic bg-white/70 p-2.5 rounded-lg border border-red-100">
            {liveTranscript ? `“${liveTranscript}”` : 'Listening to your voice... Speak clearly into your mic.'}
          </p>
        </div>
      )}

      {/* AI Transcribing Spinner State */}
      {isTranscribing && (
        <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 flex items-center justify-between gap-3 text-xs text-purple-900 font-bold animate-fadeIn">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-purple-600 border-t-transparent rounded-full animate-spin shrink-0" />
            <span>Detecting speech &amp; transcribing with AI...</span>
          </div>
          <span className="text-[11px] font-normal text-purple-600">Takes 1-2 seconds</span>
        </div>
      )}

      {/* Transcribe Success Banner */}
      {transcribeSuccess && !isRecording && !isTranscribing && (
        <div className="px-3 py-2 bg-emerald-50 rounded-xl border border-emerald-200 flex items-center gap-2 text-xs text-emerald-800 font-bold animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Speech transcribed accurately and copied to the Problem Description box below!</span>
        </div>
      )}

      {/* Transcribe Warning / Empty Speech Notice */}
      {transcribeError && !isRecording && !isTranscribing && (
        <div className="px-3 py-2 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-2 text-xs text-amber-800 font-medium animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
          <span>{transcribeError}</span>
        </div>
      )}

      {/* Audio Playback Bar */}
      {audioUrl && !isRecording && (
        <div className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs space-y-2 animate-fadeIn">
          <div className="flex items-center justify-between text-xs font-bold text-slate-700">
            <span className="flex items-center gap-1.5 text-blue-700">
              <Volume2 className="w-4 h-4" />
              <span>Voice Note Audio Preview</span>
            </span>
            <button
              type="button"
              onClick={startRecording}
              className="text-[11px] text-slate-500 hover:text-slate-800 flex items-center gap-1 font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Record again</span>
            </button>
          </div>

          <div className="flex items-center gap-3">
            {/* Direct Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlayback}
              className="w-9 h-9 rounded-xl bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shrink-0 shadow-xs transition-transform hover:scale-105 cursor-pointer"
              title={isPlaying ? 'Pause voice note' : 'Play recorded voice note'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
            </button>

            {/* Native HTML5 Audio Controller with full height */}
            <audio
              ref={audioPlayerRef}
              src={audioUrl}
              controls
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
              onEnded={() => setIsPlaying(false)}
              className="w-full h-10 rounded-lg text-xs"
              preload="auto"
            />
          </div>
        </div>
      )}
    </div>
  );
}
