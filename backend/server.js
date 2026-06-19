import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import supabase from "./supabase.js";


dotenv.config();

const app = express();

app.use(cors({
  origin: "*"
}));
app.use(express.json());
app.get("/test", (req, res) => {
  console.log("TEST ROUTE HIT");
  res.send("OK");
});

app.get("/", (req, res) => {
  res.send("Queue Cure API Running");
});

// Add Patient
app.post("/patients", async (req, res) => {
  try {
    const { name, phone } = req.body;

    if (!name || !phone) {
      return res.status(400).json({
        success: false,
        message: "Name and phone are required",
      });
    }

    // Get last token
    const { data: lastPatient } = await supabase
      .from("patients")
      .select("token_number")
      .order("token_number", { ascending: false })
      .limit(1);

    const nextToken =
      lastPatient && lastPatient.length > 0
        ? lastPatient[0].token_number + 1
        : 101;

    // Insert patient
    const { data, error } = await supabase
      .from("patients")
      .insert([
        {
          name,
          phone,
          token_number: nextToken,
        },
      ])
      .select();

    if (error) throw error;

    io.emit("queueUpdated");

    res.status(201).json({
      success: true,
      token: nextToken,
      patient: data[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/patients", async (req, res) => {
  const { data, error } = await supabase
    .from("patients")
    .select("*");

  if (error) {
    
    return res.status(500).json(error);
  }

  res.json(data);
});

app.get("/queue", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("patients")
      .select("*")
      .eq("status", "waiting")
      .order("token_number");

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});

app.post("/call-next", async (req, res) => {

  const { data: activePatient } = await supabase
  .from("patients")
  .select("*")
  .eq("status", "in_consultation")
  .limit(1);

if (activePatient && activePatient.length > 0) {
  return res.json({
    success: false,
    message: "Finish current consultation first",
  });
}
  try {
    // Get first waiting patient
    const { data: patients, error } = await supabase
      .from("patients")
      .select("*")
      .eq("status", "waiting")
      .order("token_number")
      .limit(1);

    if (error) throw error;

    if (!patients || patients.length === 0) {

      return res.json({
        success: false,
        message: "No patients waiting",
      });
    }

    const patient = patients[0];

    // Update patient status
    const { error: updateError } = await supabase
      .from("patients")
      .update({
        status: "in_consultation",
      })
      .eq("id", patient.id);

    if (updateError) throw updateError;

    // Update current token
    const { data: settings } = await supabase
  .from("queue_settings")
  .select("id")
  .single();

await supabase
  .from("queue_settings")
  .update({
    current_token: patient.token_number,
  })
  .eq("id", settings.id);

  io.emit("queueUpdated");

    res.json({
      success: true,
      token: patient.token_number,
      patient,
    });
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});


app.post("/complete-consultation", async (req, res) => {
  console.log("COMPLETE CONSULTATION CALLED");

  try {
    const { data: patient, error } = await supabase
      .from("patients")
      .select("*")
      .eq("status", "in_consultation")
      .limit(1)
      .single();

    if (error || !patient) {
      return res.json({
        success: false,
        message: "No active consultation",
      });
    }

    const { error: updateError } = await supabase
      .from("patients")
      .update({
        status: "completed",
      })
      .eq("id", patient.id);

    if (updateError) throw updateError;

    const { data: settings } = await supabase
      .from("queue_settings")
      .select("id")
      .single();

    console.log("SETTINGS:", settings);

    const result = await supabase
      .from("queue_settings")
      .update({
        current_token: null,
      })
      .eq("id", settings.id)
      .select();

    console.log("UPDATE RESULT:", result);

    io.emit("queueUpdated");

    res.json({
      success: true,
    });

  } catch (error) {
    console.log("ERROR:", error);

    res.status(500).json({
      message: error.message,
    });
  }
});


app.get("/current-token", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("queue_settings")
      .select("*")
      .single();

    if (error) throw error;

    res.json(data);
  } catch (error) {
    res.status(500).json({
      message: error.message,
    });
  }
});
app.put("/average-time", async (req, res) => {
  try {
    const { minutes } = req.body;

    const { data: settings, error: settingsError } =
      await supabase
        .from("queue_settings")
        .select("id")
        .single();

    if (settingsError) throw settingsError;

    const { error } = await supabase
      .from("queue_settings")
      .update({
        average_consultation_time: minutes,
      })
      .eq("id", settings.id);

    if (error) throw error;

    io.emit("queueUpdated");

    res.json({
      success: true,
      averageTime: minutes,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

app.get("/test-route", (req, res) => {
  res.send("NEW SERVER VERSION");
});

import http from "http";
import { Server } from "socket.io";

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server Running on port ${PORT}`);
});