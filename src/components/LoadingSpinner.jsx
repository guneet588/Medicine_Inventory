import { Pill } from 'lucide-react';

export default function LoadingSpinner() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="bg-blue-100 p-4 rounded-full inline-block mb-4 animate-pulse">
          <Pill className="h-8 w-8 text-blue-600" />
        </div>
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  );
}