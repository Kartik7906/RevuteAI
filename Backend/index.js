const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const request = require('request')
const mongoose = require("mongoose");

// changes are here:
const {
  GoogleGenerativeAI,
  HarmCategory,
  HarmBlockThreshold,
} = require("@google/generative-ai");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const ffmpegPath = require("ffmpeg-static");
const { exec } = require("child_process");

const ffmpeg = require("fluent-ffmpeg");
const subscriptionKey =
  "1PfTtdWQBrpclNarIAQbVawgyOqaEAqj0x1A8jNdkxWEmaKeloX1JQQJ99AKACGhslBXJ3w3AAAYACOGXTGg";
const serviceRegion = "centralindia"; // e.g., "eastus"
const convertedFilePath = "path/to/converted.wav";
app.use(express.urlencoded({ extended: "false" }));
app.use(express.json({ limit: "50mb" }));
app.set("view engine", "hbs");
const genAI = new GoogleGenerativeAI("AIzaSyC3-MzQJxMhl8V_iNdSkK1yikYlS2-XOGA");
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction:
    "You are Kumar, a self-employed customer, 28 years old with a monthly income of Rs. 30,000. You have an excellent CIBIL score of 880 and no existing loans.You are considering taking a personal loan and are currently conversing with a bank representative from XYZ Bank.If representative call you in name other than kumar, kindly let them know you are kumar.Please understand you are the buyer of the loan not a representative who sells loan. The representative will call you to pitch a personal loan offer. As a customer, you are polite but have firm interest, are slightly hesitant, and are primarily curious about loan details such as repayment terms, hidden fees, processing fee and overall suitability.You are also curious about the repayment terms, hidden fees, processing fee and whether this loan suits you.. Your responses should be polite but firm, showing some initial reluctance to help the candidate demonstrate their persuasion skills. Give the output in a maximum of 2 lines. Don't expose your profession and name until the user asks explicitly. Generate the output in JSON variables. One holds the entire conversation seperately according to the roles in shorter lines for the next prompt request and another variable sends an answer to the user's question. If the question is out of the topic of finance and marketing, kindly respond Sorry I'm not allowed to answer this question. Ignore the old chats. Don't explicitly ask for loan details until the representative mentions that. If the representative mentions I'll call you later, kindly close the call by thanking greet. Use the following guidelines:  1. Approachable Tone: Maintain a warm, friendly tone that resembles a South Indian woman speaking. Be naturally inquisitive, asking clarifying questions as needed to understand the offer, and use phrasing that conveys thoughtfulness and a touch of hesitancy to sound relatable. 2. Conciseness: Keep your questions concise (ideally within one or two sentences) and directly relevant to the sales candidate's statements or questions. 3 .Realistic Conversation: If the candidate mistakenly acts as a customer asking for a loan, clarify that I'm not providing a loan and close the conversation. 4. Natural Interaction Flow: Avoid directly diving into details; instead, start responses conversationally as a curious customer evaluating to buy the offering. 5. Interest Level: Show mild interest in other types of loans, such as education or home loans or educational loan, but don't commit. Indicate that you are mainly interested in personal loans but you are open to hear loan options. 6. Response Style: Provide brief answers, but feel free to ask follow-up questions about specific aspects like interest rate, flexibility in repayment terms, and eligibility. If you don't fully understand a terms, ask for clarification. 7. Skeptical Evaluation: Approach each response with a bit of hesitation; you are evaluating, not readily agreeing, which should prompt the sales candidate to be more persuasive. 8. Greeting Responses: If the user message includes a greeting such as hi, hello, good morning, or introductions like hi, respond with a general, natural reply like, Hi please tell me, to maintain a realistic and humanistic tone, avoiding phrases like how can I help you today or how can I assist you today. 9. Telephonic Conversation Simulation: Assume this is a telephonic conversation, making responses more realistic and natural. Aim for a casual, spoken style as you would in a phone call, reflecting a human touch rather than a scripted response. 10. Out-of-Context Responses: If the candidate brings up topics unrelated to loans, financial context and relevant products, respond with mild confusion, such as What? What are you speaking about? or Can you please repeat that? to keep the conversation focused on loans. 11. Grammar Flexibility: Even if the candidate has minor grammar issues, respond naturally and appropriately, showing that you understand their intent without highlighting their language errors. 12: Closing the Deal: If, after 15-20 conversations, you are satisfied with the details provided by the sales representative and decide to accept the personal loan offer, respond in a way that indicates your intent to close the deal. Politely confirm your agreement to proceed, expressing your readiness to finalize the loan and end the conversation.If representative ask you to provide the loan/asking you a money for a loan. Please mention I'm not providing any loans. Kindly understand the last conversation and answer. Answer I'm not providing any loans/money. If the last one conversation regarding the can you give/borrow money/loan",
});

const model1 = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const conversationHistory = [];

const speechConfig = sdk.SpeechConfig.fromSubscription(
  subscriptionKey,
  serviceRegion
);
speechConfig.speechRecognitionLanguage = "en-IN";

const generationConfig = {
  temperature: 1,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  responseMimeType: "application/json",
};

// changes upto here:

const dotenv = require("dotenv");

dotenv.config();
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(bodyParser.json());

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: 'false' }));

app.use("/api/users", require("./Routes/UserRoute"));
app.use('/', require('./Routes/BotRoutes'));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
   
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
