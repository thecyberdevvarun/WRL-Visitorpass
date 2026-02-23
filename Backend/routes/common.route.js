import express from "express";
import {
  getDepartments,
  getEmployeesWithDepartments,
} from "../controllers/common.controller.js";

const router = express.Router();

router.get("/departments", getDepartments);
router.get("/employees-with-departments", getEmployeesWithDepartments);

export default router;
