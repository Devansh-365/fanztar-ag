import express from "express";
import http from "http";
import cors from "cors";

import router from "./router";

const app = express();

app.use(
  cors({
    credentials: true,
  })
);
app.use(express.json());

const server = http.createServer(app);

server.listen(4000, () => {
  console.log("Server running on http://localhost:4000/");
});

app.use("/api", router());

export default app;
