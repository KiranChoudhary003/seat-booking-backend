import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    contactNo: { type: String, required: true },
    institute: { type: String, required: true },
    attended: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

export default User;
