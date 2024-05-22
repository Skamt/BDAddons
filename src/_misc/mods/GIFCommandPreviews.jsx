import ErrorBoundary from "@Components/ErrorBoundary";
import Popout from "@Components/Popout";
import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import { Filters, getModule } from "@Webpack";

const GIFIntegration = getModule(a => a.GIFIntegration).GIFIntegration;
const b = getModule(Filters.byProps("useElementPools", "GIFPickerSearchItem"));

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
										src={_.props.src?.replace("AAAAS", "AAAPo")}
										width={_.props.width * 3}
										height={_.props.height * 3}
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
				Patcher.after(b, "default", (_, __, ret) => {
					ret.props.data.forEach(a => {
						a.format = 1;
						a.src = `https://media.tenor.com${a.src?.split("media.tenor.com")[1]?.replace("mp4", "gif").replace("AAAPo", "AAAAS")}`;
					});
				})
			];
		else Logger.patch("GIFIntegration");
	}
}
