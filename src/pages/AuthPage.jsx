import { useState } from 'react';
import { useAuthStore } from '../stores/authStore';
import { Pill, Shield, User, Building2, Package, Truck } from 'lucide-react';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('pharmacy');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { signIn, signUp } = useAuthStore();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        await signIn(email, password);
      } else {
        await signUp(email, password, role);
        setError('Account created successfully! You can now sign in.');
        setIsLogin(true);
        setPassword('');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md border border-gray-100">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-3 rounded-full">
              <Pill className="h-8 w-8 text-white" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Multi-Pharmacy Inventory
          </h1>
          <p className="text-gray-600">
            {isLogin ? 'Sign in to your account' : 'Create a new account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
              placeholder="Enter your password"
              required
            />
          </div>

          {!isLogin && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Account Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'pharmacy' 
                    ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="pharmacy"
                    checked={role === 'pharmacy'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <Building2 className={`h-6 w-6 mb-2 ${
                      role === 'pharmacy' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      role === 'pharmacy' ? 'text-blue-900' : 'text-gray-700'
                    }`}>
                      Pharmacy
                    </span>
                  </div>
                </label>
                
                <label className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  role === 'warehouse' 
                    ? 'border-green-500 bg-green-50 ring-2 ring-green-200' 
                    : 'border-gray-200 hover:border-gray-300'
                }`}>
                  <input
                    type="radio"
                    name="role"
                    value="warehouse"
                    checked={role === 'warehouse'}
                    onChange={(e) => setRole(e.target.value)}
                    className="sr-only"
                  />
                  <div className="flex flex-col items-center text-center">
                    <Shield className={`h-6 w-6 mb-2 ${
                      role === 'warehouse' ? 'text-green-600' : 'text-gray-400'
                    }`} />
                    <span className={`text-sm font-medium ${
                      role === 'warehouse' ? 'text-green-900' : 'text-gray-700'
                    }`}>
                      Warehouse
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {error && (
            <div className={`border rounded-lg p-3 ${
              error.includes('successfully') 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <p className={`text-sm ${
                error.includes('successfully') ? 'text-green-600' : 'text-red-600'
              }`}>
                {error}
              </p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3 px-4 rounded-lg hover:from-blue-700 hover:to-indigo-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 font-medium"
          >
            {loading ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Please wait...
              </div>
            ) : (
              isLogin ? 'Sign In' : 'Create Account'
            )}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setError('');
            }}
            className="text-blue-600 hover:text-blue-700 text-sm font-medium transition-colors"
          >
            {isLogin 
              ? "Don't have an account? Create one" 
              : 'Already have an account? Sign in'
            }
          </button>
        </div>

        {/* Feature highlights */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="bg-blue-100 p-2 rounded-lg mb-2">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <span className="text-xs text-gray-600">Real-time Inventory</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="bg-green-100 p-2 rounded-lg mb-2">
                <Truck className="h-4 w-4 text-green-600" />
              </div>
              <span className="text-xs text-gray-600">Order Tracking</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}