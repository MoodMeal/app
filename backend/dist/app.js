import 'dotenv/config';
import { config } from "./config.js";
import express from "express";
import cors from "cors";
import chatRoutes from "./routes/chatRoutes.js";
import promptsRoutes from "./routes/promptsRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
const app = express();
app.use(cors({
    origin: 'http://localhost:5173'
}));
app.use(express.json());
app.use("/api/chat", chatRoutes);
app.use("/api/prompts", promptsRoutes);
app.use("/api/recommendations", recommendationRoutes);
const PORT = config.port || 4000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
//# sourceMappingURL=app.js.map