import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import { reactRefMemoFilter, waitForModule } from "@Webpack";
// import { ChannelComponent } from "@Discord/Modules";
import ChannelSettings from "@Modules/ChannelSettings";

export default class ChannelMuteButton extends Disposable {
	Init(signal) {
		// if (!ChannelComponent) return Logger.patchError("ChannelMuteButton");
		
 
		waitForModule(reactRefMemoFilter("render", "hasActiveThreads"), { signal, searchExports: true }).then(ChannelComponent => {
			this.patches.push(
				Patcher.before(
					ChannelComponent,
					"render",
					(
						_,
						[
							{
								children,
								muted,
								channel: { guild_id, id }
							}
						]
					) => {
						if (children?.find(a => a?.props?.id === "channelMuteButton")) return;
						children?.push?.(
							<b
								id="channelMuteButton"
								className="channelMuteButton"
								onClick={e => {
									e.stopPropagation();
									e.preventDefault();
									ChannelSettings.updateChannelOverrideSettings(guild_id, id, { muted: !muted });
								}}>
								{"M"}
							</b>
						);
					}
				)
			);
		});
	}
}
