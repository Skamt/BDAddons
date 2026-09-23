import { Filters, getByKeys, lazy, getMangled, getModule } from "@Webpack";
import React from "@React";
import Plugin from "@common/Plugin";
import { after } from "@common/Patcher";
import Settings from "@Utils/Settings";
import SettingSwtich from "@Components/SettingSwtich";
import GuildStore from "@Stores/GuildStore";

const LinkPrompt = getModule(Filters.bySource(`="MaskedLinkStore",`), { declarationFilter: a => a?.prototype?.isTrustedDomain });

const FilePrompt = getMangled(Filters.bySource("github.com", "bitbucket.org", "gitlab.com"), { confirm: () => 1 });

const deleteGuild = getByKeys("deleteGuild", "sendTransferOwnershipPincode")?.deleteGuild;

function GetPropsAndDeleteGuild(id) {
	const GotGuild = GuildStore.getGuild(id);
	if (!GotGuild) return;

	deleteGuild(id, GotGuild.name);
}

Plugin.onStart(() => {
	after(LinkPrompt.prototype, "isTrustedDomain", ({ ret }) => (Settings.state.domain ? true : ret));
	after(FilePrompt, "confirm", ({ ret }) => (Settings.state.file ? null : ret));

	lazy(Filters.bySource("DELETE", "getSectionDefinition"), {
		decFilter: Filters.byStrings("isOwnerWithRequiredMfaLevel")
	}).then(GuildDelete => {
		after(...GuildDelete, ({ args: [, { guild }], ret }) => {
			if (!Settings.state.noDeleteSafety || ret.section !== "DELETE") return;

			ret.onClick = () => {
				if (!Settings.state.confirmModal) return GetPropsAndDeleteGuild(guild.id);

				BdApi.UI.showConfirmationModal(
					"Delete server?",
					<>
						Are you sure you want to delete <b>{guild.name}</b> ? <br /> <b>This action cannot be undone.</b>
					</>,
					{
						danger: true,
						confirmText: "Delete",
						cancelText: "Cancel",
						onConfirm: () => GetPropsAndDeleteGuild(guild.id)
					}
				);
			};
		});
	});
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
			border: true,
			description: "Download prompt",
			note: "Remove the 'Potentially Dangerous Download' prompt when opening links",
			settingKey: "file"
		},
		{
			border: true,
			description: "Server delete prompt",
			note: "Removes the enter server name prompt when deleting a server",
			settingKey: "noDeleteSafety"
		},
		{
			description: "Server delete confirm",
			note: "Show a simpler confirm prompt when deleting a server",
			settingKey: "confirmModal"
		}
	].map(SettingSwtich);

module.exports = () => Plugin;
