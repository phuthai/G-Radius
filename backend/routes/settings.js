const express = require('express');
const googleAuth = require('../config/google-auth');
const router = express.Router();

// Get Google OAuth settings
router.get('/google-auth', async (req, res, next) => {
    try {
        const settings = await googleAuth.loadSettings();
        if (settings) {
            // Mask the client secret for security
            settings.client_secret = settings.client_secret ? '********' : null;
        }
        res.json({ settings: settings || {} });
    } catch (error) {
        next(error);
    }
});

// Update Google OAuth settings
router.post('/google-auth', async (req, res, next) => {
    try {
        const { client_id, client_secret, enabled } = req.body;

        // Simple validation
        if (enabled && (!client_id || !client_secret)) {
            return res.status(400).json({ error: { message: 'Client ID and Secret are required when enabling Google Auth' } });
        }

        const success = await googleAuth.updateSettings(client_id, client_secret, enabled, 1); // Assuming user ID 1 for now or system

        if (success) {
            res.json({ message: 'Settings updated successfully' });
        } else {
            res.status(500).json({ error: { message: 'Failed to update settings' } });
        }
    } catch (error) {
        next(error);
    }
});

module.exports = router;
