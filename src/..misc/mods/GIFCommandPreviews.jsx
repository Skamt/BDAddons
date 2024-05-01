import ErrorBoundary from "@Components/ErrorBoundary";
import Popout from "@Components/Popout";
import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import { getModule } from "@Webpack";

const GIFIntegration = getModule(a => a.GIFIntegration).GIFIntegration;

export default class GIFCommandPreviews extends Disposable {
	Init() {
		if (GIFIntegration)
			this.patches = [
				Patcher.after(GIFIntegration.prototype, "renderContent", (_, args, ret) => {
					return (
						<Popout
							renderPopout={t => <img src={_.props.src} width={_.props.width * 3} height={_.props.height * 3}/>}
							align="center"
							position="top"
							animation="1">
							{ret}
						</Popout>
					);
				})
			];
		else Logger.patch("GIFIntegration");
	}
}
