import ErrorBoundary from "@Components/ErrorBoundary";
import HoverPopout from "@Components/HoverPopout";
import Logger from "@Utils/Logger";
import { copy, Disposable, nop } from "@Utils";
import { Filters, getMangled, getModule } from "@Webpack";
import { ContextMenu, Patcher } from "@Api";
import Plugin, { Events } from "@Utils/Plugin";
import React from "@React";
import { sendMessageDirectly, insertText } from "@Utils/Messages";

const GIFIntegration = getModule(a => a.GIFIntegration).GIFIntegration;

const GifsModule = getMangled(Filters.bySource("renderGIF()", "renderEmptyFavorites"), {
	Gif: Filters.byStrings("return(0,r.jsx)(G"),
	GifsList: Filters.byPrototypeKeys("renderGIF")
});

function GifMenu(url) {
	const Menu = ContextMenu.buildMenu([
		{
			label: "Send Directly",
			action: () => sendMessageDirectly(url)
		},
		{
			label: "Insert Url",
			action: () => insertText(url)
		},
		{
			label: "Copy Url",
			action: () => copy(url)
		}
	]);

	return props => <Menu {...props} />;
}

export default class GIFCommandPreviews extends Disposable {
	Init() {
		if (!GIFIntegration) return Logger.patchError("GIFIntegration");

		this.patches = [
			Patcher.after(GifsModule.GifsList.prototype, "render", ({ props }, args, ret) => {
				// console.log(props)
				if (!props.item?.url) return;
				ret.props.onContextMenu = e => {
					ContextMenu.open(e, GifMenu(props.item.url), {
						position: "bottom",
						align: "left"
					});
				};
			}),
			Patcher.after(GIFIntegration.prototype, "renderContent", (_, args, ret) => {
				return (
					<ErrorBoundary id="GIF-Stuff">
						<HoverPopout
							popout={() => (
								<img
									src={_.props.src}
									alt={_.props.url}
									width={_.props.width * 5}
									height={_.props.height * 5}
								/>
							)}
							align="center"
							position="top"
							delay={100}>
							{ret}
						</HoverPopout>
					</ErrorBoundary>
				);
			}),
			Patcher.after(GifsModule, "Gif", (_, __, ret) => {
				// biome-ignore lint/complexity/noForEach: <explanation>
				ret.props.data.forEach(a => {
					const [, segment] = a.src.match(/\.tenor\.com(.+?)\.mp4/) || [];
					if (!segment) return;
					a.format = 1;
					const url = `https://media.tenor.com${segment}.gif`;
					a.src = url.replace("AAAPo", "AAAAS");
				});
			})
		];
	}
}
