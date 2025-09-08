import ErrorBoundary from "@Components/ErrorBoundary";
import HoverPopout from "@Components/HoverPopout";
import Logger from "@Utils/Logger";
import { Disposable, nop } from "@Utils";
import { Patcher, React } from "@Api";
import { Filters, getModuleAndKey, getModule } from "@Webpack";

const GIFIntegration = getModule(a => a.GIFIntegration).GIFIntegration;
const b = getModuleAndKey(Filters.byPrototypeKeys("renderGIF"), { searchExports: true });

export default class GIFCommandPreviews extends Disposable {
	Init() {
		if (GIFIntegration)
			this.patches = [
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
				!b?.module
					? nop
					: Patcher.after(b.module, "ZP", (_, __, ret) => {
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
		else Logger.patchError("GIFIntegration");
	}
}
