// import { Patcher } from "@Api";
// import Logger from "@Utils/Logger";
// import { Filters, getModule } from "@Webpack";
// import QuestStore from "@Stores/QuestStore";
// import Plugin from "@common/Plugin";
// import { isQuestExpired, isQuestCompleted, isQuestAccepted } from "@/utils";

// Plugin.onStart(() => {
	// if (!QuestStore) return Logger.patchError("QuestStore");

	// const originalQuests = new Map(QuestStore.quests);
	// QuestStore.quests.clear();

	// originalQuests.forEach((quest, id) => {
	// 	if (isQuestExpired(quest) || isQuestCompleted(quest)) return;
	// 	QuestStore.quests.set(id, quest);
	// });
	// QuestStore.emitChange();

	// Plugin.onStop(() => {
	// 	QuestStore.quests.clear();
	// 	originalQuests.forEach((value, key) => QuestStore.quests.set(key, value));
	// 	QuestStore.emitChange();
	// });
// });
