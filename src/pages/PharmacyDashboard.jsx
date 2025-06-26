import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { useAuthStore } from '../stores/authStore';
import { 
  Plus, AlertTriangle, Package, Calendar, Edit2, Trash2, 
  Building2, Truck, BarChart3, User 
} from 'lucide-react';
import MedicineForm from '../components/MedicineForm';
import PharmacyProfile from '../components/PharmacyProfile';
import RestockRequestForm from '../components/RestockRequestForm';
import OrderTracking from '../components/OrderTracking';
import StatsCard from '../components/StatsCard';

export default function PharmacyDashboard() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [editingMedicine, setEditingMedicine] = useState(null);
  const [activeTab, setActiveTab] = useState('inventory');
  const { user } = useAuthStore();

  useEffect(() => {
    fetchMedicines();
    
    // Set up polling for updates
    const interval = setInterval(fetchMedicines, 5000);
    return () => clearInterval(interval);
  }, [user.id]);

  const fetchMedicines = async () => {
    try {
      const medicinesData = storage.getMedicines(user.id);
      setMedicines(medicinesData);
    } catch (error) {
      console.error('Error fetching medicines:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this medicine?')) return;

    try {
      const medicines = storage.getMedicines(user.id);
      const updatedMedicines = medicines.filter(med => med.id !== id);
      storage.saveMedicines(user.id, updatedMedicines);
      fetchMedicines();
    } catch (error) {
      console.error('Error deleting medicine:', error);
    }
  };

  const handleEdit = (medicine) => {
    setEditingMedicine(medicine);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingMedicine(null);
    fetchMedicines();
  };

  const handleRestockSuccess = () => {
    setShowRestockForm(false);
  };

  const lowStockMedicines = medicines.filter(med => med.quantity <= med.threshold);
  const expiringMedicines = medicines.filter(med => {
    const expiryDate = new Date(med.expiry_date);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiryDate <= thirtyDaysFromNow;
  });

  const getStockStatus = (quantity, threshold) => {
    if (quantity === 0) return { status: 'Out of Stock', color: 'text-red-600', bg: 'bg-red-100' };
    if (quantity <= threshold) return { status: 'Low Stock', color: 'text-orange-600', bg: 'bg-orange-100' };
    return { status: 'In Stock', color: 'text-green-600', bg: 'bg-green-100' };
  };

  const isExpiringSoon = (expiryDate) => {
    const expiry = new Date(expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return expiry <= thirtyDaysFromNow;
  };

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
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Pharmacy Dashboard</h1>
          <p className="text-gray-600">Manage your inventory and track orders</p>
        </div>
        <div className="flex space-x-3">
          {lowStockMedicines.length > 0 && (
            <button
              onClick={() => setShowRestockForm(true)}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
            >
              <Truck className="h-4 w-4" />
              <span>Request Restock</span>
            </button>
          )}
          <button
            onClick={() => {
              setEditingMedicine(null);
              setShowForm(true);
            }}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Total Medicines"
          value={medicines.length}
          icon={Package}
          color="blue"
        />
        <StatsCard
          title="Low Stock Items"
          value={lowStockMedicines.length}
          icon={AlertTriangle}
          color="orange"
        />
        <StatsCard
          title="Expiring Soon"
          value={expiringMedicines.length}
          icon={Calendar}
          color="red"
        />
        <StatsCard
          title="Total Quantity"
          value={medicines.reduce((sum, med) => sum + med.quantity, 0)}
          icon={Package}
          color="green"
        />
      </div>

      {/* Low Stock Alert */}
      {lowStockMedicines.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-orange-600 mr-2" />
              <h3 className="font-semibold text-orange-800">Low Stock Alert</h3>
            </div>
            <button
              onClick={() => setShowRestockForm(true)}
              className="bg-orange-600 text-white px-3 py-1 rounded text-sm hover:bg-orange-700 transition-colors"
            >
              Create Restock Request
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            {lowStockMedicines.slice(0, 6).map(medicine => (
              <div key={medicine.id} className="flex justify-between items-center bg-white rounded p-2">
                <span className="text-sm text-orange-700">{medicine.name}</span>
                <span className="text-sm font-medium text-orange-800">
                  {medicine.quantity} left
                </span>
              </div>
            ))}
            {lowStockMedicines.length > 6 && (
              <div className="col-span-full">
                <p className="text-sm text-orange-600">
                  +{lowStockMedicines.length - 6} more items need restocking
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'inventory', label: 'Inventory', icon: Package },
            { id: 'orders', label: 'Order Tracking', icon: Truck },
            { id: 'profile', label: 'Pharmacy Profile', icon: Building2 },
            { id: 'reports', label: 'Reports', icon: BarChart3 }
          ].map(tab => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'inventory' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Medicine Inventory</h3>
          </div>
          
          {medicines.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">No medicines in inventory</p>
              <button
                onClick={() => setShowForm(true)}
                className="mt-4 text-blue-600 hover:text-blue-700 font-medium"
              >
                Add your first medicine
              </button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Medicine
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Quantity
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Threshold
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Expiry Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {medicines.map((medicine) => {
                    const stockStatus = getStockStatus(medicine.quantity, medicine.threshold);
                    const expiringSoon = isExpiringSoon(medicine.expiry_date);
                    
                    return (
                      <tr key={medicine.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {medicine.name}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{medicine.quantity}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{medicine.threshold}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className={`text-sm ${expiringSoon ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                            {new Date(medicine.expiry_date).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bg} ${stockStatus.color}`}>
                            {stockStatus.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleEdit(medicine)}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                            >
                              <Edit2 className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDelete(medicine.id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'orders' && <OrderTracking />}
      {activeTab === 'profile' && <PharmacyProfile />}
      {activeTab === 'reports' && (
        <div className="bg-white rounded-lg shadow p-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Reports & Analytics</h3>
            <p className="text-gray-500">Detailed inventory reports and analytics coming soon</p>
          </div>
        </div>
      )}

      {/* Medicine Form Modal */}
      {showForm && (
        <MedicineForm
          medicine={editingMedicine}
          onSuccess={handleFormSuccess}
          onCancel={() => {
            setShowForm(false);
            setEditingMedicine(null);
          }}
        />
      )}

      {/* Restock Request Form Modal */}
      {showRestockForm && (
        <RestockRequestForm
          medicines={medicines}
          onSuccess={handleRestockSuccess}
          onCancel={() => setShowRestockForm(false)}
        />
      )}
    </div>
  );
}