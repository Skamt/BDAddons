import { Children, useCallback, useEffect, useReducer, useRef, useState } from "@React";
import useStateFromStores from "@Modules/useStateFromStores";
import UserStore from "@Stores/UserStore";
import ReadStateStore from "@Stores/ReadStateStore";
import TypingStore from "@Stores/TypingStore";
import ChannelStore from "@Stores/ChannelStore";
import { getChannelName } from "@Utils/Channel";

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
			clear(); // clean first in case of exception
			fn();
		}, delay);
	}, [fn, delay]);

	useEffect(() => clear, []);

	return [start, clear];
}

export function useChannelState(channelId) {
	const channel = useStateFromStores([ChannelStore], () => ChannelStore.getChannel(channelId), [channelId]);
	const name = getChannelName(channel);
	const [mentionCount, unreadCount, hasUnread] = useStateFromStores(
		[ReadStateStore],
		() => {
			const hasUnread = ReadStateStore.hasUnread(channelId);
			const mentionCount = ReadStateStore.getMentionCount(channelId);
			const unreadCount = ReadStateStore.getUnreadCount(channelId);
			return [mentionCount, unreadCount, hasUnread];
		},
		[channelId]
	);

	const typingUsersIds = useStateFromStores([TypingStore], () => Object.keys(TypingStore.getTypingUsers(channelId)), [channelId]);
	const currentUser = UserStore.getCurrentUser();
	const typingUsers = typingUsersIds.filter(id => id !== currentUser?.id).map(UserStore.getUser);

	return {
		name,
		channel,
		get isDM() {
			return channel?.isDM();
		},
		get isTyping() {
			return !!typingUsers.length;
		},
		typingUsers,
		mentionCount,
		unreadCount,
		hasUnread
	};
}
