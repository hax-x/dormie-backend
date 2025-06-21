require('dotenv').config(); // Load the mongo URI from .env file
const express = require("express");
const cors = require("cors");
const { ObjectId } = require('mongodb');
const { connectToDatabase } = require('./database/mongo'); // Adjust path as needed

const app = express();
const port = 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Confirm DB connection
connectToDatabase()
  .then(() => {
    console.log("🟢 Database is ready");
  })
  .catch((err) => {
    console.error("🔴 Error connecting to database:", err.message);
  });

// API route to fetch hostel data
app.get("/api/hostel", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const hostelsCollection = db.collection('hostels');
    const data = await hostelsCollection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hostels' });
  }
});

// Route to get universities data
app.get("/universities", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const universitiesCollection = db.collection('universities');
    const data = await universitiesCollection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching universities:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch universities' });
  }
});
app.post('/api/profile', async (req, res) => {
  try{
    const profileData = req.body;
    const db = await connectToDatabase();
    const profileCollection = db.collection('profiles');

    const result = await profileCollection.insertOne(profileData);
    if(result.acknowledged){
      res.status(201).json({
        success: true,
        message: "Profile added to database",
      })
    }
    else{
      throw new Error("Failed to add data to the Database");
    }
  }
  catch(error){
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Failed to add profile to database"
    })
  }
})

app.post('/api/user', async (req, res) => {
  try {
    const { email } = req.body; // Destructure email from request body
    const db = await connectToDatabase(); // Ensure this function connects properly
    const profile = await db.collection('profiles').findOne({ email }); // Use findOne for a single user

    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Profile not found",
      });
    }

    res.json({
      success: true,
      profile,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});
app.post('/api/profileupdate', async (req, res) => {
  try {
    const { userId, ...updatedData } = req.body;
    console.log("Received userId:", userId);
    console.log("Update data:", updatedData);

    if (!userId) {
      return res.status(400).json({ message: "User ID is required." });
    }

    // Remove undefined fields from updatedData
    const fieldsToUpdate = {};
    for (const key in updatedData) {
      if (updatedData[key] !== undefined) {
        fieldsToUpdate[key] = updatedData[key];
      }
    }

    const db = await connectToDatabase();

    const result = await db
      .collection('profiles')
      .updateOne(
        { _id: new ObjectId(userId) }, // Matches the _id in your document
        { $set: fieldsToUpdate } // Only update fields that are defined
      );

    if (result.modifiedCount === 0) {
      return res.status(404).json({ message: "Profile not found or no changes made." });
    }

    // Fetch the updated document
    const updatedProfile = await db
      .collection('profiles')
      .findOne(
        { _id: new ObjectId(userId) },
        { projection: { password: 0, confirmPassword: 0 } } // Exclude sensitive fields
      );

    res.status(200).json({
      message: "Profile updated successfully",
      profile: updatedProfile,
    });
  } catch (err) {
    console.error("Profile update error:", err.message);
    res.status(500).json({ message: "Failed to update profile", error: err.message });
  }
});


// Modified booking route
app.post('/api/bookings', async (req, res) => {
  try {
    const bookingData = req.body;
    const db = await connectToDatabase();
    const bookingsCollection = db.collection('bookings');

    // Add timestamp to booking data
    const bookingWithTimestamp = {
      ...bookingData,
      createdAt: new Date()
    };

    // Insert the booking into the collection
    const result = await bookingsCollection.insertOne(bookingWithTimestamp);

    if (result.acknowledged) {
      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: {
          ...bookingWithTimestamp,
          _id: result.insertedId
        }
      });
    } else {
      throw new Error('Failed to insert booking');
    }
  } catch (error) {
    console.error('Error processing booking:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process booking'
    });
  }
});
// Route to get hostels data
app.get("/hostels", async (req, res) => {
  try {
    const db = await connectToDatabase();
    const hostelsCollection = db.collection('unihostels');
    const data = await hostelsCollection.find().toArray();
    res.json(data);
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch hostels' });
  }
});

app.post("/api/hosteldata", async (req, res) => {
  try {
    const data = req.body.id; // Extract the ID from the body
    const db = await connectToDatabase();
    const hostelCollection = db.collection("hostels");
    const hostelData = await hostelCollection.findOne({ _id: new ObjectId(data) }); // Correct ObjectId usage
    if (!hostelData) {
      return res.status(404).json({ success: false, message: "Hostel not found" });
    }
    res.json(hostelData); // Send back the hostel data
  } catch (error) {
    console.error("Error fetching hostel:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hostel" });
  }
});

app.post("/api/hosteldatauni", async (req, res) => {
  try {
    const data = req.body.id; // Extract the ID from the body
    const db = await connectToDatabase();
    const hostelCollection = db.collection("unihostels");
    const hostelData = await hostelCollection.findOne({ _id: new ObjectId(data) }); // Correct ObjectId usage
    if (!hostelData) {
      return res.status(404).json({ success: false, message: "Hostel not found" });
    }
    res.json(hostelData); // Send back the hostel data
  } catch (error) {
    console.error("Error fetching hostel:", error);
    res.status(500).json({ success: false, message: "Failed to fetch hostel" });
  }
});


app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
