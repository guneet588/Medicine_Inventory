// Local storage utilities for managing data without Supabase
export const storage = {
  // User management
  getUser: () => {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  },

  setUser: (user) => {
    localStorage.setItem('currentUser', JSON.stringify(user));
  },

  removeUser: () => {
    localStorage.removeItem('currentUser');
  },

  // Medicines management
  getMedicines: (userId) => {
    const medicines = localStorage.getItem(`medicines_${userId}`);
    return medicines ? JSON.parse(medicines) : [];
  },

  saveMedicines: (userId, medicines) => {
    localStorage.setItem(`medicines_${userId}`, JSON.stringify(medicines));
  },

  // Pharmacy profiles
  getPharmacyProfile: (userId) => {
    const profile = localStorage.getItem(`pharmacy_profile_${userId}`);
    return profile ? JSON.parse(profile) : null;
  },

  savePharmacyProfile: (userId, profile) => {
    localStorage.setItem(`pharmacy_profile_${userId}`, JSON.stringify(profile));
  },

  // Restock requests
  getRestockRequests: (userId) => {
    const requests = localStorage.getItem(`restock_requests_${userId}`);
    return requests ? JSON.parse(requests) : [];
  },

  saveRestockRequests: (userId, requests) => {
    localStorage.setItem(`restock_requests_${userId}`, JSON.stringify(requests));
  },

  getAllRestockRequests: () => {
    const allRequests = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('restock_requests_')) {
        const requests = JSON.parse(localStorage.getItem(key));
        allRequests.push(...requests);
      }
    }
    return allRequests;
  },

  updateRestockRequest: (requestId, updates) => {
    // Find and update the request across all users
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('restock_requests_')) {
        const requests = JSON.parse(localStorage.getItem(key));
        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex !== -1) {
          requests[requestIndex] = { ...requests[requestIndex], ...updates };
          localStorage.setItem(key, JSON.stringify(requests));
          break;
        }
      }
    }
  },

  // Generate unique IDs
  generateId: () => {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
};