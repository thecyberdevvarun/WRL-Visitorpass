import sql from "mssql";
import { dbConfig2 } from "../config/db.config.js";
import { tryCatch } from "../utils/tryCatch.js";
import { AppError } from "../utils/AppError.js";
import { generateId } from "../utils/generateId.js";

/* Generate Visitor Pass */
export const generateVisitorPass = tryCatch(async (req, res) => {
  const {
    visitorPhoto,
    name,
    contactNo,
    email,
    company,
    noOfPeople,
    nationality,
    identityType,
    identityNo,
    address,
    country,
    state,
    city,
    vehicleDetails,
    allowOn,
    allowTill,
    departmentTo,
    employeeTo,
    visitType,
    token,
    specialInstruction,
    purposeOfVisit,
    createdBy,
  } = req.body;

  if (!name || !contactNo) {
    throw new AppError("Name and Contact No are required", 400);
  }

  const pool = await new sql.ConnectionPool(dbConfig2).connect();

  try {
    /* ---------- Check Existing Visitor ---------- */

    const existingVisitor = await pool
      .request()
      .input("ContactNo", sql.VarChar(20), contactNo)
      .query(`SELECT visitor_id FROM visitors WHERE contact_no = @ContactNo`);

    let visitorId;

    /* ---------- If Visitor Exists → UPDATE ---------- */

    if (existingVisitor.recordset.length) {
      visitorId = existingVisitor.recordset[0].visitor_id;

      await pool
        .request()
        .input("VisitorId", sql.VarChar(50), visitorId)
        .input("Company", sql.VarChar(255), company || null)
        .input("Nationality", sql.VarChar(100), nationality || null)
        .input("IdentityType", sql.VarChar(50), identityType || null)
        .input("IdentityNo", sql.VarChar(100), identityNo || null)
        .input("Address", sql.NVarChar(sql.MAX), address || null)
        .input("Country", sql.VarChar(100), country || null)
        .input("State", sql.VarChar(100), state || null)
        .input("City", sql.VarChar(100), city || null)
        .input("VehicleDetails", sql.VarChar(100), vehicleDetails || null)
        .query(`
          UPDATE visitors
          SET 
            company = @Company,
            nationality = @Nationality,
            identity_type = @IdentityType,
            identity_no = @IdentityNo,
            address = @Address,
            country = @Country,
            state = @State,
            city = @City,
            vehicle_details = @VehicleDetails
          WHERE visitor_id = @VisitorId
        `);
    } else {
      /* ---------- If Visitor Not Exists → INSERT ---------- */
      visitorId = generateId("WRLV");

      await pool
        .request()
        .input("VisitorId", sql.VarChar(50), visitorId)
        .input("Name", sql.NVarChar(255), name)
        .input("ContactNo", sql.VarChar(20), contactNo)
        .input("Email", sql.VarChar(255), email || null)
        .input("Company", sql.VarChar(255), company || null)
        .input("Nationality", sql.VarChar(100), nationality || null)
        .input("IdentityType", sql.VarChar(50), identityType || null)
        .input("IdentityNo", sql.VarChar(100), identityNo || null)
        .input("Address", sql.NVarChar(sql.MAX), address || null)
        .input("Country", sql.VarChar(100), country || null)
        .input("State", sql.VarChar(100), state || null)
        .input("City", sql.VarChar(100), city || null)
        .input("VehicleDetails", sql.VarChar(100), vehicleDetails || null)
        .input("VisitorPhoto", sql.NVarChar(sql.MAX), visitorPhoto || null)
        .query(`
          INSERT INTO visitors (
            visitor_id,name,contact_no,email,company,nationality,
            identity_type,identity_no,address,country,state,city,
            vehicle_details,photo_url
          )
          VALUES (
            @VisitorId,@Name,@ContactNo,@Email,@Company,@Nationality,
            @IdentityType,@IdentityNo,@Address,@Country,@State,@City,
            @VehicleDetails,@VisitorPhoto
          )
        `);
    }

    /* ---------- Create Visitor Pass ---------- */

    const passId = generateId("WRLVP");

    await pool
      .request()
      .input("PassId", sql.VarChar(50), passId)
      .input("VisitorId", sql.VarChar(50), visitorId)
      .input("VisitorPhoto", sql.NVarChar(sql.MAX), visitorPhoto || null)
      .input("Name", sql.NVarChar(255), name)
      .input("ContactNo", sql.VarChar(20), contactNo)
      .input("Email", sql.VarChar(255), email || null)
      .input("DepartmentToVisit", sql.VarChar(100), departmentTo || null)
      .input("EmployeeToVisit", sql.VarChar(50), employeeTo || null)
      .input("VisitType", sql.VarChar(50), visitType || null)
      .input("Token", sql.VarChar(50), token || null)
      .input("NoOfPeople", sql.Int, noOfPeople || 1)
      .input("AllowOn", sql.DateTime, allowOn ? new Date(allowOn) : new Date())
      .input("AllowTill", sql.DateTime, allowTill ? new Date(allowTill) : null)
      .input(
        "SpecialInstructions",
        sql.NVarChar(sql.MAX),
        specialInstruction || null,
      )
      .input("PurposeOfVisit", sql.VarChar(100), purposeOfVisit || null)
      .input("CreatedBy", sql.VarChar(50), createdBy || null)
      .input("Status", sql.Int, 1).query(`
        INSERT INTO visitor_passes (
          pass_id, visitor_id, visitor_photo, visitor_name,
          visitor_contact_no, visitor_email, department_to_visit,
          employee_to_visit, visit_type, token, no_of_people,
          allow_on, allow_till, special_instructions,
          purpose_of_visit, created_by, status
        )
        VALUES (
          @PassId,@VisitorId,@VisitorPhoto,@Name,
          @ContactNo,@Email,@DepartmentToVisit,
          @EmployeeToVisit,@VisitType,@Token,
          @NoOfPeople,@AllowOn,@AllowTill,
          @SpecialInstructions,@PurposeOfVisit,
          @CreatedBy,@Status
        )
      `);

    res.status(201).json({
      success: true,
      message: "Visitor pass generated successfully",
      data: {
        passId,
        visitorId,
      },
    });
  } finally {
    await pool.close();
  }
});

/* Fetch Previous Visitor */
export const fetchPreviousPass = tryCatch(async (req, res) => {
  const { contactNo } = req.query;

  if (!contactNo) {
    throw new AppError("Contact number is required", 400);
  }

  const pool = await new sql.ConnectionPool(dbConfig2).connect();

  const result = await pool
    .request()
    .input("ContactNo", sql.VarChar(20), contactNo)
    .query(`SELECT * FROM visitors WHERE contact_no = @ContactNo`);

  await pool.close();

  if (!result.recordset.length) {
    return res.status(200).json({
      success: false,
      message: "No data found",
      data: null,
    });
  }

  res.status(200).json({
    success: true,
    message: "Visitor found",
    data: result.recordset[0],
  });
});

/* Get Visitor Pass Details */
export const getVisitorPassDetails = tryCatch(async (req, res) => {
  const { passId } = req.params;

  if (!passId) {
    throw new AppError("Pass ID is required", 400);
  }

  const pool = await new sql.ConnectionPool(dbConfig2).connect();

  const result = await pool.request().input("PassId", sql.VarChar(50), passId)
    .query(`
      SELECT 
        vp.pass_id,
        vp.visitor_name,
        vp.visitor_contact_no,
        vp.visitor_email,
        vp.visitor_photo,
        v.company,
        v.address,
        v.city,
        v.state,
        d.department_name,
        u.name AS employee_name,
        vp.allow_on,
        vp.allow_till,
        vp.purpose_of_visit,
        vp.no_of_people
      FROM visitor_passes vp
      INNER JOIN visitors v ON v.visitor_id = vp.visitor_id
      LEFT JOIN departments d ON vp.department_to_visit = d.deptCode
      LEFT JOIN users u ON vp.employee_to_visit = u.employee_id
      WHERE vp.pass_id = @PassId
    `);

  await pool.close();

  if (!result.recordset.length) {
    throw new AppError("Visitor pass not found", 404);
  }

  res.status(200).json({
    success: true,
    data: result.recordset[0],
  });
});
