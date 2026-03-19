import QuestStore from "@Stores/QuestStore";
import Plugin, { Events } from "@Utils/Plugin";
import { isQuestExpired, isQuestClaimed, isOrbsQuest, solve, isQuestCompleted, isQuestAccepted } from "@/utils";
import { transitionTo } from "@Discord/Modules";

function patch() {
	QuestStore.quests.forEach((quest, id) => {
		if (isQuestExpired(quest) || (isQuestCompleted(quest) && isQuestClaimed(quest))) QuestStore.quests.delete(id);
	});
	QuestStore.emitChange();
}

const seenQuests = new Set();

function notifyOfNewQuests() {
	const orbsQuests = [...QuestStore.quests.values()].filter(q => isOrbsQuest(q) && !isQuestExpired(q) && !isQuestCompleted(q));
	const hasNew = orbsQuests.some(a => !seenQuests.has(a.id));
	orbsQuests.forEach(a => seenQuests.add(a.id));

	if (!orbsQuests.length || !hasNew) return;

	const { close } = BdApi.UI.showNotification({
		id: `quests-${Math.random().toString(36).slice(2)}`,
		title: "Available Quests",
		content: `${orbsQuests.length} Orb quests available`,
		type: "info",
		duration: Number.POSITIVE_INFINITY,
		actions: [
			{
				label: "Quests",
				dontClose: false,
				onClick() {
					transitionTo("/quest-home");
				}
			},
			{
				label: "Solve",
				onClick() {
					solve();
				}
			},
			{
				label: "Close",
				color: "red",
				dontClose: false
			}
		]
	});
}

function onQuestStoreChange() {
	patch();
	notifyOfNewQuests();
}

Plugin.on(Events.START, () => {
	patch();
	notifyOfNewQuests();
	QuestStore.addChangeListener(onQuestStoreChange);
});

Plugin.on(Events.STOP, () => {
	QuestStore.removeChangeListener(onQuestStoreChange);
});
