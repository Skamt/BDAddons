import solveActivity from "./activity";
import solvePlay from "./play";
import solveStream from "./stream";
import solveVideo from "./video";
import {supportedTasks} from "@/consts";

export default function (quest) {
	const pid = Math.floor(Math.random() * 30000) + 1000;

	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);

	const applicationId = quest.config.application.id;
	const applicationName = quest.config.application.name;
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName].target;
	let secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

	console.log(quest);

	// return  new Promise(resolve => setTimeout(resolve, 5 * 1000))
	switch (taskName) {
		case "WATCH_VIDEO":
		case "WATCH_VIDEO_ON_MOBILE":
			return solveVideo(quest);

		case "PLAY_ON_DESKTOP":
			return solvePlay(quest);

		case "STREAM_ON_DESKTOP":
			return solveStream(quest);

		case "PLAY_ACTIVITY":
			return solveActivity(quest);
		default: {
			console.log(`Unsupported quest type ${taskName}`);
			return Promise.resolve();
		}
	}
}
