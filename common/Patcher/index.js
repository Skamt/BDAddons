import { Patcher } from "@Api";
import { patch } from "./shared";

export const after = (...args) => patch("after", ...args);
export const before = (...args) => patch("before", ...args);
export const instead = (...args) => patch("instead", ...args);

export default Patcher;
