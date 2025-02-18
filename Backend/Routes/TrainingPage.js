// this is traniningpage.js
const express = require("express");
const router = express.Router();

router.post("/chatbot", (req, res) => {
    const userMessage = req.body.message.toLowerCase().trim();
    let botReply = "";

    if (userMessage.includes("hello")) {
        botReply = "Hello, how are you?";
    } else if (userMessage.includes("how are you")) {
        botReply = "I'm just a bot, but thanks for asking! How can I assist you?";
    } else if (userMessage.includes("i am fine")) {
        botReply = "That's great to hear! How can I help you today?";
    } else if (userMessage.includes("good morning")) {
        botReply = "Good morning! Hope you have a wonderful day ahead.";
    } else if (userMessage.includes("my name is")) {
        const name = userMessage.split("my name is ")[1] || "there";
        botReply = `Good morning ${name}, nice to meet you!`;
    } else if (userMessage.includes("bye")) {
        botReply = "Bye bye! Take care and have a great day!";
    } else if (userMessage.includes("thank you")) {
        botReply = "You're welcome! Let me know if you need any help.";
    } else if (userMessage.includes("help")) {
        botReply = "Sure! Please tell me what you need assistance with.";
    } else if (userMessage.includes("tell me a joke")) {
        botReply = "Why don't programmers like nature? Because it has too many bugs! 😆";
    } else {
        botReply = "I'm not sure how to respond to that. Could you rephrase?";
    }

    res.json({ reply: botReply });
});

module.exports = router;