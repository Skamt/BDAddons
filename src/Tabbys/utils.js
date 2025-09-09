export function parsePath(path) {
	const [, type, idk, channelId, , threadId] = path.split("/");
	return { type, idk, channelId: threadId || channelId };
}