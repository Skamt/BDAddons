import { DOM, Patcher, React, showConfirmationModal } from "@Api";
// import Tooltip from "@Components/Tooltip";
import Collapsible from "@Components/Collapsible";
import ConnectedAccountsStore from "@Stores/ConnectedAccountsStore";
import Settings from "./components/Settings";
// import "./styles";

import SpotifyAPI from "@Utils/SpotifyAPI";
import SpotifyWrapper from "./t";

// SpotifyApi.listen(type, id, rawTitle)
// SpotifyApi.queue(type, id, rawTitle)

// const pauseHandler = () => SpotifyApi.pause();
// const playHandler = () => SpotifyApi.play();
// const previousHandler = () => SpotifyApi.previous();
// const nextHandler = () => SpotifyApi.next();

// const shuffleHandler = () => SpotifyApi.shuffle(!shuffle);
// const repeatHandler = () => SpotifyApi.repeat(repeatArg);
// SpotifyApi.volume(target).then(() => {
// 		setVal(target);
// 	});
// SpotifyApi.seek(pos);

window.SpotifyAPI = SpotifyAPI;
window.SpotifyWrapper = SpotifyWrapper;

export default () => {
	return {
		start() {
			// DOM.addStyle(css);
		},
		stop() {
			DOM.removeStyle();
			Patcher.unpatchAll();
		}
	};
};
