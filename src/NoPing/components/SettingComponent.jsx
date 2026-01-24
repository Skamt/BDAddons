import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import FieldSet from "@Components/FieldSet";

export default () => {
	return (
		<FieldSet contentGap={8}>
			{[
				{
					settingKey: "silent",
					description: "Prepend @silent",
					note: "Insert @silent tag in messages containing mentions of users marked as never ping. @silent prevent messages containing mentions from pinging users"
				},
				{
					settingKey: "mentionToggle",
					description: "Always show mention toggle",
					note: "The mention toggle is usually hidden in DMs and probably other places."
				}
			].map(SettingSwtich)}
		</FieldSet>
	);
};
