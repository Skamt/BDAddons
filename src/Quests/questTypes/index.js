import solveActivity from "./activity";
import solvePlay from "./play";
import solveStream from "./stream";
import solveVideo from "./video";
import { supportedTasks } from "@/consts";

export default async function (quest) {
	// const pid = Math.floor(Math.random() * 30000) + 1000;

	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);

	// const applicationId = quest.config.application.id;
	// const applicationName = quest.config.application.name;
	// const questName = quest.config.messages.questName;
	// const secondsNeeded = taskConfig.tasks[taskName].target;
	// const secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

	switch (taskName) {
		case "WATCH_VIDEO":
		case "WATCH_VIDEO_ON_MOBILE":
			return await solveVideo(quest);

		case "PLAY_ON_DESKTOP":
			return await solvePlay(quest);

		case "STREAM_ON_DESKTOP":
			return await solveStream(quest);

		case "PLAY_ACTIVITY":
			return await solveActivity(quest);
		default: {
			throw `Unsupported quest type ${taskName}`;
		}
	}
}
