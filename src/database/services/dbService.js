const {
    GuildSetting,
    MonitoredChannel,
    UserExemption,
    RoleExemption,
    TimeoutLog
} = require('../models');
const fs = require('fs');
const path = require('path');

// Ensure the data directory exists
const dataDir = path.join(__dirname, '../../data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

// Guild Settings Service
async function getGuildSettings(guildId) {
    try {
        let settings = await GuildSetting.findByPk(guildId);
        
        if (!settings) {
            // Create default settings if none exist
            settings = await GuildSetting.create({
                guildId,
                timeoutDuration: 300,
                defaultLanguage: 'en'
            });
        }
        
        return settings;
    } catch (error) {
        console.error('Error getting guild settings:', error);
        // Graceful fallback
        return {
            guildId,
            timeoutDuration: 300,
            defaultLanguage: 'en'
        };
    }
}

async function updateTimeoutDuration(guildId, duration) {
    try {
        const [settings] = await GuildSetting.findOrCreate({
            where: { guildId },
            defaults: {
                timeoutDuration: duration,
                defaultLanguage: 'en'
            }
        });
        
        if (settings.timeoutDuration !== duration) {
            settings.timeoutDuration = duration;
            await settings.save();
        }
        
        return settings;
    } catch (error) {
        console.error('Error updating timeout duration:', error);
        throw error;
    }
}

async function updateDefaultLanguage(guildId, language) {
    try {
        const [settings] = await GuildSetting.findOrCreate({
            where: { guildId },
            defaults: {
                timeoutDuration: 300,
                defaultLanguage: language
            }
        });
        
        if (settings.defaultLanguage !== language) {
            settings.defaultLanguage = language;
            await settings.save();
        }
        
        return settings;
    } catch (error) {
        console.error('Error updating default language:', error);
        throw error;
    }
}

// Monitored Channels Service
async function addMonitoredChannel(guildId, channelId) {
    try {
        // Ensure the guild settings exist
        await getGuildSettings(guildId);
        
        // Check if channel is already monitored
        const existingChannel = await MonitoredChannel.findOne({
            where: { guildId, channelId }
        });
        
        if (existingChannel) {
            // If channel exists but is not active, reactivate it
            if (!existingChannel.isActive) {
                existingChannel.isActive = true;
                await existingChannel.save();
            }
            return existingChannel;
        }
        
        // Create new monitored channel
        return await MonitoredChannel.create({
            guildId,
            channelId,
            isActive: true
        });
    } catch (error) {
        console.error('Error adding monitored channel:', error);
        throw error;
    }
}

async function removeMonitoredChannel(guildId, channelId) {
    try {
        const channel = await MonitoredChannel.findOne({
            where: { guildId, channelId }
        });
        
        if (channel) {
            channel.isActive = false;
            await channel.save();
        }
        
        return channel;
    } catch (error) {
        console.error('Error removing monitored channel:', error);
        throw error;
    }
}

async function getMonitoredChannels(guildId) {
    try {
        return await MonitoredChannel.findAll({
            where: { guildId, isActive: true }
        });
    } catch (error) {
        console.error('Error getting monitored channels:', error);
        // Graceful fallback
        return [];
    }
}

async function isChannelMonitored(guildId, channelId) {
    try {
        const channel = await MonitoredChannel.findOne({
            where: { guildId, channelId, isActive: true }
        });
        
        return !!channel;
    } catch (error) {
        console.error('Error checking if channel is monitored:', error);
        // Graceful fallback - assume not monitored
        return false;
    }
}

// User Exemptions Service
async function addUserExemption(guildId, userId, reason = null, expiresAt = null) {
    try {
        // Ensure the guild settings exist
        await getGuildSettings(guildId);
        
        // Check if user is already exempt
        const existingExemption = await UserExemption.findOne({
            where: { guildId, userId }
        });
        
        if (existingExemption) {
            // Update existing exemption
            existingExemption.reason = reason;
            existingExemption.expiresAt = expiresAt;
            existingExemption.isActive = true;
            await existingExemption.save();
            return existingExemption;
        }
        
        // Create new exemption
        return await UserExemption.create({
            guildId,
            userId,
            reason,
            expiresAt,
            isActive: true
        });
    } catch (error) {
        console.error('Error adding user exemption:', error);
        throw error;
    }
}

async function removeUserExemption(guildId, userId) {
    try {
        const exemption = await UserExemption.findOne({
            where: { guildId, userId }
        });
        
        if (exemption) {
            exemption.isActive = false;
            await exemption.save();
        }
        
        return exemption;
    } catch (error) {
        console.error('Error removing user exemption:', error);
        throw error;
    }
}

async function isUserExempt(guildId, userId) {
    try {
        const now = new Date();
        
        // Check if user has an active exemption that hasn't expired
        const exemption = await UserExemption.findOne({
            where: { 
                guildId, 
                userId, 
                isActive: true 
            }
        });
        
        if (!exemption) return false;
        
        // If the exemption has an expiry date, check if it's expired
        if (exemption.expiresAt && exemption.expiresAt < now) {
            exemption.isActive = false;
            await exemption.save();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking if user is exempt:', error);
        // Graceful fallback - assume not exempt
        return false;
    }
}

// Get all user exemptions for a guild
async function getUserExemptions(guildId) {
    try {
        return await UserExemption.findAll({
            where: { 
                guildId,
                isActive: true 
            }
        });
    } catch (error) {
        console.error('Error getting user exemptions:', error);
        // Graceful fallback
        return [];
    }
}

// Role Exemptions Service
async function addRoleExemption(guildId, roleId, reason = null, expiresAt = null) {
    try {
        // Ensure the guild settings exist
        await getGuildSettings(guildId);
        
        // Check if role is already exempt
        const existingExemption = await RoleExemption.findOne({
            where: { guildId, roleId }
        });
        
        if (existingExemption) {
            // Update existing exemption
            existingExemption.reason = reason;
            existingExemption.expiresAt = expiresAt;
            existingExemption.isActive = true;
            await existingExemption.save();
            return existingExemption;
        }
        
        // Create new exemption
        return await RoleExemption.create({
            guildId,
            roleId,
            reason,
            expiresAt,
            isActive: true
        });
    } catch (error) {
        console.error('Error adding role exemption:', error);
        throw error;
    }
}

async function removeRoleExemption(guildId, roleId) {
    try {
        const exemption = await RoleExemption.findOne({
            where: { guildId, roleId }
        });
        
        if (exemption) {
            exemption.isActive = false;
            await exemption.save();
        }
        
        return exemption;
    } catch (error) {
        console.error('Error removing role exemption:', error);
        throw error;
    }
}

async function isRoleExempt(guildId, roleId) {
    try {
        const now = new Date();
        
        // Check if role has an active exemption that hasn't expired
        const exemption = await RoleExemption.findOne({
            where: { 
                guildId, 
                roleId, 
                isActive: true 
            }
        });
        
        if (!exemption) return false;
        
        // If the exemption has an expiry date, check if it's expired
        if (exemption.expiresAt && exemption.expiresAt < now) {
            exemption.isActive = false;
            await exemption.save();
            return false;
        }
        
        return true;
    } catch (error) {
        console.error('Error checking if role is exempt:', error);
        // Graceful fallback - assume not exempt
        return false;
    }
}

// Get all role exemptions for a guild
async function getRoleExemptions(guildId) {
    try {
        return await RoleExemption.findAll({
            where: { 
                guildId,
                isActive: true 
            }
        });
    } catch (error) {
        console.error('Error getting role exemptions:', error);
        // Graceful fallback
        return [];
    }
}

// Check if a user is exempt either directly or through a role
async function isExempt(guildId, userId, memberRoles) {
    try {
        // Check direct user exemption
        if (await isUserExempt(guildId, userId)) {
            return true;
        }
        
        // Check role exemptions
        if (memberRoles && memberRoles.length > 0) {
            for (const roleId of memberRoles) {
                if (await isRoleExempt(guildId, roleId)) {
                    return true;
                }
            }
        }
        
        return false;
    } catch (error) {
        console.error('Error checking exemption status:', error);
        // Graceful fallback - assume not exempt
        return false;
    }
}

// Timeout Logs Service
async function logTimeout(guildId, userId, channelId, duration, reason, url = null, messageContent = null) {
    try {
        return await TimeoutLog.create({
            guildId,
            userId,
            channelId,
            duration,
            reason,
            url,
            messageContent
        });
    } catch (error) {
        console.error('Error logging timeout:', error);
        // Continue without logging - this isn't critical for functionality
    }
}

async function getTimeoutLogs(guildId, limit = 100) {
    try {
        return await TimeoutLog.findAll({
            where: { guildId },
            order: [['createdAt', 'DESC']],
            limit
        });
    } catch (error) {
        console.error('Error getting timeout logs:', error);
        // Graceful fallback
        return [];
    }
}

// Export all services
module.exports = {
    // Guild Settings
    getGuildSettings,
    updateTimeoutDuration,
    updateDefaultLanguage,
    
    // Monitored Channels
    addMonitoredChannel,
    removeMonitoredChannel,
    getMonitoredChannels,
    isChannelMonitored,
    
    // User Exemptions
    addUserExemption,
    removeUserExemption,
    isUserExempt,
    getUserExemptions,
    
    // Role Exemptions
    addRoleExemption,
    removeRoleExemption,
    isRoleExempt,
    getRoleExemptions,
    
    // Combined Exemption Check
    isExempt,
    
    // Timeout Logs
    logTimeout,
    getTimeoutLogs
}; 