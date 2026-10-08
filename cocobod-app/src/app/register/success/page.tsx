'use client';

import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Suspense } from 'react';

function RegistrationSuccessContent() {
  const searchParams = useSearchParams();
  const [registrationCode, setRegistrationCode] = useState('');
  const [participantName, setParticipantName] = useState('');
  const [activeEvent, setActiveEvent] = useState<any>(null);
  const [fetchingEvent, setFetchingEvent] = useState(true);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await fetch('/api/events/active');
        const data = await response.json();
        setActiveEvent(data);
      } catch (error) {
        console.error('Error fetching event:', error);
      } finally {
        setFetchingEvent(false);
      }
    };
    fetchEvent();

    const code = searchParams.get('code');
    const name = searchParams.get('name');
    console.log('Success page params:', { code, name });
    if (code) setRegistrationCode(code);
    if (name) setParticipantName(decodeURIComponent(name));
  }, [searchParams]);

  const handleSaveRegistration = () => {
    const content = `
REGISTRATION SUCCESSFUL

Thank you, ${participantName || 'Participant'}.
Your registration has been confirmed.

REGISTRATION CODE
${registrationCode}

Please remember this code. Give it at the registration desk on
19 August 2026.
    `.trim();

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `registration-${registrationCode}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-white px-4 py-8">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-8">
          <h1 className="font-fraunces font-medium text-2xl text-ink mb-2">
            PENTECOST CONVENTION CENTRE
          </h1>
          <h2 className="font-fraunces text-lg text-[#123B70] mb-2 uppercase">
            Visitor Registration
          </h2>
        </div>

        {/* Credential Card */}
        <div className="bg-[#123B70] rounded-md p-8 mb-6 relative animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Inset border effect */}
          <div className="absolute inset-2 border border-[#C89B3C]/35 rounded-sm" />
          
          <div className="relative z-10 text-center">
            <p className="font-ibm-plex-mono text-xs uppercase tracking-widest text-[#C89B3C]/80 mb-4">
              Registration Confirmed
            </p>
            
            <p className="font-ibm-plex-mono font-semibold text-[34px] tracking-widest text-white mb-4">
              {registrationCode}
            </p>
            
            <p className="font-fraunces text-white/90">
              {participantName || 'Participant'}
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <button
            onClick={handleSaveRegistration}
            className="w-full py-4 px-4 text-base bg-[#123B70] text-white font-medium rounded-sm hover:bg-[#0d2d52] focus:outline-none focus:ring-2 focus:ring-[#C89B3C] transition-all duration-200 active:scale-95"
          >
            Save Registration
          </button>

          <button
            onClick={() => window.location.href = '/'}
            className="w-full py-4 px-4 text-base bg-white text-gray-900 border border-gray-300 font-medium rounded-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#C89B3C] transition-all duration-200 active:scale-95"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
}

export default function RegistrationSuccess() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white px-4 py-8 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#123B70]"></div>
      </div>
    }>
      <RegistrationSuccessContent />
    </Suspense>
  );
}
