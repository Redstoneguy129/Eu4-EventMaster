import {DataTypes, Sequelize} from "sequelize";
import {config} from "./main";

function getDatabase() {
    if(config.POSTGRES_URL === undefined) {
        return new Sequelize({
            dialect: 'sqlite',
            storage: 'campaigns.sqlite',
            logging: false
        });
    }
    return new Sequelize({
        dialect: 'postgres',
        host: config.POSTGRES_URL,
        username: config.POSTGRES_USERNAME,
        password: config.POSTGRES_PASSWORD,
        database: config.POSTGRES_DB,
        port: 5432,
        logging: false
    });
}

let db = getDatabase();

export const database = db;

export const CampaignModel = database.define('campaign', {
    id: {
        type: DataTypes.TEXT,
        unique: true,
        primaryKey: true,
    },
    name: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    ownerId: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    guildId: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    categoryId: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    roleId: {
        type: DataTypes.TEXT,
        allowNull: false
    }
});