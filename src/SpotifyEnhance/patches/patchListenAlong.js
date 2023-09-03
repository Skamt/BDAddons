import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import SpotifyStore from "@Stores/SpotifyStore";

export default () => {
	if (SpotifyStore) Patcher.after(SpotifyStore, "getActiveSocketAndDevice", () => true);
	else Logger.patch("ListenAlong");
};
