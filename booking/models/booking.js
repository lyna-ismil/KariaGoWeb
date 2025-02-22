const mongoose = require('mongoose');

// ✅ Import User and Car models correctly
const User = require('../../user/models/user');
const Car = require('../../car/models/car');

const BookingSchema = new mongoose.Schema({
    id_booking: { type: String, unique: true, required: true },
    date_hour_booking: { type: Date, required: true },
    date_hour_expire: { type: Date, required: true },
    id_user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    id_car: { type: mongoose.Schema.Types.ObjectId, ref: 'Car', required: true },
    current_Key_car: { type: String },
    image: { type: String },
    status: { type: Boolean, default: false },
    contrat: { type: String },
    paiement: { type: Number },
    location_Before_Renting: { type: String },
    location_After_Renting: { type: String },
    estimated_Location: { type: String }
}, { timestamps: true });

// ✅ Ensure model is registered
const Booking = mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
module.exports = Booking;
