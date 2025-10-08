import zustand, { subscribeWithSelector } from "@Discord/zustand";
import { remove, slice, arrayMove, meta, set, add } from "@Utils/Array";
// import { createFrom, createFromPath, addBy, mergeArrayItem, setArrayItem, reOrder } from "./shared";

export default {
	state: { roles: [] },
	selectors: { roles: state => state.roles },
	actions: {
		
	}
};
