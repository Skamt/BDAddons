import React from "@React";
import { after } from "@common/Patcher";
import { findInTree } from "@Api";
import { getMangled } from "@Webpack";
import Plugin from "@common/Plugin";
import PingToggle from "@/components/PingToggle";

const Module = getMangled("showMentionToggle", { replayComponent: a => true });

Plugin.onStart(() => {
	after(Module, "replayComponent", ({ args: [{ reply }], ret }) => {
		const target = findInTree(ret, a => a?.className?.includes("actions"), { walkable: ["children", "props"] });
		if (!target || !reply?.message?.author?.id) return ret;
		target.children.splice(0, 0, <PingToggle userId={reply.message.author.id} />);
	});
});
