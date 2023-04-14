import {
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    GuildTextBasedChannel,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {CampaignModel} from "../database";

const command = new SlashCommandBuilder()
    .setName("end")
    .setDescription("End a campaign")
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageEvents);

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const guild: Guild = <Guild>interaction.guild;
    const managerMember: GuildMember = <GuildMember>interaction.member;
    const channel: GuildTextBasedChannel = <GuildTextBasedChannel>interaction.channel;

    if(channel.type !== ChannelType.GuildText) {
        await interaction.editReply("You can only end campaigns in the text channels!");
        return;
    }

    if(channel.parent === null) {
        await interaction.editReply("You can only end campaigns in the campaigns text channels!");
        return;
    }

    const category: CategoryChannel = <CategoryChannel>channel.parent;

    const campaign = await CampaignModel.findOne({ where: { categoryId: category.id.toString() } });

    if(campaign === null) {
        await interaction.editReply("There is no campaign here!");
        return;
    }

    if(campaign?.getDataValue("ownerId") !== managerMember.id.toString()) {
        await interaction.editReply("You can only end campaigns you own!");
        return;
    }

    await interaction.editReply(`Ended the ${campaign.getDataValue("name")} Campaign`);

    await category.children.cache.each(async ch => await ch.delete(`Ended the ${campaign.getDataValue("name")} Campaign`));

    await category.delete(`Ended the ${campaign.getDataValue("name")} Campaign`);

    await guild.roles.delete(campaign.getDataValue("roleId"));

    await campaign.destroy();
}

export {
    command,
    execute
}