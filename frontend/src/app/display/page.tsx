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
      "https://queue-cure-production.up.railway.app/queue"
    );

    setQueue(response.data);
  } catch (error) {
    console.log(error);
  }
};    

const fetchSettings = async () => {
  try {
    const response = await axios.get(
      "https://queue-cure-production.up.railway.app/current-token"
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

  const socket = io("https://queue-cure-production.up.railway.app");

  socket.on("queueUpdated", () => {
    fetchSettings();
    fetchQueue();
  });

  return () => {
    socket.disconnect();
  };
}, []);

  return (
    <main className="h-screen overflow-hidden flex flex-col items-center px-6 py-6">
      <h1 className="text-5xl font-bold mb-4">
  QueueCure
</h1>

<p className="text-gray-400 text-xl mb-12">
  Please wait for your turn
</p>

<h2 className="text-4xl tracking-widest text-green-400">
  NOW SERVING
</h2>

<p className="text-[140px] lg:text-[160px] font-bold leading-none mt-2">
  {currentToken ?? "--"}
</p>

      <h2 className="text-2xl font-semibold mt-6 mb-4">
  UP NEXT
</h2>

{queue.length === 0 ? (
  <div className="bg-slate-900 border border-slate-800 rounded-2xl px-6 py-4 flex justify-between items-center">
  <p className="text-5xl mb-4">🎉</p>

  <p className="text-2xl font-semibold">
    No patients waiting
  </p>

  <p className="text-gray-400 mt-2">
    The clinic is currently caught up.
  </p>
</div>
) : (
  <div className="w-full max-w-3xl space-y-4">

  {queue.slice(0, 3).map((patient, index) => (

    <div
      key={patient.id}
      className="bg-slate-900 border border-slate-800 rounded-2xl px-8 py-6 flex justify-between items-center"
    >
      <div>
        <p className="text-4xl font-bold">
          #{patient.token_number}
        </p>

        <p className="text-gray-400 mt-1">
          {index + 1} Patient{index !== 0 ? "s" : ""} Ahead
        </p>
      </div>

      <div className="text-right">
        <p className="text-3xl font-semibold">
          {(index + 1) * averageTime} mins
        </p>

        <p className="text-gray-400">
          Estimated Wait
        </p>
      </div>
    </div>

  ))}

</div>
)}
  

    </main>
  );
}