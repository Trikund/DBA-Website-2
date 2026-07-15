const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

// Reusable transporter object using SMTP transport
const createTransporter = async () => {
    // In production, use process.env.EMAIL_HOST, process.env.EMAIL_USER, etc.
    // For demo/testing, if env vars are missing, we can use Ethereal (mock email service)
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
        return nodemailer.createTransport({
            host: process.env.EMAIL_HOST || 'smtp.gmail.com',
            port: process.env.EMAIL_PORT || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });
    } else {
        // Fallback to Ethereal mock email for demo purposes
        console.warn('⚠️ No EMAIL_USER found in .env, falling back to Ethereal Mock Email.');
        const testAccount = await nodemailer.createTestAccount();
        return nodemailer.createTransport({
            host: "smtp.ethereal.email",
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass,
            },
        });
    }
};

const sendEmail = async ({ to, subject, html }) => {
    try {
        const transporter = await createTransporter();
        const info = await transporter.sendMail({
            from: '"Digital Byte Academy" <noreply@digitalbyte.com>',
            to,
            subject,
            html,
        });

        console.log("Message sent: %s", info.messageId);
        
        // Preview only available when sending through an Ethereal account
        if (info.messageId && transporter.options.host === 'smtp.ethereal.email') {
            console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
        }

        return info;
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = sendEmail;
