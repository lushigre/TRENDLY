import express from "express";
import cors from "cors";
import router from "./routes.js"; // .js extension जरूरी है

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use("/api", router);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
