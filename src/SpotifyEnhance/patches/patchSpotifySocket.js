import { Patcher } from "@Api";
import Logger from "@Utils/Logger";

import { Store } from "@/Store";
import Plugin, { Events } from "@Utils/Plugin";
import { getObjectKey } from "@Utils";
import { Filters, waitForModule } from "@Webpack";

Plugin.on(Events.START, async () => {
	const controller = new AbortController();

	waitForModule(Filters.byKeys("getActiveSocketAndDevice"), {
		signal: controller.signal,
		raw: true,
	}).then(({ declarations: SpotifyStore }) => {
		const key = getObjectKey(SpotifyStore, Filters.byPrototypeKeys("handleEvent"));
		if (!key) return Logger.patchError("patchSpotifySocket");

		Patcher.after(SpotifyStore[key].prototype, "handleEvent", function onSocketEvent(socket, [socketEvent]) {
			DEV: {
				Logger.log("Spotify Socket", socketEvent, Date.now());
			}
			if (Store.state.account?.accountId && socket.accountId !== Store.state.account?.accountId)
				return;
			const { type, event } = socketEvent;

			switch (type) {
				case "PLAYER_STATE_CHANGED":
					Store.state.setPlayerState(event.state);
					break;
				case "DEVICE_STATE_CHANGED": {
					const devices = event.devices;
					const isActive = !!(devices.find((d) => d.is_active) || devices[0])?.is_active;
					Store.state.setDeviceState(isActive);
					if (!isActive) Store.state.setPlayerState({});
					break;
				}
			}
		});
	});
	Plugin.once(Events.STOP, () => controller.abort());
});
