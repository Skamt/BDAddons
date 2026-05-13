import { Patcher, React } from "@Api";
import { copy, Disposable } from "@Utils";
import Toast from "@Utils/Toast";
import Logger from "@Utils/Logger";

import MessageHeader from "@Patch/MessageHeader";

export default class ShowUserInfo extends Disposable {
	Init() {
		const { module, key } = MessageHeader;
		if (!module || !key) return Logger.patchError("ShowUserInfo");
		
		this.patches = [
			Patcher.after(module, key, (_, [{ message }], ret) => {
				const username = `@${message.author.username}`;
				ret.props.children.push(
					<span
						onClick={() => {
							copy(username);
							Toast.success("Username Copied!");
						}}
						className="messageHeaderItem">
						{username}
					</span>,
					<span
						onClick={() => {
							copy(message.author.id);
							Toast.success("ID Copied!");
						}}
						className="messageHeaderItem">
						{message.author.id}
					</span>
				);
			})
		];
	}
}
