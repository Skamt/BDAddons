import Logger from "@Utils/Logger";
import Store from "@/store";
import Plugin from "@common/Plugin";
import { Filters, lazy } from "@Webpack";
import { after } from "@common/Patcher";

Plugin.onStart(() => {
	lazy(Filters.byKeys("getActiveSocketAndDevice"), {
		decFilter: Filters.byPrototypeKeys("handleEvent"),
	}).then(([m, k]) => {
		after(m[k].prototype, "handleEvent", function onSocketEvent({ context, args: [{ type, event }] }) {
			DEV: {
				Logger.log("Spotify Socket", event, Date.now());
			}
			if (Store.state.account?.accountId && context.accountId !== Store.state.account?.accountId)
				return;

			switch (type) {
				case "PLAYER_STATE_CHANGED":
					Store.setPlayerState(event.state);
					break;
				case "DEVICE_STATE_CHANGED": {
					const devices = event.devices;
					const isActive = !!(devices.find((d) => d.is_active) || devices[0])?.is_active;
					Store.setDeviceState(isActive);
					if (!isActive) Store.setPlayerState({});
					break;
				}
			}
		});
	});
});
