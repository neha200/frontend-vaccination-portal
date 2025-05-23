import React, { useState, useEffect } from "react";
import axios from "../../api/axios";
import usePagination from "../../hooks/usePagination";
import styles from "./Drives.module.css";

const Drives = () => {
  const [drives, setDrives] = useState([]);
  const [form, setForm] = useState({
    vaccine_name: "",
    date: "",
    available_doses: "",
    classes: "",
    is_completed: false, // New field to track if the drive is completed
  });
  const [editingDriveId, setEditingDriveId] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const classGradeRegex = /^([1-9]|1[0-2])[A-Z]$|^[A-Z]{2,}[0-9]{2,}$/;

  const fetchDrives = async () => {
    try {
      const res = await axios.get("/drives");
      const updatedDrives = res.data.map((drive) => {
        const currentDate = new Date();
        const driveDate = new Date(drive.date);
        // Automatically mark drives as completed if the date has passed
        if (driveDate < currentDate && !drive.is_completed) {
          drive.is_completed = true;
        }
        return drive;
      });
      setDrives(updatedDrives);
    } catch (err) {
      console.error("Error fetching drives:", err);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const currentDate = new Date();
    const driveDate = new Date(form.date);
    const minDate = new Date("2019-04-01");
    const maxDate = new Date("2030-12-31");

    // Validation: Ensure the drive date is within the allowed range
    if (driveDate < minDate || driveDate > maxDate) {
      alert("The drive date must be between April 1, 2019, and December 31, 2030.");
      return;
    }

    // Validation: If the drive date is in the future, ensure the difference is more than 15 days
    if (driveDate > currentDate) {
      const dateDifference = Math.ceil((driveDate - currentDate) / (1000 * 60 * 60 * 24)); // Difference in days
      if (dateDifference <= 15) {
        alert("The drive date must be at least 15 days from today.");
        return;
      }

      // Validation: Prevent marking a future drive as completed
      if (form.is_completed) {
        alert("You cannot mark a drive as completed if the date is in the future.");
        return;
      }
    }

    // Validation: If the drive date is in the past, ensure "Mark as Completed" is checked
    if (driveDate < currentDate && !form.is_completed) {
      alert("For past dates, the drive must be marked as completed.");
      return;
    }

    // Validation: Ensure available_doses is a positive integer
    if (!Number.isInteger(Number(form.available_doses)) || form.available_doses <= 0) {
      alert("Available doses must be a positive integer greater than or equal to 1.");
      return;
    }

    const classesArray = form.classes.split(",").map((cls) => cls.trim());
    for (const cls of classesArray) {
      if (!classGradeRegex.test(cls)) {
        alert(
          "Each class must be a number (1-12) followed by an uppercase letter (e.g., 1A, 12B) or a branch and class (e.g., CS101, ME202)."
        );
        return;
      }
    }

    try {
      if (editingDriveId) {
        // Update existing drive
        console.log("Editing Drive ID:", editingDriveId); // Debugging
        await axios.put(`/drives/${editingDriveId}`, form); // Use the correct `editingDriveId`
        alert("Drive updated successfully!");
      } else {
        // Create new drive
        await axios.post("/drives", form);
        alert("Drive created successfully!");
      }
      fetchDrives(); // Refresh the drives list
      resetForm(); // Reset the form
      setIsModalOpen(false); // Close the modal after submission
    } catch (err) {
      console.error("Error response:", err.response);
      alert(err.response?.data?.msg || "Something went wrong");
    }
  };

  const handleEdit = (drive) => {
    const currentDate = new Date();
    const driveDate = new Date(drive.date);
    const minDate = new Date("2019-04-01");
    const maxDate = new Date("2030-12-31");

    // Prevent editing for dates outside the allowed range
    if (driveDate < minDate || driveDate > maxDate) {
      alert("Editing is only allowed for drives between April 1, 2019, and December 31, 2030.");
      return;
    }

    // Prevent editing for past drives
    if (driveDate < currentDate) {
      alert("Editing is disabled for past drives.");
      return;
    }

    // Format the date to YYYY-MM-DD for the date input field
    const formattedDate = drive.date
      ? new Date(drive.date).toISOString().split("T")[0]
      : "";

    // Populate the form with the selected drive's data
    setForm({
      vaccine_name: drive.vaccine_name,
      date: formattedDate, // Use the formatted date
      available_doses: drive.available_doses,
      classes: drive.classes.join(","), // Convert array to comma-separated string
      is_completed: drive.is_completed, // Include the is_completed field
    });

    // Set the editingDriveId to the drive's _id
    setEditingDriveId(drive._id.$oid || drive._id); // Ensure this is a string
    setIsModalOpen(true); // Open the modal for editing
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this drive?")) {
      try {
        await axios.delete(`/drives/${id}`);
        alert("Drive deleted successfully!");
        fetchDrives(); // Refresh the drives list
      } catch (err) {
        console.error("Error deleting drive:", err);
        alert("Failed to delete drive.");
      }
    }
  };

  const resetForm = () => {
    setForm({
      vaccine_name: "",
      date: "",
      available_doses: "",
      classes: "",
      is_completed: false,
    });
    setEditingDriveId(null); // Clear the editing ID
    setIsModalOpen(false); // Close the modal
  };

  const { currentRows, totalPages, currentPage, handlePageChange } = usePagination(drives);

  useEffect(() => {
    fetchDrives();
  }, []);

  return (
    <div>
      <h2>Manage Vaccination Drives</h2>

      <button onClick={() => setIsModalOpen(true)} className={styles.createBtn}>
        Create Drive
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h3>{editingDriveId ? "Edit Drive" : "Create Drive"}</h3>
            <form onSubmit={handleSubmit} className={styles.form}>
              <input
                name="vaccine_name"
                value={form.vaccine_name}
                onChange={handleChange}
                placeholder="Vaccine Name"
                required
              />
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={handleChange}
                min="2019-04-01" // Restrict the calendar to start from April 1, 2019
                max="2030-12-31" // Restrict the calendar to end on December 31, 2030
                required
              />
              <input
                name="available_doses"
                type="number"
                value={form.available_doses}
                onChange={handleChange}
                placeholder="Available Doses"
                min="1" // Restrict to positive integers starting from 1
                step="1" // Ensure only whole numbers are allowed
                required
              />
              <input
                name="classes"
                value={form.classes}
                onChange={handleChange}
                placeholder="Applicable Classes (comma-separated)"
                required
              />
              <label>
                <input
                  type="checkbox"
                  name="is_completed"
                  checked={form.is_completed}
                  onChange={handleChange}
                />
                Mark as Completed
              </label>
              <div className={styles.buttonContainer}>
                <button type="submit" className={styles.submitBtn}>
                  {editingDriveId ? "Update Drive" : "Create Drive"}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className={styles.cancelBtn}
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
            <th>Vaccine</th>
            <th>Date</th>
            <th>Doses</th>
            <th>Classes</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((d) => (
            <tr key={d._id}>
              <td>{d.vaccine_name}</td>
              <td>
                {d.date ? new Date(d.date).toLocaleDateString() : "N/A"} {/* Format the date */}
              </td>
              <td>{d.available_doses}</td>
              <td>{d.classes.join(", ")}</td>
              <td>{d.is_completed ? "Completed" : "Upcoming"}</td>
              <td>
                <button
                  onClick={() => handleEdit(d)}
                  disabled={new Date(d.date) < new Date()} // Disable for past drives
                >
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(d._id)}
                  className={styles.deleteBtn}
                  disabled={d.is_completed} // Disable the button if the drive is completed
                >
                  Delete
                </button>
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

export default Drives;
