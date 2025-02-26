const priceContainer = document.getElementById('price-container');
const favoritesContainer = document.getElementById('favorites-container');
const darkModeToggle = document.getElementById('dark-mode-toggle');
const searchInput = document.getElementById('search-input');
const suggestionsList = document.getElementById('suggestions-list');
const messageContainer = document.getElementById('message-container');

let allCryptos = [];  // Store all cryptocurrencies from Coinbase

// --- Dark Mode Logic ---
function setDarkMode(isDark) {
    if (isDark) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', isDark ? 'enabled' : 'disabled'); // Store preference
}

// Initialize Dark Mode
function initializeDarkMode() {
    const savedDarkMode = localStorage.getItem('darkMode');
    if (savedDarkMode === 'enabled') {
        setDarkMode(true);
    } else if (savedDarkMode === 'disabled') {
        setDarkMode(false);
    } else if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
        setDarkMode(true);
    }
}

darkModeToggle.addEventListener('click', () => {
    const isDark = document.documentElement.classList.contains('dark');
    setDarkMode(!isDark);
});

// --- Crypto Price and List Fetching ---
async function fetchCryptoPrice(cryptoCode) {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-USD/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode} price:`, error);
        showMessage(`Error fetching price for ${cryptoCode}.`);
        return null;
    }
}

async function fetchAllCryptos() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/currencies');
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            allCryptos = data.data.map(crypto => ({
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.id // Using ID as symbol (Coinbase uses ID)
            }));
        } else {
            throw new Error('Invalid response for currencies');
        }
    } catch (error) {
        console.error('Error fetching all cryptocurrencies:', error);
        showMessage('Error fetching cryptocurrency list.');
    }
}


// --- UI Update Functions ---

async function createCryptoCard(code, isFavorite = false) {
    const price = await fetchCryptoPrice(code);

    const card = document.createElement('div');
    card.classList.add(isFavorite ? 'crypto-favorite' : 'crypto-price'); // Different class for favorites
    card.dataset.cryptoCode = code;

    const title = document.createElement('h2');
    title.textContent = code;
    card.appendChild(title);

    const priceElement = document.createElement('p');
    priceElement.textContent = price !== null ? `$${price}` : 'N/A';
    card.appendChild(priceElement);

    const button = document.createElement('button');
    if (isFavorite) {
        button.innerHTML = '<i class="fas fa-star"></i>';
        button.classList.add('remove-favorite-button');
        button.addEventListener('click', () => toggleFavorite(code, button));

    } else {
        button.innerHTML = '<i class="far fa-star"></i>'; // Use regular star for non-favorites
        button.classList.add('add-favorite-button');
        button.addEventListener('click', () => toggleFavorite(code, button));

    }
    card.appendChild(button);

    // Add remove button only to tracked (not favorites)
    if (!isFavorite) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => removeCrypto(code));
        card.appendChild(removeButton);
    }


    return card;
}

async function displayPrices() {
    priceContainer.innerHTML = '';
    const trackedCryptos = getTrackedCryptos();

    for (const code of trackedCryptos) {
        const card = await createCryptoCard(code);
        priceContainer.appendChild(card);
    }
}
async function displayFavorites() {
    favoritesContainer.innerHTML = '';
    const favoriteCryptos = getFavorites();

    for (const code of favoriteCryptos) {
        const card = await createCryptoCard(code, true); // isFavorite = true
        favoritesContainer.appendChild(card);
    }
}
// Show message
function showMessage(message) {
    messageContainer.textContent = message;
    messageContainer.style.display = 'block'; // Ensure it's visible
    // Hide the message after 5 seconds
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}
// --- Favorites Management ---

function getFavorites() {
    const stored = localStorage.getItem('favoriteCryptos');
    return stored ? JSON.parse(stored) : [];
}

function isFavorite(code) {
    return getFavorites().includes(code);
}

function addFavorite(code) {
    const favorites = getFavorites();
    if (!favorites.includes(code)) {
        favorites.push(code);
        localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
    }
}

function removeFavorite(code) {
    let favorites = getFavorites();
    favorites = favorites.filter(c => c !== code);
    localStorage.setItem('favoriteCryptos', JSON.stringify(favorites));
}

function toggleFavorite(code, button) {
    if (isFavorite(code)) {
        removeFavorite(code);
        button.innerHTML = '<i class="far fa-star"></i>'; // Change to outline star
          // If it's in the favorites section, remove the card
        const favoriteCard = favoritesContainer.querySelector(`[data-crypto-code="${code}"]`);
        if (favoriteCard) {
            favoriteCard.remove();
        }
        //Update button on price container.
        const priceCardButton = priceContainer.querySelector(`[data-crypto-code="${code}"] .add-favorite-button`);

        if(priceCardButton) {
            priceCardButton.innerHTML = '<i class="far fa-star"></i>'
        }


    } else {
        addFavorite(code);
        button.innerHTML = '<i class="fas fa-star"></i>'; // Change to solid star
         // If it's not in the favorites section, add the card
        displayFavorites()
        const priceCardButton = priceContainer.querySelector(`[data-crypto-code="${code}"] .add-favorite-button`);
        if(priceCardButton) {
          priceCardButton.innerHTML = '<i class="fas fa-star"></i>'
        }
    }

}


// --- Local Storage Management (for Tracked Cryptos - separate from favorites) ---
function getTrackedCryptos() {
    const stored = localStorage.getItem('trackedCryptos');
    return stored ? JSON.parse(stored) : ['TOSHI','BTC', 'ETH', 'ALGO']; // Default cryptos
}

function addCryptoToTracking(code) {
    const trackedCryptos = getTrackedCryptos();
    if (!trackedCryptos.includes(code)) { // Prevent duplicates
        trackedCryptos.push(code);
        localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
    }
}

function removeCrypto(code) {
    let trackedCryptos = getTrackedCryptos();
    trackedCryptos = trackedCryptos.filter(c => c !== code);
    localStorage.setItem('trackedCryptos', JSON.stringify(trackedCryptos));
    displayPrices(); // Update the display

}

// --- Search and Suggestions ---

function showSuggestions(suggestions) {
    suggestionsList.innerHTML = ''; // Clear previous suggestions
    if (suggestions.length === 0) {
        suggestionsList.style.display = 'none'; // Hide if no suggestions
        return;
    }

    suggestions.forEach(crypto => {
        const listItem = document.createElement('li');
        listItem.textContent = `${crypto.name} (${crypto.symbol})`;
        const addButton = document.createElement('button');
        addButton.textContent = '+';
        addButton.classList.add('add-favorite-button'); // Reuse the same styling
        addButton.addEventListener('click', (event) => {
            event.stopPropagation(); // Prevent the li click handler from firing
            addCryptoToTracking(crypto.symbol);
            if(!isFavorite(crypto.symbol)){
                addFavorite(crypto.symbol)
            }
            displayPrices();
            displayFavorites();
            clearSearch();

        });

        listItem.appendChild(addButton);

        listItem.addEventListener('click', () => {
            searchInput.value = crypto.symbol; // Fill the input with the symbol
            addCryptoToTracking(crypto.symbol); // Add to tracked
             if(!isFavorite(crypto.symbol)){
                addFavorite(crypto.symbol)
            }
            displayPrices(); // Update the display
            displayFavorites();
            clearSearch(); // Hide suggestions
        });
        suggestionsList.appendChild(listItem);
    });

    suggestionsList.style.display = 'block'; // Show the list
}
function clearSearch(){
     searchInput.value = '';
    suggestionsList.innerHTML = '';
    suggestionsList.style.display = 'none';
}

function handleSearchInput() {
    const searchTerm = searchInput.value.trim().toLowerCase();
    if (searchTerm.length === 0) {
        clearSearch()
        return;
    }

    const filteredCryptos = allCryptos.filter(crypto =>
        crypto.name.toLowerCase().includes(searchTerm) ||
        crypto.symbol.toLowerCase().includes(searchTerm)
    );
    showSuggestions(filteredCryptos);
}
searchInput.addEventListener('input', handleSearchInput);

// Hide suggestions when clicking outside
document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !suggestionsList.contains(event.target)) {
        suggestionsList.style.display = 'none';
    }
});


// --- Service Worker Registration (No Changes) ---
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('ServiceWorker registered with scope:', registration.scope);
            })
            .catch(error => {
                console.error('ServiceWorker registration failed:', error);
            });
    });
}

// --- Initialization ---
async function initializeApp() {
    initializeDarkMode();
    await fetchAllCryptos(); // Fetch the list of cryptocurrencies
    displayPrices();
    displayFavorites();
    setInterval(displayPrices, 30000);
}

initializeApp(); // Call the initialization function
