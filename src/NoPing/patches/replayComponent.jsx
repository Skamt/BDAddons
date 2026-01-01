import React from "@React";
import { Patcher, findInTree } from "@Api";
import { getMangled } from "@Webpack";
import Plugin, { Events } from "@Utils/Plugin";
import PingToggle from "@/components/PingToggle";

const Module = getMangled("showMentionToggle", {
	replayComponent: a => true
});

Plugin.on(Events.START, () => {
	Patcher.after(Module, "replayComponent", (_, [{ reply }], ret) => {
		const target = findInTree(ret, a => a?.className?.includes("actions"), { walkable: ["children", "props"] });

		if (!target || !reply?.message?.author?.id) return ret;
		target.children.splice(0, 0, <PingToggle userId={reply.message.author.id} />);
	});
});
