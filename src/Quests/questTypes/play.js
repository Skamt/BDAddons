import GameStore from "@Stores/GameStore";
import RunningGameStore from "@Stores/RunningGameStore";
import { DiscordApi } from "@Discord/Modules";
import Toast from "@Utils/Toast";
import { supportedTasks } from "@/consts";
import Dispatcher from "@Modules/Dispatcher";

export default function (quest) {
	const { promise, reject, resolve } = Promise.withResolvers();
	const pid = Math.floor(Math.random() * 30000) + 1000;

	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName = supportedTasks.find(x => taskConfig.tasks[x] != null);

	const applicationId = quest.config.application.id;
	const applicationName = quest.config.application.name;
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName].target;
	const secondsDone = quest.userStatus?.progress?.[taskName]?.value ?? 0;

	
	const game = GameStore.games.find(a => a.id === applicationId);

	if (!game) reject(`can't find ${applicationName} in [GameStore]`);

	const exeName = game.executables.find(x => x.os === "win32").name.replace(">", "");

	const fakeGame = {
		cmdLine: `C:\\Program Files\\${game.name}\\${exeName}`,
		exeName,
		exePath: `c:/program files/${game.name.toLowerCase()}/${exeName}`,
		hidden: false,
		isLauncher: false,
		id: applicationId,
		name: game.name,
		pid: pid,
		pidPath: [pid],
		processName: game.name,
		start: Date.now()
	};

	const realGames = RunningGameStore.getRunningGames();
	const fakeGames = [fakeGame];
	const realGetRunningGames = RunningGameStore.getRunningGames;
	const realGetGameForPID = RunningGameStore.getGameForPID;
	RunningGameStore.getRunningGames = () => fakeGames;
	RunningGameStore.getGameForPID = pid => fakeGames.find(x => x.pid === pid);
	Dispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });

	const fn = data => {
		const progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
		Toast.info(`Completing for ${applicationName} progress: ${Math.round((progress/secondsNeeded) * 100)}%`);

		if (progress >= secondsNeeded) {
			RunningGameStore.getRunningGames = realGetRunningGames;
			RunningGameStore.getGameForPID = realGetGameForPID;
			Dispatcher.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
			Dispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
			Toast.success(`Quest ${questName} completed!`);
			resolve();
		}
	};
	Dispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

	Toast.info(`Completing quest for game ${applicationName}. Wait for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);

	return promise;
}
