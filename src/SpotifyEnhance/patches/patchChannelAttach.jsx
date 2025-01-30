import { React, Patcher, ContextMenu } from "@Api";
import Logger from "@Utils/Logger";
import { Filters, getModule } from "@Webpack";
import { Store } from "../Store";
import Flex from "@Components/Flex";
import ImageIcon from "@Components/icons/ImageIcon";
import ListenIcon from "@Components/icons/ListenIcon";

const { Item: MenuItem } = ContextMenu;

const ChannelAttachMenu = getModule(Filters.byStrings("Plus Button"), { defaultExport: false });

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

export default () => {
	if (!ChannelAttachMenu) return Logger.patchError("patchChannelAttach");
	Patcher.after(ChannelAttachMenu, "Z", (_, args, ret) => {
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
};
