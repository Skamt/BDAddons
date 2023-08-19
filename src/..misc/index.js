import { DOM } from "@Api";
import css from "./styles.css";
import ChannelMuteButton from "./mods/ChannelMuteButton";
import ConsoleToggleButton from "./mods/ConsoleToggleButton";
import EmojiLetters from "./mods/EmojiLetters";
import GuildInfo from "./mods/GuildInfo";
import MemUsage from "./mods/MemUsage";
import NoTrack from "./mods/NoTrack";
import ShowUserInfo from "./mods/ShowUserInfo";
import SpotifyListenAlong from "./mods/SpotifyListenAlong";
import Whois from "./mods/Whois";
import Spotify from "./mods/Spotify";

const mods = [
	new ChannelMuteButton(),
	new ConsoleToggleButton(),
	new EmojiLetters(),
	new GuildInfo(),
	// new MemUsage(),
	// new Whois(),
	// new Spotify(),
	new NoTrack(),
	new ShowUserInfo(),
	new SpotifyListenAlong()
];

console = console.context();

export default () => ({
	start() {
		DOM.addStyle(css);
		mods.forEach(mod => { try { mod.Init?.() } catch (e) { console.log(mod, '\nInit failed\n', e) } });
	},
	stop() {
		DOM.removeStyle();
		mods.forEach(mod => { try { mod.Dispose?.() } catch (e) { console.log(mod, '\nDispose failed\n', e) } });
	}
});