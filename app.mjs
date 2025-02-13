import express from "express";
import fs from "fs/promises";
import cors from "cors";

const app = express();
const PORT = process.env.PORT || 5000;
const DATA_FILE = "database.json"; 

app.use(express.json());
app.use(cors());

const ensureDatabaseFile = async () => {
  try {
    await fs.access(DATA_FILE);
  } catch {
    await fs.writeFile(DATA_FILE, "[]", "utf-8");
  }
};

ensureDatabaseFile();

app.get("/bookings", async (req, res) => {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const bookings = JSON.parse(data);
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ message: "Error reading data", error });
  }
});

app.post("/bookings", async (req, res) => {
  try {
    const newBooking = { ...req.body, attended: false }; 
    const data = await fs.readFile(DATA_FILE, "utf-8");
    const bookings = JSON.parse(data);

    bookings.push(newBooking); 

    await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2));
    console.log("New Booking Saved:", newBooking);


    res.status(201).json({ message: "Booking saved!", newBooking });
  } catch (error) {
    res.status(500).json({ message: "Error saving data", error });
  }
});

app.post("/scan", async (req, res) => {
  try {
    const { qrData } = req.body;

    const data = await fs.readFile(DATA_FILE, "utf-8");
    let bookings = JSON.parse(data);

    const scannedData = JSON.parse(qrData); // Parse QR data

    let matchedBooking = bookings.find(
      (b) =>
        b.name === scannedData.name &&
        b.email === scannedData.email &&
        b.contactNo === scannedData.contactNo &&
        b.institute === scannedData.institute
    );

    if (matchedBooking) {
      matchedBooking.attended = true;
      await fs.writeFile(DATA_FILE, JSON.stringify(bookings, null, 2));

      return res.json({ status: "Booked", message: "Attendance marked!" });
    } else {
      return res.json({ status: "Not Booked", message: "No matching record found!" });
    }
  } catch (error) {
    res.status(500).json({ message: "Error processing QR scan", error });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
