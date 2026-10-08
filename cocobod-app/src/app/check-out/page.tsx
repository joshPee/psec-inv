'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function CheckOut() {
  const router = useRouter();
  const [registrationCode, setRegistrationCode] = useState('');
  const [guardName, setGuardName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleCheckOut = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!registrationCode.trim()) {
      setError('Please enter your registration code');
      setLoading(false);
      return;
    }

    if (!guardName.trim()) {
      setError('Please enter the guard\'s name');
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('/api/check-out', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          registrationCode: registrationCode.trim(),
          guardName: guardName.trim()
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Check-out failed');
      } else {
        setSuccess(true);
        setTimeout(() => {
          router.push('/');
        }, 3000);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white px-4 py-4 flex items-center justify-center">
      <div className="max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-40 h-40 mx-auto mb-4">
            <img
              src="/pcc.png"
              alt="PCC Logo"
              className="object-contain w-full h-full"
            />
          </div>
          <h1 className="font-fraunces font-medium text-xl text-ink mb-1">
            PENTECOST CONVENTION CENTRE
          </h1>
          <h2 className="font-fraunces text-base text-amber-700 mb-2 uppercase">
            Visitor Check-Out
          </h2>
        </div>

        {success ? (
          <div className="bg-white p-6 border border-gray-200 rounded-sm min-h-[400px] flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 bg-amber-100 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Check-out Successful!</h3>
              <p className="text-gray-600">Thank you for visiting Pentecost Convention Centre</p>
            </div>
          </div>
        ) : (
          <div className="bg-white p-6 border border-gray-200 rounded-sm">
            <form onSubmit={handleCheckOut} className="space-y-4">
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-sm">
                  {error}
                </div>
              )}

              <div>
                <label htmlFor="registrationCode" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                  Registration Code *
                </label>
                <input
                  id="registrationCode"
                  type="text"
                  required
                  value={registrationCode}
                  onChange={(e) => setRegistrationCode(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-700 transition-all duration-200"
                  placeholder="Enter your registration code"
                  autoComplete="off"
                />
              </div>

              <div>
                <label htmlFor="guardName" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                  Guard's Name *
                </label>
                <input
                  id="guardName"
                  type="text"
                  required
                  value={guardName}
                  onChange={(e) => setGuardName(e.target.value)}
                  className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-amber-700 transition-all duration-200"
                  placeholder="Enter guard's name"
                  autoComplete="name"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-4 text-base font-medium rounded-sm text-white bg-amber-700 hover:bg-amber-800 focus:outline-none focus:ring-2 focus:ring-amber-700 transition-all duration-200 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Checking out...' : 'Check Out'}
              </button>

              <div className="text-center">
                <p className="text-sm text-gray-600">
                  <a href="/" className="text-amber-700 hover:underline font-medium">
                    Back to home
                  </a>
                </p>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
