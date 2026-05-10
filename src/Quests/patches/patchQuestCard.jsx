import { getDeclarationAndKey, waitForModule, Filters } from "@Webpack";
import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";
import { getObjectKey, preventDefault } from "@Utils";
import Button from "@Components/Button";
import React from "@React";
import Toast from "@Utils/Toast";
import completeQuest from "@/questTypes";
import { isQuestCompleted, isQuestAccepted } from "@/utils";

function CompleteQuest({ quest }) {
	const [completing, setCompleting] = React.useState(false);
	const questHandler = async () => {
		try {
			setCompleting(true);
			await completeQuest(quest);
			setCompleting(false);
		} catch (e) {
			setCompleting(false);
			Toast.error("error completing quest");
			Logger.error(e);
		}
	};

	return (
		<Button
			disabled={completing}
			onClick={preventDefault(questHandler)}
			color={Button.Colors.GREEN}>
			Complete Quest
		</Button>
	);
}

Plugin.on(Events.START, async () => {
	const QuestCard = await waitForModule(Filters.bySource("isClaimingReward", "sourceQuestContent", "questEnrollmentBlockedUntil", "enabledQuestStates"), { raw: true });

	if (!QuestCard) return Logger.patchError("QuestCard");

	const declarationFilter = Filters.byStrings("isClaimingReward", "sourceQuestContent", "questEnrollmentBlockedUntil", "enabledQuestStates");

	const key = getObjectKey(QuestCard.declarations, declarationFilter);

	if (!key) return Logger.patchError("QuestCard");

	Patcher.after(QuestCard.declarations, key, (_, [props], ret) => {
		if (!isQuestAccepted(props.quest) || isQuestCompleted(props.quest)) return;
		ret.props.children.push(<CompleteQuest quest={props.quest} />);
	});
});
