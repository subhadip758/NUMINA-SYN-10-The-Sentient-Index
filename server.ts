import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function startServer() {
  const app = express();
  app.use(express.json());
  const PORT = 3000;

  // State Management
  let currentScore = 7.4;
  let history: { timestamp: number; value: number }[] = [
    { timestamp: Date.now() - 3600000 * 5, value: 7.1 },
    { timestamp: Date.now() - 3600000 * 4, value: 7.3 },
    { timestamp: Date.now() - 3600000 * 3, value: 7.2 },
    { timestamp: Date.now() - 3600000 * 2, value: 7.5 },
    { timestamp: Date.now() - 3600000 * 1, value: 7.4 },
  ];
  let predictedScore = 7.6;

  const cities = {
    "Kolkata": 6.2,
    "Tokyo": 8.1,
    "New York": 5.9,
    "London": 7.0,
    "Berlin": 7.8,
    "Mumbai": 5.4,
    "Paris": 7.5,
    "Sydney": 8.4,
    "Sao Paulo": 6.1,
    "Cairo": 5.8,
    "Beijing": 6.5,
    "Seoul": 7.9,
    "Dubai": 6.8,
    "Toronto": 8.2
  };

  let lastTrends: "rising" | "falling" | "stable" = "rising";
  let logs: { id: string; message: string; timestamp: number; type: "info" | "success" | "warning" | "error" }[] = [
    { id: "1", message: "System initialized. Sentient index active.", timestamp: Date.now(), type: "success" }
  ];

  function addLog(message: string, type: "info" | "success" | "warning" | "error" = "info") {
    logs.unshift({ id: Math.random().toString(36).substr(2, 9), message, timestamp: Date.now(), type });
    if (logs.length > 30) logs.pop();
  }

  // Simulate global index fluctuations
  setInterval(() => {
    const fluctuation = (Math.random() - 0.5) * 0.1;
    const oldScore = currentScore;
    currentScore = Math.max(1, Math.min(10, currentScore + fluctuation));
    
    if (Math.abs(currentScore - oldScore) < 0.01) {
      lastTrends = "stable";
    } else {
      lastTrends = currentScore > oldScore ? "rising" : "falling";
      if (Math.abs(currentScore - oldScore) > 0.05) {
        addLog(`Global node fluctuation detected: ${lastTrends}`, "info");
      }
    }

    if (history.length > 50) history.shift();
    history.push({ timestamp: Date.now(), value: parseFloat(currentScore.toFixed(2)) });
    
    // Update prediction slightly based on trend
    const predictionFluctuation = (Math.random() - 0.4) * (lastTrends === "rising" ? 0.2 : -0.2);
    predictedScore = Math.max(1, Math.min(10, currentScore + predictionFluctuation));
  }, 10000);

  // API Routes
  app.get("/api/index", (req, res) => {
    res.json({
      score: parseFloat(currentScore.toFixed(1)),
      predictedScore: parseFloat(predictedScore.toFixed(1)),
      trend: lastTrends,
      history: history.slice(-20),
      cities: Object.entries(cities).map(([name, value]) => ({ name, value })),
      logs: logs.slice(0, 10),
      timestamp: Date.now()
    });
  });

  app.post("/api/vote", (req, res) => {
    const { vote } = req.body; // "yes", "no", "neutral"
    const impact = vote === "yes" ? 0.05 : vote === "no" ? -0.05 : 0;
    currentScore = Math.max(1, Math.min(10, currentScore + impact));
    addLog(`User vote received: ${vote.toUpperCase()}. Impact: ${impact.toFixed(3)}`, vote === "yes" ? "success" : vote === "no" ? "warning" : "info");
    res.json({ success: true, newScore: currentScore });
  });

  app.post("/api/sentiment", (req, res) => {
    const { text } = req.body;
    
    // Simulated sentiment analysis
    let score = 0.5;
    let aiResponse = "Processing... data stream unreadable.";
    if (text) {
      const lower = text.toLowerCase();
      if (lower.includes("good") || lower.includes("optimal") || lower.includes("sustainable") || lower.includes("great") || lower.includes("clean")) {
        score = 0.8 + Math.random() * 0.2;
        aiResponse = "Neural consensus shifted positive. Energy optimization protocols active.";
      } else if (lower.includes("bad") || lower.includes("waste") || lower.includes("critical") || lower.includes("terrible") || lower.includes("pollution")) {
        score = 0.1 + Math.random() * 0.2;
        aiResponse = "Critical anomalies detected. Defensive heuristics deploying to stabilize node.";
      } else {
        score = 0.4 + Math.random() * 0.2;
        aiResponse = "Input assimilated. Marginal fluctuations recorded in the local cluster.";
      }
    }
    
    const impact = (score - 0.5) * 0.2; // Map 0-1 to -0.1 to 0.1
    currentScore = Math.max(1, Math.min(10, currentScore + impact));
    addLog(`Neural sentiment analysis: ${(score * 100).toFixed(0)}% stability.`, score > 0.6 ? "success" : score < 0.4 ? "error" : "info");
    res.json({ success: true, newScore: currentScore, aiResponse });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
