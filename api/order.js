import nodemailer from "nodemailer";

export default async function handler(req, res) {
if (req.method !== "POST") return res.status(405).json({ ok: false, error: "Method not allowed" });
try {
const { order, customerEmail } = req.body || {};
if (!order || !customerEmail) return res.status(400).json({ ok: false, error: "Missing order or customerEmail" });

const port = Number(process.env.SMTP_PORT || 587);
const secure = port === 465; // true für 465, sonst false
const t = nodemailer.createTransport({
host: process.env.SMTP_HOST,
port,
secure,
auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
});

const addr = `${order.strasse} ${order.hausnummer}, ${order.plz} ${order.ortschaft}`;

// 1) Kunde
await t.sendMail({
from: process.env.FROM_EMAIL,
to: customerEmail,
subject: `Bestellbestätigung – ${order.produkt} ${order.grams} g (Order ${order.id})`,
text: `Hallo ${order.vorname} ${order.name},\n\n`+
`Danke für deine Bestellung!\n\n`+
`Produkt: ${order.produkt}\n`+
`Gewicht: ${order.grams} g\n`+
`Lieferadresse: ${addr}\n`+
`Bestell-ID: ${order.id}\n\n`+
`Wir melden uns, sobald die Sendung auf dem Weg ist.\n\n`+
`Liebe Grüsse\nBiltong Team`,
});

// 2) Intern
await t.sendMail({
from: process.env.FROM_EMAIL,
to: process.env.ORDER_INBOX,
subject: `Neuer Auftragseingang – ${order.produkt} ${order.grams} g (Order ${order.id})`,
text: `Neue Bestellung:\n`+
`Produkt: ${order.produkt}\nGewicht: ${order.grams} g\n`+
`Kunde: ${order.vorname} ${order.name}\n`+
`Adresse: ${addr}\n`+
`Bestell-ID: ${order.id}\nZeit: ${new Date().toISOString()}\n`,
});

res.json({ ok: true });
} catch (e) {
console.error(e);
res.status(500).json({ ok: false, error: e?.message || "send failed" });
}
}
