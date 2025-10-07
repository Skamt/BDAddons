import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import Store from "@/Store";
import { getNestedProp } from "@Utils";
import SelectedChannelStore from "@Stores/SelectedChannelStore";

// const DMChannelFilter = Filters.byStrings("navigate", "location", "href", "createHref");
// export const DMChannel = getModule(a => a.render && DMChannelFilter(a.render), { searchExports: true });

const B = s(325257).exports.Z;
import Plugin, { Events } from "@Utils/Plugin";

Plugin.on(Events.START, () => {
	if (!B) return Logger.patchError("GuildComponent");
	Patcher.after(B, "type", (_, [{ guild }], ret) => {
		const targetProps = getNestedProp(ret, "props.children.1.props.children.props.children.props.children.props");
		if (!targetProps) return ret;
		const selectedChannelId = SelectedChannelStore.getChannelId(guild.id);
		const origClick = targetProps.onClick;

		targetProps.onClick = e => {
			e.preventDefault();
			if (e.ctrlKey) Store.newTab(`/channels/${guild.id}/${selectedChannelId}`);
			else origClick?.(e);
		};
	});
});
