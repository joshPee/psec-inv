'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Register() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [organisation, setOrganisation] = useState('');
  const [personToVisit, setPersonToVisit] = useState('');
  const [department, setDepartment] = useState('');
  const [visitPurpose, setVisitPurpose] = useState('');
  const [vehicleRegistration, setVehicleRegistration] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [duplicateWarning, setDuplicateWarning] = useState(false);
  const [pendingSubmission, setPendingSubmission] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);


  const validateInput = (value: string) => {
    if (!value || value.trim().length < 2) {
      return 'Please enter at least 2 characters';
    }
    return '';
  };

  const handleNextStep = () => {
    setError('');
    
    // Validate step 1 fields
    if (!fullName || fullName.trim().length < 2) {
      setError('Please enter a valid full name');
      return;
    }
    if (!phone || phone.trim().length < 2) {
      setError('Please enter a valid phone number');
      return;
    }
    if (!location || location.trim().length < 2) {
      setError('Please enter your location');
      return;
    }
    
    setCurrentStep(2);
  };

  const handlePreviousStep = () => {
    setError('');
    setCurrentStep(1);
  };

  const handleSubmit = async (e: React.FormEvent, forceSubmit = false) => {
    e.preventDefault();
    setError('');
    setDuplicateWarning(false);

    // Validate step 2 fields
    if (!personToVisit || personToVisit.trim().length < 2) {
      setError('Please enter the person you are visiting');
      return;
    }
    if (!department || department.trim().length < 2) {
      setError('Please enter the department');
      return;
    }
    if (!visitPurpose || visitPurpose.trim().length < 2) {
      setError('Please enter the purpose of your visit');
      return;
    }

    setLoading(true);
    setPendingSubmission({ fullName, phone, location, organisation, personToVisit, department, visitPurpose, vehicleRegistration });

    try {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: fullName.trim(),
          phone: phone.trim(),
          location: location.trim(),
          organisation: organisation.trim(),
          personToVisit: personToVisit.trim(),
          department: department.trim(),
          visitPurpose: visitPurpose.trim(),
          vehicleRegistration: vehicleRegistration.trim(),
          forceSubmit,
        }),
      });

      const data = await response.json();
      console.log('Registration API response:', data);

      if (!response.ok) {
        if (data.duplicate) {
          setDuplicateWarning(true);
          setPendingSubmission(data);
          setError('A similar registration already exists. Submit anyway?');
        } else {
          setError(data.error || 'Registration failed');
        }
      } else {
        console.log('Redirecting with:', { code: data.registrationCode, name: data.fullName });
        router.push(`/register/success?code=${data.registrationCode}&name=${encodeURIComponent(data.fullName)}`);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForceSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSubmit(e, true);
  };

  const handleViewExisting = () => {
    if (pendingSubmission?.existingCode) {
      router.push(`/register/success?code=${pendingSubmission.existingCode}&name=${encodeURIComponent(pendingSubmission.fullName)}`);
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
          <h2 className="font-fraunces text-base text-green-700 mb-2 uppercase">
            Visitor Check-In
          </h2>
        </div>

        {loading ? (
           <div className="bg-white p-6 border border-gray-200 rounded-sm min-h-[400px] flex items-center justify-center">
             <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-700 border-t-transparent"></div>
           </div>
        ) : (
          <div className="bg-white p-6 border border-gray-200 rounded-sm">
            {/* Progress Indicator */}
            <div className="flex items-center justify-center mb-6">
              {[1, 2].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      currentStep >= step
                        ? 'bg-blue-700 text-white'
                        : 'bg-gray-200 text-gray-600'
                    }`}
                  >
                    {step}
                  </div>
                  {step < 2 && (
                    <div
                      className={`w-12 h-1 mx-2 ${
                        currentStep > step ? 'bg-blue-700' : 'bg-gray-200'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <p className="font-ibm-plex-sans text-sm text-ink mb-6 text-center">
              {currentStep === 1 ? 'Step 1: Personal Information' : 'Step 2: Visit Details'}
            </p>

          <form onSubmit={currentStep === 1 ? (e) => { e.preventDefault(); handleNextStep(); } : handleSubmit} className="space-y-4">
            {error && !duplicateWarning && (
              <div className="bg-brick/10 border border-brick text-brick px-4 py-3 rounded-sm">
                {error}
              </div>
            )}

            {duplicateWarning && (
              <div className="bg-gold/20 border border-gold text-forest px-4 py-3 rounded-sm">
                {error}
                <div className="mt-3 flex gap-2">
                  {pendingSubmission?.existingCode && (
                    <button
                      onClick={handleViewExisting}
                      className="px-4 py-2 bg-blue-600 text-white rounded-sm hover:bg-blue-700"
                    >
                      View Existing Registration
                    </button>
                  )}
                  <button
                    onClick={handleForceSubmit}
                    className="px-4 py-2 bg-blue-700 text-white rounded-sm hover:bg-blue-800"
                  >
                    Yes, Submit Anyway
                  </button>
                  <button
                    onClick={() => {
                      setDuplicateWarning(false);
                      setError('');
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-700 border border-gray-300 rounded-sm hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {currentStep === 1 ? (
              <>
                <div>
                  <label htmlFor="fullName" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Full Name *
                  </label>
                  <input
                    id="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter your full name"
                    autoComplete="name"
                  />
                </div>

                <div>
                  <label htmlFor="phone" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Phone Number *
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter your phone number"
                    autoComplete="tel"
                  />
                </div>

                <div>
                  <label htmlFor="location" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Coming From / Location *
                  </label>
                  <input
                    id="location"
                    type="text"
                    required
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter your location"
                  />
                </div>

                <div>
                  <label htmlFor="organisation" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Organization / Company
                  </label>
                  <input
                    id="organisation"
                    type="text"
                    value={organisation}
                    onChange={(e) => setOrganisation(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter your organization (if applicable)"
                    autoComplete="organization"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-4 px-4 text-base font-medium rounded-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all duration-200 active:scale-95"
                >
                  Next Step
                </button>
              </>
            ) : (
              <>
                <div>
                  <label htmlFor="personToVisit" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Person to Visit *
                  </label>
                  <input
                    id="personToVisit"
                    type="text"
                    required
                    value={personToVisit}
                    onChange={(e) => setPersonToVisit(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter the person you are visiting"
                  />
                </div>

                <div>
                  <label htmlFor="department" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Department *
                  </label>
                  <input
                    id="department"
                    type="text"
                    required
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter the department"
                  />
                </div>

                <div>
                  <label htmlFor="visitPurpose" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Purpose of Visit *
                  </label>
                  <textarea
                    id="visitPurpose"
                    required
                    value={visitPurpose}
                    onChange={(e) => setVisitPurpose(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter the purpose of your visit"
                    rows={2}
                  />
                </div>

                <div>
                  <label htmlFor="vehicleRegistration" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-2">
                    Vehicle Registration Number
                  </label>
                  <input
                    id="vehicleRegistration"
                    type="text"
                    value={vehicleRegistration}
                    onChange={(e) => setVehicleRegistration(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-200 bg-gray-50 rounded-sm focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 transition-all duration-200"
                    placeholder="Enter vehicle registration (if applicable)"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={handlePreviousStep}
                    className="flex-1 py-4 px-4 text-base font-medium rounded-sm bg-gray-200 text-gray-700 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-700 transition-all duration-200 active:scale-95"
                  >
                    Previous
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-1 py-4 px-4 text-base font-medium rounded-sm text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 active:scale-95"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        Registering...
                      </span>
                    ) : 'Register'}
                  </button>
                </div>
              </>
            )}
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
