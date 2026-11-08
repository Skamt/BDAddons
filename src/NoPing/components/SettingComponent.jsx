import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import FieldSet from "@Components/FieldSet";
import Settings from "@Settings";

export default () => {
	return (
		<FieldSet contentGap={8}>
			{[
				
				{
					setting: Settings.mentionToggle,
					label: "Always show mention toggle",
					description: "The mention toggle is usually hidden in DMs and probably other places."
				}
			].map(SettingSwtich)}
		</FieldSet>
	);
};
