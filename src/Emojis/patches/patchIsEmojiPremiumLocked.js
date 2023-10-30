import { Patcher } from "@Api";
import Logger from "@Utils/Logger";
import EmojiFunctions from "@Modules/EmojiFunctions";
import EmojiIntentionEnum from "@Enums/EmojiIntentionEnum";
export default () => {
	
	if (EmojiFunctions)
		Patcher.after(EmojiFunctions, "isEmojiPremiumLocked", (_,args,ret) => {
			console.log('isEmojiPremiumLocked', args, ret);
			return ret;
			if (intention !== EmojiIntentionEnum.CHAT) return ret;
			return false;
		});
	else
		Logger.patch("IsEmojiPremiumLocked");
};

