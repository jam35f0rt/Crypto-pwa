// components/ui-updates.js
import { fetchCryptoPrice, selectedCurrency } from '../utils/api.js';
import { isFavorite, toggleFavorite, getFavorites } from './favorites.js'; // CORRECT import
import { getTrackedCryptos, removeCryptoFromTracking } from './local-storage.js';


const priceContainer = document.getElementById('price-container');
const favoritesContainer = document.getElementById('favorites-container');
const messageContainer = document.getElementById('message-container');


export async function createCryptoCard(code, isFavoriteCard = false) {
    const price = await fetchCryptoPrice(code, selectedCurrency); // Use selected currency

    const card = document.createElement('div');
    card.classList.add(isFavoriteCard ? 'crypto-favorite' : 'crypto-price');
    card.dataset.cryptoCode = code;

    const title = document.createElement('h2');
    title.textContent = code;
    card.appendChild(title);

    const priceElement = document.createElement('p');
    priceElement.textContent = price !== null ? `${price} ${selectedCurrency}` : 'N/A';  // Display currency
    card.appendChild(priceElement);


    const favButton = document.createElement('button');
    if (isFavoriteCard) {
        favButton.innerHTML = '<i class="fas fa-star"></i>';
        favButton.classList.add('remove-favorite-button');
    } else {
        favButton.innerHTML = isFavorite(code) ? '<i class="fas fa-star"></i>' : '<i class="far fa-star"></i>';
        favButton.classList.add(isFavorite(code) ? 'remove-favorite-button' : 'add-favorite-button');
    }

	favButton.addEventListener('click', () => {
		toggleFavorite(code);
		displayFavorites(); // Update favorites display
		// Update the button in the main price list if it exists
		const priceCard = document.querySelector(`.crypto-price[data-crypto-code="${code}"]`);
		if (priceCard) {
			const priceCardFavButton = priceCard.querySelector('.add-favorite-button, .remove-favorite-button');

			if(priceCardFavButton){
				if (isFavorite(code)) {
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
            removeCryptoFromTracking(code); // Use the function from local-storage.js
            displayPrices();
            if(isFavorite(code)){ //Remove from favorite if it is favorite
                toggleFavorite(code)
                displayFavorites()
            }
        });
        card.appendChild(removeButton);
    }

    return card;
}


export async function displayPrices() {
    priceContainer.innerHTML = '';
    const trackedCryptos = getTrackedCryptos();

    // Use Promise.all to wait for ALL cards to be created
    await Promise.all(trackedCryptos.map(async (code) => {
        const card = await createCryptoCard(code); // AWAIT the card creation
        priceContainer.appendChild(card);
    }));
}

export async function displayFavorites() {
    favoritesContainer.innerHTML = '';
    const favoriteCryptos = getFavorites(); // Get favorites

    // Use Promise.all for favorites as well
    await Promise.all(favoriteCryptos.map(async (code) => {
        const card = await createCryptoCard(code, true); // AWAIT, and pass true for favorites
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
export function setupRemoveCryptoHandlers() {
    priceContainer.addEventListener('click', (event) => {
        if (event.target.classList.contains('remove-button')) {
            const card = event.target.closest('.crypto-price');
            if (card) {
                const code = card.dataset.cryptoCode;
                removeCryptoFromTracking(code); // Remove from tracking
				if(isFavorite(code)){ //Remove from favorite if it is favorite
					toggleFavorite(code)
                    displayFavorites()
				}
                displayPrices(); // Refresh
            }
        }
    });
}
