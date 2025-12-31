import ChannelStore from "@Stores/ChannelStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import { DiscordApi } from "@Discord/Modules";
import Toast from "@Utils/Toast";
import { supportedTasks } from "@/consts";

export default async function (quest) {
	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName].target;

	const channelId = ChannelStore.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore.getAllGuilds()).find(x => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
	const streamKey = `call:${channelId}:1`;

	Toast.info(`Completing quest ${questName}-${quest.config.messages.questName}`);
	
	while (true) {
		const res = await DiscordApi.api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
		const progress = res.body.progress.PLAY_ACTIVITY.value;
		Toast.info(`Quest progress: ${progress}/${secondsNeeded}`);

		await new Promise(resolve => setTimeout(resolve, 20 * 1000));

		if (progress >= secondsNeeded) {
			await DiscordApi.api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
			break;
		}
	}

	Toast.success(`Quest ${questName} completed!`);
}
