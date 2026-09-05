import { ContextMenu } from "@Api";
import React from "@React";
import { I18n } from "@Discord/Modules";
import Settings from "@Utils/Settings";
import Plugin, { Events } from "@Utils/Plugin";

function transformSettingsEntries(list) {
	const items = [];

	for (const item of list) {
		const { key, props } = item;
		if (!props) continue;

		if (key === "profile_section") {
			items.push(item);
			items.push(ContextMenu.buildItem({ type: "separator" }));
			continue;
		}

		if (key === "user_section" || (key?.endsWith("_section") && props.label)) {
			const label = key === "user_section" ? I18n.intl.string(I18n.t.cduTBL) : props.label;

			items.push(
				<ContextMenu.Item {...props} key={key} label={label} id={String(label)}>
					{props.children}
				</ContextMenu.Item>,
			);
			continue;
		}

		items.push(item);
	}

	return items;
}

Plugin.on(Events.START, () => {
	const unpatch = ContextMenu.patch("settings-menu", (ret, props) => {
		if(!Settings.state.organizeMenu) return; 
		ret.props.children[0] = transformSettingsEntries(ret.props.children[0]);
	});
	Plugin.on(Events.STOP, () => unpatch());
});
