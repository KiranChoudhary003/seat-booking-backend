import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    contactNo: { type: String, required: true },
    institute: { type: String, required: true },
    attended: { type: Boolean, default: false }
});

const User = mongoose.model("User", userSchema);

export default User;
