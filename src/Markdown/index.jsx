import Plugin from "@common/Plugin";
import { after, instead } from "@common/Patcher";
import { getModule } from "@Webpack";
import { Markdown } from "@Discord/Modules";
import { copy, nop } from "@Utils";
import { CopyIcon } from "@Components/icon";
import Tooltip from "@Components/Tooltip";
import { findInTree } from "@Api";
import React from "@React";
import Toast from "@Utils/Toast";

const subText = getModule(a => a?.requiredFirstCharacters?.[0] === "-");

function CopyButton({ content }) {
	const copyHandler = () => {
		try {
			copy(content);
			Toast.success("Copied!");
		} catch {
			Toast.error("Copy Failed!");
		}
	};

	return (
		<Tooltip note="Copy">
			<div onClick={copyHandler}>
				<CopyIcon
					width={16}
					height={16}
				/>
			</div>
		</Tooltip>
	);
}

Plugin.onStart(() => {
	instead(Markdown.defaultRules.link, "match", nop);
	instead(Markdown.defaultRules.subtext, "match", nop);
	instead(subText, "match", nop);
	after(Markdown.defaultRules.codeBlock, "react", ({ args: [{ content }], ret }) => {
		if (!content) return;
		const codeActions = findInTree(ret, x => x?.className?.includes("codeActions"), { walkable: ["props", "children"] });
		const existingCodeblocks = Array.isArray(codeActions.children) ? codeActions.children : [codeActions.children];
		codeActions.children = [<CopyButton content={content} />, ...existingCodeblocks.filter(a => !a?.props?.text)];
	});
});

module.exports = () => Plugin;
