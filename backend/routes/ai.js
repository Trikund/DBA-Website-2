const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');

router.post('/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (!process.env.GEMINI_API_KEY) {
            const q = message.toLowerCase();
            let reply = "I am running in offline mode (No GEMINI_API_KEY found). I can answer questions about MERN, React, Node, Python, Java, C++, AI, ML, SQL, MongoDB, HTML, CSS, JavaScript, RAG, and more! Add an API key for infinite knowledge. ✨";
            
            const techDictionary = {
                "python": "Python is a high-level, versatile programming language heavily used in AI, Data Science, and backend development. Its simple syntax makes it very beginner-friendly!",
                "react": "React is a popular JavaScript library for building user interfaces. It uses a Virtual DOM for ultra-fast rendering and is a core part of the MERN stack.",
                "node": "Node.js is a runtime environment that allows you to run JavaScript on the server. It's built on Chrome's V8 engine and is incredibly fast for building APIs.",
                "express": "Express.js is a minimal and flexible Node.js web application framework that provides a robust set of features for web and mobile applications.",
                "mongo": "MongoDB is a NoSQL database that stores data in flexible, JSON-like documents. It's highly scalable and perfectly integrates with Node.js.",
                "sql": "SQL (Structured Query Language) is used for managing and querying relational databases. It's essential for handling structured data efficiently.",
                "database": "A database is an organized collection of structured information. We teach both NoSQL (MongoDB) and Relational (SQL) databases in our courses.",
                "java": "Java is a robust, object-oriented programming language used widely in enterprise software, Android development, and large-scale backend systems.",
                "c++": "C++ is a high-performance programming language used in system/software development, game engines, and competitive programming.",
                "javascript": "JavaScript is the programming language of the web. It allows you to implement complex features on web pages and is used on both frontend and backend.",
                "html": "HTML is the standard markup language for documents designed to be displayed in a web browser. It provides the basic structure of a website.",
                "css": "CSS is used for styling and formatting web pages. It controls the layout, colors, and overall visual appearance of HTML elements.",
                "machine learning": "Machine Learning is a subset of AI where systems learn from data to identify patterns and make decisions with minimal human intervention.",
                "ai": "Artificial Intelligence is the simulation of human intelligence by machines. Our AI course covers everything from basic algorithms to advanced LLMs.",
                "rag": "RAG (Retrieval-Augmented Generation) is a technique where an AI fetches contextual information from an external database before generating an answer, preventing hallucinations.",
                "mern": "The MERN stack (MongoDB, Express.js, React, Node.js) is a popular JavaScript stack used for building full-stack web applications efficiently.",
                "full stack": "A Full Stack Developer can build both the frontend (user interface) and backend (server and database) of a web application.",
                "data science": "Data Science involves extracting insights from vast amounts of data using statistics, scientific computing, and machine learning algorithms.",
                "cyber": "Cyber Security is the practice of protecting systems, networks, and programs from digital attacks. It's one of our highly demanded premium courses.",
                "fee": "Our courses are very affordable with flexible EMI options available. We focus on providing premium education and 100% placement assistance.",
                "hi": "Hello! I am the AI counselor for Digital Byte Academy. How can I assist you with your tech journey today?",
                "hello": "Hello! I am the AI counselor for Digital Byte Academy. How can I assist you with your tech journey today?",
                "contact": "You can contact Digital Byte Academy at support@digitalbyte.com or call us at +91-9876543210. Our office is open Mon-Fri, 9 AM to 6 PM.",
                "support": "You can contact Digital Byte Academy at support@digitalbyte.com or call us at +91-9876543210. Our office is open Mon-Fri, 9 AM to 6 PM.",
            };

            for (const [key, val] of Object.entries(techDictionary)) {
                if (q.includes(key)) {
                    return res.json({ reply: val });
                }
            }

            // If not in local dictionary, fetch infinite knowledge from Wikipedia API
            try {
                const https = require('https');
                const searchOpts = {
                    hostname: 'en.wikipedia.org',
                    path: '/w/api.php?action=query&list=search&srsearch=' + encodeURIComponent(message) + '&utf8=&format=json',
                    headers: { 'User-Agent': 'DigitalByteAcademy/1.0' }
                };

                const wikiReply = await new Promise((resolve, reject) => {
                    https.get(searchOpts, (searchRes) => {
                        let searchData = '';
                        searchRes.on('data', c => searchData += c);
                        searchRes.on('end', () => {
                            try {
                                const sr = JSON.parse(searchData).query.search;
                                if (sr && sr.length > 0) {
                                    const title = sr[0].title;
                                    const summaryOpts = {
                                        hostname: 'en.wikipedia.org',
                                        path: '/api/rest_v1/page/summary/' + encodeURIComponent(title),
                                        headers: { 'User-Agent': 'DigitalByteAcademy/1.0' }
                                    };
                                    https.get(summaryOpts, (sumRes) => {
                                        let sumData = '';
                                        sumRes.on('data', c => sumData += c);
                                        sumRes.on('end', () => {
                                            const extract = JSON.parse(sumData).extract;
                                            resolve(extract ? extract + " ✨" : null);
                                        });
                                    }).on('error', err => reject(err));
                                } else {
                                    resolve(null);
                                }
                            } catch (e) {
                                resolve(null);
                            }
                        });
                    }).on('error', err => reject(err));
                });

                if (wikiReply) {
                    return res.json({ reply: wikiReply });
                }
            } catch (err) {
                console.error("Wikipedia API Fallback failed:", err);
            }

            // Absolute last resort
            return res.json({ reply: "I am running in offline mode (No GEMINI_API_KEY found). I couldn't find an exact answer for that, but you can ask me about MERN, React, Python, ML, Java, C++, etc.! ✨" });
        }

        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-pro" });
        
        const prompt = `You are a smart AI assistant for Digital Byte Academy. 
        You MUST answer STRICTLY in English. Do NOT use Hindi or Hinglish.
        You are allowed to answer any question in the world, tech or non-tech, but try to tie it back to learning and technology if possible.
        Keep your response concise, helpful, and in 2-3 short paragraphs.
        Student's message: ${message}`;
        
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();
        
        res.json({ reply: text });
    } catch (error) {
        console.error("AI Chat Error:", error);
        res.status(500).json({ error: error.message || error.toString() });
    }
});

router.get('/test-models', async (req, res) => {
    try {
        const { GoogleGenerativeAI } = require('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const modelsToTest = [
            'gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro',
            'gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-pro',
            'gemini-2.0-pro-exp', 'gemini-1.0-pro'
        ];
        const results = {};
        for (const m of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: m });
                await model.generateContent('hi');
                results[m] = 'SUCCESS';
            } catch (e) {
                results[m] = e.message;
            }
        }
        res.json(results);
    } catch(e) {
        res.status(500).json({error: e.message});
    }
});
module.exports = router;



