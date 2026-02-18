/**
 * Sakan DB API Adapter
 * Connects Frontend to Microservices via API Gateway (Nginx).
 * 
 * ARCHITECTURE (5-Tier):
 * 1. Client (Browser) -> 2. Gateway (Nginx) -> 3. App (Node Services) -> 4. Event Bus (Kafka) -> 5. Data (Mongo)
 */

const API_URLS = {
    AUTH: '/api/auth',
    HOUSING: '/api/housing',
    BOOKING: '/api/booking'
};

const DB_KEYS = {
    CURRENT_USER: 'mysakn_current_user_token',
    USER_DATA: 'mysakn_user_data'
};

const db = {
    // --- USERS (AUTH SERVICE) ---
    saveUser: async (user) => {
        try {
            console.log('📡 --- API CALL: REGISTER ---');
            const res = await fetch(`${API_URLS.AUTH}/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            console.log('📶 Response status:', res.status);
            const text = await res.text();

            let data;
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error('🧩 JSON Parse Fail:', text.substring(0, 100));
                return { error: `Server Error (${res.status}): Invalid Response Format. Likely a routing or firewall issue.` };
            }

            if (!res.ok) {
                console.error('❌ Server rejected registration:', data);
                return { error: data.error || 'Server error during signup' };
            }

            // Auto Login Cache
            if (data.token) localStorage.setItem(DB_KEYS.CURRENT_USER, data.token);
            if (data.user) localStorage.setItem(DB_KEYS.USER_DATA, JSON.stringify(data.user));

            return { success: true, user: data.user };
        } catch (err) {
            console.error('🌐 NETWORK ERROR:', err);
            return { error: 'Connection Failure: ' + err.message };
        }
    },

    apiPing: async () => {
        try {
            const res = await fetch(`${API_URLS.AUTH}/verify`, {
                headers: { 'Authorization': 'Bearer test' }
            });
            return res.status;
        } catch (e) {
            return 'Offline';
        }
    },

    login: async (email, password) => {
        try {
            const res = await fetch(`${API_URLS.AUTH}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem(DB_KEYS.CURRENT_USER, data.token);
                localStorage.setItem(DB_KEYS.USER_DATA, JSON.stringify(data.user));
                return data.user;
            }
            return null;
        } catch (err) {
            console.error(err);
            return null;
        }
    },

    getCurrentUser: () => {
        // Sync retrieval for UI rendering (Relies on LocalStorage cache from Login)
        return JSON.parse(localStorage.getItem(DB_KEYS.USER_DATA));
    },

    logout: () => {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
        localStorage.removeItem(DB_KEYS.USER_DATA);
        window.location.href = 'index.html';
    },

    clearSession: () => {
        localStorage.removeItem(DB_KEYS.CURRENT_USER);
        localStorage.removeItem(DB_KEYS.USER_DATA);
    },

    // --- LISTINGS (HOUSING SERVICE) ---
    getListings: async () => {
        try {
            const res = await fetch(`${API_URLS.HOUSING}/listings`);
            if (res.ok) return await res.json();
            return [];
        } catch (err) {
            console.error('Housing Service Error', err);
            return [];
        }
    },

    saveListing: async (listing) => {
        await fetch(`${API_URLS.HOUSING}/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(listing)
        });
        return listing;
    },

    // --- BOOKINGS (BOOKING SERVICE) ---
    saveBooking: async (booking) => {
        try {
            const user = db.getCurrentUser();
            if (user) booking.userId = user.id || user.email; // Ensure ID is passed

            await fetch(`${API_URLS.BOOKING}/bookings`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(booking)
            });
            return booking;
        } catch (err) {
            console.error('Booking Service Error', err);
            return booking;
        }
    }
};

// Expose legacy seed functions as no-ops or simple mocks if needed by app.js to prevent crash
// In a real migration, we would remove usage of these in app.js
db.seedAll = () => console.log('Seeding handled by Microservices DBs'); 
