const { google } = require('googleapis');
const db = require('./database');

class GoogleAuthConfig {
    constructor() {
        this.oauth2Client = null;
        this.settings = null;
    }

    async loadSettings() {
        try {
            const [rows] = await db.query(
                'SELECT * FROM google_auth_settings ORDER BY id DESC LIMIT 1'
            );

            if (rows.length > 0) {
                this.settings = rows[0];

                if (this.settings.enabled && this.settings.client_id && this.settings.client_secret) {
                    this.oauth2Client = new google.auth.OAuth2(
                        this.settings.client_id,
                        this.settings.client_secret,
                        this.settings.callback_url
                    );
                }
            }

            return this.settings;
        } catch (error) {
            console.error('Error loading Google auth settings:', error);
            return null;
        }
    }

    async updateSettings(clientId, clientSecret, enabled, userId) {
        try {
            const callbackUrl = process.env.GOOGLE_CALLBACK_URL || 'http://10.0.0.3:5000/api/auth/google/callback';

            await db.query(
                `INSERT INTO google_auth_settings (enabled, client_id, client_secret, callback_url, updated_by)
                 VALUES (?, ?, ?, ?, ?)
                 ON DUPLICATE KEY UPDATE 
                 enabled = VALUES(enabled),
                 client_id = VALUES(client_id),
                 client_secret = VALUES(client_secret),
                 callback_url = VALUES(callback_url),
                 updated_by = VALUES(updated_by)`,
                [enabled, clientId, clientSecret, callbackUrl, userId]
            );

            await this.loadSettings();
            return true;
        } catch (error) {
            console.error('Error updating Google auth settings:', error);
            return false;
        }
    }

    getAuthUrl(state) {
        if (!this.oauth2Client) {
            throw new Error('Google OAuth not configured');
        }

        return this.oauth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: [
                'https://www.googleapis.com/auth/userinfo.profile',
                'https://www.googleapis.com/auth/userinfo.email'
            ],
            state: state
        });
    }

    async getTokens(code) {
        if (!this.oauth2Client) {
            throw new Error('Google OAuth not configured');
        }

        const { tokens } = await this.oauth2Client.getToken(code);
        this.oauth2Client.setCredentials(tokens);
        return tokens;
    }

    async getUserInfo(tokens) {
        if (!this.oauth2Client) {
            throw new Error('Google OAuth not configured');
        }

        this.oauth2Client.setCredentials(tokens);
        const oauth2 = google.oauth2({ version: 'v2', auth: this.oauth2Client });
        const { data } = await oauth2.userinfo.get();
        return data;
    }

    isEnabled() {
        return this.settings && this.settings.enabled;
    }
}

module.exports = new GoogleAuthConfig();
