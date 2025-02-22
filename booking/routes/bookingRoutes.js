const express = require('express');
const mongoose = require('mongoose');
const Booking = require('../models/booking');

// ✅ Connect to User & Car Databases
const userDB = mongoose.createConnection(process.env.MONGO_URI_USER);
const carDB = mongoose.createConnection(process.env.MONGO_URI_CAR);

const User = userDB.model('User', require('../../user/models/user').schema);
const Car = carDB.model('Car', require('../../car/models/car').schema);

const router = express.Router();

// ✅ DEBUG MODELS ENDPOINT
router.get('/debug/models', async (req, res) => {
    return res.status(200).json({
        available_models: mongoose.modelNames()
    });
});

// ✅ CREATE A NEW BOOKING
router.post('/', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.id_user) || !mongoose.Types.ObjectId.isValid(req.body.id_car)) {
            return res.status(400).json({ message: "Invalid id_user or id_car format" });
        }

        const newBooking = new Booking({
            id_booking: new mongoose.Types.ObjectId(),
            id_user: req.body.id_user,
            id_car: req.body.id_car,
            date_hour_booking: req.body.date_hour_booking,
            date_hour_expire: req.body.date_hour_expire,
            current_Key_car: req.body.current_Key_car,
            image: req.body.image,
            status: req.body.status || false,
            contrat: req.body.contrat,
            paiement: req.body.paiement,
            location_Before_Renting: req.body.location_Before_Renting,
            location_After_Renting: req.body.location_After_Renting,
            estimated_Location: req.body.estimated_Location
        });

        await newBooking.save();
        res.status(201).json(newBooking);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ GET ALL BOOKINGS (Manually Fetch User & Car Data)
router.get('/', async (req, res) => {
    try {
        let filter = {};

        if (req.query.id_user) {
            if (!mongoose.Types.ObjectId.isValid(req.query.id_user)) {
                return res.status(400).json({ message: "Invalid id_user format" });
            }
            filter.id_user = req.query.id_user;
        }

        if (req.query.id_car) {
            if (!mongoose.Types.ObjectId.isValid(req.query.id_car)) {
                return res.status(400).json({ message: "Invalid id_car format" });
            }
            filter.id_car = req.query.id_car;
        }

        const bookings = await Booking.find(filter);

        // ✅ Fetch User & Car Details Manually
        const populatedBookings = await Promise.all(bookings.map(async (booking) => {
            const user = await User.findById(booking.id_user).lean();
            const car = await Car.findById(booking.id_car).lean();

            return {
                ...booking.toObject(),
                id_user: user || null,
                id_car: car || null
            };
        }));

        res.status(200).json(populatedBookings);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET BOOKING BY `id_booking`
router.get('/:id_booking', async (req, res) => {
    try {
        const booking = await Booking.findOne({ id_booking: req.params.id_booking });

        if (!booking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        // ✅ Fetch User & Car Manually
        const user = await User.findById(booking.id_user).lean();
        const car = await Car.findById(booking.id_car).lean();

        res.status(200).json({
            ...booking.toObject(),
            id_user: user || null,
            id_car: car || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ UPDATE BOOKING STATUS (Start or End Rental)
router.put('/:id_booking/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (typeof status !== "boolean") {
            return res.status(400).json({ message: "Status must be true (in progress) or false (completed)" });
        }

        const updatedBooking = await Booking.findOneAndUpdate(
            { id_booking: req.params.id_booking },
            { status },
            { new: true }
        );

        if (!updatedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json(updatedBooking);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE A BOOKING BY `id_booking`
router.delete('/:id_booking', async (req, res) => {
    try {
        const deletedBooking = await Booking.findOneAndDelete({ id_booking: req.params.id_booking });
        if (!deletedBooking) {
            return res.status(404).json({ message: "Booking not found" });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
