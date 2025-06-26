import { useAuthStore } from '../stores/authStore';
import { Pill, LogOut, User, Shield } from 'lucide-react';

export default function Layout({ children }) {
  const { user, signOut } = useAuthStore();
  const isWarehouse = user?.user_metadata?.role === 'warehouse';

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center">
                <div className="bg-blue-100 p-2 rounded-lg mr-3">
                  <Pill className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">
                    Pharmacy Inventory
                  </h1>
                  <p className="text-sm text-gray-500">
                    Management System
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {isWarehouse ? (
                  <Shield className="h-5 w-5 text-green-600" />
                ) : (
                  <User className="h-5 w-5 text-blue-600" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  {isWarehouse ? 'Warehouse' : 'Pharmacy'}
                </span>
              </div>
              
              <div className="text-sm text-gray-600">
                {user?.email}
              </div>
              
              <button
                onClick={handleSignOut}
                className="flex items-center space-x-1 text-gray-600 hover:text-red-600 transition-colors"
              >
                <LogOut className="h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          </div>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}