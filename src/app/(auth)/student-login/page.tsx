'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import toast from 'react-hot-toast';

export default function StudentLogin() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual login logic here
    try {
      // Simulate login success
      toast.success('Login successful!');
      router.push('/dashboard'); // Redirect to dashboard or home after login
    } catch (error) {
      console.error('Login failed:', error);
      toast.error('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="flex h-screen w-screen bg-white min-width-[360px]">
      <div className="container">
        <div className="h-screen w-screen bg-cover bg-center" style={{ backgroundImage: "url('/assets/sis_bg.webp')" }}>
          <div className="absolute right-0 w-full md:w-[450px] min-h-screen min-w-[360px] flex items-center justify-center overflow-hidden bg-white/70 backdrop-blur-[20px] backdrop-saturate-[168%] shadow-md m-0 rounded-none flex flex-col bg-clip-border border border-transparent break-words">
            <div className="flex flex-col items-center w-full px-8">
              <h1 className="text-3xl text-center text-[#800000] w-full mb-8">
                Student Login
              </h1>
              <form onSubmit={handleSubmit} className="w-full space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                  <input
                    type="email"
                    id="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    required
                  />
                </div>
                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#800000] text-white rounded-md hover:bg-[#600000] transition-colors"
                >
                  Login
                </button>
              </form>
              <div className="mt-4 text-center">
                <Link href="/" className="text-sm text-[#800000] hover:underline">
                  Back to Home
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 