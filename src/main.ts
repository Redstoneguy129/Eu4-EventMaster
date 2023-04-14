import * as dotenv from "dotenv";
import * as process from "process";
import {Client, Events, GatewayIntentBits, Routes} from "discord.js";

import * as fs from "fs";
import * as path from "path";
import CommandType from "./types/CommandType";
import {CampaignModel, database} from "./database";

dotenv.config();

type ConfigType = {
    DISCORD_TOKEN: string | undefined,
    POSTGRES_USERNAME: string | undefined,
    POSTGRES_PASSWORD: string | undefined,
    POSTGRES_URL: string | undefined,
    POSTGRES_DB: string | undefined
}

export const config: ConfigType = {
    DISCORD_TOKEN: process.env.DISCORD_TOKEN,
    POSTGRES_USERNAME: process.env.POSTGRES_USERNAME,
    POSTGRES_PASSWORD: process.env.POSTGRES_PASSWORD,
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_DB: process.env.POSTGRES_DB
}

const commands: CommandType[] = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'))
commandFiles.push(...fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts')))

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async event => {
    await database.authenticate();
    await CampaignModel.sync();
    console.log(`Logged in as ${event.user.tag}!`);
    const rest = client.rest;
    console.log(`Started refreshing ${commands.length} application commands.`);
    const nonGuildCommands = commands.filter(cmd => !cmd.guildCommand);
    const commandJSON = nonGuildCommands.flatMap(oldCMD => oldCMD.command.toJSON());
    let data: number = <number>await rest.put(Routes.applicationCommands(event.application.id), {body: commandJSON});

    await event.guilds.cache.each(async guild => {
        const guildCommands = commands.filter(cmd => cmd.guildCommand);
        // @ts-ignore
        const guildCommandJSON = (await Promise.all(guildCommands.map(async oldCMD => (await oldCMD.guildCommand(guild.id)).toJSON()))).flat();
        console.log(JSON.stringify(guildCommandJSON));
        const guildData: number = <number>await rest.put(Routes.applicationGuildCommands(event.application.id, guild.id), {body: guildCommandJSON});
        // @ts-ignore
        console.log(`Successfully reloaded ${guildData.length} guild commands for ${guild.id}.`);
    });

    // @ts-ignore
    console.log(`Successfully reloaded ${data.length} application commands.`);
})

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

    // @ts-ignore
    const command = commands.find(cmd => cmd.command.name === interaction.commandName);

    if(!command) {
        console.error(`No command matching ${interaction.commandName}`);
        return;
    }
    command.execute(interaction).catch(e => {
        console.error(`Error executing ${interaction.commandName}`);
        console.error(e)
    })
})

client.login(config.DISCORD_TOKEN).then(() => console.log("Logging in.."));