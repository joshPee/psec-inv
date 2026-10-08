'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/toast';

export default function AdminLogin() {
  const router = useRouter();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError('Invalid email or password');
        toast.error('Invalid email or password');
      } else {
        toast.success('Login successful! Redirecting...');
        setTimeout(() => {
          router.push('/admin/dashboard');
          router.refresh();
        }, 1200);
      }
    } catch (error) {
      setError('An error occurred. Please try again.');
      toast.error('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-white px-4">
      <div className="max-w-md w-full space-y-6 bg-white p-6 border border-gray-200 rounded-lg shadow-sm">
        <div className="text-center">
          <div className="w-48 h-48 mx-auto mb-4">
            <img src="/pcc.png" alt="PCC Logo" className="object-contain w-full h-full" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900">
            Admin Login
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            Secure access to visitor management
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}
          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-1">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-gray-900 uppercase tracking-widest mb-1">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full px-3 py-2 border border-gray-200 bg-gray-50 rounded-lg placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-blue-700 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-700 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
