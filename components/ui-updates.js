// components/ui-updates.js
import { fetchCryptoPrice, selectedCurrency } from '../utils/api.js';
import { isFavorite, toggleFavorite } from './favorites.js';
import { getTrackedCryptos, removeCryptoFromTracking } from './local-storage.js';

const priceContainer = document.getElementById('price-container');
const favoritesContainer = document.getElementById('favorites-container');
const messageContainer = document.getElementById('message-container');

export async function createCryptoCard(cryptoBasePair, isFavoriteCard = false) {
    const price = await fetchCryptoPrice(cryptoBasePair);

    const card = document.createElement('div');
    card.classList.add(isFavoriteCard ? 'crypto-favorite' : 'crypto-price');
    card.dataset.cryptoCode = cryptoBasePair; // Store the full pair

    const title = document.createElement('h2');
    title.textContent = cryptoBasePair; // Display full pair
    card.appendChild(title);

    const priceElement = document.createElement('p');
    priceElement.textContent = price !== null ? `${price} ${selectedCurrency}` : 'N/A';  // Display price
    card.appendChild(priceElement);

    const favButton = document.createElement('button');
    if (isFavoriteCard) {
        favButton.innerHTML = '<i class="fas fa-star"></i>';
        favButton.classList.add('remove-favorite-button');
    } else {
        favButton.innerHTML = isFavorite(cryptoBasePair) ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        favButton.classList.add(isFavorite(cryptoBasePair) ? 'remove-favorite-button' : 'add-favorite-button');
    }

    favButton.addEventListener('click', () => {
        toggleFavorite(cryptoBasePair);
        displayFavorites();
        const priceCard = document.querySelector(`.crypto-price[data-crypto-code="${cryptoBasePair}"]`);
        if (priceCard) {
            const priceCardFavButton = priceCard.querySelector('.add-favorite-button, .remove-favorite-button');
            if (priceCardFavButton) {
                if (isFavorite(cryptoBasePair)) {
                    priceCardFavButton.innerHTML = '<i class="fas fa-star"></i>';
                    priceCardFavButton.classList.remove('add-favorite-button');
                    priceCardFavButton.classList.add('remove-favorite-button');
                } else {
                    priceCardFavButton.innerHTML = '<i class="far fa-star"></i>';
                    priceCardFavButton.classList.add('add-favorite-button');
                    priceCardFavButton.classList.remove('remove-favorite-button');
                }
            }
        }
    });
    card.appendChild(favButton);

    if (!isFavoriteCard) {
        const removeButton = document.createElement('button');
        removeButton.textContent = 'x';
        removeButton.classList.add('remove-button');
        removeButton.addEventListener('click', () => {
            removeCryptoFromTracking(cryptoBasePair);
            if (isFavorite(cryptoBasePair)) {
                toggleFavorite(cryptoBasePair);
                displayFavorites();
            }
            displayPrices();
        });
        card.appendChild(removeButton);
    }

    return card;
}


export async function displayPrices() {
    priceContainer.innerHTML = '';
    const trackedCryptos = getTrackedCryptos();
    await Promise.all(trackedCryptos.map(async (pair) => { // Use the pair directly
        const card = await createCryptoCard(pair);
        priceContainer.appendChild(card);
    }));
}

export async function displayFavorites() {
    favoritesContainer.innerHTML = '';
    const favoriteCryptos = getFavorites();
    await Promise.all(favoriteCryptos.map(async (pair) => {
        const card = await createCryptoCard(pair, true);
        favoritesContainer.appendChild(card);
    }));
}

export function showMessage(message) {
    messageContainer.textContent = message;
    messageContainer.style.display = 'block';
    setTimeout(() => {
        messageContainer.style.display = 'none';
    }, 5000);
}

// No changes to setupRemoveCryptoHandlers needed, as it now works with pairs
export function setupRemoveCryptoHandlers() {
    priceContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-button')) {
            const card = event.target.closest('.crypto-price');
            if (card) {
                const cryptoBasePair = card.dataset.cryptoCode; // Get full pair
                removeCryptoFromTracking(cryptoBasePair);
                if (isFavorite(cryptoBasePair)) {
                    toggleFavorite(cryptoBasePair);
                    displayFavorites();
                }
                displayPrices();
            }
        }
    });
}
