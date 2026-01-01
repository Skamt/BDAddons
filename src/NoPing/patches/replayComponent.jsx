import { Patcher, findInTree } from "@Api";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";

const DD = s(407661).exports;

Plugin.on(Events.START, () => {
	Patcher.after(DD, "Z", (_, args, ret) => {
		const target = findInTree(ret, a => a?.className?.includes("actions"), { walkable: ["children", "props"] });
		if(!target) return ret;
		console.log(ret,target);
		target.children.splice(0,0, "POOP")
	});
});
