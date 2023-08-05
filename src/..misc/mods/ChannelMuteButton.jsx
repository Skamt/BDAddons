import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import ChannelComponent from "@Patch/ChannelComponent";
import ChannelSettings from "@Modules/ChannelSettings";

export default class ChannelMuteButton extends Disposable {
	Init() {
		const { module, key } = ChannelComponent;
		if(module && key)
			this.patches = [
				Patcher.after(module, key, (_, [{ muted, channel: { guild_id, id } }], ret) => {
					const children = ret.props?.children?.props?.children[1].props?.children.props.children[1].props.children;
					if (!children.some(a => a?.props?.id === "channelMuteButton"))
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