const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
    if (transporter !== null) return transporter;

    const host = process.env.SMTP_HOST;
    const port = process.env.SMTP_PORT || 587;
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;

    if (!host || !user || !pass) {
        // SMTP is not configured; return null to silently skip
        transporter = false;
        return null;
    }

    try {
        transporter = nodemailer.createTransport({
            host,
            port: Number(port),
            secure: Number(port) === 465,
            auth: { user, pass }
        });
    } catch (err) {
        console.warn("Failed to initialize mail transporter:", err.message);
        transporter = false;
    }

    return transporter;
}

async function sendMailSafely({ to, subject, text, html }) {
    try {
        const mailer = getTransporter();
        if (!mailer) return; // Silently skip if not configured

        await mailer.sendMail({
            from: process.env.SMTP_FROM || "friend.me <noreply@friend.me>",
            to,
            subject,
            text,
            html
        });
    } catch (err) {
        // Never block or throw on email failure
        console.warn("Non-blocking email send skipped or failed:", err.message);
    }
}

module.exports = { sendMailSafely };
