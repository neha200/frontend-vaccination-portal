import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import usePagination from "../../hooks/usePagination";
import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import "jspdf-autotable";
import styles from "./Reports.module.css";

const Reports = () => {
  const [data, setData] = useState([]);
  const [vaccineOptions, setVaccineOptions] = useState([]);
  const [classOptions, setClassOptions] = useState([]);
  const [filters, setFilters] = useState({
    vaccine: "",
    class_grade: "",
  });
  const [report, setReport] = useState({
    total_students: 0,
    vaccinated_students: 0,
  });

  const fetchData = async () => {
    try {
      const res = await axios.get("/students");
      console.log("Fetched students:", res.data); // Log the fetched data
      const vaccinated = res.data.filter((s) => s.is_vaccinated);
      setData(res.data); // Set all students, not just vaccinated ones
      setReport({
        total_students: res.data.length,
        vaccinated_students: vaccinated.length,
      });

      // Extract unique vaccine names, filtering out null or undefined values
      const uniqueVaccines = [
        ...new Set(res.data.map((s) => s.vaccine_name).filter((name) => name)),
      ];
      setVaccineOptions(uniqueVaccines);

      // Extract unique class names
      const uniqueClasses = [
        ...new Set(res.data.map((s) => s.class_grade).filter(Boolean)),
      ];
      setClassOptions(uniqueClasses);
    } catch (err) {
      console.error(err);
    }
  };

  const filteredData = data.filter((s) => {
    return (
      (!filters.vaccine || s.vaccine_name?.toLowerCase() === filters.vaccine.toLowerCase()) &&
      (!filters.class_grade || s.class_grade?.toLowerCase() === filters.class_grade.toLowerCase())
    );
  });

  const { currentRows, totalPages, currentPage, handlePageChange } = usePagination(filteredData);

  const handleExportCSV = () => {
    const headers = ["Name", "Class", "Vaccinated", "Vaccine", "Date"];
    const rows = filteredData.map((s) => [
      s.name || s.username, 
      s.class_grade || "N/A", 
      s.is_vaccinated ? "Yes" : "No", 
      s.vaccine_name || "N/A", 
      s.date_of_vaccination || "N/A",
    ]);

    let csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = "vaccination_report.csv";
    link.click();
  };

  const handleExportExcel = () => {
    const headers = ["Name", "Class", "Vaccinated", "Vaccine", "Date"];
    const rows = filteredData.map((s) => [
      s.name || s.username, 
      s.class_grade || "N/A", 
      s.is_vaccinated ? "Yes" : "No", 
      s.vaccine_name || "N/A", 
      s.date_of_vaccination || "N/A",
    ]);

    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...rows]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Vaccination Report");

    XLSX.writeFile(workbook, "vaccination_report.xlsx");
  };

  const handleExportPDF = () => {
    const doc = new jsPDF();
    const headers = [["Name", "Class", "Vaccinated", "Vaccine", "Date"]];
    const rows = filteredData.map((s) => [
      s.name || s.username || "N/A",
      s.class_grade || "N/A",
      s.is_vaccinated ? "Yes" : "No",
      s.vaccine_name || "N/A",
      s.date_of_vaccination || "N/A",
    ]);

    doc.text("Vaccination Report", 14, 10);
    doc.autoTable({
      head: headers,
      body: rows,
      startY: 20,
    });

    doc.save("vaccination_report.pdf");
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div>
      <h2>Vaccination Report</h2>

      {/* Display report summary */}
      <div className={styles.summary}>
        <p>Total Students: {report.total_students || 0}</p>
        <p>Vaccinated Students: {report.vaccinated_students || 0}</p>
      </div>

      {/* Export Buttons */}
      <div className={styles.exportButtons}>
        <button onClick={handleExportCSV}>Download CSV</button>
        <button onClick={handleExportExcel}>Download Excel</button>
        <button onClick={handleExportPDF}>Download PDF</button>
      </div>

      {/* Filters */}
      <div className={styles.filters}>
        <select
          value={filters.vaccine}
          onChange={(e) => setFilters({ ...filters, vaccine: e.target.value })}
        >
          <option value="">All Vaccines</option>
          {vaccineOptions.map((vaccine, index) => (
            <option key={index} value={vaccine}>
              {vaccine}
            </option>
          ))}
        </select>
        <select
          value={filters.class_grade}
          onChange={(e) => setFilters({ ...filters, class_grade: e.target.value })}
        >
          <option value="">All Classes</option>
          {classOptions.map((classGrade) => (
            <option key={classGrade} value={classGrade}>
              {classGrade}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Class</th>
            <th>Vaccinated</th>
            <th>Vaccine</th>
            <th>Date of Vaccination</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((s, index) => (
            <tr key={`${s._id || index}-${s.username}-${s.class_grade}`}>
              <td>{s.username}</td>
              <td>{s.class_grade}</td>
              <td>{s.is_vaccinated ? "Yes" : "No"}</td>
              <td>{s.vaccine_name || "N/A"}</td>
              <td>
                {s?.date_of_vaccination
                  ? new Date(s.date_of_vaccination.$date || s.date_of_vaccination).toLocaleDateString()
                  : "N/A"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            onClick={() => handlePageChange(index + 1)}
            className={currentPage === index + 1 ? styles.activePage : ""}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Reports;
