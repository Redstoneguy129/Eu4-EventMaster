import {
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    GuildMember,
    GuildTextBasedChannel,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {CampaignModel} from "../database";

const command = new SlashCommandBuilder()
    .setName("leave")
    .setDescription("Leave an ongoing campaign");

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const managerMember: GuildMember = <GuildMember>interaction.member;
    const channel: GuildTextBasedChannel = <GuildTextBasedChannel>interaction.channel;

    if(channel.type !== ChannelType.GuildText) {
        await interaction.editReply("You can only leave campaigns in the text channels!");
        return;
    }

    if(channel.parent === null) {
        await interaction.editReply("You can only leave campaigns in the campaigns text channels!");
        return;
    }

    const category: CategoryChannel = <CategoryChannel>channel.parent;

    const campaign = await CampaignModel.findOne({ where: { categoryId: category.id.toString() } });

    if(campaign === null) {
        await interaction.editReply("There is no campaign here!");
        return;
    }

    if(managerMember.id.toString() === campaign.getDataValue("ownerId")) {
        await interaction.editReply("You can't leave a campaign you own!");
        return;
    }

    await managerMember.roles.remove(campaign.getDataValue("roleId"));

    await interaction.editReply(`Removed ${interaction.user.tag} from this campaign!`);
}

export {
    command,
    execute
}