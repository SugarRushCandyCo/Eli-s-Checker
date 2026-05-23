# FilterCheck

A simple web tool to check whether a URL would be blocked by any of the supported school web filters.

## Supported Filters

| ID | Name |
|----|------|
| aristotle | Aristotle K12 |
| blocksiAI | Blocksi AI |
| blocksiStd | Blocksi Standard |
| cisco | Cisco Talos |
| contentkeeper | ContentKeeper |
| deledao | Deledao |
| fortiguard | FortiGuard |
| goguardian | GoGuardian |
| lanschool | LanSchool |
| lightspeed | Lightspeed |
| linewize | Linewize |
| paloalto | Palo Alto |
| securly | Securly |

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Add category JSON files

Each filter needs a JSON file in `filters/json/`. These encode category → blocked mappings specific to each provider. Place the real JSON files there (they are not included in this repo).

| Filter | JSON file(s) needed |
|--------|---------------------|
| Blocksi | `filters/json/blocksi.json` |
| Cisco | `filters/json/ciscoblocked.json` |
| ContentKeeper | `filters/json/contentkeeper.json` |
| Deledao | `filters/json/deledao.json` |
| FortiGuard | `filters/json/fortiguard.json` |
| GoGuardian | `filters/json/goguardian.json` |
| LanSchool | `filters/json/lanschool.json` |
| Lightspeed | `filters/json/lightspeed.json` |
| Palo Alto | `filters/json/paloblocked.json` |

### 3. Start the server

```bash
npm start
```

Then open **http://localhost:3000** in your browser.

## Usage

1. Enter a URL in the input field (e.g. `https://reddit.com`)
2. Select a specific filter from the dropdown, then click **Check Filter** — or click **Check All Filters** to query every filter at once
3. Results show each filter's category classification and whether the URL would be blocked (🟥) or allowed (🟩)

## API

The server exposes two endpoints:

### `GET /api/filters`
Returns the list of loaded filters.

### `POST /api/check`
Check a single filter.
```json
{ "url": "https://example.com", "filterId": "goguardian" }
```

### `POST /api/check-all`
Check all filters simultaneously.
```json
{ "url": "https://example.com" }
```

## Project Structure

```
filtercheck/
├── server.js          ← Express API server
├── fetch.js           ← Shared fetch wrapper
├── package.json
├── public/
│   └── index.html     ← Frontend UI
└── filters/
    ├── aristotle.js
    ├── blocksi.js
    ├── cisco.js
    ├── contentkeeper.js
    ├── deledao.js
    ├── fortiguard.js
    ├── goguardian.js
    ├── lanschool.js
    ├── lightspeed.js
    ├── linewize.js
    ├── paloalto.js
    ├── securly.js
    └── json/           ← Category mapping JSON files (add yours here)
```
