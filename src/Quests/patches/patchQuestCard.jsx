import { getDeclarationAndKey, Filters } from "@Webpack";
import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";
import { preventDefault } from "@Utils";
import Button from "@Components/Button";
import React from "@React";
import Toast from "@Utils/Toast";
import completeQuest from "@/questTypes";
import { isQuestCompleted, isQuestAccepted } from "@/utils";

// const QuestCard = s(291922).rawModule.declarations;
// getMangled(Filters.bySource("isClaimingReward","sourceQuestContent"), { default: a => true });
const QuestCard = getDeclarationAndKey(Filters.bySource("isClaimingReward","sourceQuestContent","questEnrollmentBlockedUntil","enabledQuestStates"), Filters.byStrings("isClaimingReward","sourceQuestContent","questEnrollmentBlockedUntil","enabledQuestStates"));

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

Plugin.on(Events.START, () => {
	Patcher.after(QuestCard, "ek", (_, [props], ret) => {
		// console.log(ret);
		// return ret;
		if (!isQuestAccepted(props.quest) || isQuestCompleted(props.quest)) return;
		ret.props.children.push(<CompleteQuest quest={props.quest} />);
	});
});
