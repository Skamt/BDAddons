import React from "@React";
import { getModule } from "@Webpack";
import { getChannelName } from "@/utils";
import FloatingWindow from "./FloatingWindow";
import { Store } from "@/Store";
import ChannelStore from "@Stores/ChannelStore";
import useStateFromStores from "@Modules/useStateFromStores";

const ChannelComp = getModule(a => a.type && String(a.type).includes("providedChannel"));

export default React.memo(function FloatingChannel({ id }) {
	const isFocused = Store(state => state.getFocused() === id);
	const { channelId } = Store.state.get(id) || {};

	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	if (!channel) return;

	const closeHandler = e => {
		console.log(e);
		Store.state.remove(id);
	};

	const clickHandler = e => {
		console.log(e);
		Store.state.setFocused(id);
	};

	return (
		<FloatingWindow
			focused={isFocused}
			onMouseDown={clickHandler}
			onClose={closeHandler}
			title={getChannelName(channel)}
			content={<ChannelComp providedChannel={channel} />}
		/>
	);
});
