const mongoose = require('mongoose');

console.log("✅ Loading Car Model...");

const diagnostiqueVidangeSchema = new mongoose.Schema({
    vidange1: { type: Number, default: 0 },
    vidange2: { type: Number, default: 0 },
    vidange3: { type: Number, default: 0 }
}, { _id: false });

const CarSchema = new mongoose.Schema({
    matricule: { type: String, required: true, unique: true, trim: true },
    marque: { type: String, required: true, trim: true },
    panne: { type: String, required: true, trim: true },
    panne_ia: { type: String, required: true, trim: true },
    location: { type: String, required: true, trim: true },
    visite_technique: { type: Date, required: true, default: null },
    car_work: { type: Boolean, default: true },
    date_assurance: { type: Date, required: true, default: null },
    vignette: { type: Date, required: true, default: null },
    diagnostique_vidange: diagnostiqueVidangeSchema
}, { timestamps: true });

console.log("✅ Car Schema Defined...");

// ✅ Ensure Model is Registered Only Once
if (!mongoose.models.Car) {
    module.exports = mongoose.model('Car', CarSchema);
    console.log("✅ Car Model Registered:", mongoose.modelNames());
} else {
    module.exports = mongoose.models.Car;
    console.log("✅ Car Model Already Registered.");
}
