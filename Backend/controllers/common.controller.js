import sql from "mssql";
import { dbConfig1, dbConfig2 } from "../config/db.config.js";
import { tryCatch } from "../utils/tryCatch.js";
import { AppError } from "../utils/AppError.js";

// Fetches a list of all departments from the **Department** table.
export const getDepartments = tryCatch(async (_, res) => {
  const query = `
    Select DeptCode, Name 
    From Department;
  `;

  const pool = await new sql.ConnectionPool(dbConfig1).connect();

  try {
    const result = await pool.request().query(query);

    res.status(200).json({
      success: true,
      message: "Departments fetched successfully",
      data: result.recordset,
    });
  } catch (error) {
    throw new AppError("Failed to fetch departments", 500);
  } finally {
    await pool.close();
  }
});

// Fetches a list of all employees along with their department information.
export const getEmployeesWithDepartments = tryCatch(async (_, res) => {
  const query = `
    SELECT 
      u.name,
      u.employee_id,
      dpt.department_name,
      dpt.deptCode
    FROM users AS u
    INNER JOIN departments AS dpt
      ON u.department_id = dpt.deptCode;
  `;

  const pool = await new sql.ConnectionPool(dbConfig2).connect();

  try {
    const result = await pool.request().query(query);

    res.status(200).json({
      success: true,
      message: "Employees with departments fetched successfully",
      data: result.recordset,
    });
  } catch (error) {
    throw new AppError("Failed to fetch employees with departments", 500);
  } finally {
    await pool.close();
  }
});
