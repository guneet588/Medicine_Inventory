import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { 
  Package, Clock, CheckCircle, Truck, Filter, AlertTriangle, 
  Building2, MapPin, Phone, Calendar, User, MessageSquare 
} from 'lucide-react';
import StatsCard from '../components/StatsCard';

export default function WarehouseDashboard() {
  const [requests, setRequests] = useState([]);
  const [allMedicines, setAllMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');

  useEffect(() => {
    fetchData();
    
    // Set up polling for updates
    const interval = setInterval(fetchData, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const allRequests = storage.getAllRestockRequests();
      setRequests(allRequests);

      // Get all medicines from all users
      const allMeds = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith('medicines_')) {
          const medicines = JSON.parse(localStorage.getItem(key));
          allMeds.push(...medicines);
        }
      }
      setAllMedicines(allMeds);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateRequestStatus = async (requestId, newStatus) => {
    try {
      storage.updateRestockRequest(requestId, { 
        status: newStatus,
        updated_at: new Date().toISOString()
      });
      fetchData();
    } catch (error) {
      console.error('Error updating request status:', error);
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'text-yellow-800', bg: 'bg-yellow-100', icon: Clock },
      processing: { color: 'text-blue-800', bg: 'bg-blue-100', icon: Package },
      prepared: { color: 'text-indigo-800', bg: 'bg-indigo-100', icon: CheckCircle },
      shipped: { color: 'text-purple-800', bg: 'bg-purple-100', icon: Truck },
      delivered: { color: 'text-green-800', bg: 'bg-green-100', icon: CheckCircle }
    };
    
    const config = statusConfig[status] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.color}`}>
        <Icon className="h-3 w-3 mr-1" />
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const getPriorityBadge = (priority) => {
    const priorityConfig = {
      high: { color: 'text-red-800', bg: 'bg-red-100' },
      medium: { color: 'text-yellow-800', bg: 'bg-yellow-100' },
      low: { color: 'text-green-800', bg: 'bg-green-100' }
    };
    
    const config = priorityConfig[priority] || priorityConfig.medium;
    
    return (
      <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${config.bg} ${config.color}`}>
        {priority.charAt(0).toUpperCase() + priority.slice(1)}
      </span>
    );
  };

  const filteredRequests = requests.filter(request => {
    const statusMatch = statusFilter === 'all' || request.status === statusFilter;
    const priorityMatch = priorityFilter === 'all' || request.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  // Get statistics
  const pendingRequests = requests.filter(r => r.status === 'pending').length;
  const processingRequests = requests.filter(r => r.status === 'processing').length;
  const deliveredRequests = requests.filter(r => r.status === 'delivered').length;
  const lowStockMedicines = allMedicines.filter(med => med.quantity <= med.threshold);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Warehouse Dashboard</h1>
        <p className="text-gray-600">Manage pharmacy restock requests and monitor inventory levels</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Requests"
          value={requests.length}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Pending Requests"
          value={pendingRequests}
          icon={Clock}
          color="yellow"
        />
        <StatsCard
          title="Processing"
          value={processingRequests}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockMedicines.length}
          icon={AlertTriangle}
          color="orange"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center mb-4">
            <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
            <div>
              <h3 className="font-semibold text-orange-800 text-lg">System-wide Low Stock Alert</h3>
              <p className="text-orange-700 text-sm">
                {lowStockMedicines.length} medicines across all pharmacies need attention
              </p>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {lowStockMedicines.slice(0, 6).map(medicine => (
              <div key={medicine.id} className="bg-white rounded-lg p-3 border border-orange-200">
                <div className="font-medium text-sm text-orange-800">{medicine.name}</div>
                <div className="text-xs text-orange-600">
                  Stock: {medicine.quantity} | Threshold: {medicine.threshold}
                </div>
              </div>
            ))}
            {lowStockMedicines.length > 6 && (
              <div className="bg-white rounded-lg p-3 border border-orange-200 flex items-center justify-center">
                <span className="text-sm text-orange-600 font-medium">
                  +{lowStockMedicines.length - 6} more items
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center space-x-2">
            <Filter className="h-5 w-5 text-gray-400" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="prepared">Prepared</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-600">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="all">All Priority</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">No requests found matching your filters</p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <div key={request.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-3">
                    <div className="bg-blue-100 p-2 rounded-lg">
                      <Package className="h-5 w-5 text-blue-600" />
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
                    {getPriorityBadge(request.priority)}
                    {getStatusBadge(request.status)}
                  </div>
                </div>

                {/* Pharmacy Information */}
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="flex items-center space-x-2 mb-2">
                    <Building2 className="h-4 w-4 text-gray-600" />
                    <h4 className="font-medium text-gray-900">{request.pharmacy_name}</h4>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div className="flex items-center space-x-1">
                      <MapPin className="h-3 w-3" />
                      <span>{request.pharmacy_address}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Phone className="h-3 w-3" />
                      <span>{request.pharmacy_phone}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3" />
                      <span>Created: {new Date(request.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Clock className="h-3 w-3" />
                      <span>Timeline: {request.delivery_timeline}</span>
                    </div>
                  </div>
                </div>

                {/* Medicines Grid */}
                <div className="mb-4">
                  <h4 className="font-medium text-gray-900 mb-2">Requested Medicines:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                    {request.medicines.map((medicine, index) => (
                      <div key={index} className="bg-blue-50 rounded p-2 text-sm">
                        <div className="font-medium">{medicine.medicine_name}</div>
                        <div className="text-gray-600">
                          Requested: {medicine.requested_quantity}
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
                  <div className="mb-4 p-3 bg-yellow-50 rounded-lg">
                    <div className="flex items-center space-x-1 mb-1">
                      <MessageSquare className="h-4 w-4 text-yellow-600" />
                      <span className="font-medium text-yellow-800 text-sm">Special Instructions:</span>
                    </div>
                    <p className="text-sm text-yellow-700">{request.special_instructions}</p>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex justify-end space-x-2">
                  {request.status === 'pending' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'processing')}
                      className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
                    >
                      Start Processing
                    </button>
                  )}
                  {request.status === 'processing' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'prepared')}
                      className="bg-indigo-600 text-white px-3 py-1 rounded text-sm hover:bg-indigo-700 transition-colors"
                    >
                      Mark Prepared
                    </button>
                  )}
                  {request.status === 'prepared' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'shipped')}
                      className="bg-purple-600 text-white px-3 py-1 rounded text-sm hover:bg-purple-700 transition-colors"
                    >
                      Mark Shipped
                    </button>
                  )}
                  {request.status === 'shipped' && (
                    <button
                      onClick={() => updateRequestStatus(request.id, 'delivered')}
                      className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                    >
                      Mark Delivered
                    </button>
                  )}
                  {request.status === 'delivered' && (
                    <span className="text-green-600 text-sm font-medium px-3 py-1">
                      ✓ Completed
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}