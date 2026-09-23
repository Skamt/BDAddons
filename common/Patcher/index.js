import { Patcher } from "@Api";
import { patch } from "./shared";

export const after = (...args) => patch("after", ...args);
export const afterOnce = (...args) => patch("after", ...args, true);

export const before = (...args) => patch("before", ...args);
export const beforeOnce = (...args) => patch("before", ...args, true);

export const instead = (...args) => patch("instead", ...args);
export const insteadOnce = (...args) => patch("instead", ...args, true);

export default Patcher;
