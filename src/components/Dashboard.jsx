import React, { useContext, useEffect, useState } from "react";
import { Context } from "../main";
import { Navigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-toastify";
import { GoCheckCircleFill } from "react-icons/go";
import { AiFillCloseCircle } from "react-icons/ai";

const Dashboard = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");
  const [showAllRecords, setShowAllRecords] = useState(false);
  const { isAuthenticated, admin } = useContext(Context);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const appointmentsRes = await axios.get(
          "http://localhost:5000/api/v1/appointments/admin/allappointments",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`
            }
          }
        );
        setAppointments(appointmentsRes.data.appointments || []);
        
        const doctorsRes = await axios.get(
          "http://localhost:5000/api/v1/user/doctors",
          {
            withCredentials: true,
            headers: {
              Authorization: `Bearer ${localStorage.getItem("adminToken")}`
            }
          }
        );
        setDoctors(doctorsRes.data.doctors || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        toast.error(error.response?.data?.message || "Failed to fetch data");
      }
    };

    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  const handleUpdateStatus = async (appointmentId, status) => {
    try {
      const { data } = await axios.put(
        `http://localhost:5000/api/v1/appointments/update/${appointmentId}`,
        { status },
        {
          withCredentials: true,
          headers: {
            Authorization: `Bearer ${localStorage.getItem("adminToken")}`
          }
        }
      );

      setAppointments(prev => 
        prev.map(app => 
          app._id === appointmentId ? {...app, status} : app
        )
      );
      toast.success(data.message || "Status updated successfully!");
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Update failed");
    }
  };

  const filteredAppointments = appointments.filter(appointment => {
    // Filter by status
    if (!showAllRecords && appointment.status === "Rejected") return false;
    
    // Filter by date range
    if (!filterStartDate || !filterEndDate) return true;
    const appointmentDate = new Date(appointment.appointment_date);
    const startDate = new Date(filterStartDate);
    const endDate = new Date(filterEndDate);
    return appointmentDate >= startDate && appointmentDate <= endDate;
  });

  const handleFilterReset = () => {
    setFilterStartDate("");
    setFilterEndDate("");
  };
  const visibleAppointmentsCount = appointments.filter(app => 
    showAllRecords || app.status !== "Rejected"
  ).length;

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  return (
    <section className="dashboard page">
      <div className="filter-sidebar">
        
        
        <button 
          className={`toggle-btn ${showAllRecords ? 'active' : ''}`}
          onClick={() => setShowAllRecords(!showAllRecords)}
        >
          {showAllRecords ? "Hide Rejected" : "Show All Records"}
        </button>
        <h4>Appointment Filters</h4>

        <div className="filter-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={filterStartDate}
            onChange={(e) => setFilterStartDate(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <label>End Date:</label>
          <input
            type="date"
            value={filterEndDate}
            onChange={(e) => setFilterEndDate(e.target.value)}
          />
        </div>

        <div className="filter-buttons">
          <button 
            onClick={handleFilterReset}
            className="reset-btn"
          >
            Reset Filters
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="banner">
          <div className="firstBox">
            <img src="/doc.png" alt="Doctor" />
            <div className="content">
              <div>
                <p>Hello,</p>
                <h5>{admin ? `${admin.firstName} ${admin.lastName}` : "Admin"}</h5>
              </div>
              <p>Manage appointments and doctors from this dashboard</p>
            </div>
          </div>
          
          <div className="secondBox">
            <p>Total Appointments</p>
            <h3>{visibleAppointmentsCount}</h3>
          </div>

          <div className="thirdBox">
            <p>Registered Doctors</p>
            <h3>{doctors.length}</h3>
          </div>
        </div>

        <div className="banner">
          <h5>{showAllRecords ? "All Appointments" : "Active Appointments"}</h5>
          <div className="table-container">
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
                {filteredAppointments.length > 0 ? (
                  filteredAppointments.slice().reverse().map(appointment => (
                    <tr key={appointment._id}>
                      <td>{`${appointment.firstName} ${appointment.lastName}`}</td>
                      <td>
                        {new Date(appointment.appointment_date).toLocaleDateString()}
                      </td>
                      <td>
                        {appointment.doctor?.firstName} {appointment.doctor?.lastName}
                      </td>
                      <td>{appointment.department}</td>
                      <td>
                        <select
                          value={appointment.status}
                          onChange={(e) => handleUpdateStatus(appointment._id, e.target.value)}
                          className={`status-select ${appointment.status.toLowerCase()}`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Accepted">Accepted</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>
                      <td>
                        {appointment.hasVisited ? (
                          <GoCheckCircleFill className="success-icon" />
                        ) : (
                          <AiFillCloseCircle className="error-icon" />
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="no-data">
                      No appointments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Dashboard;