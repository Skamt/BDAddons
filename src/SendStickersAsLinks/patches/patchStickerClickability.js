import { after } from "@common/Patcher";
import { StickerSendability } from "../Modules";
import Plugin from "@common/Plugin";

Plugin.onStart(() => after(StickerSendability, "isSendableSticker", () => true));
