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

const [queue, setQueue] = useState<Patient[]>([]);
  const fetchQueue = async () => {
  try {
    const response = await axios.get(
      "https://queue-cure-production.up.railway.app//queue"
    );

    setQueue(response.data);
  } catch (error) {
    console.log(error);
  }
};
  useEffect(() => {
  fetchQueue();
  fetchSettings();

  const socket = io("https://queue-cure-production.up.railway.app");

  socket.on("queueUpdated", () => {
    fetchQueue();
    fetchSettings();
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
      "https://queue-cure-production.up.railway.app/patients",
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

  const [currentToken, setCurrentToken] =
  useState<number | null>(null);

  

const callNextPatient = async () => {
  if (calling) return;

  setCalling(true);

  try {
    await axios.post(
      "https://queue-cure-production.up.railway.app/call-next"
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
      "https://queue-cure-production.up.railway.app/average-time",
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
      "https://queue-cure-production.up.railway.app/current-token"
    );

    setCurrentToken(response.data.current_token);

    setAvgTime(
      response.data.average_consultation_time
    );
  } catch (error) {
    console.log(error);
  }
};



  return (
  <main className="min-h-screen bg-slate-950 text-white p-6">
    <div className="max-w-6xl mx-auto">

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-green-500 animate-pulse" />
          QueueCure
        </h1>

        <p className="text-gray-500 mt-2">
          Reception Dashboard
        </p>
      </div>

      {/* Top Section */}
      <div className="grid lg:grid-cols-2 gap-6 items-start">

  {/* LEFT COLUMN */}
  <div className="space-y-6">

        {/* Add Patient */}
        <div className="bg-slate-900
border border-slate-800 rounded-2xl shadow p-6">

          <h2 className="text-2xl font-bold mb-6">
            Add Patient
          </h2>

          <input
            className="border rounded-xl p-3 w-full mb-4"
            placeholder="Patient Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <input
            className="border rounded-xl p-3 w-full mb-4"
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

    <p className="text-3xl font-bold mt-1">
      {token}
    </p>
  </div>
)}
          
        </div>

        {/* Average Time */}
      <div className="bg-[#0B1736] rounded-3xl p-6 mt-8 border border-white/10">
  <div className="flex items-center justify-between mb-4">
    <div>
      <h2 className="text-lg font-semibold text-white">
        ⚙ Queue Settings
      </h2>

      <p className="text-xs text-gray-500 mt-2">
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
        bg-[#081229]
        border
        border-white/20
        rounded-xl
        px-4
        py-3
        text-white
      "
    />

    <span className="text-gray-400">
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
<div className="space-y-6">

{/* Now Serving */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-2xl shadow p-6">

          <p className="uppercase text-sm tracking-widest">
            Now Serving
          </p>

          <h2 className="text-7xl font-bold mt-4">
            {currentToken ?? "--"}
          </h2>

          <div className="grid grid-cols-3 gap-4 mt-8">

            <div>
              <p className="text-sm opacity-80">
                Queue
              </p>

              <p className="text-2xl font-bold">
                {queue.length}
              </p>
            </div>

            <div>
              <p className="text-sm opacity-80">
                Patients Served
              </p>

              <p className="text-2xl font-bold">
  {currentToken ? currentToken - 100 : 0}
</p>
            </div>

            <div>
              <p className="text-sm opacity-80">
                Max Wait
              </p>

              <p className="text-2xl font-bold">
                {queue.length * avgTime}m
              </p>
            </div>

          </div>
        </div>


        {/* Queue */}
      <div className="bg-slate-900
border border-slate-800 rounded-2xl shadow p-6 mt-6">

        <h2 className="text-2xl font-bold mb-6">
          Current Queue
        </h2>

        {queue.length === 0 ? (

          <div className="text-center py-10">
  <div className="text-5xl mb-3">
    🎉
  </div>

  <p className="text-lg font-medium">
    No patients waiting
  </p>

  <p className="text-gray-400">
    Queue is currently empty
  </p>
</div>

        ) : (

          <div className="space-y-3">

            {queue.map((patient, index) => (

              <div
  key={patient.id}
  className="flex justify-between items-center bg-slate-950 border border-white/20 rounded-2xl p-5"
>
                <div>
  <p className="text-2xl font-bold">
    #{patient.token_number}
  </p>

  <p className="text-gray-400 mt-1">
    {patient.name}
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