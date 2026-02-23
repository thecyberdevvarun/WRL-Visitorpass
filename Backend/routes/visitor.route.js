import express from "express";
import { getDashboardStats } from "../controllers/dashboard.controller.js";
import {
  fetchPreviousPass,
  generateVisitorPass,
  getVisitorPassDetails,
} from "../controllers/generatepass.controller.js";
import {
  getAllVisitors,
  getVisitorDetails,
} from "../controllers/history.controller.js";
import {
  getVisitorLogs,
  visitorIn,
  visitorOut,
} from "../controllers/inOut.controller.js";
import {
  fetchVisitors,
  sendVisitorReport,
} from "../controllers/reports.controller.js";
import { visitors } from "../controllers/visitors.controller.js";

const router = express.Router();

// -----------------> Visitor Pass Routes
router.post("/generate-pass", generateVisitorPass);
router.get("/fetch-previous-pass", fetchPreviousPass);
router.get("/pass-details/:passId", getVisitorPassDetails);

// -----------------> Visitor In Out Routes
router.post("/in", visitorIn);
router.post("/out", visitorOut);
router.get("/logs", getVisitorLogs);
router.get("/reprint/:passId", getVisitorPassDetails);

// -----------------> Visitor Reports Routes
router.get("/repot", fetchVisitors);
router.post("/send-report", sendVisitorReport);
router.get("/visitors", visitors);
// -----------------> Visitor Dashboard Routes
router.get("/dashboard-stats", getDashboardStats);
// -----------------> Visitor History Routes
router.get("/history", getAllVisitors);
router.get("/details/:visitorId", getVisitorDetails);

export default router;
