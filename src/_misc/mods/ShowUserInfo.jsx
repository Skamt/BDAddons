import { Patcher } from "@Api";
import { copy, Disposable } from "@Utils";
import Toast from "@Utils/Toast";
import Logger from "@Utils/Logger";
import React from "@React";
import { MessageHeader } from "@Discord/Modules";
import Plugin from "@Utils/Plugin";
import { promiseHandler } from "@Utils";
// const MessageHeaderFilter = Filters.byStrings("userOverride", "withMentionPrefix");

export default class ShowUserInfo {
	async Init() {
		const [err, {module, key}] = await promiseHandler(MessageHeader);
		if(err) return Logger.patchError("ShowUserInfo");
		if (Plugin.stopped) return;
		Patcher.after(module, key, (_, [{ message }], ret) => {
			const username = `@${message.author.username}`;
			ret.props.children.push(
				<span
					onClick={() => {
						copy(username);
						Toast.success("Username Copied!");
					}}
					className="messageHeaderItem"
				>
					{username}
				</span>,
				<span
					onClick={() => {
						copy(message.author.id);
						Toast.success("ID Copied!");
					}}
					className="messageHeaderItem"
				>
					{message.author.id}
				</span>,
			);
		});
	}
}
