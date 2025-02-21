import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import Booking from "./models/userModel.mjs";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI

mongoose
    .connect(MONGO_URI, {
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Seat Booking Backend is Running!");
});

app.get("/bookings", async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Error fetching data", error });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const newBooking = new Booking({ ...req.body, attended: false });
    await newBooking.save();

    console.log("New Booking Saved:", newBooking);
    res.status(201).json({ message: "Booking saved!", newBooking });
  } catch (error) {
    console.error("Error saving data:", error);
    res.status(500).json({ message: "Error saving data", error });
  }
});

app.post("/scan", async (req, res) => {
  try {
    const { qrData } = req.body;
    const scannedData = typeof qrData === "string" ? JSON.parse(qrData) : qrData; 

    console.log("Scanned Data Received:", scannedData);

    const existingBooking = await Booking.findOne({
      contactNo: scannedData.contactNo,
      institute: scannedData.institute,
    });

    if (!existingBooking) {
      console.log("No matching record found for:", scannedData);
      return res.json({ status: "Not Booked", message: "No matching record found!" });
    }

    console.log("Matching booking found:", existingBooking);

    const updatedBooking = await Booking.findOneAndUpdate(
      { contactNo: scannedData.contactNo, institute: scannedData.institute },
      { $set: { attended: true } }, 
      { returnDocument: "after" }
    );

    console.log("Attendance Updated:", updatedBooking);

    return res.json({
      status: "Booked",
      message: "Attendance marked successfully!",
      updatedBooking,
    });
  } catch (error) {
    console.error("Error processing QR scan:", error);
    res.status(500).json({ message: "Error processing QR scan", error });
  }
});



app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
