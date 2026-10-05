import { after } from "@common/Patcher";
import { getBySource, Filters } from "@Webpack";
import Store from "@/Store";
import { getNestedProp } from "@Utils/Object";
import { getGuildChannelPath } from "@/utils";
import Plugin from "@common/Plugin";
import Settings from "@Settings";

const GuildComponent = getBySource("guildsnav", {
	declarationFilter: Filters.byComponentType(Filters.byStrings("aria-owns=folder-items-", "onDragOverChanged"))
});

Plugin.onStart(() => {
	after(GuildComponent, "type", ({ args: [{ guild }], ret }) => {
		const targetProps = getNestedProp(ret, "props.children.1.props.children.props.children.props.children.props.children.props.children.props");

		if (!targetProps) return ret;
		const origClick = targetProps.onClick;
		const path = getGuildChannelPath(guild.id);
		targetProps.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey && Settings.state.ctrlClickChannel) Store.newTab(path);
			else origClick?.(e);
		};
	});
});
