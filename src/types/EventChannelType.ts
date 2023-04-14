import {ChannelType, OverwriteResolvable} from "discord.js";

type EventChannelType = {
    name: string,
    type: 0 | 2 | 5 | 15,
    perms?: OverwriteResolvable[]
}

export default EventChannelType;