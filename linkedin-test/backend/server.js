import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const BASE_URL = "https://api1.unipile.com:13111";
const API_KEY = process.env.UNIPILE_API_KEY;

console.log("Loaded API KEY:", API_KEY);

let savedAccountId = null;

app.get("/connect-linkedin", async (req, res) => {
  try {
    const response = await fetch(
      `${BASE_URL}/api/v1/hosted/accounts/link`,
      {
        method: "POST",
        headers: {
          "X-API-KEY": API_KEY,
          "Content-Type": "application/json",
          "accept": "application/json"
        },
        body: JSON.stringify({
          type: "create",               
          providers: ["LINKEDIN"],       
          api_url: BASE_URL,       
          notify_url: process.env.CALLBACK_URL,
          success_redirect_url: "http://localhost:5500/success.html",
          failure_redirect_url: "http://localhost:5500/error.html",  
          name: "test_user_123"
        }),
      }
    );

    const data = await response.json();

    console.log("Unipile response:", data);

    if (!data.url) {
      return res.status(500).json({
        error: "No auth URL returned",
        full_response: data,
      });
    }

    res.json({
      auth_url: data.url,
    });

  } catch (err) {
    console.error("Error:", err);
    res.status(500).json({ error: "Failed to generate link" });
  }
});

app.post("/callback", (req, res) => {
  console.log("Callback received:", req.body);

  if (req.body.status === "CREATION_SUCCESS") {
    savedAccountId = req.body.account_id;
    console.log("Saved account ID:", savedAccountId);
  }

  res.send("OK");
});

app.get("/profile", async (req, res) => {
  try {
    if (!savedAccountId) {
      return res.status(400).json({ error: "No account connected" });
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/accounts/${savedAccountId}`,
      {
        headers: {
          "X-API-KEY": API_KEY,
          "accept": "application/json"
        },
      }
    );

    const data = await response.json();
    res.json(data);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching profile");
  }
});

app.get("/download", async (req, res) => {
  try {
    if (!savedAccountId) {
      return res.status(400).send("No data available");
    }

    const response = await fetch(
      `${BASE_URL}/api/v1/accounts/${savedAccountId}`,
      {
        headers: {
          "X-API-KEY": API_KEY,
          "accept": "application/json"
        },
      }
    );

    const data = await response.json();

    res.setHeader("Content-Disposition", "attachment; filename=linkedin.json");
    res.setHeader("Content-Type", "application/json");
    res.send(JSON.stringify(data, null, 2));

  } catch (err) {
    console.error(err);
    res.status(500).send("Download error");
  }
});

app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

app.listen(process.env.PORT || 5000, () => {
  console.log(`Server running on http://localhost:5000`);
});