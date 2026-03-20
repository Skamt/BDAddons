import ApplicationStreamingStore from "@Stores/ApplicationStreamingStore";
import RunningGameStore from "@Stores/RunningGameStore";
import QuestStore from "@Stores/QuestStore";
import GameStore from "@Stores/GameStore";
import ChannelStore from "@Stores/ChannelStore";
import GuildChannelStore from "@Stores/GuildChannelStore";
import FluxDispatcher from "@Modules/Dispatcher";
import { DiscordApi as api } from "@Discord/Modules";
import {supportedTasks} from "@/consts";

export function isQuestExpired(quest) {
	return new Date(quest.config.expiresAt) < Date.now();
}

export function isQuestCompleted(quest) {
	return quest.userStatus?.completedAt;
}

export function isQuestClaimed(quest) {
	return quest.userStatus?.claimedAt;
}

export function isQuestAccepted(quest) {
	return quest.userStatus?.enrolledAt;
}

export function isOrbsQuest(quest) {
	return quest.config.rewardsConfig.rewards.some(a => a.type === 4);
}

export function isQuestSupported(quest) {
	const config = quest.config.taskConfig ?? quest.config.taskConfigV2;
	return supportedTasks.find(task => Object.keys(config.tasks).includes(task))
}
