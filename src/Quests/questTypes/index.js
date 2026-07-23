import solveActivity from "./activity";
import solvePlay from "./play";
import solveStream from "./stream";
import solveVideo from "./video";
import { supportedTasks } from "@/consts";

export default async function (quest) {
	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);

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
