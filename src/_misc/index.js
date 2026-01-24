import "./styles.css";
import Logger from "@Utils/Logger";
import { DOM } from "@Api";
import ChannelMuteButton from "./mods/ChannelMuteButton";
import ConsoleToggleButton from "./mods/ConsoleToggleButton";
import EmojiLetters from "./mods/EmojiLetters";
import GIFCommandPreviews from "./mods/GIFCommandPreviews";
import GuildInfo from "./mods/GuildInfo";
import NoLinkPreview from "./mods/NoLinkPreview";
import NoTrack from "./mods/NoTrack";
import MarkdownActionButtons from "./mods/MarkdownActionButtons";
import MoreQuickReacts from "./mods/MoreQuickReacts";
import Whois from "./mods/Whois";
import OwnerCrown from "./mods/OwnerCrown";
import ShowUserInfo from "./mods/ShowUserInfo";
import Commands from "./mods/Commands";
import EnableModView from "./mods/EnableModView";
import WelcomeMessage from "./mods/WelcomeMessage";
import PinRoles from "./mods/PinRoles";
import ShowChannelPerms from "./mods/ShowChannelPerms";


const mods = [
	new MoreQuickReacts(),
	new ChannelMuteButton(),
	new ConsoleToggleButton(),
	new Commands(),
	new EmojiLetters(),
	new GuildInfo(),
	new WelcomeMessage(),
	new OwnerCrown(),
	new NoLinkPreview(),
	// new NoReplyPing(),
	new PinRoles(),
	new EnableModView(),
	new ShowChannelPerms(),
	new NoTrack(),
	// new FriendsSince(),
	new ShowUserInfo(),
	new MarkdownActionButtons(),
	// new SpotifyListenAlong(),
	new GIFCommandPreviews(),
	// new MemUsage(),
	new Whois(),
	// new RefreshChannel(),
];

if (console.context) console = console.context();

import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	for (const mod of mods) {
		try {
			mod.Init?.();
		} catch (e) {
			Logger.error(mod, "\nInit failed\n", e);
		}
	}
});

Plugin.on(Events.STOP, () => {
	for (const mod of mods) {
		try {
			mod.Dispose?.();
		} catch (e) {
			Logger.error(mod, "\nDispose failed\n", e);
		}
	}
});

Plugin.getSettingsPanel = () => {
	return mod.map(mod => {
		try {
			return content.push(mod.getSettingsPanel?.());
		} catch (e) {
			Logger.error(mod, "\nError loading settings\n", e);
		}
	});
};

module.exports = () => Plugin;
