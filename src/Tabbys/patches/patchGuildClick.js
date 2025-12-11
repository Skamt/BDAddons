import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { reactRefMemoFilter, getModule } from "@Webpack";
import Store from "@/Store";
import { getNestedProp } from "@Utils";
import SelectedChannelStore from "@Stores/SelectedChannelStore";
import { getGuildChannelPath } from "@/utils";
import Plugin, { Events } from "@Utils/Plugin";
import Settings from "@Utils/Settings";

const GuildComponent = getModule(reactRefMemoFilter("type","onDragStart", "guildNode"), { searchExports: true });
Plugin.on(Events.START, () => {
	if (!GuildComponent) return Logger.patchError("GuildComponent");
	Patcher.after(GuildComponent, "type", (_, [{ guild }], ret) => {
		const targetProps = getNestedProp(ret, "props.children.1.props.children.props.children.props.children.props");
		if (!targetProps) return ret;
		const origClick = targetProps.onClick;
		const path = getGuildChannelPath(guild.id);
		targetProps.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey&& Settings.state.ctrlClickChannel) Store.newTab(path);
			else origClick?.(e);
		};
	});
});
