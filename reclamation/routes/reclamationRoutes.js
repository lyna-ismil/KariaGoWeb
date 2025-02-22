const express = require('express');
const mongoose = require('mongoose');
const Reclamation = require('../models/reclamation');

// ✅ Connect to User Database
const userDB = mongoose.createConnection(process.env.MONGO_URI_USER);
const User = userDB.model('User', require('../../user/models/user').schema);

const router = express.Router();

// ✅ DEBUG MODELS ENDPOINT
router.get('/debug/models', async (req, res) => {
    return res.status(200).json({
        available_models: mongoose.modelNames()
    });
});

// ✅ CREATE A NEW RECLAMATION
router.post('/', async (req, res) => {
    try {
        if (!mongoose.Types.ObjectId.isValid(req.body.id_user)) {
            return res.status(400).json({ message: "Invalid id_user format" });
        }

        const newReclamation = new Reclamation({
            id_reclamation: new mongoose.Types.ObjectId(),
            id_user: req.body.id_user,
            message: req.body.message,
            date_created: new Date()
        });

        await newReclamation.save();
        res.status(201).json(newReclamation);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// ✅ GET ALL RECLAMATIONS (Manually Fetch User Data)
router.get('/', async (req, res) => {
    try {
        let filter = {};

        if (req.query.id_user) {
            if (!mongoose.Types.ObjectId.isValid(req.query.id_user)) {
                return res.status(400).json({ message: "Invalid id_user format" });
            }
            filter.id_user = req.query.id_user;
        }

        const reclamations = await Reclamation.find(filter);

        // ✅ Fetch User Details Manually
        const populatedReclamations = await Promise.all(reclamations.map(async (reclamation) => {
            const user = await User.findById(reclamation.id_user).lean();

            return {
                ...reclamation.toObject(),
                id_user: user || null
            };
        }));

        res.status(200).json(populatedReclamations);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ GET RECLAMATION BY `id_reclamation`
router.get('/:id_reclamation', async (req, res) => {
    try {
        const reclamation = await Reclamation.findOne({ id_reclamation: req.params.id_reclamation });

        if (!reclamation) {
            return res.status(404).json({ message: "Reclamation not found" });
        }

        // ✅ Fetch User Manually
        const user = await User.findById(reclamation.id_user).lean();

        res.status(200).json({
            ...reclamation.toObject(),
            id_user: user || null
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ UPDATE A RECLAMATION MESSAGE
router.put('/:id_reclamation', async (req, res) => {
    try {
        const updatedReclamation = await Reclamation.findOneAndUpdate(
            { id_reclamation: req.params.id_reclamation },
            { message: req.body.message },
            { new: true }
        );

        if (!updatedReclamation) {
            return res.status(404).json({ message: "Reclamation not found" });
        }

        res.status(200).json(updatedReclamation);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// ✅ DELETE A RECLAMATION BY `id_reclamation`
router.delete('/:id_reclamation', async (req, res) => {
    try {
        const deletedReclamation = await Reclamation.findOneAndDelete({ id_reclamation: req.params.id_reclamation });
        if (!deletedReclamation) {
            return res.status(404).json({ message: "Reclamation not found" });
        }

        res.status(200).json({ message: 'Reclamation deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
