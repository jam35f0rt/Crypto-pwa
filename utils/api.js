// utils/api.js
export async function fetchCryptoPrice(cryptoCode, currency = 'USD') {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-${currency}/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}`);
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode} price:`, error);
        return null; // Return null on error
    }
}

export let allCryptos = []; // Export so it can be used in search.js
export let allCurrencies = [];
export let selectedCurrency = 'USD'

export async function fetchAllCryptos() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/currencies');
        const data = await response.json();
        if (data.data && Array.isArray(data.data)) {
            allCryptos = data.data.map(crypto => ({
                id: crypto.id,
                name: crypto.name,
                symbol: crypto.id
            }));
        } else {
            throw new Error('Invalid response for currencies');
        }
    } catch (error) {
        console.error('Error fetching all cryptocurrencies:', error);
         throw error; // Re-throw for handling in the caller
    }
}

export async function fetchAllCurrencies() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD');
        const data = await response.json();

        if (data.data && data.data.rates) {
            allCurrencies = Object.keys(data.data.rates).map(code => ({
                code: code,
                // name: "" // No name available in this API
            }));
		} else {
			throw new Error('Invalid response for exchange rates');
		}
    } catch (error) {
        console.error('Error fetching all currencies:', error);
        throw error; // Re-throw for handling in the caller
    }
}
export function setSelectedCurrency(currency){
    selectedCurrency = currency
}
