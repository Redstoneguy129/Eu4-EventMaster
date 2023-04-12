import {ChannelType, OverwriteResolvable} from "discord.js";

type EventChannelType = {
    name: string,
    type: ChannelType,
    perms?: OverwriteResolvable[]
}

export default EventChannelType;