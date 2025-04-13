import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]); // New state for doctors
  const { isAuthenticated, admin } = useContext(Context);

  useEffect(() => {
    // Fetch Appointments
    const fetchAppointments = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/appointment/getall",
          { withCredentials: true }
        );
        setAppointments(data.appointment || []); // Ensure appointments are set correctly
      } catch (error) {
        console.error("Error fetching appointments:", error);
        setAppointments([]);
      }
    };

    // Fetch Doctors
    const fetchDoctors = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/v1/doctor/getall", // Assuming this endpoint exists
          { withCredentials: true }
        );
        console.log("Doctors data:", data); // Log doctors data to inspect the response
        setDoctors(data?.doctors || []); // Ensure doctors are set correctly
      } catch (error) {
        console.error("Error fetching doctors:", error);
        setDoctors([]);
      }
    };

    fetchAppointments();
    fetchDoctors();
  }, []);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/v1/appointment/update/${appointmentId}`,
        { status },
        { withCredentials: true }
      );
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status }
            : appointment
        )
      );
      toast.success(data.message || "Status updated successfully!");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error(error.response?.data?.message || "Failed to update status.");
    }
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="dashboard page">
      <div className="banner">
        <div className="firstBox">
          <img src="/doc.png" alt="Doctor Image" />
          <div className="content">
            <div>
              <p>Hello,</p>
              <h5>
                {admin && `${admin.firstName} ${admin.lastName}`}
              </h5>
            </div>
            <p>
              Welcome to the admin dashboard. Here you can manage appointments,
              monitor activity, and perform administrative tasks.
            </p>
          </div>
        </div>
        <div className="secondBox">
          <p>Total Appointments</p>
          <h3>{appointments.length}</h3>
        </div>
        <div className="thirdBox">
          <p>Registered Doctors</p>
          <h3>{doctors.length > 0 ? doctors.length : "No doctors found"}</h3> {/* Check doctors length */}
        </div>
      </div>
      <div className="banner">
        <h5>Appointments</h5>
        <table>
          <thead>
            <tr>
              <th>Patient</th>
              <th>Date</th>
              <th>Doctor</th>
              <th>Department</th>
              <th>Status</th>
              <th>Visited</th>
            </tr>
          </thead>
          <tbody>
            {appointments && appointments.length > 0 ? (
              appointments.map((appointment) => (
                <tr key={appointment._id}>
                  <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                  <td>
                    {appointment.appointment_date
                      ? new Date(appointment.appointment_date).toLocaleDateString()
                      : "Invalid Date"}
                  </td>
                  <td>
                    {appointment.doctor
                      ? `${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                      : "N/A"}
                  </td>
                  <td>{appointment.department || "N/A"}</td>
                  <td>
                    <select
                      className={
                        appointment.status === "Pending"
                          ? "value-pending"
                          : appointment.status === "Accepted"
                          ? "value-accepted"
                          : "value-rejected"
                      }
                      value={appointment.status}
                      onChange={(e) =>
                        handleUpdateStatus(appointment._id, e.target.value)
                      }
                    >
                      <option value="Pending" className="value-pending">
                        Pending
                      </option>
                      <option value="Accepted" className="value-accepted">
                        Accepted
                      </option>
                      <option value="Rejected" className="value-rejected">
                        Rejected
                      </option>
                    </select>
                  </td>
                  <td>
                    {appointment.hasVisited ? (
                      <GoCheckCircleFill className="green" />
                    ) : (
                      <AiFillCloseCircle className="red" />
                    )}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="6" style={{ textAlign: "center" }}>
                  No Appointments Found!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
};

export default Dashboard;
