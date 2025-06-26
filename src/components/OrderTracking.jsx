import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { useAuthStore } from '../stores/authStore';
import { Package, Clock, CheckCircle, Truck, AlertTriangle, Calendar, MapPin } from 'lucide-react';

export default function OrderTracking() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchRequests();
    
    // Set up polling for updates (since we don't have real-time updates)
    const interval = setInterval(fetchRequests, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const fetchRequests = async () => {
    try {
      const requestsData = storage.getRestockRequests(user.id);
      setRequests(requestsData);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return Clock;
      case 'processing': return Package;
      case 'prepared': return CheckCircle;
      case 'shipped': return Truck;
      case 'delivered': return CheckCircle;
      default: return Package;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'processing': return 'text-blue-600 bg-blue-100';
      case 'prepared': return 'text-indigo-600 bg-indigo-100';
      case 'shipped': return 'text-purple-600 bg-purple-100';
      case 'delivered': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'text-red-600 bg-red-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const filteredRequests = requests.filter(request => 
    statusFilter === 'all' || request.status === statusFilter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex items-center space-x-4">
          <Package className="h-5 w-5 text-gray-400" />
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          <div className="flex space-x-2">
            {['all', 'pending', 'processing', 'prepared', 'shipped', 'delivered'].map(status => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  statusFilter === status
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">
              {statusFilter === 'all' ? 'No restock requests found' : `No ${statusFilter} requests`}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => {
            const StatusIcon = getStatusIcon(request.status);
            
            return (
              <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${getStatusColor(request.status)}`}>
                        <StatusIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">
                          Request #{request.id.slice(-8)}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {request.total_items} items • {request.total_quantity} total quantity
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(request.priority)}`}>
                        {request.priority} priority
                      </span>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(request.status)}`}>
                        {request.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Calendar className="h-4 w-4" />
                      <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <Clock className="h-4 w-4" />
                      <span>Timeline: {request.delivery_timeline}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                      <MapPin className="h-4 w-4" />
                      <span>Delivery to: {request.pharmacy_name}</span>
                    </div>
                  </div>

                  {/* Medicines List */}
                  <div className="border-t pt-4">
                    <h4 className="font-medium text-gray-900 mb-2">Requested Medicines:</h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                      {request.medicines.map((medicine, index) => (
                        <div key={index} className="bg-gray-50 rounded p-2 text-sm">
                          <div className="font-medium">{medicine.medicine_name}</div>
                          <div className="text-gray-600">
                            Qty: {medicine.requested_quantity} 
                            <span className="text-xs ml-1">
                              (Current: {medicine.current_quantity})
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Special Instructions */}
                  {request.special_instructions && (
                    <div className="border-t pt-4 mt-4">
                      <h4 className="font-medium text-gray-900 mb-1">Special Instructions:</h4>
                      <p className="text-sm text-gray-600">{request.special_instructions}</p>
                    </div>
                  )}

                  {/* Status Timeline */}
                  <div className="border-t pt-4 mt-4">
                    <div className="flex items-center space-x-4">
                      {['pending', 'processing', 'prepared', 'shipped', 'delivered'].map((status, index) => {
                        const isCompleted = ['pending', 'processing', 'prepared', 'shipped', 'delivered']
                          .indexOf(request.status) >= index;
                        const isCurrent = request.status === status;
                        
                        return (
                          <div key={status} className="flex items-center">
                            <div className={`w-3 h-3 rounded-full ${
                              isCurrent ? 'bg-blue-600' : 
                              isCompleted ? 'bg-green-600' : 'bg-gray-300'
                            }`} />
                            <span className={`ml-2 text-xs ${
                              isCurrent ? 'text-blue-600 font-medium' :
                              isCompleted ? 'text-green-600' : 'text-gray-400'
                            }`}>
                              {status.charAt(0).toUpperCase() + status.slice(1)}
                            </span>
                            {index < 4 && (
                              <div className={`w-8 h-0.5 ml-2 ${
                                isCompleted && !isCurrent ? 'bg-green-600' : 'bg-gray-300'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}