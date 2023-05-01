import { DOM } from "@Api";
import css from "./styles.css";
import ChannelMuteButton from "./mods/ChannelMuteButton";
import ConsoleToggleButton from "./mods/ConsoleToggleButton";
import EmojiLetters from "./mods/EmojiLetters";
import GuildInfo from "./mods/GuildInfo";
import MemUsage from "./mods/MemUsage";
import NoTrack from "./mods/NoTrack";
import ShowUserId from "./mods/ShowUserId";
import SpotifyListenAlong from "./mods/SpotifyListenAlong";
import Devtools from "./mods/Devtools";


const mods = [
	new ChannelMuteButton(),
	new ConsoleToggleButton(),
	new EmojiLetters(),
	new GuildInfo(),
	// new MemUsage(),
	new NoTrack(),
	new ShowUserId(),
	new SpotifyListenAlong()
];

Devtools();

export default () => ({
	start() {
		DOM.addStyle(css);
		mods.forEach(mod => { try { mod.Init?.() } catch (e) { console.log(mod, 'Init failed', e) } });
	},
	stop() {
		DOM.removeStyle();
		mods.forEach(mod => { try { mod.Dispose?.() } catch (e) { console.log(mod, 'Dispose failed', e) } });
	}
});