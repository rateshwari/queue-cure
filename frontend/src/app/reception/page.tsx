"use client";


import axios from "axios";
import { useState, useEffect } from "react";
import { io } from "socket.io-client";

export default function Home() {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [token, setToken] = useState<number | null>(null);
  const [avgTime, setAvgTime] = useState(10);
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

  const socket = io("http://localhost:5000");

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

  const [currentToken, setCurrentToken] =
  useState<number | null>(null);

  

const callNextPatient = async () => {
  try {
    await axios.post(
      "http://localhost:5000/call-next"
    );

  } catch (error) {
    console.log(error);
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

    setCurrentToken(response.data.current_token);

    setAvgTime(
      response.data.average_consultation_time
    );
  } catch (error) {
    console.log(error);
  }
};



  return (
    <main className="min-h-screen p-10">
      <div className="max-w-md mx-auto space-y-4">
        <div className="border border-gray-700 p-4 rounded mt-6">

        <h1 className="text-3xl font-bold">
  Reception Dashboard
</h1>

<p className="text-gray-500">
  Manage patient queue efficiently
</p>

        <input
          className="border p-3 w-full"
          placeholder="Patient Name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="border p-3 w-full"
          placeholder="Phone Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <button
          onClick={addPatient}
          className="bg-black text-white px-4 py-3 rounded w-full"
        >
          Generate Token
        </button>

        {token && (
          <div className="p-4 border rounded">
            Generated Token: {token}
          </div>
        )}
      </div>


      <div className="border border-gray-700 p-4 rounded mt-6">
  <h2 className="text-xl font-bold">
    Current Token
  </h2>

  <p className="text-3xl mt-2">
    {currentToken ?? "None"}
  </p>
</div>



<button
  onClick={callNextPatient}
  className="bg-green-600 text-white px-4 py-3 rounded mt-4 w-full"
>
  Call Next Patient
</button>
      
  <h2 className="text-xl font-bold mb-3">
    Current Queue
  </h2>

  {queue.length === 0 ? (
    <div className="border border-dashed border-gray-500 rounded p-4 text-center">
  No patients waiting
</div>
  ) : (
    <div className="border border-gray-700 rounded">
  {queue.map((patient) => (
    <div
      key={patient.id}
      className="p-3 border-b border-gray-700"
    >
      <span className="font-semibold">
        #{patient.token_number}
      </span>
      {" - "}
      {patient.name}
    </div>
  ))}
</div>
  )}

  <div className="border border-gray-700 p-4 rounded mt-6">
  <h2 className="text-xl font-bold mb-2">
    Average Consultation Time (mins)
  </h2>

  <input
    type="number"
    value={avgTime}
    onChange={(e) =>
      setAvgTime(Number(e.target.value))
    }
    className="border p-3 w-full"
  />

  <button
    onClick={updateAverageTime}
    className="bg-blue-600 text-white px-4 py-3 rounded mt-3 w-full"
  >
    Save Average Time
  </button>
</div>

</div>




    </main>
  );
}