const express = require("express");
const router = express.Router();
const multer = require("multer");
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const sdk = require("microsoft-cognitiveservices-speech-sdk");
const dotenv = require("dotenv");
dotenv.config();

const uploadFolder = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadFolder)) {
  fs.mkdirSync(uploadFolder);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadFolder),
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const allowedTypes = /webm|mp4|avi|mov|mp3/;
    const isValidType = allowedTypes.test(path.extname(file.originalname).toLowerCase()) &&
                        allowedTypes.test(file.mimetype);
    return isValidType ? cb(null, true) : cb(new Error("Invalid file type."));
  },
}).fields([{ name: "videoFile", maxCount: 1 }, { name: "audioFile", maxCount: 1 }]);

router.post("/upload", upload, async (req, res) => {
  try {
    const audioFile = req.files?.audioFile?.[0];
    const { textData, sessionId } = req.body;

    if (!audioFile || !textData || !sessionId) {
      return res.status(400).json({ error: "Missing required fields." });
    }

    const outputPath = path.join(uploadFolder, `${sessionId}.wav`);

    exec(`${ffmpegPath} -i "${audioFile.path}" "${outputPath}"`, (error) => {
      if (error) {
        return res.status(500).json({ error: `ffmpeg error: ${error.message}` });
      }

      const pronConfig = new sdk.PronunciationAssessmentConfig(
        textData,
        sdk.PronunciationAssessmentGradingSystem.HundredMark,
        sdk.PronunciationAssessmentGranularity.Phoneme
      );

      const audioConfig = sdk.AudioConfig.fromWavFileInput(fs.readFileSync(outputPath));
      const recognizer = new sdk.SpeechRecognizer(sdk.SpeechConfig.fromSubscription(
        process.env.SPEECH_API_KEY, process.env.SPEECH_REGION
      ), audioConfig);

      pronConfig.applyTo(recognizer);

      recognizer.recognizeOnceAsync(result => {
        if (result.reason === sdk.ResultReason.RecognizedSpeech) {
          const json = JSON.parse(result.properties.getProperty(sdk.PropertyId.SpeechServiceResponse_JsonResult));
          const { AccuracyScore, FluencyScore, CompletenessScore } = json.NBest[0].PronunciationAssessment;
          return res.status(200).json({ accuracy: AccuracyScore, fluency: FluencyScore, completeness: CompletenessScore });
        } else {
          res.status(500).json({ error: `Speech recognition error: ${result.errorDetails}` });
        }
        recognizer.close();
      });
    });
  } catch (error) {
    res.status(500).json({ error: `Server error: ${error.message}` });
  }
});

module.exports = router;
