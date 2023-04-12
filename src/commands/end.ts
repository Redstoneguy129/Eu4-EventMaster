import { SlashCommandBuilder, PermissionFlagsBits, ChatInputCommandInteraction, ChannelType, CategoryChannel } from "discord.js";

const command = new SlashCommandBuilder()
    .setName("end")
    .setDescription("End a campaign")
    .addStringOption(opt => opt.setName("name").setDescription("Name of campaign").setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents);

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const campaignName: string = <string>interaction.options.getString('name')?.toLowerCase();
    // @ts-ignore
    const campaignCategory: CategoryChannel = await interaction.guild.channels.cache.filter(ch => ch.type === ChannelType.GuildCategory).find(ch => ch.name.toLowerCase() === campaignName);
    if(campaignCategory) {
        await campaignCategory.children.cache.each(async ch => await ch.delete(`Ended the ${campaignName} Campaign`));
        await campaignCategory.delete(`Ended the ${campaignName} Campaign`);
        await interaction.editReply(`Ended the ${campaignName} Campaign`);
    } else {
        await interaction.editReply(`The ${campaignName} campaign does not exist!`);
    }
}

export {
    command,
    execute
}