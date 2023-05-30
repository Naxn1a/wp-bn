require("dotenv").config();
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const route = require("./src/routes/route");
const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(cors({origin: process.env.CLIENT,credentials: true}));

app.get("/", (req, res) => res.send("it's work!"));
app.use(route);

app.listen(process.env.PORT, () => console.log("server is running"));
