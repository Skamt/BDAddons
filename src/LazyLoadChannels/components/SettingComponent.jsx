import React from "@React";
import SettingSwtich from "@Components/SettingSwtich";
import FieldSet from "@Components/FieldSet";
import Settings from "@Settings";
export default () => {
	return (
		<FieldSet>
			{[
				{
					setting: Settings.autoloadedChannelIndicator,
					description: "Auto load indicator.",
					note: "Whether or not to show an indicator for channels set to auto load",
				},
				{ setting: Settings.lazyLoadDMs, description: "Lazy load DMs." },
				{ setting: Settings.lazyLoadForum, description: "Lazy load Forums." },
				{ setting: Settings.lazyLoadVoice, description: "Lazy load Voice channels." },
			].map(SettingSwtich)}
		</FieldSet>
	);
};
