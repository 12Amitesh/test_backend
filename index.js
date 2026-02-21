import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { OAuth2Client } from "google-auth-library";
import jwt from "jsonwebtoken";
dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
const client = new OAuth2Client(
  process.env.GOOGLE_CLIENT_ID
);
app.post("/auth/google", async (req, res) => {
 try {
    console.log("Received Google auth request");
    const { idToken } = req.body;

    if (!idToken) {
      return res.status(400).json({
        message: "ID Token is required",
      });
    }

    // 1️⃣ Verify token with Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    const {
      sub: googleId,
      email,
      name,
      picture,
    } = payload;

    // 2️⃣ Find or create user (mock DB)
    // 👉 Replace this with Prisma / DB later
    const user = {
      id: googleId,
      email,
      name,
      avatar: picture,
      role: "USER",
    };

    // 3️⃣ Create YOUR JWT
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

   console.log("User authenticated:", user.email, "Token created", token);
    res.json({
      token,
      user,
    });

  } catch (error) {
    console.error(error);
    res.status(401).json({
      message: "Invalid Google token",
    });
  }





  
});








app.get("/health", (req, res) => {
    console.log("Health check endpoint hit");
  res.send("Auth server running");
});







const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`http://localhost:${PORT}`);
});
