import {
    APIApplicationCommandOptionChoice,
    CategoryChannel,
    ChannelType,
    ChatInputCommandInteraction,
    Guild,
    GuildMember,
    PermissionFlagsBits,
    RESTPostAPIChatInputApplicationCommandsJSONBody,
    SlashCommandBuilder
} from "discord.js";
import {CampaignModel} from "../database";

const command = new SlashCommandBuilder()
    .setName("join")
    .setDescription("Join an ongoing campaign");

async function guildCommand(guild: string): Promise<SlashCommandBuilder> {
    console.log(`Creating join command for guild ${guild}.`);
    const campaigns = await CampaignModel.findAll({ where: { guildId: guild } });
    if(campaigns.length === 0) {
        await command.addChannelOption(option => option.setName("campaign").setDescription("The campaign you want to join").addChannelTypes(ChannelType.GuildCategory).setRequired(true));
        return command;
    }
    await command.addStringOption(option => {
        option.setName("campaign").setDescription("The campaign you want to join").setRequired(true);
        campaigns.forEach(campaign => {
            option.addChoices({ name: campaign.getDataValue("name"), value: campaign.getDataValue("id") });
        });
        return option;
    });
    console.log(JSON.stringify(command.toJSON()));
    return command;
}

async function execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply();
    const guild: Guild = <Guild>interaction.guild;
    const managerMember: GuildMember = <GuildMember>interaction.member;
    const camp = interaction.options.get("campaign");
    let campaignCategory: CategoryChannel;
    if(camp?.type === 3) {
        console.log("Using string option");
        campaignCategory = <CategoryChannel>guild.channels.resolve((await CampaignModel.findOne({ where: { id: <string>camp.value } }))?.getDataValue("categoryId"));
    } else {
        console.log("Using channel option");
        campaignCategory = <CategoryChannel>interaction.options.getChannel('campaign');
    }
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
    guildCommand,
    execute
}