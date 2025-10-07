import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import FieldSet from "@Components/FieldSet";

export default () => {
	return (
		<FieldSet>
			{[
				{
					settingKey: "autoloadedChannelIndicator",
					description: "Auto load indicator.",
					note: "Whether or not to show an indicator for channels set to auto load"
				},
				{
					settingKey: "lazyLoadDMs",
					description: "Lazy load DMs.",
					note: "Whether or not to consider DMs for lazy loading"
				}
			].map(SettingSwtich)}
		</FieldSet>
	);
};
