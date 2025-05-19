const express = require('express');
const session = require('express-session');
const cors = require('cors');
const helmet = require('helmet');
const bodyParser = require('body-parser');
const path = require('path');
const crypto = require('crypto');

// Create a random session secret
const sessionSecret = crypto.randomBytes(32).toString('hex');

// Create Express app
const app = express();

// Middleware
app.use(helmet({ contentSecurityPolicy: false })); // Disable CSP for development
app.use(cors({
    origin: 'http://localhost:8080', // Vue dev server
    credentials: true
}));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // Only use secure cookies in production
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

// Serve static files from the dashboard/dist directory
app.use(express.static(path.join(__dirname, 'dist')));

// Authentication middleware
const authenticateUser = (req, res, next) => {
    // For development, we'll allow all requests
    // In production, you'd implement proper authentication
    next();
};

// API routes
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
});

// Define API routes
function setupApiRoutes(client) {
    const db = client.database;
    
    // Get guild settings
    app.get('/api/guilds/:guildId/settings', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            const settings = await db.getGuildSettings(guildId);
            res.json(settings);
        } catch (error) {
            console.error('Error getting guild settings:', error);
            res.status(500).json({ error: 'Failed to get guild settings' });
        }
    });
    
    // Update timeout duration
    app.post('/api/guilds/:guildId/timeout', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            const { duration } = req.body;
            
            if (!duration || isNaN(duration) || duration < 5 || duration > 2419200) {
                return res.status(400).json({ error: 'Invalid duration' });
            }
            
            const settings = await db.updateTimeoutDuration(guildId, parseInt(duration));
            res.json(settings);
        } catch (error) {
            console.error('Error updating timeout duration:', error);
            res.status(500).json({ error: 'Failed to update timeout duration' });
        }
    });
    
    // Get monitored channels
    app.get('/api/guilds/:guildId/channels', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            const channels = await db.getMonitoredChannels(guildId);
            res.json(channels);
        } catch (error) {
            console.error('Error getting monitored channels:', error);
            res.status(500).json({ error: 'Failed to get monitored channels' });
        }
    });
    
    // Add monitored channel
    app.post('/api/guilds/:guildId/channels', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            const { channelId } = req.body;
            
            if (!channelId) {
                return res.status(400).json({ error: 'Channel ID is required' });
            }
            
            const channel = await db.addMonitoredChannel(guildId, channelId);
            res.json(channel);
        } catch (error) {
            console.error('Error adding monitored channel:', error);
            res.status(500).json({ error: 'Failed to add monitored channel' });
        }
    });
    
    // Remove monitored channel
    app.delete('/api/guilds/:guildId/channels/:channelId', authenticateUser, async (req, res) => {
        try {
            const { guildId, channelId } = req.params;
            const channel = await db.removeMonitoredChannel(guildId, channelId);
            res.json(channel);
        } catch (error) {
            console.error('Error removing monitored channel:', error);
            res.status(500).json({ error: 'Failed to remove monitored channel' });
        }
    });
    
    // Get user exemptions
    app.get('/api/guilds/:guildId/exemptions/users', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            // We need to add this function to the database service
            const exemptions = await db.getUserExemptions(guildId);
            res.json(exemptions);
        } catch (error) {
            console.error('Error getting user exemptions:', error);
            res.status(500).json({ error: 'Failed to get user exemptions' });
        }
    });
    
    // Get role exemptions
    app.get('/api/guilds/:guildId/exemptions/roles', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            // We need to add this function to the database service
            const exemptions = await db.getRoleExemptions(guildId);
            res.json(exemptions);
        } catch (error) {
            console.error('Error getting role exemptions:', error);
            res.status(500).json({ error: 'Failed to get role exemptions' });
        }
    });
    
    // Get timeout logs
    app.get('/api/guilds/:guildId/logs', authenticateUser, async (req, res) => {
        try {
            const { guildId } = req.params;
            const { limit } = req.query;
            const logs = await db.getTimeoutLogs(guildId, limit ? parseInt(limit) : 100);
            res.json(logs);
        } catch (error) {
            console.error('Error getting timeout logs:', error);
            res.status(500).json({ error: 'Failed to get timeout logs' });
        }
    });
    
    // Catch-all route to serve Vue app
    app.get('*', (req, res) => {
        res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
}

// Export the app and setup function
module.exports = {
    app,
    setupApiRoutes
}; 