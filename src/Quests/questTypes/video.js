import { DiscordApi } from "@Discord/Modules";
import Toast from "@Utils/Toast";
import { supportedTasks } from "@/consts";
import { sleep } from "@Utils";

export default async function (quest) {
	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName].target;
	let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

	const maxFuture = 10;
	const speed = 7;
	const interval = 1;
	const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
	let completed = false;

	Toast.info(`Completing quest ${questName}.`);

	while (true) {
		const maxAllowed = Math.abs(Math.floor((enrolledAt - Date.now()) / 1000) + maxFuture);
		const diff = maxAllowed - secondsDone;
		const timestamp = secondsDone + speed;
		if (diff >= speed) {
			const res = await DiscordApi.api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: Math.min(secondsNeeded, timestamp + Math.random()) } });
			completed = res.body.completed_at != null;
			secondsDone = Math.min(secondsNeeded, timestamp);
		}

		if (timestamp >= secondsNeeded) break;

		await sleep(1);
	}
	if (!completed) {
		await DiscordApi.api.post({ url: `/quests/${quest.id}/video-progress`, body: { timestamp: secondsNeeded } });
	}

	Toast.success(`Quest ${questName} completed!`);
}
