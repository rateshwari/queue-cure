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

    console.log("SETTINGS:", response.data);

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
  <main className="h-screen bg-[#0a0f1e] text-slate-100 overflow-hidden flex flex-col items-center px-6 py-6">
    <h1 className="text-5xl font-bold mb-4">
      QueueCure
    </h1>

    <p className="text-slate-400 text-lg mb-10">
      Please wait for your turn
    </p>

    <div className="flex items-center gap-3">
      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
      <h2 className="text-3xl font-medium text-green-500">
        Now Serving
      </h2>
    </div>

    <div className="h-[220px] flex items-center justify-center">
      {currentToken ? (
        <p className="text-[220px] lg:text-[260px] font-bold leading-none">
          {currentToken}
        </p>
      ) : (
        <div className="text-center">
          <p className="text-7xl font-bold text-slate-600">
            --
          </p>
          <p className="text-slate-500 mt-3">
            No active consultation
          </p>
        </div>
      )}
    </div>

    <h2 className="text-2xl font-semibold mt-6 mb-4">
      UP NEXT
    </h2>

    {queue.length === 0 ? (
      <div className="bg-[#1e293b] border border-[#2d3f55] rounded-2xl w-full max-w-xl px-12 py-10 text-center">
        <div className="text-5xl mb-3">✅</div>
        <p className="text-2xl font-semibold">Queue Clear</p>
        <p className="text-slate-500 mt-2">No patients waiting</p>
      </div>
    ) : (
      <div className="w-full max-w-3xl space-y-4">
        {queue.slice(0, 3).map((patient, index) => (
          <div
            key={patient.id}
            className="bg-[#1e293b] border border-[#2d3f55] rounded-2xl px-8 py-6 flex justify-between items-center"
          >
            <div>
              <p className="text-4xl font-bold">
                #{patient.token_number}
              </p>
              <p className="text-slate-500 mt-1">
                Token #{patient.token_number}
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-semibold text-amber-400">
                {(index + 1) * averageTime} mins
              </p>
              <p className="text-slate-500">
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