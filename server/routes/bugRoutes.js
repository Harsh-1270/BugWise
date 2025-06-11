import express from 'express';
import mongoose from 'mongoose';
import { exec } from 'child_process';
import User from '../models/User.js';

const router = express.Router();
// Route to handle bug submission

router.post('/detect', async (req, res) =>{
    const { repoLink } = req.body;
    const token = req.headers.authorization?.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    exec(`python3 ./bug-detector/detect.py "${repoLink}"`, async (error, stdout) => {
        if(err) return res.status(500).json({ error: 'Detection failed'});

        const bugData = JSON.parse(stdout); // Ensure detect.py outputs JSON string

        user.history.push({ repoLink, bugs: bugData });
        await user.save();

        res.json({ bugs: bugData });
    });
});

export default router;
// This code defines an Express route for detecting bugs in a repository.