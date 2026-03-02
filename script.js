/* --- 1. DATA APLIKACE --- */
const placesData = [
    { id: 1, name: "Prachovské skály", location: "krkonose", difficulty: "medium", type: "nature", desc: "Skalní město v Českém ráji. Ideální pro rodiny i turisty.", img: "https://prachovskeskaly.com/images/podzim/image05.jpg", mapsLink: "https://www.google.com/maps/search/?api=1&query=Prachovské+skály" },
    { id: 2, name: "Vyšehrad", location: "praha", difficulty: "easy", type: "landmark", desc: "Historické hradiště v Praze s výhledem na Vltavu.", img: "https://files.praha-vysehrad.cz/4eqcs3aimj06/optimized/alter4.jpg", mapsLink: "https://www.google.com/maps/search/?api=1&query=Vyšehrad" },
    { id: 3, name: "Pálava - Děvín", location: "jizni-morava", difficulty: "medium", type: "nature", desc: "Vápencové bradlo na jihu Moravy.", img: "https://cdn.kudyznudy.cz/files/32/32ebf5a1-89b7-4377-adc7-9f546aba3ed4.jpg?v=20250301060701", mapsLink: "https://www.google.com/maps/search/?api=1&query=Děvín+Pálava" },
    { id: 4, name: "Sněžka", location: "krkonose", difficulty: "hard", type: "view", desc: "Nejvyšší hora ČR. Náročný výšlap.", img: "https://media.istockphoto.com/id/526035879/photo/snezka-in-sunrise.jpg?s=612x612&w=0&k=20&c=tEf070zS0l98SZNISJ58o-xjJeip_Ol1x0jsjxnpE4M=", mapsLink: "https://www.google.com/maps/search/?api=1&query=Sněžka" },
    { id: 5, name: "Jezerní slať", location: "sumava", difficulty: "easy", type: "nature", desc: "Rašeliniště s vyhlídkovou věží na Šumavě.", img: "https://www.npsumava.cz/wp-content/uploads/2019/08/jezerni-slat.jpg", mapsLink: "https://www.google.com/maps/search/?api=1&query=Jezerní+slať" },
    { id: 6, name: "Lom Velká Amerika", location: "stredni-cechy", difficulty: "easy", type: "view", desc: "Český Grand Canyon nedaleko Karlštejna.", img: "https://d34-a.sdn.cz/d_34/c_img_QL_q/O1GI6T.jpeg?fl=res,400,225,3", mapsLink: "https://www.google.com/maps/search/?api=1&query=Lom+Velká+Amerika" }
];

/* --- 2. GLOBAL STATE (STAV APLIKACE) --- */
let currentUser = JSON.parse(localStorage.getItem('currentUser'));
let usersDB = JSON.parse(localStorage.getItem('usersDB')) || [];

/* --- 3. INITIALIZATION & DARK MODE --- */
window.onload = () => {
    initDarkMode();
    updateAuthUI();
};

function initDarkMode() {
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('dark-mode');
        document.getElementById('dark-mode-btn').textContent = "☀️";
    }
}

function toggleDarkMode() {
    document.body.classList.toggle('dark-mode');
    const btn = document.getElementById('dark-mode-btn');
    if (document.body.classList.contains('dark-mode')) {
        localStorage.setItem('darkMode', 'enabled');
        btn.textContent = "☀️";
    } else {
        localStorage.setItem('darkMode', 'disabled');
        btn.textContent = "🌙";
    }
}

/* --- 4. AUTHENTICATION LOGIC --- */
function updateAuthUI() {
    const loggedOut = document.getElementById('logged-out-view');
    const loggedIn = document.getElementById('logged-in-view');
    const nameSpan = document.getElementById('user-display-name');

    if (currentUser) {
        loggedOut.style.display = 'none';
        loggedIn.style.display = 'flex'; // Flex pro řádkování
        nameSpan.textContent = `👤 ${currentUser.username}`;
    } else {
        loggedOut.style.display = 'block';
        loggedIn.style.display = 'none';
    }
    filterPlaces(); // Překreslí grid (aktualizuje srdíčka a hvězdičky)
}

function performRegister() {
    const name = document.getElementById('reg-username').value.trim();
    const pass = document.getElementById('reg-password').value.trim();
    
    if (!name || !pass) return alert("❌ Vyplň prosím všechna pole!");
    if (usersDB.find(u => u.username === name)) return alert("⚠️ Uživatel s tímto jménem už existuje!");

    // Inicializace nového uživatele s prázdnými poli pro data
    const newUser = { 
        username: name, 
        password: pass, 
        favorites: [], 
        ratings: {},      // { placeId: 5, ... }
        textReviews: {}   // { placeId: "Bylo to super", ... }
    };
    
    usersDB.push(newUser);
    saveDB();
    alert("✅ Registrace úspěšná! Nyní se přihlas.");
    switchAuthForm('login');
}

function performLogin() {
    const name = document.getElementById('login-username').value.trim();
    const pass = document.getElementById('login-password').value.trim();
    const foundUser = usersDB.find(u => u.username === name && u.password === pass);

    if (foundUser) {
        currentUser = foundUser;
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        closeAllModals();
        updateAuthUI();
        // Toast notification by byla lepší, ale alert stačí
    } else {
        alert("❌ Chybné jméno nebo heslo!");
    }
}

function logoutUser() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    showOnlyFavorites = false; // Reset filtru
    updateAuthUI();
}

function saveDB() {
    localStorage.setItem('usersDB', JSON.stringify(usersDB));
    if (currentUser) {
        // Musíme aktualizovat i currentUser v localStorage, aby byl sync
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
    }
}

/* --- 5. CORE FEATURES (Favorites, Ratings, Reviews) --- */

// A. OBLÍBENÉ
function toggleFavorite(id) {
    if (!currentUser) return openModal('login'); // Nepřihlášený -> Login okno

    // Najdeme index v DB pro trvalé uložení
    const idx = usersDB.findIndex(u => u.username === currentUser.username);
    const user = usersDB[idx];

    if (user.favorites.includes(id)) {
        user.favorites = user.favorites.filter(fid => fid !== id);
    } else {
        user.favorites.push(id);
    }

    // Aktualizujeme stav v paměti i v DB
    usersDB[idx] = user;
    currentUser = user; 
    saveDB();
    filterPlaces(); // Překreslit (změní barvu srdíčka)
}

// B. HODNOCENÍ (HVĚZDIČKY)
function ratePlace(placeId, starCount) {
    if (!currentUser) return openModal('login');

    const idx = usersDB.findIndex(u => u.username === currentUser.username);
    // Pojistka, kdyby user neměl objekt ratings (stará verze dat)
    if (!usersDB[idx].ratings) usersDB[idx].ratings = {};
    
    usersDB[idx].ratings[placeId] = starCount;
    
    currentUser = usersDB[idx];
    saveDB();
    filterPlaces(); // Překreslit hvězdy
}

// Funkce pro výpočet průměru všech uživatelů
function getAverageRating(placeId) {
    let sum = 0;
    let count = 0;
    
    usersDB.forEach(u => {
        if (u.ratings && u.ratings[placeId]) {
            sum += u.ratings[placeId];
            count++;
        }
    });

    if (count === 0) return 0;
    return (sum / count).toFixed(1); // Např. "4.5"
}

// C. RECENZE (SOCIAL)
let currentReviewPlaceId = null;

function openReviewModal(placeId) {
    currentReviewPlaceId = placeId;
    const place = placesData.find(p => p.id === placeId);
    
    document.getElementById('review-modal-title').textContent = `Recenze: ${place.name}`;
    document.getElementById('review-modal').style.display = 'block';
    
    renderReviewsInModal(placeId);
}

function submitReview() {
    if (!currentUser) { alert("Pro napsání recenze se přihlas."); return openModal('login'); }
    
    const text = document.getElementById('review-text').value.trim();
    if (!text) return alert("Napiš alespoň něco!");

    const idx = usersDB.findIndex(u => u.username === currentUser.username);
    if (!usersDB[idx].textReviews) usersDB[idx].textReviews = {};

    usersDB[idx].textReviews[currentReviewPlaceId] = text;
    
    currentUser = usersDB[idx];
    saveDB();
    
    document.getElementById('review-text').value = ""; // Vymazat pole
    renderReviewsInModal(currentReviewPlaceId); // Aktualizovat seznam
}

function renderReviewsInModal(placeId) {
    const container = document.getElementById('reviews-container');
    container.innerHTML = "";
    
    let hasReviews = false;

    usersDB.forEach(user => {
        if (user.textReviews && user.textReviews[placeId]) {
            hasReviews = true;
            // Zjistíme, kolik dal hvězd, pro kontext
            const userStars = (user.ratings && user.ratings[placeId]) ? "⭐".repeat(user.ratings[placeId]) : "";
            
            const html = `
                <div class="review-item">
                    <div class="review-header">
                        <span class="review-user">${user.username}</span>
                        <span class="review-stars">${userStars}</span>
                    </div>
                    <div class="review-text">"${user.textReviews[placeId]}"</div>
                </div>
            `;
            container.innerHTML += html;
        }
    });

    if (!hasReviews) {
        container.innerHTML = "<p class='no-reviews'>Zatím žádné recenze. Buď první! ✍️</p>";
    }
}

/* --- 6. RENDERING & FILTERS --- */
let showOnlyFavorites = false;

function filterMyFavorites() {
    if (!currentUser) return alert("Přihlas se!");
    showOnlyFavorites = !showOnlyFavorites;
    
    const btn = document.querySelector('.btn-my-favs');
    if (showOnlyFavorites) {
        btn.textContent = "❌ Zobrazit vše";
        btn.style.background = "#333";
    } else {
        btn.textContent = "❤️ Oblíbené";
        btn.style.background = ""; // Reset na CSS default
    }
    filterPlaces();
}

function renderPlaces(data) {
    const container = document.getElementById('places-grid');
    container.innerHTML = "";

    if (data.length === 0) {
        container.innerHTML = "<div style='grid-column: 1/-1; text-align:center; padding: 40px;'><h3>😔 Žádné místo nenalezeno.</h3><p>Zkus změnit filtry.</p></div>";
        return;
    }

    data.forEach(place => {
        // A. Zjištění stavu pro aktuálního uživatele
        const isFav = currentUser && currentUser.favorites && currentUser.favorites.includes(place.id);
        const userRating = (currentUser && currentUser.ratings && currentUser.ratings[place.id]) ? currentUser.ratings[place.id] : 0;
        
        // B. Výpočet průměru
        const avgRating = getAverageRating(place.id);
        const avgText = avgRating > 0 ? `(Průměr: ${avgRating})` : "";

        // C. Generování hvězdiček
        let starsHTML = '';
        for (let i = 1; i <= 5; i++) {
            const filledClass = i <= userRating ? 'filled' : '';
            starsHTML += `<span class="star ${filledClass}" onclick="ratePlace(${place.id}, ${i})">★</span>`;
        }

        // D. Překlad náročnosti
        const diffLabels = { 'easy': 'Lehká', 'medium': 'Střední', 'hard': 'Těžká' };
        
        const cardHTML = `
            <div class="card">
                <div class="img-wrapper">
                    <div class="card-img" style="background-image: url('${place.img}')"></div>
                </div>
                <div class="card-content">
                    <div class="card-header">
                        <h3>${place.name}</h3>
                        <button class="btn-fav ${isFav ? 'active' : ''}" onclick="toggleFavorite(${place.id})" title="Přidat do oblíbených">${isFav ? '❤️' : '🤍'}</button>
                    </div>
                    
                    <div class="location">📍 ${formatLocation(place.location)}</div>

                    <div class="rating-stars" title="Tvé hodnocení">${starsHTML} <span class="rating-info">${avgText}</span></div>

                    <div class="tags"><span class="tag ${place.difficulty}">${diffLabels[place.difficulty]}</span></div>
                    
                    <p class="desc">${place.desc}</p>
                    
                    <div class="card-actions">
                        <button onclick="openReviewModal(${place.id})" class="btn-reviews">💬 Recenze</button>
                        <a href="${place.mapsLink}" target="_blank" rel="noopener noreferrer" class="btn-map">🗺️ Mapa</a>
                    </div>
                </div>
            </div>
        `;
        container.innerHTML += cardHTML;
    });
}

function filterPlaces() {
    const loc = document.getElementById('filter-location').value;
    const diff = document.getElementById('filter-difficulty').value;
    const type = document.getElementById('filter-type').value;
    const search = document.getElementById('search-input').value.toLowerCase();

    const filtered = placesData.filter(p => {
        const mLoc = loc === 'all' || p.location === loc;
        const mDiff = diff === 'all' || p.difficulty === diff;
        const mType = type === 'all' || p.type === type;
        const mSearch = p.name.toLowerCase().includes(search);
        
        // Pokud je zapnutý filtr oblíbených, kontrolujeme i to
        const mFav = showOnlyFavorites ? (currentUser && currentUser.favorites.includes(p.id)) : true;
        
        return mLoc && mDiff && mType && mSearch && mFav;
    });
    renderPlaces(filtered);
}

function formatLocation(loc) {
    const names = { 'praha': 'Praha a okolí', 'stredni-cechy': 'Střední Čechy', 'jizni-morava': 'Jižní Morava', 'krkonose': 'Krkonoše', 'sumava': 'Šumava' };
    return names[loc] || loc;
}

/* --- 7. MODAL CONTROL --- */
function openModal(type) { 
    document.getElementById('auth-modal').style.display = 'block'; 
    switchAuthForm(type); 
}
function closeAllModals() { 
    document.getElementById('auth-modal').style.display = 'none'; 
    document.getElementById('review-modal').style.display = 'none'; 
}
function switchAuthForm(type) {
    document.getElementById('login-form').style.display = type === 'login' ? 'block' : 'none';
    document.getElementById('register-form').style.display = type === 'register' ? 'block' : 'none';
}
// Kliknutí mimo okno zavře modal
window.onclick = (e) => { 
    if (e.target.classList.contains('modal')) closeAllModals(); 
};