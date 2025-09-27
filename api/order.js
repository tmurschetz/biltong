const nodemailer = require('nodemailer');

/** 
 * Vercel‑Function zum Versenden von Bestellbestätigungen.
 * Erwartet POST‑Requests mit den Feldern aus deinem Formular.
 */
module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }
  const order = req.body;

  // SMTP‑Transport konfigurieren – Werte kommen aus den Vercel‑ENV‑Variablen.
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT || 587),
    secure: process.env.SMTP_SECURE === 'true', // true für Port 465, sonst false
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  // Mail an den Kunden (nur, wenn er eine E‑Mail angegeben hat)
  const customerMail = {
    from: process.env.FROM_EMAIL,
    to: order.email,
    subject: 'Bestellbestätigung Biltong',
    text: `Hallo ${order.firstName} ${order.lastName},\\n\\n`
      + `vielen Dank für deine Bestellung über ${order.item.grams} g Biltong. `
      + `Wir versenden an: ${order.street} ${order.houseNumber}, ${order.zip} ${order.city}.\\n\\n`
      + 'Beste Grüsse!',
  };

  // Interne Mail an dich
  const internalMail = {
    from: process.env.FROM_EMAIL,
    to: process.env.ORDER_INBOX || 'biltong@thomasmurschetz.com',
    subject: 'Neue Biltong‑Bestellung',
    text: JSON.stringify(order, null, 2),
  };

  try {
    if (order.email) await transporter.sendMail(customerMail);
    await transporter.sendMail(internalMail);
    res.status(200).json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'E‑Mail konnte nicht versendet werden' });
  }
};
