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