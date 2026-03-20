import QuestStore from "@Stores/QuestStore";
import completeQuest from "@/questTypes";
import { isQuestExpired, isQuestSupported, isQuestCompleted, isQuestAccepted } from "@/utils";
import { sleep } from "@Utils";
import { supportedTasks } from "@/consts";
import Toast from "@Utils/Toast";
import Logger from "@Utils/Logger";

export default async function () {
	const quests = [...QuestStore.quests.values()].filter(q => isQuestAccepted(q) && !isQuestExpired(q) && !isQuestCompleted(q) && isQuestSupported(q));
	const qcount = quests.length;
	if(quests.length === 0 )
		console.log("You don't have any uncompleted quests!");

	Toast.info(`Completing ${qcount} quests.`);

	while (quests.length) {
		const quest = quests.pop();
		Toast.info(`quest ${qcount-quests.length}/${qcount}`);
		try {
			await completeQuest(quest);
		} catch (e) {
			Logger.error(e);
		}finally{
			await sleep(5)
		}
	}
}
