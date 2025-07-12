import { Store } from "@/Store";
import { getChannelName } from "@/utils";
import useStateFromStores from "@Modules/useStateFromStores";
import React from "@React";
import ChannelStore from "@Stores/ChannelStore";
import { Filters, getModule } from "@Webpack";
import FloatingWindow from "./FloatingWindow";
import GuildStore from "@Stores/GuildStore";

// const ChannelComp = getModule(a => a.type && String(a.type).includes("providedChannel"));
const ChannelComp = getModule(m => m?.type?.toString().indexOf("communicationDisabledUntil") > -1);
const chatInputTypes = getModule(Filters.byKeys("OVERLAY", "NORMAL"), { searchExports: true });

export default React.memo(function FloatingChannel({ id }) {
	const isFocused = Store(state => state.getFocused() === id);
	const { channelId } = Store.state.get(id) || {};

	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;
	const guild = GuildStore.getGuild(channel.id);
	const closeHandler = () => {
		Store.state.remove(id);
	};

	const clickHandler = () => {
		Store.state.setFocused(id);
	};

	return (
		<FloatingWindow
			focused={isFocused}
			onMouseDown={clickHandler}
			onClose={closeHandler}
			title={getChannelName(channel)}
			content={
				<ChannelComp
					channel={channel}
					guild={guild}
					chatInputType={{
						...chatInputTypes.NORMAL,
						analyticsName: crypto.randomUUID()
					}}
				/>
			}
		/>
	);
});
