import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import ChannelComponent from "@Modules/ChannelComponent";
import ChannelSettings from "@Modules/ChannelSettings";

export default class ChannelMuteButton extends Disposable {
	Init() {
		if (ChannelComponent)
			this.patches = [
				Patcher.before(ChannelComponent, "default", (_, [{children, muted, channel: { guild_id, id } }]) => {
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
				})
			];
		else
			Logger.patch("ChannelMuteButton");
	}
}