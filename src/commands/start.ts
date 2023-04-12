import {
    SlashCommandBuilder,
    PermissionFlagsBits,
    ChatInputCommandInteraction,
    ChannelType,
    PermissionOverwrites, PermissionsBitField
} from "discord.js";
import EventChannelType from "../types/EventChannelType";
import eventChannelType from "../types/EventChannelType";

const command = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a new campaign")
    .addStringOption(opt => opt.setName("name").setDescription("Name of campaign").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents);

async function execute(interaction: ChatInputCommandInteraction) {
    const campaignName: string = <string>interaction.options.getString('name');
    await interaction.reply(`Starting game ${campaignName}`)
    const channels: EventChannelType[] = [
        // @ts-ignore
        { name: "server-id", type: ChannelType.GuildAnnouncement, perms: [{id: interaction.guild.id, deny: [PermissionsBitField.Flags.SendMessages]}, {id: interaction.guild.roles.cache.find(r => r.name.toLowerCase() === "managers").id, allow: [PermissionsBitField.Flags.SendMessages]}] },
        { name: "save-fixes", type: ChannelType.GuildForum },
        { name: "general", type: ChannelType.GuildText },
        { name: "NorthAmerica", type: ChannelType.GuildVoice },
        { name: "SouthAmerica", type: ChannelType.GuildVoice },
        { name: "WestEurope", type: ChannelType.GuildVoice },
        { name: "HolyRomanEmpire", type: ChannelType.GuildVoice },
        { name: "EastEurope", type: ChannelType.GuildVoice },
        { name: "NorthAfrica", type: ChannelType.GuildVoice },
        { name: "Africa", type: ChannelType.GuildVoice },
        { name: "MiddleEast", type: ChannelType.GuildVoice },
        { name: "India", type: ChannelType.GuildVoice },
        { name: "SouthEastAsia", type: ChannelType.GuildVoice },
        { name: "Asia", type: ChannelType.GuildVoice },
    ]
    // @ts-ignore
    const category = await interaction.guild.channels.create({
        name: campaignName.toLowerCase(),
        type: ChannelType.GuildCategory,
    });
    for (const eventChannelType of channels) {
        // @ts-ignore
        await interaction.guild.channels.create({ name: eventChannelType.name, type: eventChannelType.type, parent: category, permissionOverwrites: eventChannelType.perms });
    }
}

export {
    command,
    execute
};