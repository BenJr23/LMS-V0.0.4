'use client';

import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useClerk } from '@clerk/nextjs';
import { LogOut } from 'lucide-react';

export default function Unauthorized() {
  const router = useRouter();
  const { signOut } = useClerk();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push('/');
    } catch (err) {
      console.error('Error signing out:', err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-xl shadow-md">
        <div className="text-center">
          <Image src="/favicon.ico" alt="Favicon" width={120} height={120} className="mx-auto mb-2" />
          <h1 className="text-2xl font-bold text-red-800 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-6">You don&apos;t have permission to access this resource.</p>
          
          <div className="space-y-4">
            <button
              onClick={() => router.back()}
              className="w-full py-2 px-4 bg-red-700 text-white rounded-md hover:bg-red-800 transition-colors"
            >
              GO BACK
            </button>

            <button
              onClick={handleSignOut}
              className="w-full py-2 px-4 border border-red-700 text-red-700 rounded-md hover:bg-red-50 transition-colors flex items-center justify-center gap-2"
            >
              <LogOut size={18} />
              Sign Out
            </button>
            
            <p className="text-sm text-gray-500">
              If you believe this is an error, please contact your administrator.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
} 