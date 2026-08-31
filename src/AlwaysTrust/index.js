import { Filters, getMangled, getModule } from "@Webpack";
import Plugin, { Events } from "@Utils/Plugin";
import { Patcher } from "@Api";
import Settings from "@Utils/Settings";
import SettingSwtich from "@Components/SettingSwtich";

const LinkPrompt = getModule(Filters.bySource(`="MaskedLinkStore",`), {
	declarationFilter: a => a.prototype.isTrustedDomain
});

const FilePrompt = getMangled(Filters.bySource("github.com", "bitbucket.org", "gitlab.com"), {
	confirm: () => 1
});

Plugin.on(Events.START, () => {
	Patcher.after(LinkPrompt.prototype, "isTrustedDomain", (_, __, ret) => (Settings.state.domain ? true : ret));
	Patcher.after(LinkPrompt, "confirm", (_, __, ret) => (Settings.state.domain ? null : ret));
});

Plugin.on(Events.STOP, () => {
	Patcher.unpatchAll();
});

Plugin.getSettingsPanel = () => () =>
	[
		{
			border: true,
			description: "Domain prompt",
			note: "Remove the untrusted domain prompt when opening links",
			settingKey: "domain"
		},
		{
			description: "Download prompt",
			note: "Remove the 'Potentially Dangerous Download' prompt when opening links",
			settingKey: "file"
		}
	].map(SettingSwtich);

module.exports = () => Plugin;
