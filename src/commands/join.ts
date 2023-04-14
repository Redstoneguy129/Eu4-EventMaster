import {
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    PermissionFlagsBits,
    SlashCommandBuilder
} from "discord.js";
import {CampaignModel} from "../database";

const command = new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join an ongoing campaign")
    .addChannelOption(option => option.setName("campaign").setDescription("The campaign you want to join").addChannelTypes(ChannelType.GuildCategory).setRequired(true));

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const managerMember: GuildMember = <GuildMember>interaction.member;
    const campaignCategory: CategoryChannel = <CategoryChannel>interaction.options.getChannel('campaign');

    const campaign = await CampaignModel.findOne({ where: { categoryId: campaignCategory.id.toString() } });

    if(campaign === null) {
        await interaction.editReply("This campaign doesn't exist!");
        return;
    }

    await managerMember.roles.add(campaign.getDataValue("roleId"));

    await interaction.editReply(`Added ${interaction.user.tag} to the ${campaign.getDataValue("name")} campaign!`);
}

export {
    command,
    execute
}