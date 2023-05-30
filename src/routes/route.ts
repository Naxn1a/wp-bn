import { Router } from "express";
import { login, register } from "../controllers/users";
import { auth } from "../middlewares/auth";
import { accessUrl, createUrl, deleteUrl, getUrl } from "../controllers/url";

const router = Router();

// user
router.post("/user/register", register);
router.post("/user/login", login);

// auth
router.get("/user/auth", auth);

// url
router.post("/url/create", createUrl);
router.post("/url/access", accessUrl);
router.get("/url/get", getUrl);
router.delete("/url/del", deleteUrl);

module.exports = router;
