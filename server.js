const express = require("express");
const axios = require("axios");
const app = express();

app.use(express.json());
app.use(express.static("public"));

const userAuthCodes = {};

// Health‑check / landing page so Render sees a 200 on '/'
app.get("/", (req, res) => {
  res.send("✅ Google‑Auth server is running");
});

// OAuth callback (called by Google after login)
app.get("/auth/google/callback", async (req, res) => {
  const authCode = req.query.code;
  const state = req.query.state;

  if (!authCode || !state) {
    return res
      .status(400)
      .send("Missing authorization code or state parameter.");
  }

  userAuthCodes[state] = { authCode };

  const deepLink = `journeywithin://auth?state=${state}`;
  res.redirect(deepLink);
});

//Reset Password
app.post("/api/reset-password", async (req, res) => {
  const { token, password } = req.body;

  try {
    const response = await axios.post(
      `https://${process.env.PLAYFAB_TITLE_ID}.playfabapi.com/Server/ConfirmPasswordRecovery`,
      {
        Token: token,
        Password: password,
      },
      {
        headers: {
          "X-SecretKey": process.env.PLAYFAB_SECRET_KEY,
          "Content-Type": "application/json",
        },
      },
    );

    return res.json({
      success: true,
      message: "Password successfully reset.",
    });
  } catch (err) {
    if (err.response) {
      return res.status(400).json({
        success: false,
        message:
          err.response.data.errorMessage ||
          err.response.data.error ||
          "Password reset failed.",
      });
    }

    console.error(err);

    return res.status(500).json({
      success: false,
      message: "Internal server error.",
    });
  }
});

// Endpoint for Unity to retrieve the profile data by state
app.get("/getProfile", (req, res) => {
  const state = req.query.state;
  if (state && userAuthCodes[state]) {
    const entry = userAuthCodes[state];
    delete userAuthCodes[state]; // Clear memory
    res.json(entry);
  } else {
    res.status(404).send("Profile not found.");
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});
