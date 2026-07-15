const express = require('express');
const router = express.Router();

router.post('/chat', async (req, res) => {
    try {
        const { query } = req.body;
        
        const systemPrompt = `You are Motion AI, a friendly and expert tech counselor for Digital Byte Academy. 
Guide students about MERN, AI, Data Science, Cyber Security. 
Points: 100% placement, 4-6 months duration, affordable fees.
RULES:
1. Speak STRICTLY in natural "Hinglish" (Hindi language written in English alphabet). DO NOT use JSON. DO NOT use Devanagari script.
2. Keep it short (2-3 sentences max).
3. Use 1-2 emojis.
4. Be encouraging, use words like 'Bhai', 'Bilkul'.`;

        const finalPrompt = systemPrompt + "\n\nUser Question: " + query;
        
        const API_KEY = process.env.GEMINI_API_KEY;
        let aiResponseText = "";

        if (API_KEY && API_KEY !== "YOUR_GEMINI_API_KEY_HERE") {
            // Use Secure Gemini API from backend
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${API_KEY}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
                    generationConfig: { maxOutputTokens: 300, temperature: 0.7 }
                })
            });
            
            if (response.ok) {
                const data = await response.json();
                aiResponseText = data.candidates[0].content.parts[0].text;
            } else {
                throw new Error("Gemini API Failed");
            }
        } else {
            // Fallback to Free Pollinations API
            const url = `https://text.pollinations.ai/${encodeURIComponent(finalPrompt)}`;
            const response = await fetch(url);
            
            if (response.ok) {
                aiResponseText = await response.text();
            } else {
                throw new Error("Pollinations API Failed");
            }
        }

        res.json({ success: true, reply: aiResponseText });

    } catch (err) {
        console.error("AI Error:", err.message);
        
        // Final Local Fallback if both APIs fail
        const q = req.body.query ? req.body.query.toLowerCase() : "";
        let fallbackReply = "Bhai, main samajh nahi paya! Par agar aap courses dhoondh rahe ho toh MERN, AI aur Data Science humare best courses hain. Kuch details batau? ✨";
        
        if(q.includes("mern") || q.includes("web")) {
            fallbackReply = "Bhai, Web Dev (MERN Stack) ki bohot demand hai! 🔥 Humare 4-6 mahine ke course me aap frontend/backend master kar loge, 100% placement ke sath! 🚀";
        } else if(q.includes("ai") || q.includes("data")) {
            fallbackReply = "Arre waah! AI aur Data Science toh future hai. Humara course ekdum practical hai aur placement bhi 100% guaranteed hai! 🤖";
        } else if(q.includes("fee") || q.includes("paise")) {
            fallbackReply = "Fees bilkul affordable hai bhai, aur EMI options bhi available hain. Tension mat lo, padhai pe focus karo! 💸";
        }

        res.json({ success: true, reply: fallbackReply, fallback: true });
    }
});

module.exports = router;
