const express = require("express");
const path = require("path");
const app = express();

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

// ── Filter registry ──────────────────────────────────────────────────────────
// Each entry: { id, label, fn }
// fn(url) → { blocked: bool, category: string } | [category, blocked] | string
const filters = [];

function safeLoad(id, label, loader) {
	try {
		const fn = loader();
		filters.push({ id, label, fn });
		console.log(`✓ Loaded: ${label}`);
	} catch (e) {
		console.warn(`✗ Could not load ${label}: ${e.message}`);
	}
}

// Normalize whatever a filter returns into { blocked, category }
function normalize(result) {
	if (!result || result === "Error") return { blocked: null, category: "Error" };
	if (Array.isArray(result)) {
		return { category: String(result[0] ?? "Unknown"), blocked: !!result[1] };
	}
	if (typeof result === "object") {
		return {
			blocked: result.blocked ?? null,
			category: String(result.category ?? "Unknown"),
		};
	}
	return { blocked: null, category: String(result) };
}

safeLoad("aristotle",     "Aristotle K12",   () => { const m = require("./filters/aristotle");     return (u) => m.aristotlek12(u); });
safeLoad("blocksiAI",     "Blocksi AI",       () => { const m = require("./filters/blocksi");       return (u) => m.blocksiAI(u); });
safeLoad("blocksiStd",    "Blocksi Standard", () => { const m = require("./filters/blocksi");       return (u) => m.blocksiStandard(u); });
safeLoad("cisco",         "Cisco Talos",      () => { const m = require("./filters/cisco");         return (u) => m.cisco(u); });
safeLoad("contentkeeper", "ContentKeeper",    () => { const m = require("./filters/contentkeeper"); return (u) => m.contentkeeper(u); });
safeLoad("deledao",       "Deledao",          () => { const m = require("./filters/deledao");       return (u) => m.deledao(u); });
safeLoad("fortiguard",    "FortiGuard",       () => { const m = require("./filters/fortiguard");    return (u) => m.fortiguard(u); });
safeLoad("goguardian",    "GoGuardian",       () => { const m = require("./filters/goguardian");    return (u) => m.goguardian(u); });
safeLoad("lanschool",     "LanSchool",        () => { const m = require("./filters/lanschool");     return (u) => m.lanschool(u); });
safeLoad("lightspeed",    "Lightspeed",       () => { const m = require("./filters/lightspeed");    return (u) => m.lightspeed(u); });
safeLoad("linewize",      "Linewize",         () => { const m = require("./filters/linewize");      return (u) => m.linewize(u); });
safeLoad("paloalto",      "Palo Alto",        () => { const m = require("./filters/paloalto");      return (u) => m.palo(u); });
safeLoad("securly",       "Securly",          () => { const m = require("./filters/securly");       return (u) => m.securly(u); });

// ── Routes ───────────────────────────────────────────────────────────────────

// List available filters
app.get("/api/filters", (_req, res) => {
	res.json(filters.map(({ id, label }) => ({ id, label })));
});

// Check a single filter
app.post("/api/check", async (req, res) => {
	const { url, filterId } = req.body;
	if (!url || !filterId) return res.status(400).json({ error: "Missing url or filterId" });

	const filter = filters.find((f) => f.id === filterId);
	if (!filter) return res.status(404).json({ error: "Unknown filter" });

	try {
		const raw = await Promise.race([
			filter.fn(url),
			new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000)),
		]);
		res.json({ filterId, label: filter.label, ...normalize(raw) });
	} catch (err) {
		res.json({ filterId, label: filter.label, blocked: null, category: "Error: " + err.message });
	}
});

// Check all filters at once
app.post("/api/check-all", async (req, res) => {
	const { url } = req.body;
	if (!url) return res.status(400).json({ error: "Missing url" });

	const results = await Promise.allSettled(
		filters.map(async (f) => {
			const raw = await Promise.race([
				f.fn(url),
				new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 15000)),
			]);
			return { filterId: f.id, label: f.label, ...normalize(raw) };
		})
	);

	res.json(
		results.map((r, i) =>
			r.status === "fulfilled"
				? r.value
				: { filterId: filters[i].id, label: filters[i].label, blocked: null, category: "Error: " + r.reason?.message }
		)
	);
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`FilterCheck running → http://localhost:${PORT}`));
