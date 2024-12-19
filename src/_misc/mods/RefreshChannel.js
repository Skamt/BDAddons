import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import { getModule, waitForModule, Filters } from "@Webpack";
import { promiseHandler, Disposable } from "@Utils";
import ChannelSettingsStore from "@Stores/ChannelSettingsStore";

const { createChannel } = getModule(a => a.createChannel);
const { batchChannelUpdate } = getModule(a => a.batchChannelUpdate);
const { deleteChannel } = getModule(Filters.byProps("deleteChannel", "saveChannel"));

function textToJSON(str) {
	try {
		return JSON.parse(str);
	} catch {}
}

function printError(...args) {
	console.log(...args);
}

function repositionChannel(guildId, channelId, position) {
	return batchChannelUpdate(guildId, [
		{
			id: channelId,
			position: position
		}
	]);
}

export default class RefreshChannel extends Disposable {
	async Init() {
		const Settings = await waitForModule(Filters.byPrototypeKeys(["getPredicateSections"]));
		if (Settings)
			this.patches = [
				Patcher.after(Settings.prototype, "getPredicateSections", (_, __, ret) => {
					ret.push({
						label: "Refresh Channel",
						section: "Refresh",
						onClick: async () => {
							// console.log(_, args, ret);
							const currentChannel = ChannelSettingsStore.getChannel();
							const { id, guild_id, type, name, permissionOverwrites, bitrate, userLimit, parent_id, position } = currentChannel;
							const newChannelObj = {
								guildId: guild_id,
								type: type,
								name: name,
								permissionOverwrites: Object.values(permissionOverwrites),
								bitrate: bitrate,
								userLimit: userLimit,
								parentId: parent_id
							};

							console.log(currentChannel);

							console.log(newChannelObj);

							createChannel(newChannelObj)
								.then(data => {
									const newlyCreatedChannel = textToJSON(data.text);
									if (!newlyCreatedChannel) throw new Error("Can't Parse response", data);
									return repositionChannel(guild_id, newlyCreatedChannel.id, position);
								})
								.then(data => {
									console.log(data);
									return deleteChannel(id);
								})
								.then(console.log)
								.catch(printError);

							// const [error, data] = await promiseHandler(createChannel(newChannelObj));

							// if (error) return printError(error);

							// if (!data.text) return printError(data);

							// const newlyCreatedChannel = textToJSON(data.text);

							// if (!newlyCreatedChannel) return printError("Can't Parse response", data);

							// const [positionError, positionRes] = await promiseHandler(repositionChannel(guild_id, newlyCreatedChannel.id, position));

							// if (positionError) return printError(positionError);

							// console.log(positionRes);

							// const [deleteChannelError, deleteChannelRes] = await promiseHandler(deleteChannel(id));

							// if (deleteChannelError) return printError(deleteChannelError);

							// console.log(deleteChannelRes);
						}
					});
				})
			];
		else Logger.patchError("RefreshChannel");
	}
}
