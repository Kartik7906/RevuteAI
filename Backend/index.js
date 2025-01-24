const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const multer = require("multer");
const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
const fs = require("fs");
const fsPromises = fs.promises;

const { MongoClient, ObjectId } = require("mongodb");

dotenv.config();
const PORT = process.env.PORT || 8000;
const MONGODB_URI = process.env.MONGODB_URI;

app.use(cors({
  origin: '*',                    
  methods: ['GET', 'POST'],        
  allowedHeaders: ['Content-Type'] 
}));
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ extended: true, limit: "50mb" }));

app.use(express.static(path.join(__dirname)));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes from original code, convert all the routes in this way to follow industry level code:
app.use("/api/users", require("./Routes/UserRoute"));

app.get("/", (req, res) => {
  res.send("Hello World!");
});

// put privatekey of google generative AI here: only 2 line of code:

// ends here:

const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${file.fieldname}-${timestamp}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["video/webm", "audio/webm", "video/mp4", "audio/mp3"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024, 
  },
}).fields([
  { name: "videoFile", maxCount: 1 },
  { name: "audioFile", maxCount: 1 },
]);

app.use("/uploads", express.static(path.join(__dirname, "uploads")));

async function analyzeWithGemini(text) {
  return {};
}

function analyzeEmotions(emotionData) {
  return { Neutral: "100.0" };
}

// Example route using gemini
app.post("/api/gemini", async (req, res) => {
  try {
    const { transcript } = req.body;
    let suggestions = [];

    if (!transcript.toLowerCase().includes("project")) {
      suggestions.push("Mention the projects you've worked on to showcase your experience.");
    }

    if (!transcript.toLowerCase().includes("goal")) {
      suggestions.push("Add a clear statement of your career goals or future aspirations.");
    }

    if (!transcript.toLowerCase().includes("leadership")) {
      suggestions.push("Highlight any leadership roles or team experiences you've had.");
    }

    if (!transcript.toLowerCase().includes("belong")) {
      suggestions.push("Include a brief note about where you are from or your cultural background.");
    }

    if (!transcript.toLowerCase().includes("currently")) {
      suggestions.push("Mention what you're currently doing (e.g., your job, studies, or side projects).");
    }

    while (suggestions.length < 3) {
      suggestions.push("Provide more detailed examples to make your introduction stand out.");
    }

    if (suggestions.length > 5) {
      suggestions = suggestions.slice(0, 5);
    }

    res.json({ suggestions });
  } catch (error) {
    console.error("Gemini suggestions error:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});


// Endpoint to handle uploads
app.post("/api/upload", (req, res) => {
  console.log("Upload request received");
  upload(req, res, async function (err) {
    if (err) {
      console.error("Upload error:", err);
      return res.status(400).json({
        success: false,
        message: err.message || "File upload failed",
      });
    }
    try {
      console.log("Files received:", req.files);
      console.log("Body data:", req.body);

      if (!req.files || !req.files.videoFile || !req.files.audioFile) {
        throw new Error("Missing required files");
      }

      const emotionData = JSON.parse(req.body.emotionData);
      const speechData = JSON.parse(req.body.speechData);

      // Example mock report
      const mockReport = {
        summary: {
          totalDuration: speechData.duration + " seconds",
          wordsPerMinute: speechData.wpm,
          totalWords: speechData.totalWords,
        },
        grammarAnalysis: { score: 8, feedback: "Good grammar usage" },
        sentimentAnalysis: {
          confidenceScore: 7,
          clarityScore: 8,
          overallImpression: "Positive",
          sentiment: "Positive",
        },
        professionalAnalysis: {
          communicationScore: 8,
          organizationScore: 7,
          recommendations: [
            "Maintain good pace",
            "Continue clear articulation",
          ],
        },
        emotionAnalysis: {
          Neutral: "60",
          Happy: "30",
          Engaged: "10",
        },
      };

      res.json({
        success: true,
        message: "Upload and analysis complete",
        report: mockReport,
      });
    } catch (error) {
      console.error("Processing error:", error);
      res.status(500).json({
        success: false,
        message: error.message || "Error processing recording",
      });
    }
  });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: "Internal server error",
    error: err.message,
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB (Mongoose) connected successfully!");
    connectSecondDatabaseAndStartServer();
  })
  .catch((err) => {
    console.error("Error connecting to first MongoDB:", err);
  });

//  CONNECT SECOND DB 
const secondMongoURI = process.env.SECOND_MONGO_URI;
let secondDb = null;

function connectSecondDatabaseAndStartServer() {
  MongoClient.connect(secondMongoURI)
    .then((client) => {
      console.log("Connected to second MongoDB (usersDB)");
      secondDb = client.db("usersDB");

      secondDb
        .listCollections()
        .toArray()
        .then((collections) => {
          const collectionNames = collections.map((c) => c.name);
          if (!collectionNames.includes("notifications")) {
            secondDb
              .createCollection("notifications")
              .then(() => {
                console.log("Created notifications collection in second DB");
                secondDb
                  .collection("notifications")
                  .createIndex({ timestamp: -1 });
                secondDb.collection("notifications").createIndex({ read: 1 });
              })
              .catch((err) =>
                console.error("Error creating notifications collection:", err)
              );
          }
        })
        .catch((err) =>
          console.error("Error listing collections in second DB:", err)
        );
      app.use(express.static("public"));

      app.get("/home", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_users: true })
            .sort({ user_approval_date: -1 })
            .toArray();

          let indexHtml = await fsPromises.readFile(
            path.join(__dirname, "public", "index.html"),
            "utf8"
          );

          const scenarioOptions = scenarios
            .map((s) => `<option value="${s._id}">${s.scenario}</option>`)
            .join("\n");

          indexHtml = indexHtml.replace(
            "{% for scenario in scenarios %}",
            scenarioOptions
          );

          res.send(indexHtml);
        } catch (error) {
          console.error("Error serving /home index:", error);
          res.status(500).json({ error: "Server error" });
        }
      });


      app.get("/api/scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_users: true })
            .sort({ user_approval_date: -1 })
            .toArray();
          res.json(scenarios);
        } catch (error) {
          console.error("Error fetching scenarios:", error);
          res.status(500).json({ error: "Failed to fetch scenarios" });
        }
      });

      app.post("/api/scenarios/prompt", async (req, res) => {
        try {
          const { scenario_id } = req.body;
          if (!scenario_id) {
            return res.status(400).json({ error: "No scenario ID provided" });
          }
          const scenario = await secondDb.collection("admin").findOne({
            _id: new ObjectId(scenario_id),
          });
          if (!scenario || !scenario.prompt) {
            return res.status(404).json({ error: "Scenario not found" });
          }
          res.json({ prompt: scenario.prompt });
        } catch (error) {
          console.error("Error fetching prompt:", error);
          res.status(500).json({ error: "Failed to fetch prompt" });
        }
      });

      app.post("/api/scenarios/create", async (req, res) => {
        try {
          const result = await secondDb.collection("admin").insertOne({
            ...req.body,
            visible_to_users: false,
            notification_sent: false,
          });
          res.status(201).json({
            message: "Scenario created successfully",
            id: result.insertedId,
          });
        } catch (error) {
          console.error("Error creating scenario:", error);
          res.status(500).json({ error: "Failed to create scenario" });
        }
      });

      app.get("/api/admin/scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_admin: true })
            .toArray();

          res.json(
            scenarios.map((doc) => ({
              _id: doc._id,
              scenario: doc.scenario,
              prompt: doc.prompt,
              question: doc.question,
              visible_to_users: doc.visible_to_users,
            }))
          );
        } catch (error) {
          console.error("Error fetching admin scenarios:", error);
          res.status(500).json({ error: "Failed to fetch scenarios" });
        }
      });

      app.post("/api/admin/toggle-visibility", async (req, res) => {
        try {
          const { ids, action } = req.body;
          if (!ids?.length) {
            return res.status(400).json({ error: "No scenarios specified" });
          }

          if (action === "add") {
            for (const id of ids) {
              const scenario = await secondDb.collection("admin").findOne({
                _id: new ObjectId(id),
              });

              if (scenario) {
                await secondDb.collection("notifications").insertOne({
                  title: "New Scenario Available",
                  message: `New scenario available: '${scenario.scenario}'`,
                  scenario_id: id,
                  source: "admin",
                  timestamp: new Date(),
                  read: false,
                  accepted: false,
                });

                await secondDb.collection("admin").updateOne(
                  { _id: new ObjectId(id) },
                  {
                    $set: {
                      notification_sent: true,
                      notification_date: new Date(),
                    },
                  }
                );
              }
            }
          }

          res.json({
            success: true,
            message: "Notifications sent successfully",
            modified_count: ids.length,
          });
        } catch (error) {
          console.error("Error toggling visibility:", error);
          res.status(500).json({ error: "Failed to update visibility" });
        }
      });

    
      app.get("/api/notifications", async (req, res) => {
        try {
          const notifications = await secondDb
            .collection("notifications")
            .find()
            .sort({ timestamp: -1 })
            .toArray();

          res.json(
            notifications.map((notification) => ({
              id: notification._id,
              title: notification.title,
              message: notification.message,
              time: notification.timestamp.toISOString(),
              read: notification.read,
              accepted: notification.accepted,
              scenario_id: notification.scenario_id,
              source: notification.source,
            }))
          );
        } catch (error) {
          console.error("Error fetching notifications:", error);
          res.status(500).json({ error: "Failed to fetch notifications" });
        }
      });

      app.get("/api/notifications/unread-count", async (req, res) => {
        try {
          const count = await secondDb
            .collection("notifications")
            .countDocuments({ read: false });
          res.json({ count });
        } catch (error) {
          console.error("Error getting unread count:", error);
          res.status(500).json({ error: "Failed to get unread count" });
        }
      });

      app.post("/api/notifications/mark-all-read", async (req, res) => {
        try {
          const result = await secondDb
            .collection("notifications")
            .updateMany({}, { $set: { read: true } });
          res.json({
            success: true,
            modified_count: result.modifiedCount,
          });
        } catch (error) {
          console.error("Error marking notifications as read:", error);
          res.status(500).json({ error: "Failed to mark notifications as read" });
        }
      });

      app.post("/api/notifications/:id/read", async (req, res) => {
        try {
          const result = await secondDb
            .collection("notifications")
            .updateOne(
              { _id: new ObjectId(req.params.id) },
              { $set: { read: true } }
            );
          res.json({
            success: true,
            modified_count: result.modifiedCount,
          });
        } catch (error) {
          console.error("Error marking notification as read:", error);
          res.status(500).json({ error: "Failed to mark notification as read" });
        }
      });

    
      app.post("/api/superadmin/toggle-user-visibility", async (req, res) => {
        try {
          const { ids, action } = req.body;
          if (!ids?.length) {
            return res.status(400).json({ error: "No scenarios specified" });
          }

          if (action === "add") {
            for (const id of ids) {
              const scenario = await secondDb.collection("admin").findOne({
                _id: new ObjectId(id),
              });

              if (scenario) {
                await secondDb.collection("notifications").insertOne({
                  title: "New Scenario From SuperAdmin",
                  message: `SuperAdmin has shared a new scenario: '${scenario.scenario}'`,
                  scenario_id: id,
                  source: "superadmin",
                  timestamp: new Date(),
                  read: false,
                  accepted: false,
                });

                await secondDb.collection("admin").updateOne(
                  { _id: new ObjectId(id) },
                  {
                    $set: {
                      notification_sent: true,
                      notification_date: new Date(),
                    },
                  }
                );
              }
            }
            return res.json({
              message: "Notifications sent successfully",
              modified_count: ids.length,
            });
          } else {
            const objectIds = ids.map((id) => new ObjectId(id));

            const result = await secondDb.collection("admin").updateMany(
              { _id: { $in: objectIds } },
              {
                $set: { visible_to_users: false },
                $unset: {
                  user_approval_date: "",
                  sent_by: "",
                },
              }
            );

            await secondDb.collection("notifications").deleteMany({
              scenario_id: { $in: ids },
            });

            return res.json({
              message: "Successfully removed from user view",
              modified_count: result.modifiedCount,
            });
          }
        } catch (error) {
          console.error("Error in superadmin toggle:", error);
          res.status(500).json({ error: "Failed to update scenarios" });
        }
      });

      app.post("/get_prompt", async (req, res) => {
        try {
          const scenario_id = req.body.scenario_id;
          if (!scenario_id) {
            return res.status(400).json({ error: "No scenario ID provided" });
          }

          const scenario = await secondDb.collection("admin").findOne({
            _id: new ObjectId(scenario_id),
            visible_to_users: true,
          });

          if (!scenario || !scenario.prompt) {
            return res
              .status(404)
              .json({ error: "Scenario not found or no prompt available" });
          }

          console.log("Sending prompt for scenario:", scenario.scenario);
          res.json({ prompt: scenario.prompt });
        } catch (error) {
          console.error("Error fetching prompt:", error);
          res.status(500).json({ error: "Failed to fetch prompt" });
        }
      });

    


      app.post("api/save_chat_history", async (req, res) => { 
        try {
          const { chatHistory } = req.body;
          if (!chatHistory) {
            return res.status(400).json({ error: "No chat history provided" });
          }

          const cleanedHistory = chatHistory
            .replace(/<br>/g, "\n")
            .replace(/<br\/>/g, "\n")
            .trim();

          await fsPromises.writeFile("chat_history.txt", cleanedHistory, "utf8");

          const analysis = await analyzeConversation(cleanedHistory);
          await fsPromises.writeFile(
            "analysis_report.json",
            JSON.stringify(analysis, null, 4),
            "utf8"
          );

          await secondDb.collection("conversation_analyses").insertOne({
            conversation: cleanedHistory,
            analysis: analysis,
            timestamp: new Date(),
          });

          res.json({
            message: "Chat history and analysis saved successfully!",
            analysis: analysis,
          });
        } catch (error) {
          console.error("Error saving chat history:", error);
          res.status(500).json({ error: "Failed to save chat history" });
        }
      });

    
      app.get("/report", async (req, res) => {
        try {
          if (!(await fileExists("analysis_report.json"))) {
            return res.render("report", {
              error: "No analysis report found. Please complete a conversation first.",
            });
          }

          const fileContent = await fsPromises.readFile(
            "analysis_report.json",
            "utf8"
          );
          const analysisData = JSON.parse(fileContent);

          const validationResult = validateAnalysisData(analysisData);
          if (!validationResult.valid) {
            return res.render("report", {
              error: `Incomplete analysis data: missing ${validationResult.missing.join(
                ", "
              )}`,
            });
          }

          res.render("report", { analysis: analysisData });
        } catch (error) {
          console.error("Error in report route:", error);
          res.render("report", {
            error: `An unexpected error occurred: ${error.message}`,
          });
        }
      });

      app.get("/api/accepted-scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_users: true })
            .sort({ user_approval_date: -1 })
            .toArray();
      
          res.json(
            scenarios.map((scenario) => ({
              _id: scenario._id,
              scenario: scenario.scenario,
              prompt: scenario.prompt,
              question: scenario.question,
              acceptance_date: scenario.user_approval_date,
            }))
          );
        } catch (error) {
          console.error("Error fetching accepted scenarios:", error);
          res.status(500).json({ error: "Internal Server Error" });
        }
      });
      

      app.get("/admin/scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_admin: true })
            .toArray();

          res.json(
            scenarios.map((doc) => ({
              _id: doc._id,
              scenario: doc.scenario,
              prompt: doc.prompt,
              question: doc.question,
              visible_to_users: doc.visible_to_users,
            }))
          );
        } catch (error) {
          console.error("Error fetching admin scenarios:", error);
          res.status(500).json({ error: "Failed to fetch scenarios" });
        }
      });

      app.get("/admin/current-user-scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_users: true })
            .toArray();

          res.json(
            scenarios.map((doc) => ({
              _id: doc._id,
              scenario: doc.scenario,
              prompt: doc.prompt,
              question: doc.question,
              approval_date: doc.user_approval_date,
            }))
          );
        } catch (error) {
          console.error("Error fetching user scenarios:", error);
          res.status(500).json({ error: "Failed to fetch scenarios" });
        }
      });

      app.post("/admin/toggle_visibility", async (req, res) => {
        try {
          const { ids, action } = req.body;
          if (!ids?.length) {
            return res.status(400).json({ error: "No scenarios specified" });
          }

          const objectIds = ids.map((id) => new ObjectId(id));
          const visibleToAdmin = await secondDb.collection("admin").countDocuments({
            _id: { $in: objectIds },
            visible_to_admin: true,
          });

          if (visibleToAdmin !== ids.length) {
            return res.status(403).json({
              error: "Unauthorized access to some scenarios",
            });
          }

          if (action === "add") {
            const scenarios = await secondDb
              .collection("admin")
              .find({ _id: { $in: objectIds } })
              .toArray();

            for (const scenario of scenarios) {
              await secondDb.collection("notifications").insertOne({
                title: "New Scenario Available",
                message: `New scenario available: '${scenario.scenario || "Unnamed"}'`,
                timestamp: new Date(),
                read: false,
                accepted: false,
                scenario_id: scenario._id.toString(),
                source: "admin",
              });

              await secondDb.collection("admin").updateOne(
                { _id: scenario._id },
                {
                  $set: {
                    notification_sent: true,
                    notification_date: new Date(),
                  },
                }
              );
            }
          }

          res.json({
            message: "Notifications sent successfully",
            modified_count: ids.length,
          });
        } catch (error) {
          console.error("Error in visibility toggle:", error);
          res.status(500).json({ error: error.toString() });
        }
      });

      app.get("/superadmin/current-user-scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_users: true })
            .toArray();

          res.json(
            scenarios.map((doc) => ({
              _id: doc._id,
              scenario: doc.scenario,
              approval_date: doc.user_approval_date,
              admin_approval_date: doc.admin_approval_date,
            }))
          );
        } catch (error) {
          console.error("Error fetching user scenarios:", error);
          res.status(500).json({ error: "Failed to fetch scenarios" });
        }
      });

      app.get("/superadmin/current-admin-scenarios", async (req, res) => {
        try {
          const scenarios = await secondDb
            .collection("admin")
            .find({ visible_to_admin: true })
            .toArray();

          res.json(
            scenarios.map((doc) => ({
              _id: doc._id,
              scenario: doc.scenario,
              approval_date: doc.admin_approval_date,
              user_visible: doc.visible_to_users,
            }))
          );
        } catch (error) {
          console.error("Error fetching admin scenarios:", error);
          res.status(500).json({ error: "Failed to fetch scenarios" });
        }
      });

      app.post("/superadmin/toggle-admin-visibility", async (req, res) => {
        try {
          const { ids, action } = req.body;
          if (!ids?.length) {
            return res.status(400).json({ error: "No scenarios specified" });
          }

          const objectIds = ids.map((id) => new ObjectId(id));
          let result;

          if (action === "add") {
            result = await secondDb.collection("admin").updateMany(
              { _id: { $in: objectIds } },
              {
                $set: {
                  visible_to_admin: true,
                  admin_approval_date: new Date(),
                },
              }
            );
            return res.json({
              message: "Successfully added to admin view",
              modified_count: result.modifiedCount,
            });
          } else {
            result = await secondDb.collection("admin").updateMany(
              { _id: { $in: objectIds } },
              {
                $set: { visible_to_admin: false },
                $unset: { admin_approval_date: "" },
              }
            );
            return res.json({
              message: "Successfully removed from admin view",
              modified_count: result.modifiedCount,
            });
          }
        } catch (error) {
          console.error("Error toggling admin visibility:", error);
          res.status(500).json({ error: "Failed to update scenarios" });
        }
      });

    
      app.post("/api/chat/process", async (req, res) => {
        const { messages } = req.body;

        try {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const chat = model.startChat({
            history: messages.slice(0, -1),
          });

          const result = await chat.sendMessage(messages[messages.length - 1].content);
          const response = await result.response;

          res.json({ reply: response.text() });
        } catch (error) {
          console.error("Error processing chat:", error);
          res.status(500).json({ error: "Failed to process chat message" });
        }
      });

      app.post("/api/chat/save", async (req, res) => {
        try {
          const { chatHistory } = req.body;
          if (!chatHistory) {
            return res.status(400).json({ error: "No chat history provided" });
          }

          const formattedHistory = await formatChatHistory(chatHistory);
          await fsPromises.writeFile("chat_history.txt", formattedHistory, "utf8");

          const analysis = await analyzeConversation(formattedHistory);
          await fsPromises.writeFile(
            "analysis_report.json",
            JSON.stringify(analysis, null, 4),
            "utf8"
          );

          await secondDb.collection("conversation_analyses").insertOne({
            conversation: formattedHistory,
            analysis: analysis,
            timestamp: new Date(),
          });

          res.json({
            message: "Chat history and analysis saved successfully!",
            analysis: analysis,
          });
        } catch (error) {
          console.error("Error saving chat history:", error);
          res.status(500).json({ error: "Failed to save chat history" });
        }
      });

      app.get("/history", async (req, res) => {
        try {
          const history = await secondDb.collection("admin").find().toArray();
          res.json(
            history.map((doc) => ({
              _id: doc._id,
              scenario: doc.scenario || "",
              prompt: doc.prompt || "",
              question: doc.question || "",
              visible_to_users: doc.visible_to_users || false,
              visible_to_admin: doc.visible_to_admin || false,
            }))
          );
        } catch (error) {
          console.error("Error fetching history:", error);
          res.status(500).json({ error: "Failed to fetch history" });
        }
      });

     
    
      async function formatChatHistory(chatHistory) {
        let cleaned = chatHistory
          .replace(/<br>/g, "\n")
          .replace(/<br\/>/g, "\n")
          .trim();

        const lines = cleaned.split("\n");
        const formatted = [];
        let currentSpeaker = null;
        let currentMessage = [];

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("User:")) {
            if (currentSpeaker) {
              formatted.push(`${currentSpeaker}: ${currentMessage.join(" ")}`);
            }
            currentSpeaker = "User";
            currentMessage = [trimmed.slice(5).trim()];
          } else if (trimmed.startsWith("Assistant:")) {
            if (currentSpeaker) {
              formatted.push(`${currentSpeaker}: ${currentMessage.join(" ")}`);
            }
            currentSpeaker = "Assistant";
            currentMessage = [trimmed.slice(10).trim()];
          } else {
            currentMessage.push(trimmed);
          }
        }

        if (currentSpeaker && currentMessage.length) {
          formatted.push(`${currentSpeaker}: ${currentMessage.join(" ")}`);
        }

        return formatted.join("\n");
      }

      async function analyzeConversation(conversation) {
        try {
          const model = genAI.getGenerativeModel({ model: "gemini-pro" });
          const prompt = `
            Analyze this conversation and provide scores for:
            1. Grammar and Language Usage (Score out of 10)
            2. Product Knowledge & Negotiation Skills (Score out of 10)
            3. Confidence Level (Score out of 10)

            Conversation:
            ${conversation}

            Provide the scores in JSON format:
            {
                "Role play Grammar Score": "<score>",
                "Product Knowledge & Negotiation Skills Score": "<score>",
                "Confidence Score": "<score>"
            }
          `;

          const result = await model.generateContent(prompt);
          const response = await result.response;
          const jsonMatch = response.text().match(/\{[\s\S]*\}/);

          if (!jsonMatch) {
            throw new Error("No JSON found in response");
          }

          return JSON.parse(jsonMatch[0]);
        } catch (error) {
          console.error("Analysis error:", error);
          throw error;
        }
      }

      async function fileExists(filename) {
        try {
          await fsPromises.access(filename);
          return true;
        } catch {
          return false;
        }
      }

      function validateAnalysisData(data) {
        const requiredKeys = [
          "Role play Grammar Score",
          "Product Knowledge & Negotiation Skills Score",
          "Confidence Score",
        ];

        const missing = requiredKeys.filter((key) => !(key in data));
        return {
          valid: missing.length === 0,
          missing,
        };
      }

      app.use((err, req, res, next) => {
        console.error(err.stack);
        res.status(500).json({
          error: "Internal Server Error",
          message:
            process.env.NODE_ENV === "development" ? err.message : "Something went wrong",
        });
      });

      app.listen(PORT, () => {
        console.log(`Server running on port: ${PORT}`);
        console.log(`Both DB connections established successfully.`);
      });
    })
    .catch((err) => {
      console.error("Error connecting to second MongoDB:", err);
    });
}
