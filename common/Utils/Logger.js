import { Logger } from "@Api";

export default Logger;

export const patchError = (...args) => Logger.error("Could not patch SettingsMenuTransition", ...args);
