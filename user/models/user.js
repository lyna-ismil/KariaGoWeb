const mongoose = require('mongoose');

console.log("✅ Loading User Model...");

const UserSchema = new mongoose.Schema({
    cin: { type: String, required: true, unique: true, trim: true },
    permis: { type: String, required: true, trim: true },
    num_phone: { type: String, required: true, trim: true },
    facture: { type: Number, default: 0 },
    nbr_fois_allocation: { type: Number, default: 0 },
    blacklist: { type: Boolean, default: false },
    iD_Booking: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }]
}, { timestamps: true });

console.log("✅ User Schema Defined...");

// ✅ Ensure Model is Registered Only Once
if (!mongoose.models.User) {
    module.exports = mongoose.model('User', UserSchema);
    console.log("✅ User Model Registered:", mongoose.modelNames());
} else {
    module.exports = mongoose.models.User;
    console.log("✅ User Model Already Registered.");
}
