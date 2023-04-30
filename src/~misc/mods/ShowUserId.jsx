import { copy, Disposable } from "@Utils";
import { Patcher, React } from "@Api";
import Logger from "@Utils/Logger";

import MessageHeader from "@Patch/MessageHeader";

export default class ShowUserId extends Disposable {
	Init() {
		const { module, key } = MessageHeader;
		if (module && key)
			this.patches = [
				Patcher.after(module, key, (_, [{ message }], ret) => {
					ret.props.children.push(
						<span
							onClick={() => copy(message.author.id)}
							className="id">
							{message.author.id}
						</span>
					);
				})
			];
		else Logger.patch("ShowUserId");
	}
}
