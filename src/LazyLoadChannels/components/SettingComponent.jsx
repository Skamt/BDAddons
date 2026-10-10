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
					label: "Auto load indicator.",
					note: "Whether or not to show an indicator for channels set to auto load",
				},
				{ setting: Settings.lazyLoadDMs, label: "Lazy load DMs." },
				{ setting: Settings.lazyLoadForum, label: "Lazy load Forums." },
				{ setting: Settings.lazyLoadVoice, label: "Lazy load Voice channels." },
			].map(SettingSwtich)}
		</FieldSet>
	);
};
