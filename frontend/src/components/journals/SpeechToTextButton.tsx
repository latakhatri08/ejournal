'use client';

import { useEffect, useRef, useState } from 'react';

interface SpeechRecognitionResultLike {
  isFinal: boolean;
  [index: number]: { transcript: string };
}

interface SpeechRecognitionEventLike {
  resultIndex: number;
  results: ArrayLike<SpeechRecognitionResultLike>;
}

interface SpeechRecognitionErrorEventLike {
  error: string;
}

interface SpeechRecognitionLike {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onend: (() => void) | null;
  onerror: ((event: SpeechRecognitionErrorEventLike) => void) | null;
  onresult: ((event: SpeechRecognitionEventLike) => void) | null;
  onstart: (() => void) | null;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

interface SpeechRecognitionConstructor {
  new (): SpeechRecognitionLike;
}

declare global {
  interface Window {
    SpeechRecognition?: SpeechRecognitionConstructor;
    webkitSpeechRecognition?: SpeechRecognitionConstructor;
  }
}

interface SpeechToTextButtonProps {
  onTranscript: (transcript: string) => void;
}

export default function SpeechToTextButton({ onTranscript }: SpeechToTextButtonProps) {
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onTranscriptRef = useRef(onTranscript);
  const [listening, setListening] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    onTranscriptRef.current = onTranscript;
  }, [onTranscript]);

  useEffect(() => {
    return () => {
      const recognition = recognitionRef.current;
      if (recognition) {
        recognition.onend = null;
        recognition.onerror = null;
        recognition.onresult = null;
        recognition.onstart = null;
        recognition.abort();
      }
    };
  }, []);

  const toggleListening = () => {
    if (listening) {
      recognitionRef.current?.stop();
      return;
    }

    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Recognition) {
      setError('Speech recognition is not supported in this browser.');
      return;
    }

    setError('');
    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = navigator.language || 'en-US';
    recognition.onstart = () => setListening(true);
    recognition.onend = () => {
      setListening(false);
      recognitionRef.current = null;
    };
    recognition.onerror = event => {
      setListening(false);
      if (event.error !== 'aborted') {
        const messages: Record<string, string> = {
          'audio-capture': 'No microphone was found. Check your microphone and try again.',
          network: 'Speech recognition could not connect. Check your connection and try again.',
          'no-speech': 'No speech was detected. Try speaking closer to your microphone.',
          'not-allowed': 'Microphone access was denied. Allow microphone access in your browser settings.',
          'service-not-allowed': 'Speech recognition is blocked by your browser.',
        };
        setError(messages[event.error] || 'Speech recognition failed. Please try again.');
      }
      recognitionRef.current = null;
    };
    recognition.onresult = event => {
      const transcript = Array.from(event.results)
        .slice(event.resultIndex)
        .filter(result => result.isFinal)
        .map(result => result[0].transcript.trim())
        .filter(Boolean)
        .join(' ');
      if (transcript) onTranscriptRef.current(transcript);
    };
    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      recognitionRef.current = null;
      setError('Could not start speech recognition. Please try again.');
    }
  };

  return (
    <div className="px-6 pt-4">
      <button
        type="button"
        onClick={toggleListening}
        aria-pressed={listening}
        className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
          listening ? 'bg-red-50 text-red-700 hover:bg-red-100' : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
        }`}
      >
        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.5a6.5 6.5 0 006.5-6.5M12 18.5A6.5 6.5 0 015.5 12M12 18.5V22m0-3.5H8m4 0h4M12 15a3 3 0 003-3V5a3 3 0 00-6 0v7a3 3 0 003 3z" />
        </svg>
        {listening ? 'Stop listening' : 'Dictate entry'}
      </button>
      {listening && <span className="ml-3 text-sm text-gray-500">Listening… speak to add to your entry.</span>}
      {error && <p role="status" className="mt-2 text-sm text-red-600">{error}</p>}
    </div>
  );
}
