// fetch.js — thin wrapper so filter modules can call fetchURL(...)
// In Node 18+ fetch is global; this just re-exports it with the same API.

async function fetchURL(url, options = {}) {
	return fetch(url, options);
}

module.exports = { fetchURL };
