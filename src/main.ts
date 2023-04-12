import * as dotenv from "dotenv";

//@ts-ignore
const config: {DISCORD_TOKEN: string} = dotenv.config().parsed;

import { Client, Events, GatewayIntentBits, Routes } from "discord.js";

import * as fs from "fs";
import * as path from "path";
import CommandType from "./types/CommandType";

const commands: CommandType[] = [];

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));

for(const file of commandFiles) {
    const command = require(`./commands/${file}`);
    commands.push(command);
}

const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.once(Events.ClientReady, async event => {
    console.log(`Logged in as ${event.user.tag}!`);
    const rest = client.rest;
    console.log(`Started refreshing ${commands.length} application commands.`);
    const commandJSON = commands.flatMap(oldCMD => oldCMD.command.toJSON());
    const data = await rest.put(Routes.applicationCommands(event.application.id), { body: commandJSON })
    // @ts-ignore
    console.log(`Successfully reloaded ${data.length} application commands.`)
})

client.on(Events.InteractionCreate, async interaction => {
    if(!interaction.isChatInputCommand()) return;

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

client.login(config.DISCORD_TOKEN).then(console.log);