import {
    ChannelType,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    PermissionFlagsBits,
    PermissionsBitField, Routes,
    SlashCommandBuilder
} from "discord.js";
import EventChannelType from "../types/EventChannelType";
import {CampaignModel} from "../database";
import {regenCampaignGuildCommands} from "../main";

const command = new SlashCommandBuilder()
    .setName("start")
    .setDescription("Start a new campaign")
    .addStringOption(opt => opt.setName("name").setDescription("Name of campaign").setRequired(true).setMinLength(8).setMaxLength(15))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents);

async function execute(interaction: ChatInputCommandInteraction) {
    const campaignName: string = <string>interaction.options.getString('name');
    await interaction.deferReply();
    const guild: Guild = <Guild>interaction.guild;
    const managerMember: GuildMember = <GuildMember>interaction.member;
    const reason = `Created for campaign ${campaignName}`;

    const role = await guild.roles.create({
        name: campaignName.toLowerCase(),
        mentionable: true,
        permissions: [],
        reason
    });

    await managerMember.roles.add(role);

    const category = await guild.channels.create({
        name: campaignName.toLowerCase(),
        type: ChannelType.GuildCategory,
        permissionOverwrites: [
            { id: role.id, allow: [PermissionsBitField.Flags.ViewChannel] },
            { id: guild.id, deny: [PermissionsBitField.Flags.ViewChannel] }
        ],
        reason
    });

    await CampaignModel.create({
        id: Date.now().toString(),
        name: campaignName,
        ownerId: interaction.user.id,
        guildId: guild.id,
        categoryId: category.id,
        roleId: role.id
    });

    const channels: EventChannelType[] = [
        { name: "server-id", type: ChannelType.GuildAnnouncement, perms: [{id: guild.id, deny: [PermissionsBitField.Flags.SendMessages, PermissionsBitField.Flags.ViewChannel]}, {id: role.id, allow: [PermissionsBitField.Flags.ViewChannel]}, {id: managerMember.id, allow: [PermissionsBitField.Flags.SendMessages]}] },
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

    for (const eventChannelType of channels) {
        await guild.channels.create({ name: eventChannelType.name, type: eventChannelType.type, parent: category, permissionOverwrites: eventChannelType.perms });
    }

    await interaction.editReply(`Created campaign ${campaignName}`);

    /*

    await restClient.put(Routes.applicationGuildCommands(applicationId, guildId), { body: [] }).then(async () => {

    });
     */

    await interaction.client.rest.put(Routes.applicationGuildCommands(interaction.applicationId, guild.id), { body: [] }).then(async () => {
        await regenCampaignGuildCommands(guild.id, interaction.applicationId, interaction.client.rest);
    });
}

export {
    command,
    execute
};