import React, { useEffect, useMemo, useState } from "react";

const LS_KEYS = { inventory: "biltong_inventory_v1", orders: "biltong_orders_v1" };
const uid = (p = "id") => `${p}_${Math.random().toString(36).slice(2, 8)}_${Date.now().toString(36)}`;
const loadJSON = (k, fb) => { try { const r = localStorage.getItem(k); return r ? JSON.parse(r) : fb; } catch { return fb; } };
const saveJSON = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };
const download = (fn, txt) => { const a = document.createElement("a"); a.href = "data:text/plain;charset=utf-8," + encodeURIComponent(txt); a.download = fn; a.click(); };
const toCSV = (rows) => { if (!rows?.length) return ""; const h = Object.keys(rows[0]); return [h.join(","), ...rows.map(r => h.map(k => JSON.stringify(r[k] ?? "")).join(","))].join("\n"); };

const H1 = ({ children }) => <h1 className="text-3xl font-bold tracking-tight mb-4">{children}</h1>;
const H2 = ({ children }) => <h2 className="text-xl font-semibold tracking-tight mb-3">{children}</h2>;
const Card = ({ children }) => <div className="bg-white rounded-2xl shadow p-5 border border-gray-100">{children}</div>;
const Button = ({ children, className = "", ...p }) => <button className={`px-4 py-2 rounded-xl shadow-sm border border-gray-200 hover:shadow transition active:scale-[0.99] ${className}`} {...p}>{children}</button>;
const Input = (props) => <input {...props} className={`w-full rounded-xl border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black/20 ${props.className || ""}`} />;
const Label = ({ children }) => <label className="text-sm font-medium text-gray-700 mb-1 block">{children}</label>;
const Badge = ({ children }) => <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs bg-gray-50 border-gray-200">{children}</span>;

export default function App() {
const [inventory, setInventory] = useState([]);
const [orders, setOrders] = useState([]);
const [view, setView] = useState("shop");
const [showAdmin, setShowAdmin] = useState(true);

useEffect(() => {
const q = new URLSearchParams(window.location.search);
if ((q.get("view") || "").toLowerCase() === "shop") { setShowAdmin(false); setView("shop"); }
}, []);

useEffect(() => { setInventory(loadJSON(LS_KEYS.inventory, [])); setOrders(loadJSON(LS_KEYS.orders, [])); }, []);
useEffect(() => { saveJSON(LS_KEYS.inventory, inventory); }, [inventory]);
useEffect(() => { saveJSON(LS_KEYS.orders, orders); }, [orders]);

function addItem(grams) {
const g = Number(grams); if (!g || g <= 0) return alert("Bitte gültige Grammzahl angeben.");
const item = { id: uid("item"), grams: g, createdAt: new Date().toISOString() };
setInventory((p) => [...p, item].sort((a, b) => a.grams - b.grams));
}
function bulkAdd(grams, qty) {
const g = Number(grams), q = Number(qty); if (!g || g <= 0 || !q || q <= 0) return alert("Bitte Gramm und Anzahl prüfen.");
const items = Array.from({ length: q }).map(() => ({ id: uid("item"), grams: g, createdAt: new Date().toISOString() }));
setInventory((p) => [...p, ...items].sort((a, b) => a.grams - b.grams));
}
function deleteItem(id) { setInventory((p) => p.filter((x) => x.id !== id)); }
function clearAll(txt, setter) { if (prompt(`Zum Bestätigen tippe: ${txt}`) === txt) setter([]); }

async function placeOrder(item, customer) {
// 1) Produkt lokal entfernen & Order speichern
setInventory((p) => p.filter((x) => x.id !== item.id));
const order = {
id: uid("order"), itemId: item.id, grams: item.grams,
vorname: customer.vorname.trim(), name: customer.name.trim(), strasse: customer.strasse.trim(),
hausnummer: customer.hausnummer.trim(), plz: customer.plz.trim(), ortschaft: customer.ortschaft.trim(),
createdAt: new Date().toISOString(), produkt: "Biltong",
};
setOrders((p) => [order, ...p]);

// 2) E-Mail via Serverless Function auslösen
try {
await fetch("/api/order", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ order, customerEmail: customer.email }) });
} catch (e) { console.warn("Email trigger failed", e); }
return order;
}

const totalStock = inventory.length;
const totalGrams = useMemo(() => inventory.reduce((s, it) => s + Number(it.grams || 0), 0), [inventory]);

return (
<div className="min-h-screen bg-gradient-to-b from-gray-50 to-white text-gray-900">
<div className="max-w-5xl mx-auto px-4 py-8">
<header className="flex items-center justify-between mb-6">
<div className="flex items-center gap-3">
<span className="text-2xl">🥩</span>
}
