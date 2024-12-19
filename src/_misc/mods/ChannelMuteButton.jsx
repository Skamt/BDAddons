import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import ChannelComponent from "@Patch/ChannelComponent";
import ChannelSettings from "@Modules/ChannelSettings";

export default class ChannelMuteButton extends Disposable {
	Init() {
		const { module, key } = ChannelComponent;
		if (!module || !key) return Logger.patchError("ChannelMuteButton");
		this.patches = [
			Patcher.before(module,key,(_,[{children,muted,channel: { guild_id, id }}]) => {
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
		];
	}
}
