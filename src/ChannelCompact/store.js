import Plugin from "@common/Plugin";
import { create, subscribeWithSelector } from "@Discord/zustand";
import { Data } from "@Api";
import { shallow } from "@Utils";

const initialState = {
	channels: new Set()
};

const Store = create(subscribeWithSelector(() => initialState));
export default Store;
Object.assign(Store, {
	add(channelId) {
		this.setState({
			channels: new Set(this.state.channels.add(channelId))
		});
	},
	delete(channelId) {
		if (!this.state.channels.delete(channelId)) return;
		this.setState({
			channels: new Set(this.state.channels)
		});
	},
	has(channelId) {
		return this.state.channels.has(channelId);
	}
});

Store.subscribe(
	state => state,
	() => Data.save("channels", Store.state.channels),
	shallow
);

Plugin.onStart(() => {
	const channels = Data.load("channels") || [];
	Store.setState({ channels: new Set(channels) });
});

window.Store = Store;


