import { useState, useEffect } from "react";
import "./App.css";

function App() {
  const doctors = [
    {
      id: 1,
      name: "Dr. Rao",
      specialization: "Cardiologist",
      days: ["Monday", "Wednesday", "Friday"],
      startTime: 9,
      endTime: 13,
    },
    {
      id: 2,
      name: "Dr. Priya",
      specialization: "Dermatologist",
      days: ["Tuesday", "Thursday"],
      startTime: 14,
      endTime: 18,
    },
    {
      id: 3,
      name: "Dr. Sharma",
      specialization: "Orthopedic",
      days: ["Monday", "Thursday", "Saturday"],
      startTime: 10,
      endTime: 15,
    },
    {
      id: 4,
      name: "Dr. Anjali",
      specialization: "Pediatrician",
      days: ["Tuesday", "Friday"],
      startTime: 8,
      endTime: 12,
    },
    {
      id: 5,
      name: "Dr. Kumar",
      specialization: "Neurologist",
      days: ["Wednesday", "Saturday"],
      startTime: 11,
      endTime: 16,
    },
    {
      id: 6,
      name: "Dr. Meena",
      specialization: "Gynecologist",
      days: ["Monday", "Wednesday", "Friday"],
      startTime: 15,
      endTime: 19,
    },
    {
      id: 7,
      name: "Dr. Reddy",
      specialization: "ENT Specialist",
      days: ["Tuesday", "Thursday", "Saturday"],
      startTime: 9,
      endTime: 12,
    },
    {
      id: 8,
      name: "Dr. Sneha",
      specialization: "General Physician",
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      startTime: 10,
      endTime: 17,
    },
  ];

  const [role, setRole] = useState("patient");
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [selectedDoctorDetails, setSelectedDoctorDetails] = useState(null);

  const [formData, setFormData] = useState({
    patientName: "",
    doctor: "",
    date: "",
    time: "",
  });

  const [appointments, setAppointments] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Load from localStorage
  useEffect(() => {
    const savedAppointments = localStorage.getItem("appointments");
    if (savedAppointments) {
      setAppointments(JSON.parse(savedAppointments));
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("appointments", JSON.stringify(appointments));
  }, [appointments]);

  // Format hour to AM/PM
  const formatHour = (hour) => {
    const displayHour = hour > 12 ? hour - 12 : hour;
    const ampm = hour >= 12 ? "PM" : "AM";
    return `${displayHour}:00 ${ampm}`;
  };

  // Generate slots from startTime to endTime
  const generateSlots = (start, end) => {
    const slots = [];
    for (let i = start; i < end; i++) {
      slots.push(formatHour(i));
    }
    return slots;
  };

  // Handle doctor selection
  const handleDoctorChange = (e) => {
    const doctorName = e.target.value;

    setSelectedDoctor(doctorName);

    const doctor = doctors.find((doc) => doc.name === doctorName) || null;
    setSelectedDoctorDetails(doctor);

    setFormData((prev) => ({
      ...prev,
      doctor: doctorName,
      time: "",
    }));

    // If date already selected, update slots
    if (doctor && formData.date) {
      const dayName = new Date(formData.date).toLocaleDateString("en-US", {
        weekday: "long",
      });

      if (doctor.days.includes(dayName)) {
        setAvailableSlots(generateSlots(doctor.startTime, doctor.endTime));
      } else {
        setAvailableSlots([]);
        alert("Doctor not available on selected day!");
      }
    } else {
      setAvailableSlots([]);
    }
  };

  // Handle other inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;

    const updatedData = {
      ...formData,
      [name]: value,
    };

    setFormData(updatedData);

    // If date changes, re-check doctor availability
    if (name === "date") {
      const doctor = doctors.find((doc) => doc.name === updatedData.doctor);

      if (doctor && updatedData.date) {
        const dayName = new Date(updatedData.date).toLocaleDateString("en-US", {
          weekday: "long",
        });

        if (doctor.days.includes(dayName)) {
          setAvailableSlots(generateSlots(doctor.startTime, doctor.endTime));
        } else {
          setAvailableSlots([]);
          setFormData((prev) => ({
            ...prev,
            date: value,
            time: "",
          }));
          alert("Doctor not available on selected day!");
        }
      } else {
        setAvailableSlots([]);
      }
    }
  };

  // Book appointment
  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !formData.patientName ||
      !formData.doctor ||
      !formData.date ||
      !formData.time
    ) {
      alert("Please fill all fields!");
      return;
    }

    const alreadyBooked = appointments.some(
      (appt) =>
        appt.doctor === formData.doctor &&
        appt.date === formData.date &&
        appt.time === formData.time
    );

    if (alreadyBooked) {
      alert("This slot is already booked!");
      return;
    }

    const newAppointment = {
      id: Date.now(),
      patientName: formData.patientName,
      doctor: formData.doctor,
      date: formData.date,
      time: formData.time,
    };

    setAppointments((prev) => [...prev, newAppointment]);

    alert("Appointment Booked Successfully!");

    setFormData({
      patientName: "",
      doctor: "",
      date: "",
      time: "",
    });

    setSelectedDoctor("");
    setSelectedDoctorDetails(null);
    setAvailableSlots([]);
  };

  // Cancel appointment
  const handleCancel = (id) => {
    const updatedAppointments = appointments.filter((appt) => appt.id !== id);
    setAppointments(updatedAppointments);
  };

  // Filter appointments for selected doctor in doctor view
  const doctorAppointments = selectedDoctor
    ? appointments.filter((appt) => appt.doctor === selectedDoctor)
    : appointments;

  return (
    <div className="container">
      <h2>Hospital Appointment Booking System</h2>

      <div className="role-buttons">
        <button type="button" onClick={() => setRole("patient")}>
          Patient View
        </button>
        <button type="button" onClick={() => setRole("doctor")}>
          Doctor View
        </button>
      </div>

      {/* PATIENT VIEW */}
      {role === "patient" && (
        <div>
          <h3>Book Appointment</h3>

          <form onSubmit={handleSubmit} className="form">
            <input
              type="text"
              name="patientName"
              placeholder="Enter Patient Name"
              value={formData.patientName}
              onChange={handleInputChange}
            />

            <select
              name="doctor"
              value={formData.doctor}
              onChange={handleDoctorChange}
            >
              <option value="">Select Doctor</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name} - {doc.specialization}
                </option>
              ))}
            </select>

            {selectedDoctorDetails && (
              <div className="doctor-info">
                <p>
                  <strong>Doctor Name:</strong> {selectedDoctorDetails.name}
                </p>
                <p>
                  <strong>Specialization:</strong>{" "}
                  {selectedDoctorDetails.specialization}
                </p>
                <p>
                  <strong>Available Days:</strong>{" "}
                  {selectedDoctorDetails.days.join(", ")}
                </p>
                <p>
                  <strong>Available Timing:</strong>{" "}
                  {formatHour(selectedDoctorDetails.startTime)} to{" "}
                  {formatHour(selectedDoctorDetails.endTime)}
                </p>
              </div>
            )}

            <input
              type="date"
              name="date"
              min={new Date().toISOString().split("T")[0]}
              value={formData.date}
              onChange={handleInputChange}
            />

            <select
              name="time"
              value={formData.time}
              onChange={handleInputChange}
              disabled={availableSlots.length === 0}
            >
              <option value="">Select Time Slot</option>
              {availableSlots.map((slot, index) => (
                <option key={index} value={slot}>
                  {slot}
                </option>
              ))}
            </select>

            <button type="submit">Book Appointment</button>
          </form>
        </div>
      )}

      {/* DOCTOR VIEW */}
      {role === "doctor" && (
        <div>
          <h3>Doctor Dashboard</h3>

          <div className="form" style={{ marginBottom: "20px" }}>
            <select
              value={selectedDoctor}
              onChange={(e) => setSelectedDoctor(e.target.value)}
            >
              <option value="">All Doctors</option>
              {doctors.map((doc) => (
                <option key={doc.id} value={doc.name}>
                  {doc.name} - {doc.specialization}
                </option>
              ))}
            </select>
          </div>

          {doctorAppointments.length === 0 ? (
            <p className="empty-text">No Appointments Yet</p>
          ) : (
            doctorAppointments.map((appt) => (
              <div key={appt.id} className="card">
                <p>
                  <strong>Patient Name:</strong> {appt.patientName}
                </p>
                <p>
                  <strong>Doctor:</strong> {appt.doctor}
                </p>
                <p>
                  <strong>Date:</strong> {appt.date}
                </p>
                <p>
                  <strong>Time:</strong> {appt.time}
                </p>

                <button type="button" onClick={() => handleCancel(appt.id)}>
                  Cancel Appointment
                </button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}

export default App;