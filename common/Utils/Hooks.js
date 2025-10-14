import { Children, useCallback, useEffect, useReducer, useRef, useState } from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import UserStore from "@Stores/UserStore";
import ReadStateStore from "@Stores/ReadStateStore";
import TypingStore from "@Stores/TypingStore";
import ChannelStore from "@Stores/ChannelStore";
// import { getChannelName } from "@Utils/Channel";
// import { getUserName } from "@Utils/User";

export function usePropBasedState(prop) {
	const [state, setState] = useState(prop);
	useEffect(() => {
		setState(prop);
	}, [prop]);

	return [state, setState];
}

export const LengthStateEnum = {
	INCREASED: "INCREASED",
	UNCHANGED: "UNCHANGED",
	DECREASED: "DECREASED"
};

export function useNumberWatcher(num) {
	const lastNum = useRef(num);
	const currentNum = num;

	let state = "";
	if (lastNum.current < num) state = LengthStateEnum.INCREASED;
	else if (lastNum.current > currentNum) state = LengthStateEnum.DECREASED;
	else state = LengthStateEnum.UNCHANGED;
	lastNum.current = currentNum;
	return state;
}

export function useChildrenLengthStateChange(children) {
	const lastCount = useRef(Children.count(children));
	const currentCount = Children.count(children);

	let state = "";
	if (lastCount.current < currentCount) state = LengthStateEnum.INCREASED;
	else if (lastCount.current > currentCount) state = LengthStateEnum.DECREASED;
	else state = LengthStateEnum.UNCHANGED;
	lastCount.current = currentCount;
	return state;
}

export function useForceUpdate() {
	return useReducer(num => num + 1, 0);
}

export function useTimer(fn, delay) {
	const hideTimeoutId = useRef(null);

	const clear = useCallback(() => {
		if (hideTimeoutId.current === null) return;
		clearTimeout(hideTimeoutId.current);
		hideTimeoutId.current = null;
	}, []);

	const start = useCallback(() => {
		hideTimeoutId.current = setTimeout(() => {
			clear();
			fn();
		}, delay);
	}, [fn, delay]);

	useEffect(() => clear, []);

	return [start, clear];
}

function getChannelState(channelId) {
	const hasUnread = ReadStateStore.hasUnread(channelId);
	const mentionCount = ReadStateStore.getMentionCount(channelId);
	const unreadCount = ReadStateStore.getUnreadCount(channelId);
	return [mentionCount, unreadCount, hasUnread];
}

export function useChannelState(channelId) {
	const [mentionCount, unreadCount, hasUnread] = useStateFromStores([ReadStateStore], () => getChannelState(channelId), [channelId]);

	const typingUsersIds = useStateFromStores([TypingStore], () => Object.keys(TypingStore.getTypingUsers(channelId)), [channelId]);
	const currentUser = UserStore.getCurrentUser();
	const typingUsers = typingUsersIds.filter(id => id !== currentUser?.id).map(UserStore.getUser);

	return {
		isTyping: !!typingUsers.length,
		typingUsers,
		mentionCount,
		unreadCount,
		hasUnread
	};
}

export function useChannelsState(channelIds = []) {
	const [mentionCount, unreadCount, hasUnread] = useStateFromStores(
		[ReadStateStore],
		() => {
			return channelIds.map(getChannelState).reduce((acc,item) => {
				const [mentionCount, unreadCount, hasUnread] = item;
				acc[0] += mentionCount;
				acc[1] += unreadCount;
				acc[2] = acc[2] || hasUnread;
				return acc;
			}, [0,0,false]);
		},
		[channelIds]
	);

	const typingUsersIds = useStateFromStores(
		[TypingStore],
		() => {
			return channelIds.flatMap(channelId => Object.keys(TypingStore.getTypingUsers(channelId)));
		},
		[...channelIds]
	);
	const currentUser = UserStore.getCurrentUser();
	const typingUsers = typingUsersIds.filter(id => id !== currentUser?.id).map(UserStore.getUser);

	return {
		isTyping: !!typingUsers.length,
		typingUsers,
		mentionCount,
		unreadCount,
		hasUnread
	};
}
