import { Filters, getDeclarationAndKey } from "@Webpack";

const d =  getDeclarationAndKey(Filters.bySource("isClaimingReward","sourceQuestContent","questEnrollmentBlockedUntil","enabledQuestStates"), Filters.byStrings("isClaimingReward","sourceQuestContent","questEnrollmentBlockedUntil","enabledQuestStates"));
;
console.log(d);
module.exports = () => ({
	start() {
		Patcher;
	},
	stop() {
		Patcher.unpatchAll();
	}
});
