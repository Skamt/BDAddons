import { DOM } from "@Api";
import ChannelMuteButton from "./mods/ChannelMuteButton";
import ConsoleToggleButton from "./mods/ConsoleToggleButton";
import EmojiLetters from "./mods/EmojiLetters";
import FriendsSince from "./mods/FriendsSince";
import GIFCommandPreviews from "./mods/GIFCommandPreviews";
import GuildInfo from "./mods/GuildInfo";
import MemUsage from "./mods/MemUsage";
import NoLinkPreview from "./mods/NoLinkPreview";
import NoReplyPing from "./mods/NoReplyPing";
import NoTrack from "./mods/NoTrack";
import RefreshChannel from "./mods/RefreshChannel";
import ShowChannelPerms from "./mods/ShowChannelPerms";
import ShowUserInfo from "./mods/ShowUserInfo";
import SpotifyListenAlong from "./mods/SpotifyListenAlong";
import Whois from "./mods/Whois";
import "./styles.css";

const mods = [
	new ChannelMuteButton(),
	new ConsoleToggleButton(),
	new EmojiLetters(),
	new GuildInfo(),
	new NoLinkPreview(),
	new NoReplyPing(),
	// new MemUsage(),
	// new Whois(),
	new ShowChannelPerms(),
	new RefreshChannel(),
	new NoTrack(),
	new FriendsSince(),
	new ShowUserInfo(),
	new SpotifyListenAlong(),
	new GIFCommandPreviews()
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