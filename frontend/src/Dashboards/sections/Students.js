import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import usePagination from "../../hooks/usePagination";
import styles from "./Students.module.css";

const Students = () => {
  const [students, setStudents] = useState([]);
  const [file, setFile] = useState(null);
  const [isVaccinationModalOpen, setIsVaccinationModalOpen] = useState(false);
  const [isAddStudentModalOpen, setIsAddStudentModalOpen] = useState(false);
  const [isVaccinationDriveModalOpen, setIsVaccinationDriveModalOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [vaccinationDrives, setVaccinationDrives] = useState([]);
  const [selectedDrive, setSelectedDrive] = useState("");
  const [newStudent, setNewStudent] = useState({
    username: "",
    class_grade: "",
    student_id: "",
    is_vaccinated: false,
    vaccine_name: "",
    date_of_vaccination: "",
  });
  const [searchQuery, setSearchQuery] = useState("");
  const [filterByVaccination, setFilterByVaccination] = useState("all"); // "all", "vaccinated", "not_vaccinated"
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStudent, setEditStudent] = useState(null);

  const classGradeRegex = /^([1-9]|1[0-2])[A-Z]$|^[A-Z]{2,}[0-9]{2,}$/;
  const studentIdRegex = /^[a-zA-Z0-9]{6}$/; // Regex for exactly 6 alphanumeric characters

  const fetchStudents = async () => {
    try {
      const res = await axios.get("/students");
      setStudents(res.data);
    } catch (err) {
      console.error("Error fetching students:", err);
    }
  };

  const fetchVaccinationDrives = async (classGrade) => {
    try {
      const response = await axios.get(`/drives/by-class?class_grade=${classGrade}`);
      setVaccinationDrives(response.data);
    } catch (error) {
      console.error("Error fetching drives:", error);
      setVaccinationDrives([]);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file");
      return;
    }
    const formData = new FormData();
    formData.append("file", file);
    try {
      const res = await axios.post("/students/bulk", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      alert(res.data.msg);
      fetchStudents();
    } catch (err) {
      console.error("Error uploading file:", err);
      alert("Upload failed. Check file format.");
    }
  };

  const openEditModal = (student) => {
    setEditStudent(student);
    setSelectedStudent(student); // Set the selected student
    setIsEditModalOpen(true);
  };

  const openVaccinationDriveModal = (student) => {
    setSelectedStudent(student); // Set the selected student
    fetchVaccinationDrives(student.class_grade); // Fetch available vaccination drives
    setIsVaccinationDriveModalOpen(true); // Open the vaccination drive modal
  };

  const handleVaccinate = async () => {
    if (!selectedDrive) {
      alert("Please select a vaccination drive.");
      return;
    }

    // Check if the student is already vaccinated with the same vaccine
    if (selectedStudent.vaccine_name === selectedDrive.vaccine_name) {
      alert(
        `The student is already vaccinated with ${selectedDrive.vaccine_name}.`
      );
      setIsVaccinationModalOpen(false);
      setSelectedStudent(null);
      setSelectedDrive("");
      return;
    }

    const currentDate = new Date();
    const driveDate = new Date(selectedDrive.date);
    if (driveDate > currentDate) {
      alert(
        "The vaccination drive date is in the future. The student cannot be marked as vaccinated until the drive is completed."
      );
      setIsVaccinationModalOpen(false);
      setSelectedStudent(null);
      setSelectedDrive("");
      return;
    }

    try {
      // Make the API call to update the student's vaccination status
      const res = await axios.put(`/students/${selectedStudent._id}/vaccinate`, {
        vaccine_name: selectedDrive.vaccine_name,
        date_of_vaccination: selectedDrive.date,
      });

      // Debugging log
      console.log("Vaccination API response:", res.data);

      if (res.status === 200) {
        alert(res.data.msg);

        // Update the frontend state
        setStudents((prev) =>
          prev.map((student) =>
            student._id === selectedStudent._id
              ? {
                  ...student,
                  is_vaccinated: true,
                  vaccine_name: selectedDrive.vaccine_name,
                  date_of_vaccination: selectedDrive.date,
                }
              : student
          )
        );

        // Reset modal and selected data
        setIsVaccinationModalOpen(false);
        setSelectedStudent(null);
        setSelectedDrive("");
      } else {
        alert("Failed to mark the student as vaccinated.");
      }
    } catch (err) {
      console.error("Error vaccinating student:", err);
      alert("Failed to vaccinate student.");
    }
  };

  const handleAddStudentChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewStudent((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    if (name === "is_vaccinated" && checked) {
      if (!editStudent.class_grade) {
        alert("Please enter the student's class grade before selecting vaccination.");
        return;
      }
      fetchVaccinationDrives(newStudent.class_grade);
      setIsVaccinationDriveModalOpen(true);
    }
  };

  const handleAddStudentSubmit = async (e) => {
    e.preventDefault();

    // Validate student_id
    if (!studentIdRegex.test(newStudent.student_id)) {
      alert("Student ID must be exactly 6 characters long and can only contain letters and numbers.");
      return;
    }

    // Validate class_grade
    if (!classGradeRegex.test(newStudent.class_grade)) {
      alert(
        "Class Grade must be a number (1-12) followed by an uppercase letter (e.g., 1A, 12B) or a branch and class (e.g., CS101, ME202)."
      );
      return;
    }

    if (newStudent.is_vaccinated && (!newStudent.vaccine_name || !newStudent.date_of_vaccination)) {
      alert("Please select a vaccination drive and date.");
      return;
    }

    try {
      await axios.post("/students", newStudent);
      alert("Student added successfully!");
      fetchStudents();
      setIsAddStudentModalOpen(false);
      setNewStudent({
        username: "",
        class_grade: "",
        student_id: "",
        is_vaccinated: false,
        vaccine_name: "",
        date_of_vaccination: "",
      });
    } catch (err) {
      console.error("Error adding student:", err);
      alert("Failed to add student.");
    }
  };

  const handleEditChange = (e) => {
    const { name, value, type, checked } = e.target;

    if (name === "is_vaccinated") {
      if (!checked) {
        // Reset vaccine_name and date_of_vaccination to N/A when unchecked
        setEditStudent((prev) => ({
          ...prev,
          is_vaccinated: false,
          vaccine_name: "N/A",
          date_of_vaccination: "N/A",
        }));
      } else {
        // Set the selected student and open the vaccination drive modal
        if (!editStudent.class_grade) {
          alert("Please enter the student's class grade before selecting vaccination.");
          return;
        }
        setSelectedStudent(editStudent); // Retain the selected student
        setIsEditModalOpen(false);
        fetchVaccinationDrives(editStudent.class_grade);
        setIsVaccinationDriveModalOpen(true);
      }
    } else {
      // Handle other input changes
      setEditStudent((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();

    // Validate student_id
    if (!studentIdRegex.test(editStudent.student_id)) {
      alert("Student ID must be exactly 6 characters long and can only contain letters and numbers.");
      return;
    }

    // Validate class_grade
    if (!classGradeRegex.test(editStudent.class_grade)) {
      alert(
        "Class Grade must be a number (1-12) followed by an uppercase letter (e.g., 1A, 12B) or a branch and class (e.g., CS101, ME202)."
      );
      return;
    }

    const { _id, ...updatedData } = editStudent; // Exclude `_id` from the payload
    try {
      await axios.put(`/students/${_id}`, updatedData);
      alert("Student details updated successfully!");
      fetchStudents(); // Refresh the student list
      setIsEditModalOpen(false);
      setEditStudent(null);
    } catch (err) {
      console.error("Error updating student details:", err);
      alert("Failed to update student details.");
    }
  };

  const handleEditVaccinationDriveSelect = () => {
    console.log("Selected Student:", selectedStudent); // Debug log

    if (!selectedDrive) {
      alert("Please select a vaccination drive.");
      return;
    }

    const currentDate = new Date();
    const driveDate = new Date(selectedDrive.date);

    // Validate that the selected drive is not in the future
    if (driveDate > currentDate) {
      alert(
        "The selected vaccination drive date is in the future. You cannot mark the student as vaccinated until the drive is completed."
      );
      return;
    }

    // Ensure selectedStudent is not null
    if (!selectedStudent) {
      alert("No student selected. Please try again.");
      return;
    }

    // Update the selected student's vaccination details
    setStudents((prev) =>
      prev.map((student) =>
        student._id === selectedStudent._id
          ? {
              ...student,
              vaccine_name: selectedDrive.vaccine_name,
              date_of_vaccination: selectedDrive.date,
              is_vaccinated: true,
            }
          : student
      )
    );

    // Close the vaccination drive modal
    setIsVaccinationDriveModalOpen(false);
    handleVaccinate(); // Call the vaccination function to update the backend
    // Reset the selected drive and student
    setSelectedDrive("");
    setSelectedStudent(null);
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  const filteredStudents = students.filter((s) => {
    const matchesSearchQuery =
      s.username?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.class_grade?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.student_id?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesVaccinationFilter =
      filterByVaccination === "all" ||
      (filterByVaccination === "vaccinated" && s.is_vaccinated) ||
      (filterByVaccination === "not_vaccinated" && !s.is_vaccinated);

    return matchesSearchQuery && matchesVaccinationFilter;
  });

  const { currentRows, totalPages, currentPage, handlePageChange } = usePagination(filteredStudents);

  return (
    <div>
      <h2>Manage Students</h2>
      <div className={styles.upload}>
        <input type="file" accept=".csv" onChange={handleFileChange} />
        <button onClick={handleUpload}>Upload CSV</button>
        <button onClick={() => setIsAddStudentModalOpen(true)}>Add Student</button>
        <a
          href="/sample_students.csv"
          download
          className={styles.downloadButton}
        >
          Download Sample CSV
        </a>
      </div>

      {/* Search and Filter */}
      <div className={styles.filters}>
        <input
          type="text"
          placeholder="Search by name, class, or ID"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <select
          value={filterByVaccination}
          onChange={(e) => setFilterByVaccination(e.target.value)}
        >
          <option value="all">All</option>
          <option value="vaccinated">Vaccinated</option>
          <option value="not_vaccinated">Not Vaccinated</option>
        </select>
      </div>

      {/* Modal for Adding Student */}
      {isAddStudentModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Add Student</h3>
            <form onSubmit={handleAddStudentSubmit} className={styles.form}>
              <input
                name="username"
                value={newStudent.username}
                onChange={handleAddStudentChange}
                placeholder="Username"
                required
              />
              <input
                name="class_grade"
                value={newStudent.class_grade}
                onChange={handleAddStudentChange}
                placeholder="Class Grade (e.g., 1A, 12B, CS101)"
                required
              />
              <input
                name="student_id"
                value={newStudent.student_id}
                onChange={handleAddStudentChange}
                placeholder="Student ID"
                required
              />
              <label>
                <input
                  type="checkbox"
                  name="is_vaccinated"
                  checked={newStudent.is_vaccinated}
                  onChange={handleAddStudentChange}
                />
                Is Vaccinated
              </label>
              <button type="submit">Submit</button>
              <button type="button" onClick={() => setIsAddStudentModalOpen(false)}>
                Cancel
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Modal for Vaccination */}
      {isVaccinationModalOpen && selectedStudent && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>Vaccinate {selectedStudent.username}</h3>
            {vaccinationDrives.length > 0 ? (
              <select
                className={styles.modalSelect}
                value={selectedDrive._id || ""}
                onChange={(e) =>
                  setSelectedDrive(
                    vaccinationDrives.find((drive) => drive._id === e.target.value)
                  )
                }
              >
                <option value="">Select a Vaccination Drive</option>
                {vaccinationDrives.map((drive) => (
                  <option key={drive._id} value={drive._id}>
                    {drive.vaccine_name} - {drive.date ? new Date(drive.date).toLocaleDateString() : "Invalid Date"}
                  </option>
                ))}
              </select>
            ) : (
              <p>No upcoming drives</p>
            )}
            {vaccinationDrives.length > 0 && (
              <div className={styles.buttonContainer}>
                <button type="submit" onClick={handleVaccinate}>Confirm</button>
                <button type="button" onClick={() => setIsVaccinationModalOpen(false)}>Cancel</button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal for Selecting Vaccination Drive */}
      {isVaccinationDriveModalOpen && selectedStudent && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Select Vaccination Drive for {selectedStudent.username}</h3>
            {vaccinationDrives.length > 0 ? (
              <select
                className={styles.modalSelect}
                value={selectedDrive._id || ""}
                onChange={(e) =>
                  setSelectedDrive(
                    vaccinationDrives.find((drive) => drive._id === e.target.value)
                  )
                }
              >
                <option value="">Select a Vaccination Drive</option>
                {vaccinationDrives
                  .filter(
                    (drive) =>
                      Array.isArray(drive.classes) && // Ensure drive.classes is an array
                      drive.classes.some((cls) => cls === selectedStudent.class_grade) // Check if student's class is one of the classes
                  )
                  .map((drive) => (
                    <option key={drive._id} value={drive._id}>
                      {drive.vaccine_name} - {drive.date ? new Date(drive.date).toLocaleDateString() : "Invalid Date"}
                    </option>
                  ))}
              </select>
            ) : (
              <p className={styles.noDrivesText}>No upcoming drives</p>
            )}
            <div className={styles.buttonContainer}>
              <button
                type="button"
                className={styles.confirmButton}
                onClick={handleEditVaccinationDriveSelect}
              >
                Confirm
              </button>
              <button
                type="button"
                className={styles.cancelButton}
                onClick={() => setIsVaccinationDriveModalOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Editing Student */}
      {isEditModalOpen && editStudent && !isVaccinationDriveModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3 className={styles.modalHeader}>Edit Student Details</h3>
            <form onSubmit={handleEditSubmit} className={styles.form}>
              <input
                className={styles.modalInput}
                name="username"
                value={editStudent.username || ""}
                onChange={handleEditChange}
                placeholder="Username"
                required
              />
              <input
                className={styles.modalInput}
                name="class_grade"
                value={editStudent.class_grade || ""}
                onChange={handleEditChange}
                placeholder="Class Grade (e.g., 1A, 12B, CS101)"
                required
              />
              <input
                className={styles.modalInput}
                name="student_id"
                value={editStudent.student_id || ""}
                onChange={handleEditChange}
                placeholder="Student ID"
                required
              />
                <input
                  type="checkbox"
                  name="is_vaccinated"
                  checked={editStudent.is_vaccinated || false}
                  onChange={handleEditChange}
                />
                Is Vaccinated
              {editStudent.is_vaccinated && (
                <>
                  <input
                    className={styles.modalInput}
                    name="vaccine_name"
                    value={editStudent.vaccine_name || ""}
                    onChange={handleEditChange}
                    placeholder="Vaccine Name"
                    required
                  />
                  <input
                    className={styles.modalInput}
                    type="date"
                    name="date_of_vaccination"
                    value={editStudent.date_of_vaccination || ""}
                    onChange={handleEditChange}
                    required
                  />
                </>
              )}
              <div className={styles.buttonContainer}>
                <button
                  type="submit"
                  className={styles.confirmButton}
                >
                  Save
                </button>
                <button
                  type="button"
                  className={styles.cancelButton}
                  onClick={() => setIsEditModalOpen(false)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Username</th>
            <th>Class</th>
            <th>Student ID</th>
            <th>Vaccinated</th>
            <th>Vaccine Name</th>
            <th>Date of Vaccination</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((s) => (
            <tr key={s?._id}>
              <td>{s?.username}</td>
              <td>{s?.class_grade}</td>
              <td>{s?.student_id || "N/A"}</td>
              <td>
                <input
                  type="checkbox"
                  checked={s?.is_vaccinated}
                  onChange={(e) => {
                    if (e.target.checked) {
                      openVaccinationDriveModal(s); // Open the vaccination drive modal
                    } else {
                      const confirmReset = window.confirm(
                        "Are you sure you want to unmark this student as vaccinated? This will reset their vaccination details."
                      );
                      if (confirmReset) {
                        setStudents((prev) =>
                          prev.map((student) =>
                            student._id === s._id
                              ? {
                                  ...student,
                                  is_vaccinated: false,
                                  vaccine_name: "N/A",
                                  date_of_vaccination: "N/A",
                                }
                              : student
                          )
                        );
                      } else {
                        fetchStudents(); // Refresh the student list to reset the state
                      }
                    }
                  }}
                />
              </td>
              <td>{s?.vaccine_name || "N/A"}</td>
              <td>
                {s?.date_of_vaccination
                  ? new Date(s.date_of_vaccination.$date || s.date_of_vaccination).toLocaleDateString()
                  : "N/A"}
              </td>
              <td>
                <button onClick={() => openEditModal(s)}>Edit</button>
                {!s?.is_vaccinated && (
                  <button onClick={() => openVaccinationDriveModal(s)}>Mark Vaccinated</button>
                )}
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

export default Students;
