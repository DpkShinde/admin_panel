import { NextResponse, NextRequest } from "next/server";
import pool4 from "@/utils/db3QuaterlyE";

export async function DELETE(req: NextRequest) {
  const connection = await pool4.getConnection();
  await connection.beginTransaction();

  try {
    const { id } = await req.json();
    const companyId = Number(id);

    if (!companyId || isNaN(companyId)) {
      return NextResponse.json(
        { success: false, message: "Valid company ID is required." },
        { status: 400 }
      );
    }

    // Delete from child tables first
    await connection.query("DELETE FROM balance_sheet WHERE company_id = ?", [
      companyId,
    ]);

    await connection.query(`DELETE FROM business_areas WHERE company_id = ?`, [
      companyId,
    ]);

    await connection.query("DELETE FROM cash_flow WHERE company_id = ?", [
      companyId,
    ]);
    await connection.query(
      "DELETE FROM financial_ratios WHERE company_id = ?",
      [companyId]
    );
    await connection.query(
      "DELETE FROM income_statement WHERE company_id = ?",
      [companyId]
    );
    await connection.query("DELETE FROM management WHERE company_id = ?", [
      companyId,
    ]);
    await connection.query("DELETE FROM news WHERE company_id = ?", [
      companyId,
    ]);
    await connection.query("DELETE FROM peer_analysis WHERE company_id = ?", [
      companyId,
    ]);
    await connection.query("DELETE FROM npa WHERE company_id = ?", [companyId]);
    await connection.query(
      "DELETE FROM quarterly_earnings WHERE company_id = ?",
      [companyId]
    );
    await connection.query("DELETE FROM shareholding WHERE company_id = ?", [
      companyId,
    ]);

    //delete form paraent table
    await connection.query("DELETE FROM company_info WHERE company_id = ?", [
      companyId,
    ]);

    //delete from parent table
    await connection.query(
      `DELETE FROM company_financial_results WHERE company_id = ?`,
      [companyId]
    );

    await connection.commit();
    connection.release();

    return NextResponse.json(
      {
        success: true,
        message: "Company and all related records deleted successfully.",
      },
      { status: 200 }
    );
  } catch (error) {
    await connection.rollback();
    connection.release();
    console.error("Error deleting company data:", error);
    return NextResponse.json(
      { success: false, message: "Internal Server Error" },
      { status: 500 }
    );
  }
}
