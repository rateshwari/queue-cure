"use client";


import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<number | null>(null);
  const [avgTime, setAvgTime] = useState(10);
  const [calling, setCalling] = useState(false);
  interface Patient {
  id: string;
  token_number: number;
  name: string;
  phone: string;
  status: string;
}

const [patients, setPatients] = useState<Patient[]>([]);

const [queue, setQueue] = useState<Patient[]>([]);
const inConsultation = patients.filter(
  p => p.status === "in_consultation"
).length;

const completed = patients.filter(
  p => p.status === "completed"
).length;

const currentPatient = patients.find(
  (p) => p.status === "in_consultation"
) || null;

const completeConsultation = async () => {
  console.log("BUTTON CLICKED");

  try {
    await axios.post(
      "http://localhost:5000/complete-consultation"
    );
  } catch (error) {
    console.log(error);
  }
};

  const fetchQueue = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/queue"
    );

    setQueue(response.data);
  } catch (error) {
    console.log(error);
  }
};
  useEffect(() => {
  fetchQueue();
  fetchSettings();
  fetchAnalytics();

  const socket = io("http://localhost:5000");

  socket.on("queueUpdated", () => {
    fetchQueue();
    fetchSettings();
    fetchAnalytics();
  });

  return () => {
    socket.disconnect();
  };
}, []);

  const addPatient = async () => {

    if (!name.trim() || !phone.trim()) {
  alert("Please enter patient name and phone number");
  return;
}
  try {
    const response = await axios.post(
      "http://localhost:5000/patients",
      {
        name,
        phone,
      }
    );

    setToken(response.data.token);

    setName("");
    setPhone("");

    
  } catch (error) {
    console.error(error);
    alert("Failed to add patient");
  }
};

  

const callNextPatient = async () => {
  if (calling) return;

  setCalling(true);

  try {
    await axios.post(
      "http://localhost:5000/call-next"
    );
  } catch (error) {
    console.log(error);
  } finally {
    setCalling(false);
  }
};

const updateAverageTime = async () => {
  if (avgTime <= 0) {
  alert("Average consultation time must be greater than 0");
  return;
}
  try {
    await axios.put(
      "http://localhost:5000/average-time",
      {
        minutes: avgTime,
      }
    );



    alert("Average consultation time updated!");
  } catch (error) {
    console.log(error);
    alert("Failed to update average time");
  }
};

const fetchSettings = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/current-token"
    );



    setAvgTime(
      response.data.average_consultation_time
    );
  } catch (error) {
    console.log(error);
  }
};

const fetchAnalytics = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/patients"
    );

    const allPatients = response.data;

    console.log(
      "Count:",
      allPatients.filter(
        (p: Patient) => p.status === "in_consultation"
      ).length
    );

    setPatients(allPatients);

    
  } catch (error) {
    console.log(error);
  }
};



  return (
  <main className="h-screen overflow-hidden bg-slate-50 text-slate-900 p-4">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-4">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          QueueCure
        </h1>

        <p className="text-slate-500 mt-2">
          Reception Dashboard
        </p>
      </div>

      {/* Top Section */}
      <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-4 items-start">

  {/* LEFT COLUMN */}
  <div className="space-y-4">

        {/* Add Patient */}
        <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-4">

          <h2 className="text-2xl font-bold text-slate-900 mb-4">
            Add Patient
          </h2>

          <input
            className="border border-slate-300 rounded-xl p-3 w-full mb-4 bg-white text-slate-900"
            placeholder="Patient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border border-slate-300 rounded-xl p-3 w-full mb-4 bg-white text-slate-900"
            placeholder="Phone Number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />

          <button
            onClick={addPatient}
            className="w-full bg-black text-white py-3 rounded-xl font-semibold"
          >
            Generate Token
          </button>

  {token && (
  <div className="mt-4 bg-green-600 text-white rounded-xl p-4 text-center">
    <p className="text-sm">
      Token Generated Successfully
    </p>

    <p className="text-3xl font-bold text-slate-900 mt-1">
      {token}
    </p>
  </div>
)}
          
        </div>

        {/* Average Time */}
      <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-sm">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold text-slate-900">
        ⚙ Queue Settings
      </h2>

      <p className="flex gap-3 items-center">
  Current maximum wait: {queue.length * avgTime} mins
</p>
    </div>
  </div>

  <div className="flex gap-3 items-center">
    <input
      type="number"
      value={avgTime}
      onChange={(e) =>
        setAvgTime(Number(e.target.value))
      }
      className="
flex-1
bg-[url('/hospital-bg.jpg')]
bg-cover
bg-center
border
border-slate-300
rounded-xl
px-4
py-3
text-slate-900
"
    />

    <span className="text-slate-500">
      mins
    </span>

    <button
      onClick={updateAverageTime}
      className="
        bg-blue-600
        hover:bg-blue-700
        px-5
        py-3
        rounded-xl
        font-medium
        transition
      "
    >
      Update
    </button>
  </div>
</div>




</div>

{/* RIGHT COLUMN */}
<div className="space-y-4">

{/* Now Serving */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow p-4">

          <p className="uppercase text-sm tracking-widest">
            Now Serving
          </p>

          <h2 className="text-5xl font-bold mt-2">
  {currentPatient?.token_number ?? "--"}
</h2>

          <div className="grid grid-cols-3 gap-4 mt-4">

            <div>
              <p className="text-sm opacity-80">
                Queue
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {queue.length}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-80">
                Completed
              </p>

              <p className="text-2xl font-bold text-slate-900">
  {completed}
</p>
            </div>

            <div>
              <p className="text-sm opacity-80">
                Max Wait
              </p>

              <p className="text-2xl font-bold text-slate-900">
                {queue.length * avgTime}m
              </p>
            </div>

          </div>
        </div>
        <button
  onClick={completeConsultation}
  disabled={!currentPatient}
  className={`w-full py-3 rounded-2xl font-bold mt-4 ${
    currentPatient
      ? "bg-blue-600 hover:bg-blue-700 text-white"
      : "bg-gray-300 text-gray-500 cursor-not-allowed"
  }`}
>
  {currentPatient
    ? "Complete Current Consultation"
    : "No Active Consultation"}
</button>







        {/* Queue */}
      <div className="
bg-white
border
border-slate-200
shadow-sm
rounded-2xl
p-4
h-[260px]
overflow-y-auto
">

        <h2 className="text-2xl font-bold mb-4">
          Current Queue
        </h2>

        {queue.length === 0 ? (

  <div className="text-center py-6">
  <div className="text-4xl mb-2">✅</div>

  <h3 className="text-lg font-semibold">
    Queue Clear
  </h3>

  <p className="text-slate-500 text-sm mt-1">
    All patients attended
  </p>
</div>


) : (

          <div className="space-y-3">

            {queue.map((patient, index) => (

              <div
  key={patient.id}
  className="flex justify-between items-center bg-slate-50 border border-slate-200 rounded-2xl p-5"
>
                <div>
  <p className="text-2xl font-bold">
    #{patient.token_number}
  </p>

  <p className="text-slate-500 mt-1">
  Waiting Patient
  </p>
</div>

                <div className="text-right flex items-center gap-3">

  <p className="font-semibold text-lg">
  Wait: {(index + 1) * avgTime} mins
</p>

  {index === 0 && (
    <button
  onClick={callNextPatient}
  disabled={calling}
  className={`px-5 py-2 rounded-xl font-semibold transition ${
    calling
      ? "bg-gray-500 cursor-not-allowed"
      : "bg-green-600 hover:bg-green-700"
  }`}
>
  {calling
  ? "Calling..."
  : `Call #${patient.token_number}`}
</button>
  )}

</div>
              </div>

            ))}

          </div>

        )}
      </div>



      </div>

      

      </div>

      
    </div>
  </main>
)}