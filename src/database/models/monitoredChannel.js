const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const MonitoredChannel = sequelize.define('MonitoredChannel', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        channelId: {
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
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
    
    return MonitoredChannel;
}; 