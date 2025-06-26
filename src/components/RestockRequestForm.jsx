import { useState, useEffect } from 'react';
import { storage } from '../lib/storage';
import { useAuthStore } from '../stores/authStore';
import { X, Package, AlertTriangle, Clock, MessageSquare } from 'lucide-react';

export default function RestockRequestForm({ medicines, onSuccess, onCancel }) {
  const [selectedMedicines, setSelectedMedicines] = useState([]);
  const [priority, setPriority] = useState('medium');
  const [deliveryTimeline, setDeliveryTimeline] = useState('3-5 days');
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { user } = useAuthStore();

  useEffect(() => {
    // Auto-select low stock medicines
    const lowStockMedicines = medicines.filter(med => med.quantity <= med.threshold);
    setSelectedMedicines(lowStockMedicines.map(med => ({
      ...med,
      requested_quantity: Math.max(med.threshold * 2 - med.quantity, med.threshold)
    })));
  }, [medicines]);

  const updateRequestedQuantity = (medicineId, quantity) => {
    setSelectedMedicines(prev =>
      prev.map(item =>
        item.id === medicineId
          ? { ...item, requested_quantity: Math.max(1, parseInt(quantity) || 0) }
          : item
      )
    );
  };

  const toggleMedicine = (medicine) => {
    const isSelected = selectedMedicines.find(item => item.id === medicine.id);
    if (isSelected) {
      setSelectedMedicines(prev => prev.filter(item => item.id !== medicine.id));
    } else {
      setSelectedMedicines(prev => [...prev, {
        ...medicine,
        requested_quantity: Math.max(medicine.threshold * 2 - medicine.quantity, medicine.threshold)
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (selectedMedicines.length === 0) {
      setError('Please select at least one medicine');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Get pharmacy profile for request details
      const profile = storage.getPharmacyProfile(user.id);

      const requestData = {
        id: storage.generateId(),
        pharmacy_id: user.id,
        pharmacy_name: profile?.pharmacy_name || 'Unknown Pharmacy',
        pharmacy_address: profile ? `${profile.address}, ${profile.city}, ${profile.state}` : 'Address not provided',
        pharmacy_phone: profile?.phone || 'Phone not provided',
        medicines: selectedMedicines.map(med => ({
          medicine_id: med.id,
          medicine_name: med.name,
          current_quantity: med.quantity,
          threshold: med.threshold,
          requested_quantity: med.requested_quantity
        })),
        total_items: selectedMedicines.length,
        total_quantity: selectedMedicines.reduce((sum, med) => sum + med.requested_quantity, 0),
        priority,
        delivery_timeline: deliveryTimeline,
        special_instructions: specialInstructions.trim(),
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };

      const existingRequests = storage.getRestockRequests(user.id);
      existingRequests.push(requestData);
      storage.saveRestockRequests(user.id, existingRequests);

      onSuccess();
    } catch (err) {
      console.error('Error creating restock request:', err);
      setError(err.message);
    } finally {
      setLoading(false);
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b">
          <div className="flex items-center space-x-2">
            <Package className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Create Restock Request</h2>
          </div>
          <button
            onClick={onCancel}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Request Settings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority Level
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
                <div className="mt-1">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getPriorityColor(priority)}`}>
                    {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Clock className="h-4 w-4 inline mr-1" />
                  Delivery Timeline
                </label>
                <select
                  value={deliveryTimeline}
                  onChange={(e) => setDeliveryTimeline(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="1-2 days">1-2 days (Urgent)</option>
                  <option value="3-5 days">3-5 days (Standard)</option>
                  <option value="1 week">1 week (Regular)</option>
                  <option value="2 weeks">2 weeks (Non-urgent)</option>
                </select>
              </div>
            </div>

            {/* Medicine Selection */}
            <div>
              <h3 className="text-lg font-medium text-gray-900 mb-4">Select Medicines to Restock</h3>
              <div className="space-y-3 max-h-64 overflow-y-auto border rounded-lg p-4">
                {medicines.map(medicine => {
                  const isSelected = selectedMedicines.find(item => item.id === medicine.id);
                  const isLowStock = medicine.quantity <= medicine.threshold;
                  
                  return (
                    <div
                      key={medicine.id}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        isSelected ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <input
                          type="checkbox"
                          checked={!!isSelected}
                          onChange={() => toggleMedicine(medicine)}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <div>
                          <div className="flex items-center space-x-2">
                            <p className="font-medium text-sm">{medicine.name}</p>
                            {isLowStock && (
                              <AlertTriangle className="h-4 w-4 text-orange-500" />
                            )}
                          </div>
                          <p className="text-xs text-gray-500">
                            Current: {medicine.quantity} | Threshold: {medicine.threshold}
                          </p>
                        </div>
                      </div>
                      
                      {isSelected && (
                        <div className="flex items-center space-x-2">
                          <label className="text-xs text-gray-600">Qty:</label>
                          <input
                            type="number"
                            min="1"
                            value={isSelected.requested_quantity}
                            onChange={(e) => updateRequestedQuantity(medicine.id, e.target.value)}
                            className="w-16 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500"
                          />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Special Instructions */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <MessageSquare className="h-4 w-4 inline mr-1" />
                Special Instructions (Optional)
              </label>
              <textarea
                value={specialInstructions}
                onChange={(e) => setSpecialInstructions(e.target.value)}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Any special delivery instructions, preferred brands, or additional notes..."
              />
            </div>

            {/* Request Summary */}
            {selectedMedicines.length > 0 && (
              <div className="bg-blue-50 rounded-lg p-4">
                <h4 className="font-medium text-gray-900 mb-2">Request Summary</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Total Items</p>
                    <p className="font-semibold">{selectedMedicines.length}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Total Quantity</p>
                    <p className="font-semibold">
                      {selectedMedicines.reduce((sum, med) => sum + med.requested_quantity, 0)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Priority</p>
                    <p className="font-semibold capitalize">{priority}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Timeline</p>
                    <p className="font-semibold">{deliveryTimeline}</p>
                  </div>
                </div>
              </div>
            )}

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <div className="flex space-x-3 pt-4 border-t">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || selectedMedicines.length === 0}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? 'Creating Request...' : 'Submit Request'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}