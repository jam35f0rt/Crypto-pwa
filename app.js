// app.js
import { initializeDarkMode, setupDarkModeToggle } from './components/dark-mode.js';
import {  fetchAllCurrencies, setSelectedCurrency } from './utils/api.js'; //No need to import fetch all crypto
import { displayPrices, displayFavorites, showMessage, setupRemoveCryptoHandlers } from './components/ui-updates.js';
import { setupCryptoSearch, setupCurrencySearch, initializeCurrencyInput } from './components/search.js';
import { getFavorites, toggleFavorite, isFavorite } from './components/favorites.js';

async function initializeApp() {
    initializeDarkMode();
    setupDarkModeToggle();

    try {
        // await fetchAllCryptos(); // No, it's pre-populated now.
        await setSelectedCurrency("USD") // Set and fetch initial currencies

        setupCryptoSearch();
        setupCurrencySearch();
        initializeCurrencyInput();

		displayPrices(); // Now it's safe to display
        displayFavorites();

        setInterval(displayPrices, 30000);
        setupRemoveCryptoHandlers();

    } catch (error) {
        // Handle errors during initialization (e.g., API failures)
        showMessage("Failed to initialize app. Check your internet connection.");
        console.error("Initialization error:", error); // Log the error for debugging.
    }
}

initializeApp();
