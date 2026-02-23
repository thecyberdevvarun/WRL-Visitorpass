import sql from "mssql";
import { dbConfig2 } from "../config/db.config.js";

// fetch visitor data controller
export const visitors = async (_, res) => {
  let pool;
  try {
    pool = await new sql.ConnectionPool(dbConfig2).connect();

    const result = await pool.request().query("SELECT * FROM dbo.visitors");

    res.status(200).json({
      success: true,
      message: "Visitors data fetched successfully",
      data: result.recordset,
    });
  } catch (error) {
    console.error("Error while fetching visitor data:", error.message);
    res.status(500).json({
      success: false,
      message: "Error while fetching visitor data",
      error: error.message,
    });
  } finally {
    if (pool) await pool.close();
  }
};
