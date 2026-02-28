const express = require("express");
const cors = require("cors");
const axios = require("axios");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({ message: "Backend running 🚀" });
});

app.post("/evaluate", async (req, res) => {
  try {
    const { persona, pitch } = req.body;

    // 1️⃣ Get embedding from Python service
    const embeddingResponse = await axios.post(
      "http://127.0.0.1:5001//embed",
      { text: pitch }
    );

    const vector = embeddingResponse.data.vector;

    res.json({
      message: "Embedding generated successfully",
      persona,
      vectorLength: vector.length,
    });

  } catch (error) {
    console.error(error.message);
    res.status(500).json({ error: "Something went wrong" });
  }
});


const PORT = 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});