// utils/api.js

export let allCryptos = [  // Pre-populate with common cryptos
    { id: 'BTC', name: 'Bitcoin', symbol: 'BTC' },
    { id: 'ETH', name: 'Ethereum', symbol: 'ETH' },
    { id: 'LTC', name: 'Litecoin', symbol: 'LTC' },
    { id: 'XRP', name: 'Ripple', symbol: 'XRP' },
    { id: 'BCH', name: 'Bitcoin Cash', symbol: 'BCH' },
    { id: 'ADA', name: 'Cardano', symbol: 'ADA' },
    { id: 'SOL', name: 'Solana', symbol: 'SOL' },
    {id: 'DOGE', name: 'Dogecoin', symbol: 'DOGE'}
];
export let allCurrencies = [];
export let selectedCurrency = 'USD';

export async function fetchCryptoPrice(cryptoCode, currency = 'USD') {
    try {
        const response = await fetch(`https://api.coinbase.com/v2/prices/${cryptoCode}-${currency}/spot`);
        const data = await response.json();
        if (data.data && data.data.amount) {
            return data.data.amount;
        } else {
            throw new Error(`Invalid response for ${cryptoCode}-${currency}`); // More specific error
        }
    } catch (error) {
        console.error(`Error fetching ${cryptoCode}-${currency} price:`, error);
        return null; // Return null on error, handle in UI
    }
}
// No longer needed, as allCryptos is prepopulated
// export async function fetchAllCryptos() { ... }

export async function fetchAllCurrencies() {
    try {
        const response = await fetch('https://api.coinbase.com/v2/exchange-rates?currency=USD');
        const data = await response.json();

        if (data.data && data.data.rates) {
            allCurrencies = Object.keys(data.data.rates).map(code => ({
                code: code,
                //  name:  "",  No name available in this API response.
            }));
		} else {
			throw new Error('Invalid response for exchange rates');
		}
    } catch (error) {
        console.error('Error fetching all currencies:', error);
        throw error; // Re-throw for handling in the caller
    }
}

export function setSelectedCurrency(currency) {
    selectedCurrency = currency;
}
