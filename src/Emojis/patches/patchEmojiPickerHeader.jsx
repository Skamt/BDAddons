import { Patcher } from "@Api";
import { getNestedProp, concateClassNames } from "@Utils";
import { getModuleAndKey } from "@Webpack";
import React from "@React";
import Logger from "@Utils/Logger";
import Plugin, { Events } from "@Utils/Plugin";
import { openEmojiManager } from "@/components/EmojiManager";
import { SettingIcon } from "@Components/icon";
import Tooltip from "@Components/Tooltip";
import {ManaButton} from "@Components/Button";
import { ModalActions } from "@Utils/Modals";

const EmojiPickerHeader = getModuleAndKey(Filters.byStrings("selectedSurrogate"));

Plugin.on(Events.START, () => {
	const { module, key } = EmojiPickerHeader;
	if (!module || !key) return Logger.patchError("patchEmojiPickerHeader");
	Patcher.after(module, key, (_, args, ret) => {
		const children = getNestedProp(ret, "props.children.props.children");
		if (!children || !Array.isArray(children)) return;

		children.push(
			<Tooltip note="Emoji settings">
				<ManaButton
					onClick={openEmojiManager}
					variant="icon-only"
					size="sm"
					icon={() => (
						<SettingIcon
							width="20"
							height="20"
						/>
					)}
				/>
			</Tooltip>
		);
	});
});
