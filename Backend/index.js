const express  = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const multer = require('multer');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const dotenv = require('dotenv');
const fs = require('fs');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI('AIzaSyCRxcQJL0lRiT8nd71y4Kvwm5WTE9rwuZ0');
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Create uploads directory if it doesn't exist
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${file.fieldname}-${timestamp}${ext}`);
  }
});

// Configure file filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['video/webm', 'audio/webm', 'video/mp4', 'audio/mp3'];
  if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
  } else {
      cb(new Error('Invalid file type'), false);
  }
};

// Configure multer upload
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
      fileSize: 50 * 1024 * 1024 // 50MB limit
  }
}).fields([
  { name: 'videoFile', maxCount: 1 },
  { name: 'audioFile', maxCount: 1 }
]);

// middleware:
dotenv.config();
app.use(cors({
    origin: 'https://revute-ai.vercel.app',
    credentials: true,
  }));
app.use(bodyParser.json({ limit: '50mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '50mb' }));
app.use(express.static(path.join(__dirname)));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/users', require('./Routes/UserRoute'));

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// Function to analyze text using Gemini
async function analyzeWithGemini(text) {
  try {
      // Helper function to extract JSON from Gemini response
      const extractJSON = (text) => {
          try {
              // Remove markdown formatting and find JSON object
              const jsonMatch = text.match(/\{[\s\S]*\}/);
              if (jsonMatch) {
                  return JSON.parse(jsonMatch[0]);
              }
              throw new Error('No JSON found in response');
          } catch (err) {
              console.error('JSON extraction error:', err);
              // Return default values if parsing fails
              return {
                  score: 7,
                  feedback: "Analysis unavailable",
                  communication_score: 7,
                  organization_score: 7,
                  clarity_score: 7,
                  recommendations: ["Continue practicing"]
              };
          }
      };

      // Grammar Analysis
      const grammarPrompt = 'Analyze this self-introduction text for grammar and language usage. Return ONLY a JSON object with fields: score (number out of 10), feedback (string), errors (array of strings), improvement_suggestions (array of strings). Text: "' + text + '"';
      const grammarResponse = await model.generateContent(grammarPrompt);
      const grammarAnalysis = extractJSON(grammarResponse.response.text());

      // Professional Communication Analysis
      const professionalPrompt = 'Analyze this self-introduction for professional communication. Return ONLY a JSON object with fields: communication_score (number), organization_score (number), clarity_score (number), content_relevance (number), recommendations (array of strings). Text: "' + text + '"';
      const professionalResponse = await model.generateContent(professionalPrompt);
      const professionalAnalysis = extractJSON(professionalResponse.response.text());

      // Overall Assessment
      const overallPrompt = 'Provide assessment of this self-introduction. Return ONLY a JSON object with fields: overall_impression (string), confidence_level (number), key_strengths (array), areas_for_improvement (array), final_score (number). Text: "' + text + '"';
      const overallResponse = await model.generateContent(overallPrompt);
      const overallAnalysis = extractJSON(overallResponse.response.text());

      console.log('Grammar Analysis:', grammarAnalysis);
      console.log('Professional Analysis:', professionalAnalysis);
      console.log('Overall Analysis:', overallAnalysis);

      return {
          grammar: grammarAnalysis,
          professional: professionalAnalysis,
          overall: overallAnalysis
      };
  } catch (error) {
      console.error('Gemini Analysis Error:', error);
      // Return default values if analysis fails
      return {
          grammar: {
              score: 7,
              feedback: "Analysis temporarily unavailable",
              errors: [],
              improvement_suggestions: []
          },
          professional: {
              communication_score: 7,
              organization_score: 7,
              clarity_score: 7,
              content_relevance: 7,
              recommendations: ["Continue practicing"]
          },
          overall: {
              overall_impression: "Analysis temporarily unavailable",
              confidence_level: 7,
              key_strengths: ["Unable to analyze at this time"],
              areas_for_improvement: ["Try again later"],
              final_score: 7
          }
      };
  }
}

// Function to analyze emotion data
function analyzeEmotions(emotionData) {
  try {
      const emotions = {};
      const totalDuration = emotionData.length;

      // Count each emotion occurrence
      emotionData.forEach(entry => {
          emotions[entry.emotion] = (emotions[entry.emotion] || 0) + 1;
      });

      // Calculate percentages
      Object.keys(emotions).forEach(emotion => {
          emotions[emotion] = ((emotions[emotion] / totalDuration) * 100).toFixed(1);
      });

      return emotions;
  } catch (error) {
      console.error('Emotion Analysis Error:', error);
      return { "Neutral": "100.0" };
  }
}

// Main upload and analysis endpoint
app.post('/api/upload', (req, res) => {
  console.log('Upload request received');
  
  upload(req, res, async function(err) {
      if (err) {
          console.error('Upload error:', err);
          return res.status(400).json({
              success: false,
              message: err.message || 'File upload failed'
          });
      }

      try {
          console.log('Files received:', req.files);
          console.log('Body data received:', req.body);

          // Ensure required files are present
          if (!req.files || !req.files.videoFile || !req.files.audioFile) {
              throw new Error('Missing required files');
          }

          // Parse data
          const emotionData = JSON.parse(req.body.emotionData);
          const speechData = JSON.parse(req.body.speechData);

          console.log('Parsed emotion data:', emotionData);
          console.log('Parsed speech data:', speechData);

          // Generate mock report for testing
          const mockReport = {
              summary: {
                  totalDuration: speechData.duration + ' seconds',
                  wordsPerMinute: speechData.wpm,
                  totalWords: speechData.totalWords
              },
              grammarAnalysis: {
                  score: 8,
                  feedback: "Good grammar usage"
              },
              sentimentAnalysis: {
                  confidenceScore: 7,
                  clarityScore: 8,
                  overallImpression: "Positive and clear presentation",
                  sentiment: "Positive"
              },
              professionalAnalysis: {
                  communicationScore: 8,
                  organizationScore: 7,
                  recommendations: [
                      "Maintain good pace",
                      "Continue clear articulation"
                  ]
              },
              emotionAnalysis: {
                  "Neutral": "60",
                  "Happy": "30",
                  "Engaged": "10"
              }
          };

          res.json({
              success: true,
              message: 'Upload and analysis complete',
              report: mockReport
          });

      } catch (error) {
          console.error('Processing error:', error);
          res.status(500).json({
              success: false,
              message: error.message || 'Error processing recording'
          });
      }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: err.message
  });
});

// Connect to MongoDB
mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB connected successfully!");
    // Start the server only after successful DB connection
    app.listen(PORT, () => {
      console.log(`Server is running on port: ${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });
