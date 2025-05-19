const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const TimeoutLog = sequelize.define('TimeoutLog', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        userId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        guildId: {
            type: DataTypes.STRING,
            allowNull: false,
            references: {
                model: 'GuildSettings',
                key: 'guildId'
            }
        },
        channelId: {
            type: DataTypes.STRING,
            allowNull: false
        },
        duration: {
            type: DataTypes.INTEGER,
            allowNull: false
        },
        reason: {
            type: DataTypes.STRING,
            allowNull: false
        },
        url: {
            type: DataTypes.STRING,
            allowNull: true
        },
        messageContent: {
            type: DataTypes.TEXT,
            allowNull: true
        }
    });
    
    return TimeoutLog;
}; 