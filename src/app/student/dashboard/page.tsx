import { auth } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';

export default async function StudentDashboard() {
  const session = await auth();

  if (!session.userId) {
    redirect('/sign-in');
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Student Dashboard</h1>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Navigation Cards */}
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">My Subjects</h2>
                <p className="text-gray-600 mb-4">View and manage your enrolled subjects</p>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  View Subjects
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Assignments</h2>
                <p className="text-gray-600 mb-4">Check your pending and submitted assignments</p>
                <button className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
                  View Assignments
                </button>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Announcements</h2>
                <p className="text-gray-600 mb-4">Stay updated with latest announcements</p>
                <button className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600">
                  View Announcements
                </button>
              </div>
            </div>
          </div>

          {/* Quick Stats Section */}
          <div className="mt-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Quick Stats</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Enrolled Subjects</h3>
                <p className="text-3xl font-bold text-blue-600 mt-2">3</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Pending Assignments</h3>
                <p className="text-3xl font-bold text-yellow-600 mt-2">2</p>
              </div>
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-medium text-gray-900">Average Grade</h3>
                <p className="text-3xl font-bold text-green-600 mt-2">85%</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
