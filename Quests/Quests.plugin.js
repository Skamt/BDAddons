/**
 * @name Quests
 * @description Empty description
 * @version 1.0.0
 * @author Skamt
 * @website https://github.com/Skamt/BDAddons/tree/main/Quests
 * @source https://raw.githubusercontent.com/Skamt/BDAddons/main/Quests/Quests.plugin.js
 */

// config:@Config
var Config_default = {
	"info": {
		"name": "Quests",
		"version": "1.0.0",
		"description": "Empty description",
		"source": "https://raw.githubusercontent.com/Skamt/BDAddons/main/Quests/Quests.plugin.js",
		"github": "https://github.com/Skamt/BDAddons/tree/main/Quests",
		"authors": [{
			"name": "Skamt"
		}]
	}
};

// common/Api.js
var Api = new BdApi(Config_default.info.name);
var UI = /* @__PURE__ */ (() => Api.UI)();
var React = /* @__PURE__ */ (() => Api.React)();
var Patcher = /* @__PURE__ */ (() => Api.Patcher)();
var Logger = /* @__PURE__ */ (() => Api.Logger)();
var Webpack = /* @__PURE__ */ (() => Api.Webpack)();

// common/React.jsx
var React_default = /* @__PURE__ */ (() => React)();

// common/Webpack.js
var getModule = /* @__PURE__ */ (() => Webpack.getModule)();
var Filters = /* @__PURE__ */ (() => Webpack.Filters)();
var getMangled = /* @__PURE__ */ (() => Webpack.getMangled)();
var getStore = /* @__PURE__ */ (() => Webpack.getStore)();

// common/Utils/Logger.js
Logger.patchError = (patchId) => {
	console.error(`%c[${Config_default.info.name}] %cCould not find module for %c[${patchId}]`, "color: #3a71c1;font-weight: bold;", "", "color: red;font-weight: bold;");
};
var Logger_default = Logger;

// common/Utils/EventEmitter.js
var EventEmitter_default = class {
	constructor() {
		this.listeners = {};
	}
	isInValid(event, handler) {
		return typeof event !== "string" || typeof handler !== "function";
	}
	once(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		const wrapper = () => {
			handler();
			this.off(event, wrapper);
		};
		this.listeners[event].add(wrapper);
	}
	on(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) this.listeners[event] = /* @__PURE__ */ new Set();
		this.listeners[event].add(handler);
		return () => this.off(event, handler);
	}
	off(event, handler) {
		if (this.isInValid(event, handler)) return;
		if (!this.listeners[event]) return;
		this.listeners[event].delete(handler);
		if (this.listeners[event].size !== 0) return;
		delete this.listeners[event];
	}
	emit(event, ...payload) {
		if (!this.listeners[event]) return;
		for (const listener of this.listeners[event]) {
			try {
				listener.apply(null, payload);
			} catch (err) {
				Logger_default.error(`Could not run listener for ${event}`, err);
			}
		}
	}
};

// common/Utils/Plugin.js
var Events = {
	START: "START",
	STOP: "STOP"
};
var Plugin_default = new class extends EventEmitter_default {
	start() {
		this.emit(Events.START);
	}
	stop() {
		this.emit(Events.STOP);
	}
}();

// common/Utils/index.js
var nop = () => {};

function sleep(delay) {
	return new Promise((done) => setTimeout(() => done(), delay * 1e3));
}

function preventDefault(handler) {
	if (!handler) return nop;
	return (e) => {
		e.preventDefault();
		e.stopPropagation();
		handler.apply(null, [e]);
	};
}

// MODULES-AUTO-LOADER:@Modules/Button
var Button_default = getModule((a) => a && a.Link && a.Colors, { searchExports: true });

// common/Components/Button/index.jsx
function ButtonComponentFallback(props) {
	return /* @__PURE__ */ React.createElement("button", { ...props });
}
var ManaButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"button"`), { searchExports: true }) || ButtonComponentFallback;
var ManaTextButton = /* @__PURE__ */ getModule(Filters.byStrings(`"data-mana-component":"text-button"`), { searchExports: true }) || ButtonComponentFallback;
var Button_default2 = Button_default || ButtonComponentFallback;

// common/Utils/Toast.js
function showToast(content, type) {
	UI.showToast(`[${Config_default.info.name}] ${content}`, { timeout: 5e3, type });
}
var Toast_default = {
	success(content) {
		showToast(content, "success");
	},
	info(content) {
		showToast(content, "info");
	},
	warning(content) {
		showToast(content, "warning");
	},
	error(content) {
		showToast(content, "error");
	}
};

// MODULES-AUTO-LOADER:@Stores/ChannelStore
var ChannelStore_default = getStore("ChannelStore");

// MODULES-AUTO-LOADER:@Stores/GuildChannelStore
var GuildChannelStore_default = getStore("GuildChannelStore");

// common/DiscordModules/Modules.js
var DiscordApi = /* @__PURE__ */ (() => getMangled("HTTPUtils", { api: Filters.byKeys("get", "del", "patch", "put") }))();
var ChannelComponent = (() => getModule(Filters.byComponentType(Filters.byStrings("hasActiveThreads")), { searchExports: true }))();
var transitionTo = /* @__PURE__ */ (() => getModule(Filters.byStrings("transitionTo - Transitioning to"), { searchExports: true }))();

// src/Quests/consts.js
var supportedTasks = ["WATCH_VIDEO", "PLAY_ON_DESKTOP", "STREAM_ON_DESKTOP", "PLAY_ACTIVITY", "WATCH_VIDEO_ON_MOBILE"];

// src/Quests/questTypes/activity.js
async function activity_default(quest) {
	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName2 = supportedTasks.find((x) => taskConfig.tasks[x] != null);
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName2].target;
	const channelId = ChannelStore_default.getSortedPrivateChannels()[0]?.id ?? Object.values(GuildChannelStore_default.getAllGuilds()).find((x) => x != null && x.VOCAL.length > 0).VOCAL[0].channel.id;
	const streamKey = `call:${channelId}:1`;
	Toast_default.info(`Completing quest ${questName}-${quest.config.messages.questName}`);
	while (true) {
		const res = await DiscordApi.api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: false } });
		const progress = res.body.progress.PLAY_ACTIVITY.value;
		Toast_default.info(`Quest progress: ${progress}/${secondsNeeded}`);
		await sleep(20);
		if (progress >= secondsNeeded) {
			await DiscordApi.api.post({ url: `/quests/${quest.id}/heartbeat`, body: { stream_key: streamKey, terminal: true } });
			break;
		}
	}
	Toast_default.success(`Quest ${questName} completed!`);
}

// MODULES-AUTO-LOADER:@Stores/GameStore
var GameStore_default = getStore("GameStore");

// MODULES-AUTO-LOADER:@Stores/RunningGameStore
var RunningGameStore_default = getStore("RunningGameStore");

// MODULES-AUTO-LOADER:@Modules/Dispatcher
var Dispatcher_default = getModule(Filters.byKeys("dispatch", "_dispatch"), { searchExports: true });

// src/Quests/questTypes/play.js
function play_default(quest) {
	const { promise, reject, resolve } = Promise.withResolvers();
	const pid = Math.floor(Math.random() * 3e4) + 1e3;
	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName2 = supportedTasks.find((x) => taskConfig.tasks[x] != null);
	const applicationId = quest.config.application.id;
	const applicationName = quest.config.application.name;
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName2].target;
	const secondsDone = quest.userStatus?.progress?.[taskName2]?.value ?? 0;
	const game = GameStore_default.games.find((a) => a.id === applicationId);
	if (!game) reject(`can't find ${applicationName} in [GameStore]`);
	const exeName = game?.executables?.find((x) => x.os === "win32")?.name?.replace(">", "") || "";
	const fakeGame = {
		cmdLine: `C:\\Program Files\\${game.name}\\${exeName}`,
		exeName,
		exePath: `c:/program files/${game.name.toLowerCase()}/${exeName}`,
		hidden: false,
		isLauncher: false,
		id: applicationId,
		name: game.name,
		pid,
		pidPath: [pid],
		processName: game.name,
		start: Date.now()
	};
	const realGames = RunningGameStore_default.getRunningGames();
	const fakeGames = [fakeGame];
	const realGetRunningGames = RunningGameStore_default.getRunningGames;
	const realGetGameForPID = RunningGameStore_default.getGameForPID;
	RunningGameStore_default.getRunningGames = () => fakeGames;
	RunningGameStore_default.getGameForPID = (pid2) => fakeGames.find((x) => x.pid === pid2);
	Dispatcher_default.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: realGames, added: [fakeGame], games: fakeGames });
	const fn = (data) => {
		const progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.PLAY_ON_DESKTOP.value);
		Toast_default.info(`Completing for ${applicationName} progress: ${Math.round(progress / secondsNeeded * 100)}%`);
		if (progress >= secondsNeeded) {
			RunningGameStore_default.getRunningGames = realGetRunningGames;
			RunningGameStore_default.getGameForPID = realGetGameForPID;
			Dispatcher_default.dispatch({ type: "RUNNING_GAMES_CHANGE", removed: [fakeGame], added: [], games: [] });
			Dispatcher_default.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
			Toast_default.success(`Quest ${questName} completed!`);
			resolve();
		}
	};
	Dispatcher_default.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);
	Toast_default.info(`Completing quest for game ${applicationName}. Wait for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
	return promise;
}

// src/Quests/questTypes/stream.js
function stream_default(quest) {}

// src/Quests/questTypes/video.js
async function video_default(quest) {
	const taskConfig = quest.config.taskConfig ?? quest.config.taskConfigV2;
	const taskName2 = supportedTasks.find((x) => taskConfig.tasks[x] != null);
	const questName = quest.config.messages.questName;
	const secondsNeeded = taskConfig.tasks[taskName2].target;
	let secondsDone = quest.userStatus?.progress?.[taskName2]?.value ?? 0;
	const maxFuture = 10;
	const speed = 7;
	const interval = 1;
	const enrolledAt = new Date(quest.userStatus.enrolledAt).getTime();
	let completed = false;
	Toast_default.info(`Completing quest ${questName}.`);
	while (true) {
		const maxAllowed = Math.abs(Math.floor((enrolledAt - Date.now()) / 1e3) + maxFuture);
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
	Toast_default.success(`Quest ${questName} completed!`);
}

// src/Quests/questTypes/index.js
async function questTypes_default(quest) {
	switch (taskName) {
		case "WATCH_VIDEO":
		case "WATCH_VIDEO_ON_MOBILE":
			return await video_default(quest);
		case "PLAY_ON_DESKTOP":
			return await play_default(quest);
		case "STREAM_ON_DESKTOP":
			return await stream_default(quest);
		case "PLAY_ACTIVITY":
			return await activity_default(quest);
		default: {
			throw `Unsupported quest type ${taskName}`;
		}
	}
}

// MODULES-AUTO-LOADER:@Stores/ApplicationStreamingStore
var ApplicationStreamingStore_default = getStore("ApplicationStreamingStore");

// MODULES-AUTO-LOADER:@Stores/QuestStore
var QuestStore_default = getStore("QuestStore");

// src/Quests/utils.js
function isQuestExpired(quest) {
	return new Date(quest.config.expiresAt) < Date.now();
}

function isQuestCompleted(quest) {
	return quest.userStatus?.completedAt;
}

function isQuestClaimed(quest) {
	return quest.userStatus?.claimedAt;
}

function isQuestAccepted(quest) {
	return quest.userStatus?.enrolledAt;
}

function isOrbsQuest(quest) {
	return quest.config.rewardsConfig.rewards.some((a) => a.type === 4);
}

function isQuestSupported(quest) {
	const config = quest.config.taskConfig ?? quest.config.taskConfigV2;
	return supportedTasks.find((task) => Object.keys(config.tasks).includes(task));
}

// src/Quests/patches/patchQuestCard.jsx
var QuestCard = getMangled(Filters.bySource("isClaimingReward", "sourceQuestContent"), { default: (a) => true });

function CompleteQuest({ quest }) {
	const [completing, setCompleting] = React_default.useState(false);
	const questHandler = async () => {
		try {
			setCompleting(true);
			await questTypes_default(quest);
			setCompleting(false);
		} catch (e) {
			setCompleting(false);
			Toast_default.error("error completing quest");
			Logger_default.error(e);
		}
	};
	return /* @__PURE__ */ React_default.createElement(
		Button_default2, {
			disabled: completing,
			onClick: preventDefault(questHandler),
			color: Button_default2.Colors.GREEN
		},
		"Complete Quest"
	);
}
Plugin_default.on(Events.START, () => {
	Patcher.after(QuestCard, "default", (_, [props], ret) => {
		if (!isQuestAccepted(props.quest) || isQuestCompleted(props.quest)) return;
		ret.props.children.push( /* @__PURE__ */ React_default.createElement(CompleteQuest, { quest: props.quest }));
	});
});

// src/Quests/questTypes/all.js
async function all_default() {
	const quests = [...QuestStore_default.quests.values()].filter((q) => isQuestAccepted(q) && !isQuestExpired(q) && !isQuestCompleted(q) && isQuestSupported(q));
	const qcount = quests.length;
	if (quests.length === 0)
		console.log("You don't have any uncompleted quests!");
	Toast_default.info(`Completing ${qcount} quests.`);
	while (quests.length) {
		const quest = quests.pop();
		Toast_default.info(`quest ${qcount - quests.length}/${qcount}`);
		try {
			await questTypes_default(quest);
		} catch (e) {
			Logger_default.error(e);
		} finally {
			await sleep(5);
		}
	}
}

// src/Quests/questsManager.js
function patch() {
	QuestStore_default.quests.forEach((quest, id) => {
		if (isQuestExpired(quest) || isQuestCompleted(quest) && isQuestClaimed(quest)) QuestStore_default.quests.delete(id);
	});
	QuestStore_default.emitChange();
}
var seenQuests = /* @__PURE__ */ new Set();

function notifyOfNewQuests() {
	const orbsQuests = [...QuestStore_default.quests.values()].filter((q) => isOrbsQuest(q) && !isQuestExpired(q) && !isQuestCompleted(q));
	const hasNew = orbsQuests.some((a) => !seenQuests.has(a.id));
	orbsQuests.forEach((a) => seenQuests.add(a.id));
	if (!orbsQuests.length || !hasNew) return;
	BdApi.UI.showNotification({
		id: `quests-${Math.random().toString(36).slice(2)}`,
		title: "Available Quests",
		content: `${orbsQuests.length} Orb quests available`,
		type: "info",
		duration: Number.POSITIVE_INFINITY,
		actions: [{
				label: "Quests",
				onClick() {
					transitionTo("/quest-home");
				}
			},
			{
				label: "Solve",
				dontClose: true,
				onClick() {
					all_default();
				}
			},
			{
				label: "Close",
				color: "red"
			}
		]
	});
}

function onQuestStoreChange() {
	patch();
	notifyOfNewQuests();
}
Plugin_default.on(Events.START, () => {
	patch();
	notifyOfNewQuests();
	QuestStore_default.addChangeListener(onQuestStoreChange);
});
Plugin_default.on(Events.STOP, () => {
	QuestStore_default.removeChangeListener(onQuestStoreChange);
});

// src/Quests/index.js
Plugin_default.on(Events.STOP, () => {
	Patcher.unpatchAll();
});
module.exports = () => Plugin_default;
