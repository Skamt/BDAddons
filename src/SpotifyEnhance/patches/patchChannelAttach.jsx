import { React, Patcher, ContextMenu } from "@Api";
import Logger from "@Utils/Logger";
import { Filters, getModuleAndKey } from "@Webpack";
import { Store } from "@/Store";
import Flex from "@Components/Flex";
import { ListenIcon, ImageIcon } from "@Components/Icon";
import Plugin, { Events } from "@Utils/Plugin";

const { Item: MenuItem } = ContextMenu;
const ChannelAttachMenu = getModuleAndKey(Filters.byStrings("Plus Button"));

function MenuLabel({ label, icon }) {
	return (
		<Flex
			direction={Flex.Direction.HORIZONTAL}
			align={Flex.Align.CENTER}
			style={{ gap: 8 }}>
			{icon}
			<div>{label}</div>
		</Flex>
	);
}

Plugin.on(Events.START, () => {
	const {module, key} = ChannelAttachMenu;
	if (!module || !key) return Logger.patchError("patchChannelAttach");
	const unpatch = Patcher.after(module, key, (_, args, ret) => {
		if (!Store.state.isActive) return;
		if (!Store.state.mediaId) return;
		if (!Array.isArray(ret?.props?.children)) return;

		ret.props.children.push(
			<MenuItem
				id="spotify-share-song-menuitem"
				label={
					<MenuLabel
						icon={<ListenIcon />}
						label="Share spotify song"
					/>
				}
				action={() => {
					const songUrl = Store.state.getSongUrl();
					Store.Utils.share(songUrl);
				}}
			/>,
			<MenuItem
				id="spotify-share-banner-menuitem"
				label={
					<MenuLabel
						icon={<ImageIcon />}
						label="Share spotify song banner"
					/>
				}
				action={() => {
					const {
						bannerLg: { url }
					} = Store.state.getSongBanners();
					Store.Utils.share(url);
				}}
			/>
		);
	});

	Plugin.once(Events.STOP, unpatch);
});
