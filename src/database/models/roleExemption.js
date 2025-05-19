const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
    const RoleExemption = sequelize.define('RoleExemption', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true
        },
        roleId: {
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
        reason: {
            type: DataTypes.STRING,
            allowNull: true
        },
        expiresAt: {
            type: DataTypes.DATE,
            allowNull: true
        },
        isActive: {
            type: DataTypes.BOOLEAN,
            allowNull: false,
            defaultValue: true
        }
    });
    
    return RoleExemption;
}; 