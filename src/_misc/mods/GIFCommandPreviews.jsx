import ErrorBoundary from "@Components/ErrorBoundary";
import Popout from "@Components/Popout";
import Logger from "@Utils/Logger";
import { Disposable, nop } from "@Utils";
import { Patcher, React } from "@Api";
import { Filters, getModuleAndKey, getModule } from "@Webpack";

const GIFIntegration = getModule(a => a.GIFIntegration).GIFIntegration;
const b = getModuleAndKey(Filters.byPrototypeKeys("renderGIF"), {searchExports:true});

export default class GIFCommandPreviews extends Disposable {
	Init() {
		if (GIFIntegration)
			this.patches = [
				Patcher.after(GIFIntegration.prototype, "renderContent", (_, args, ret) => {
					return (
						<ErrorBoundary id="GIF-Stuff">
							<Popout
								renderPopout={() => (
									<img
										src={_.props.src}
										width={_.props.width * 5}
										height={_.props.height * 5}
									/>
								)}
								align="center"
								position="top"
								animation="1">
								{ret}
							</Popout>
						</ErrorBoundary>
					);
				}),
				!b?.module ? nop : Patcher.after(b.module, "ZP", (_, __, ret) => {
					console.log(ret.props.data);
					ret.props.data.forEach(a => {
						const [,segment] = a.src.match(/\.tenor\.com(.+?)\.mp4/) || [];
						if(!segment) return;
						a.format = 1;
						const url = `https://media.tenor.com${segment}.gif`;
						a.src = url.replace("AAAPo", "AAAAS");
					});
				})
			];
		else Logger.patch("GIFIntegration");
	}
}
