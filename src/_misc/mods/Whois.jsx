import Logger from "@Utils/Logger";
import { Disposable } from "@Utils";
import { Patcher, React } from "@Api";

import FetchUser from "@Modules/FetchUser";
import MentionComponent from "@Patch/MentionComponent";

export default class Whois extends Disposable {
	Init() {
		const { module, key } = MentionComponent;
		if (module && key)
			this.patches = [
				Patcher.after(module, key, (context, args, ret) => {
					const { children, role } = ret.props;
					if (role === "link") return;
					let userId = undefined;

					try {userId = children[1][0].match(/\d+/)[0];} 
					catch {return;}

					if (!userId) return;

					ret.props.children = (
						<span style={{zIndex:"999999"}} className="mention wrapper-1ZcZW- interactive loadUnknownUser"
							onClick={() => {
								FetchUser(userId)
									.then(a => {
										console.log(`${userId}-${a.username} loaded`);
									})
									.catch(e => {
										Logger.error(e);
									});
							}}>
							{children[1]}
						</span>
					);
				})
			];
		else Logger.patch("ChannelMuteButton");
	}
}
