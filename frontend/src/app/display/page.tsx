"use client";

import axios from "axios";
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

export default function DisplayPage() {
  const [currentToken, setCurrentToken] =
    useState<number | null>(null);


interface Patient {
  id: string;
  token_number: number;
  name: string;

}
const [averageTime, setAverageTime] =
  useState(10);
const [queue, setQueue] =
  useState<Patient[]>([]);
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

const fetchSettings = async () => {
  try {
    const response = await axios.get(
      "http://localhost:5000/current-token"
    );

    setCurrentToken(
      response.data.current_token
    );

    setAverageTime(
      response.data.average_consultation_time
    );
  } catch (error) {
    console.log(error);
  }
};

useEffect(() => {
  fetchSettings();
  fetchQueue();

  const socket = io("http://localhost:5000");

  socket.on("queueUpdated", () => {
    fetchSettings();
    fetchQueue();
  });

  return () => {
    socket.disconnect();
  };
}, []);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center">
      <h1 className="text-6xl font-bold">
        NOW SERVING
      </h1>

      <p className="text-9xl mt-6">
        {currentToken ?? "--"}
      </p>

      <h2 className="text-3xl mt-10 mb-4">
  UP NEXT
</h2>

{queue.length === 0 ? (
  <div className="border border-dashed rounded p-6 text-center">
    No patients waiting
  </div>
) : (
  <div className="space-y-4">
    {queue.slice(0, 5).map((patient, index) => (
      <div
        key={patient.id}
        className="border rounded p-4 w-80 text-center"
      >
        <p className="text-2xl font-bold">
          #{patient.token_number}
        </p>

        <p>{patient.name}</p>

        <p className="text-sm text-gray-500">
          Estimated Wait: {(index + 1) * averageTime} mins
        </p>
      </div>
    ))}
  </div>
)}
  

    </main>
  );
}