import "./styles.css";
import { DOM } from "@Api";
import ChannelMuteButton from "./mods/ChannelMuteButton";
import ConsoleToggleButton from "./mods/ConsoleToggleButton";
import EmojiLetters from "./mods/EmojiLetters";
import FriendsSince from "./mods/FriendsSince";
import GIFCommandPreviews from "./mods/GIFCommandPreviews";
import GuildInfo from "./mods/GuildInfo";
import NoLinkPreview from "./mods/NoLinkPreview";
import NoTrack from "./mods/NoTrack";
import ShowUserInfo from "./mods/ShowUserInfo";
import SpotifyListenAlong from "./mods/SpotifyListenAlong";
import EnableModView from "./mods/EnableModView";

import ShowChannelPerms from "./mods/ShowChannelPerms";
// import NoReplyPing from "./mods/NoReplyPing";
// import MemUsage from "./mods/MemUsage";
// import RefreshChannel from "./mods/RefreshChannel";
// import Whois from "./mods/Whois";

const mods = [
	new ChannelMuteButton(),
	new ConsoleToggleButton(),
	new EmojiLetters(),
	new GuildInfo(),
	new NoLinkPreview(),
	// new NoReplyPing(),
	new EnableModView(),
	new ShowChannelPerms(),
	new NoTrack(),
	new FriendsSince(),
	new ShowUserInfo(),
	new SpotifyListenAlong(),
	new GIFCommandPreviews()
	// new MemUsage(),
	// new Whois(),
	// new RefreshChannel(),
];

if (console.context) console = console.context();

export default () => ({
	start() {
		DOM.addStyle(css);
		for (const mod of mods) {
			try {
				mod.Init?.();
			} catch (e) {
				console.log(mod, "\nInit failed\n", e);
			}
		}
	},
	stop() {
		DOM.removeStyle();
		for (const mod of mods) {
			try {
				mod.Dispose?.();
			} catch (e) {
				console.log(mod, "\nDispose failed\n", e);
			}
		}
	}
});