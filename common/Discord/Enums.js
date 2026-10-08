import { getModule, Filters } from "@Webpack";

export const EmojiSendAvailabilityEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("GUILD_SUBSCRIPTION_UNAVAILABLE"), { searchExports: true }))();

export const EmojiIntentionEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("GUILD_ROLE_BENEFIT_EMOJI"), { searchExports: true }))();

export const DiscordPermissionsEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("ADD_REACTIONS"), { searchExports: true }))();

export const StickerTypeEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("GUILD", "STANDARD"), { searchExports: true }) )();

export const ProfileTypeEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("POPOUT", "SETTINGS"), { searchExports: true }) )();

export const ChannelTypeEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("GUILD_TEXT", "DM"), { searchExports: true }))();

export const RelationshipTypeEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("FRIEND", "PENDING_INCOMING"), { searchExports: true }))();

export const GuildFeaturesEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("GUILD_ONBOARDING_EVER_ENABLED", "VANITY_URL"), { searchExports: true }))();

export const AgeVerificationStatusEnum = /*@__PURE__*/  (() => getModule(Filters.byKeys("INFERRED_ADULT"), {searchExports:true}))();
