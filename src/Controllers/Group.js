import axios from "axios";
import sending from "../images/rotate.png"
import chatDB from "../chatDb";
import sent from "../images/doneThick.png"


export const groupVnSend = () => {

}
export const groupMsg = (messageAddController, UUID, sender, message, replyMsg, inputController) => {
    console.log(sender, UUID, message, replyMsg);
    inputController = ""
    const id = randomGenerate()
    messageAddController(prev => [...prev, {
        [sender]: {
            prompt: message,
            progress: sending,
            reply: replyMsg,
            id,
            type: "group"
        }
    }])
    axios.post("http://localhost:3409/groupMsg", {
        sender,
        UUID,
        message,
        replyMsg,
        messageId: id,
        type: "group"
    })
        .then((output) => {
            console.log(output);
            
            chatDB?.saveChat(`${UUID}_Index`, output?.data?.message?.index)
            messageAddController(prev => {
                return prev.map((chat) => {
                    const user = Object.keys(chat)[0]
                    if (chat[user]?.id == output?.data?.message?.msgId) {
                        return {
                            [user]: {
                                ...chat[user],
                                progress: sent,
                            }
                        }
                    }
                    return chat;
                })
            })
})

}

const randomGenerate = () => {
    const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
    let randomValue = ""
    for (let index = 0; index < 20; index++) {
        const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
        randomValue = randomValue + generateRandom
    }
    return randomValue
}