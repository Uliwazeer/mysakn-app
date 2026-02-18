/**
 * MySakn Application Entry Point
 * Consolidates all logic for navigation, search, and user interactions.
 * Dependencies: db.js (Loaded first in HTML)
 */

// Data Source for MySakn - Organized by Governorate & Role
const locationData = {
    cairo: {
        student: {
            "Cairo University": "Giza/Dokki",
            "Ain Shams University": "Abbassia",
            "Al-Azhar University": "Nasr City",
            "American University (AUC)": "New Cairo",
            "German University (GUC)": "New Cairo",
            "Future University (FUE)": "New Cairo",
            "British University (BUE)": "El Shorouk",
            "Modern Academy": "Maadi",
            "Misr International University (MIU)": "Ismailia Desert Rd"
        },
        medical: {
            "Kasr Al Ainy Hospital": "Manial",
            "Demerdash Hospital": "Abbassia",
            "New Cairo Hospital": "Tagamoa",
            "As-Salam International": "Maadi"
        },
        employee: {
            "Smart Village": "6th October",
            "Fifth Settlement (Banks/HQ)": "New Cairo",
            "Maadi Degla (Tech Hub)": "Maadi",
            "Downtown Business Dist.": "Center"
        }
    },
    giza: {
        student: {
            "Cairo University": "Giza",
            "October 6 University (O6U)": "6th of October",
            "Misr Univ. for Sci & Tech (MUST)": "6th of October",
            "Modern Sci & Arts (MSA)": "6th of October",
            "Nile University": "Sheikh Zayed",
            "New Giza University (NGU)": "New Giza",
            "Zewail City": "October Gardens",
            "Ahram Canadian University (ACU)": "6th of October"
        },
        medical: {
            "Sheikh Zayed Specialized": "Zayed",
            "Dar Al Fouad": "6th October",
            "October 6 University Hospital": "6th October"
        },
        employee: {
            "Smart Village (Phase 2)": "Zayed/October",
            "Industrial Zone": "6th October",
            "Media Production City": "6th October"
        }
    },
    qalyubia: {
        student: {
            "Benha University": "Benha",
            "Higher Technological Institute": "10th of Ramadan",
            "Obour High Institute": "Obour City"
        },
        medical: {
            "Benha University Hospital": "Benha",
            "Obour Central Hospital": "Obour"
        },
        employee: {
            "Obour Industrial City": "Obour",
            "Qalyubia Tech Hub": "Benha"
        }
    },
    alexandria: {
        student: {
            "Alexandria University": "Shatby/Smouha",
            "Pharos University (PUA)": "Smouha",
            "Arab Academy (AAST)": "Abu Qir",
            "Senghor University": "Mansheya"
        },
        medical: {
            "Alexandria Main Hospital": "Azarita",
            "Smouha Medical City": "Smouha",
            "Mowassat Hospital": "Hadara"
        },
        employee: {
            "Borg El Arab Tech Park": "Borg Arab",
            "Alexandria Port Auth.": "Downtown",
            "Smouha Business District": "Smouha"
        }
    },
    dakahlia: {
        student: {
            "Mansoura University": "Mansoura",
            "Delta University": "Gamasa",
            "Horus University": "Damietta Rd"
        },
        medical: {
            "Mansoura Urology Center": "Mansoura",
            "Emergency Hospital": "Mansoura"
        },
        employee: {
            "Mansoura Business Dist.": "Mansoura",
            "Gamasa Industrial": "Gamasa"
        }
    }
};

let currentSearchMode = 'student';

// Update Search Locations based on Governorate & Mode
function updateLocationOptions() {
    const gov = document.getElementById('governorateSelect').value;
    const locSelect = document.getElementById('locationSelect');

    // Reset components
    locSelect.innerHTML = `<option value="" disabled selected>Select Area / Institution...</option>`;

    if (!gov) {
        locSelect.innerHTML = `<option value="" disabled selected>Select Governorate First...</option>`;
        return;
    }

    if (locationData[gov] && locationData[gov][currentSearchMode]) {
        const options = locationData[gov][currentSearchMode];
        for (const [name, area] of Object.entries(options)) {
            const opt = document.createElement('option');
            opt.value = name;
            opt.textContent = `${name} (${area})`;
            locSelect.appendChild(opt);
        }
    } else {
        locSelect.innerHTML = `<option value="" disabled selected>No locations found for this selection.</option>`;
    }
}

// Ensure University/Location is picked before Budget
function handleBudgetInteraction(e) {
    const loc = document.getElementById('locationSelect').value;
    if (!loc) {
        e.preventDefault(); // Stop dropdown from opening
        alert("Select Governorate First");
    }
}

// Set Search Mode (Student, Medical, Employee)
function setSearchMode(mode, btn) {
    currentSearchMode = mode;

    // Update active tab UI
    const tabs = document.querySelectorAll('.search-tabs .tab');
    tabs.forEach(t => t.classList.remove('active'));
    btn.classList.add('active');

    // Update labels and icons dynamically
    const locLabel = document.getElementById('locationLabel');
    const locIcon = document.getElementById('locationIcon');

    if (mode === 'student') {
        locLabel.textContent = "UNIVERSITY / INSTITUTE";
        locIcon.textContent = "school";
    } else if (mode === 'medical') {
        locLabel.textContent = "HOSPITAL / NIYABAT";
        locIcon.textContent = "local_hospital";
    } else if (mode === 'employee') {
        locLabel.textContent = "WORK ZONE / COMPANY";
        locIcon.textContent = "business";
    }

    // Trigger update to refresh the location select list
    updateLocationOptions();
}


// Initialize
document.addEventListener('DOMContentLoaded', () => {
    // Check session
    checkUserSession();

    // Initial UI state for search
    const user = db.getCurrentUser();
    if (user && user.gender && document.getElementById('genderFilter')) {
        document.getElementById('genderFilter').value = user.gender;
    }

    const activeTab = document.querySelector('.search-tabs .tab.active');
    if (activeTab && activeTab.dataset.mode) {
        setSearchMode(activeTab.dataset.mode, activeTab);
    } else {
        const defaultTab = document.querySelector('.search-tabs .tab[onclick*="student"]');
        if (defaultTab) {
            setSearchMode('student', defaultTab);
        }
    }

    // Event Delegation for Wishlist
    document.addEventListener('click', (e) => {
        if (e.target.closest('.wishlist-btn')) {
            const btn = e.target.closest('.wishlist-btn');
            btn.classList.toggle('active');
            const icon = btn.querySelector('i');
            icon.textContent = btn.classList.contains('active') ? 'favorite' : 'favorite_border';
        }
    });

    // Auth buttons are handled statically in HTML
});

// Modal Logic
function toggleModal(id) {
    const modal = document.getElementById(id);
    if (modal) {
        modal.classList.toggle('active');
        // Prevent body scroll when modal is open
        document.body.style.overflow = modal.classList.contains('active') ? 'hidden' : '';
    }
}

function switchModal(closeId, openId) {
    toggleModal(closeId);
    setTimeout(() => toggleModal(openId), 200);
}

// --- Authentication Handlers ---
let selectedRole = 'student'; // Global to track role

function setRole(role, btn, isSignup) {
    selectedRole = role;
    const parent = btn.parentElement;
    parent.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');

    if (isSignup) {
        const container = document.getElementById('roleSpecificFields');
        let html = '';
        if (role === 'student') {
            html = `
                <div class="form-group">
                    <label>Student Status</label>
                    <select id="signupStudentStatus" onchange="toggleUniFields(this.value)">
                        <option value="student">Active Student</option>
                        <option value="non-student">Non-Student (Employee/Staff)</option>
                    </select>
                </div>
                <div id="uniFields">
                    <div class="form-group">
                        <label>Select Governorate of Study</label>
                        <select id="signupStudyGov" onchange="updateSignupUniOptions(this.value)" required>
                            <option value="" disabled selected>Select...</option>
                            <option value="cairo">Cairo</option>
                            <option value="giza">Giza</option>
                            <option value="qalyubia">Qalyubia</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>University / Collage</label>
                        <select id="signupUniv" required>
                            <option value="" disabled selected>Select Governorate First...</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label>University Email (.edu.eg)</label>
                        <input type="email" id="signupUniEmail" placeholder="yourname@domain.edu.eg" required>
                        <p style="font-size: 11px; color: #ef4444;" id="uniEmailError"></p>
                    </div>
                </div>
                <div class="form-group">
                    <label>Purpose of Stay</label>
                    <select id="signupPurpose" required>
                        <option value="study">Studying / Education</option>
                        <option value="work">Working / Employee</option>
                        <option value="medical">Medical Training</option>
                    </select>
                </div>
            `;
        } else if (role === 'landlord' || role === 'broker') {
            html = `
                <div class="form-group">
                    <label>${role === 'landlord' ? 'Property Address' : 'Agency Name'}</label>
                    <input type="text" id="roleInfo1" placeholder="..." required>
                </div>
                <div class="form-group">
                    <label>District / Area</label>
                    <input type="text" id="roleInfo2" placeholder="..." required>
                </div>
            `;
        }
        container.innerHTML = html;
    }
}

function updateSignupUniOptions(gov) {
    const uniSelect = document.getElementById('signupUniv');
    uniSelect.innerHTML = '<option value="" disabled selected>Select University...</option>';
    if (locationData[gov] && locationData[gov].student) {
        Object.keys(locationData[gov].student).forEach(uni => {
            const opt = document.createElement('option');
            opt.value = uni;
            opt.textContent = uni;
            uniSelect.appendChild(opt);
        });
    }
}

function toggleUniFields(val) {
    const fields = document.getElementById('uniFields');
    if (val === 'non-student') {
        fields.style.display = 'none';
        document.getElementById('signupStudyGov').required = false;
        document.getElementById('signupUniv').required = false;
        document.getElementById('signupUniEmail').required = false;
    } else {
        fields.style.display = 'block';
        document.getElementById('signupStudyGov').required = true;
        document.getElementById('signupUniv').required = true;
        document.getElementById('signupUniEmail').required = true;
    }
}

function togglePaymentDetails() {
    const payment = document.querySelector('input[name="signupPayment"]:checked').value;
    const details = document.getElementById('paymentDetailsFields');
    if (payment === 'visa' || payment === 'mastercard') {
        details.style.display = 'block';
    } else {
        details.style.display = 'none';
    }
}

function handleSignup(e) {
    if (e) e.preventDefault();
    console.log('🚀 --- SIGNUP INITIATED ---');

    try {
        const getVal = (id) => {
            const el = document.getElementById(id);
            return el ? el.value : '';
        };

        const genderEl = document.querySelector('input[name="gender"]:checked');
        const paymentEl = document.querySelector('input[name="signupPayment"]:checked');

        const userData = {
            name: getVal('signupName'),
            age: parseInt(getVal('signupAge')) || 0,
            email: getVal('signupEmail'),
            homeGov: getVal('signupHomeGov'),
            password: getVal('signupPass'),
            role: selectedRole || 'student',
            gender: genderEl ? genderEl.value : 'male',
            paymentMethod: paymentEl ? paymentEl.value : 'visa',
            createdAt: new Date().toISOString()
        };

        console.log('📦 Data preview:', userData);

        if (!userData.name || !userData.email || !userData.password) {
            console.error('❌ VALIDATION ERROR: Required fields missing');
            alert('Please fill in your Name, Email, and Password.');
            return;
        }

        // Role Specific Logic (Safe)
        if (userData.role === 'student') {
            const statusEl = document.getElementById('signupStudentStatus');
            if (statusEl) {
                userData.studentStatus = statusEl.value;
                userData.purpose = getVal('signupPurpose');

                if (userData.studentStatus === 'student') {
                    const uniEmail = getVal('signupUniEmail');
                    if (uniEmail && !uniEmail.toLowerCase().endsWith('.edu.eg')) {
                        console.warn('⚠️ Invalid Uni Email format');
                        alert("For verified status, please use your .edu.eg email.");
                    }
                    userData.uniEmail = uniEmail;
                    userData.university = getVal('signupUniv');
                    userData.studyGov = getVal('signupStudyGov');
                }
            }
        } else if (userData.role === 'landlord' || userData.role === 'broker') {
            userData.roleInfo1 = getVal('roleInfo1');
            userData.roleInfo2 = getVal('roleInfo2');
        }

        console.log('📡 Sending to db.saveUser...');
        console.table(userData);

        db.saveUser(userData).then(result => {
            if (result.error) {
                console.error('🌩️ DB ERROR:', result.error);
                alert("Signup Failed: " + result.error);
            } else {
                console.log('✅ SIGNUP SUCCESS:', result.user);
                alert(`Welcome ${userData.name}! Your account is ready.`);
                window.location.reload();
            }
        }).catch(err => {
            console.error('🔥 CRITICAL FETCH ERROR:', err);
            alert("Network Error: " + err.message);
        });

    } catch (err) {
        console.error('💥 JS EXECUTION CRASH:', err);
        alert('An internal error occurred: ' + err.message);
    }
}

// Ensure clean startup state (No logged in user)
function ensureCleanStartup() {
    if (!sessionStorage.getItem('mysakn_session_initialized')) {
        console.log('🧹 Initializing clean startup state...');
        db.clearSession();
        sessionStorage.setItem('mysakn_session_initialized', 'true');
    }
}

async function testConnection(btn) {
    const statusEl = document.getElementById('connStatus');
    statusEl.innerHTML = '<span style="color:orange">Testing...</span>';
    const status = await db.apiPing();
    if (status === 200 || status === 401) { // 401 means reached service but no token
        statusEl.innerHTML = '<span style="color:green">Online ✅</span>';
    } else {
        statusEl.innerHTML = '<span style="color:red">Offline ❌</span>';
    }
}
function handleLogin(e) {
    if (e) e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPass').value;

    db.login(email, password).then(user => {
        if (user) {
            alert(`Welcome back, ${user.name}!`);
            window.location.reload();
        } else {
            alert("Invalid email or password. Please try again.");
        }
    }).catch(err => alert("Login Failed: " + err));
}

function checkUserSession() {
    const user = db.getCurrentUser();
    const navAuth = document.querySelector('.nav-auth');
    if (user && navAuth) {
        const avatarHtml = user.profilePic
            ? `<img src="${user.profilePic}" style="width: 24px; height: 24px; border-radius: 50%; object-fit: cover;">`
            : `<i class="material-icons-round" style="font-size: 18px;">account_circle</i>`;

        navAuth.innerHTML = `
            <div class="user-profile-nav">
                <a href="profile.html" class="user-name" style="text-decoration: none; display: flex; align-items: center; gap: 8px;">
                    ${avatarHtml}
                    Hi, ${user.name.split(' ')[0]}
                </a>
                <button class="btn btn-outline" onclick="db.logout()">Logout</button>
            </div>
        `;
    }
}


// Booking Logic
let currentBooking = {
    listingName: "",
    basePrice: 0
};

function openBookingModal(listingName, basePrice) {
    currentBooking.listingName = listingName;
    currentBooking.basePrice = basePrice;

    document.getElementById('bookingListingName').textContent = listingName;
    document.getElementById('housingType').value = 'shared'; // Reset
    document.querySelector('input[name="paymentPlan"][value="deposit"]').checked = true; // Reset

    updateBookingPrice();
    toggleModal('bookingModal');
}

function updateBookingPrice() {
    const type = document.getElementById('housingType').value;
    const plan = document.querySelector('input[name="paymentPlan"]:checked').value;

    let extra = 0;
    if (type === 'private') extra = 200;
    else if (type === 'studio') extra = 500;

    const basePrice = currentBooking.basePrice;

    document.getElementById('basePriceAmount').textContent = basePrice.toLocaleString() + ' EGP';
    document.getElementById('housingExtraAmount').textContent = extra.toLocaleString() + ' EGP';

    let total = 0;
    if (plan === 'full') {
        total = basePrice + extra;
    } else {
        total = 400; // Standard Viewing Deposit
    }

    document.getElementById('bookingTotalPrice').textContent = Math.round(total).toLocaleString() + ' EGP';
}

function handleBookingSubmit() {
    const visitDate = document.getElementById('visitDate').value;
    const visitTime = document.getElementById('visitTime').value;
    const moveInDate = document.getElementById('moveInDate').value;
    const housingType = document.getElementById('housingType').value;
    const residentCount = document.getElementById('residentCount').value;
    const paymentPlan = document.querySelector('input[name="paymentPlan"]:checked').value;
    const paymentMethod = document.querySelector('input[name="bookingPayment"]:checked').value;
    const totalRaw = document.getElementById('bookingTotalPrice').textContent;
    const price = parseFloat(totalRaw.replace(/[^0-9.]/g, ''));

    // Auth Guard
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        alert("Please login to complete booking.");
        return;
    }

    const bookingData = {
        listingTitle: currentBooking.listingName,
        price: price,
        visitDate,
        visitTime,
        moveInDate,
        housingType,
        residentCount,
        paymentPlan,
        paymentMethod,
        status: 'pending',
        date: new Date().toISOString(),
        customerEmail: currentUser.email
    };

    db.saveBooking(bookingData).then(() => {
        alert(`Reservation Request Sent!\n` +
            `Listing: ${currentBooking.listingName}\n` +
            `Total Due Now: ${totalRaw}\n` +
            `Type: ${housingType.toUpperCase()}\n` +
            `Status: Pending Approval\n\n` +
            `The host will review your request and contact you shortly.`);

        toggleModal('bookingModal');
    }).catch(err => alert("Booking Failed: " + err));
}
// Hero Search Redirect Function
function handleHeroSearch() {
    const gov = document.getElementById('governorateSelect').value;
    const loc = document.getElementById('locationSelect').value;
    const budget = document.getElementById('budgetFilter').value;

    // Auth Guard First: Redirect to signup if not logged in
    const currentUser = db.getCurrentUser();
    if (!currentUser) {
        toggleModal('signupModal');
        return;
    }

    const gender = currentUser.gender || 'any';

    if (!gov) {
        alert("Select Governorate First");
        return;
    }

    let url = `university_zone.html?gov=${encodeURIComponent(gov)}&mode=${currentSearchMode}&budget=${budget}&gender=${gender}`;
    if (loc) url += `&loc=${encodeURIComponent(loc)}`;

    window.location.href = url;
}

// Protected Navigation for University Zones
function handleUnivZoneNav() {
    const user = db.getCurrentUser();
    if (!user) {
        toggleModal('signupModal');
        return;
    }

    // Check if on Home Page and have a selection
    const govSelect = document.getElementById('governorateSelect');
    if (govSelect) {
        const gov = govSelect.value;
        if (!gov) {
            alert("Please select your target University/Area from the Search Home first");
            return;
        }
        handleHeroSearch();
    } else {
        // If on other pages, check if we have any stored search (simulated) or just go to default
        // For simplicity, if not on home, we just go to a default or ask them to go home
        const confirmGoHome = confirm("To view your specific zone, please make a selection on the Home page. Would you like to go to the Home page?");
        if (confirmGoHome) window.location.href = 'index.html';
    }
}

// Protected Navigation for Dashboard
function handleDashboardNav() {
    const user = db.getCurrentUser();
    if (!user) {
        toggleModal('signupModal');
        return;
    }
    window.location.href = 'dashboard.html';
}

// Initializers
document.addEventListener('DOMContentLoaded', () => {
    console.log('--- MySakn Frontend Bootstrapped ---');

    // Clean startup logic
    ensureCleanStartup();

    // Initialize signup form with default role (student)
    const signupBtn = document.querySelector('.role-btn.active');
    if (signupBtn) {
        setRole('student', signupBtn, true);
    }

    // Load session info
    checkUserSession();
});
