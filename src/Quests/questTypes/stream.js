export default function (quest) {
	// let realFunc = ApplicationStreamingStore.getStreamerActiveStreamMetadata;
	// ApplicationStreamingStore.getStreamerActiveStreamMetadata = () => ({
	// 	id: applicationId,
	// 	pid,
	// 	sourceName: null
	// });

	// let fn = data => {
	// 	let progress = quest.config.configVersion === 1 ? data.userStatus.streamProgressSeconds : Math.floor(data.userStatus.progress.STREAM_ON_DESKTOP.value);
	// 	console.log(`Quest progress: ${progress}/${secondsNeeded}`);

	// 	if (progress >= secondsNeeded) {
	// 		console.log("Quest completed!");

	// 		ApplicationStreamingStore.getStreamerActiveStreamMetadata = realFunc;
	// 		FluxDispatcher.unsubscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

	// 		doJob();
	// 	}
	// };
	// FluxDispatcher.subscribe("QUESTS_SEND_HEARTBEAT_SUCCESS", fn);

	// console.log(`Spoofed your stream to ${applicationName}. Stream any window in vc for ${Math.ceil((secondsNeeded - secondsDone) / 60)} more minutes.`);
	// console.log("Remember that you need at least 1 other person to be in the vc!");
}
