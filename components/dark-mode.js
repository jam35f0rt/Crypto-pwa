// components/dark-mode.js
const darkModeToggle = document.getElementById('dark-mode-toggle');

export function initializeDarkMode() {
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    const storedDarkMode = localStorage.getItem('darkMode');

    if (storedDarkMode === 'true' || (storedDarkMode === null && prefersDarkMode)) {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark'); // Ensure light mode if not enabled.
    }
}

export function setupDarkModeToggle() {
    darkModeToggle.addEventListener('click', () => {
        const isDarkMode = document.documentElement.classList.toggle('dark');
        localStorage.setItem('darkMode', isDarkMode);
    });
}
