import React, { useState, useEffect, useRef, useMemo, useCallback, useEffectEvent } from 'react'
import "../Styles/AIChat.css"
import send from "../images/paper-plane.png"
import profileArrow from "../images/left-arrow-white.png"
import deleteImg from "../images/delete.png"
import linkBtn from "../images/link.png"
import gallery from "../images/picture.png"
import playBtn from "../images/play-buttton.png"
import pauseBtn from "../images/pause.png"
import documentIcon from "../images/documentation.png"
import userImg from "../images/user.png"
import contactIcon from "../images/mobile.png"
import locationIcon from "../images/location (1).png"
import videoNoteIcon from "../images/clapperboard.png"
import pollIcon from "../images/poll.png"
import meetingIcon from "../images/discussion.png"
import { app, db } from '../firebase/config'
import { ref, push, set, get, query, onValue, orderByChild, equalTo, orderByKey, update } from "firebase/database"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate, useLocation, useFetcher } from 'react-router-dom';
import ChatMediaSend from './ChatMediaSend'
import PreviewMedia from './PreviewMedia'
import MediaTypesSelect from './MediaTypesSelect'
import sent from "../images/doneThick.png"
import sending from "../images/rotate.png"
import online from "../images/double-tick (2).png"
import seen from "../images/double-tick (1).png"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import recordVoice from "../images/mic.png"
import stopVoiceRecording from "../images/stop-button.png"
import { reduceMediaQualityToFile, formatBytes } from "../fileReducer.js"
import more from "../images/more.png"
import AlertComponent from './AlertComponent.jsx'
import EditDialogue from './EditDialogue.jsx'
import DeleteDialogue from "./DeleteDialogue.jsx"
import { GoogleGenAI } from '@google/genai';
import QuickSummary from './QuickSummary.jsx'
import ForwardDialogue from './ForwardDialogue.jsx'
import { ProfiileView } from './ProfiileView.jsx'
import ClearChatPrompt from './ClearChatPrompt.jsx'
import videoCallIcon from "../images/cam-recorder.png"
import voiceCallIcon from "../images/phone.png"
import Call from './Call.jsx'
import chatDB, { useChatDB } from '../chatDb.js'
import axios from 'axios'
import groupImg from "../images/group.png"
import { groupMsg, groupVnSend } from '../Controllers/Group.js'

// dotenv().config()




const ChatDisplay = (props) => {
    const navigate = useNavigate()
    const location = useLocation()
    // const useVal = ()=>{val()}
    const [onChat, setOnChat] = useState(false)
    const propsValue = useRef()
    const [userName, setUserName] = useState()
    const [mediaOption, setMediaOption] = useState(false)
    const holdDisplayUrl = useRef()
    const fileHolder = useRef()
    const [displayUrl, setDisplayUrl] = useState()
    const [displayMedia, setDisplayMedia] = useState(false)
    const [mediaType, setMediaType] = useState()
    const [mediaFileName, setMediaFileName] = useState("")
    const [previewMedia, setPreviewMedia] = useState(false)
    const [collectInputTemp, setCollectInputTemp] = useState(null)
    const [loading, setLoading] = useState(false)
    const [statusPreview, setStatusPreview] = useState(false)
    const previewSrc = useRef(null)
    const previewType = useRef(null)
    const userPrompt = useRef("")
    const [testDoc, setTestDoc] = useState("")
    const [replyMsg, setReplyMsg] = useState(null)
    const allType = useRef([])
    const [friendTyping, setFriendTyping] = useState(false)
    const [micShow, setMicShow] = useState(true)
    const [recordState, setRecordState] = useState(recordVoice)
    const [voiceNoteSrc, setVoiceNoteSrc] = useState()
    const [voicePreviewState, setVoicePreviewState] = useState(pauseBtn)
    const [replyMsgCon, setReplyMsgCon] = useState()
    const audioTag = useRef("")
    const vnData = useRef()
    const holdChat = useRef([])
    const [alertBlock, setAlertBlock] = useState(false)
    const [alertPrompt, setAlertPrompt] = useState("")
    const [alertReturn, setAlertReturn] = useState()
    const [alertQuery, setAlertQuery] = useState(false)
    const [editBlock, setEditBlock] = useState(false)
    const [editPrompt, setEditPrompt] = useState()
    const [editReturn, setEditReturn] = useState()
    const [deleteBlock, setDeleteBlock] = useState(false)
    const [deleteReturn, setDeleteReturn] = useState()
    const [deleteUserType, setDeleteUserType] = useState()
    const [quickSummaryBlock, setQuickSummaryBlock] = useState(false)
    const [summaryPrompt, setSummaryPrompt] = useState()
    const [summaryResult, setSummaryResult] = useState()
    const [forwardBlock, setForwardBlock] = useState(false)
    const [forwardCred, setForwardCred] = useState()
    const [previewBlock, setPreviewBlock] = useState(false)
    const localTriggerSend = useRef(false)
    const [friendOptions, setFriendOptions] = useState(false)
    const [friendWallpaper, setFriendWallpaper] = useState()
    const [archived, setArchived] = useState(false)
    const [clearChatPrompt, setClearChatPrompt] = useState(false)
    const [clearChatReturn, setClearChatReturn] = useState(false)
    const [chatBlocked, setChatBlocked] = useState(false)
    const [accessChat, setAccessChat] = useState(true)
    const [voiceCall, setVoiceCall] = useState(false)
    const groupMsgRequested = useRef()
    useEffect(() => {
        console.log("chatFriend", props.chatFriendDetail);

        if (location?.state) {
            triggerFunction(location?.state?.Msg1, location?.state?.Msg2, location?.state?.output)
        }
        if (window.innerWidth <= 600 && !props.chatFriendDetail || props.chatFriendDetail?.length == 0) {
            navigate("/dashboard")
            return
        }
    }, [])



    const {
        saveChat,
        getChat,
        getAllDirectories,
        getStats
    } = useChatDB()

    const triggerFunction = (Msg1, Msg2, output) => {
        if (window.innerWidth <= 600 && !props.chatFriendDetail || props.chatFriendDetail?.length == 0) {
            navigate("/dashboard")
            return
        }
        let message1;
        let message2;
        get(ref(db, `Messages/${Msg1}`))
            .then((output1) => {
                if (output1.exists()) {
                    message1 = Msg1
                }
            })
            .finally(() => {
                get(ref(db, `Messages/${Msg2}`))
                    .then((output2) => {
                        if (output2.exists()) {
                            message2 = Msg2
                        }
                    })
                    .finally(() => {
                        if (!message1 && !message2) {
                            update(ref(db, `Messages/${Msg1}`), {
                                message: "hello"
                            })
                                .then(() => {
                                    props.setChatInfo(M => Msg1)
                                    let mutuals = []
                                    let friendMutuals = []
                                    get(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`))
                                        .then((data) => {
                                            if (data.exists()) {
                                                mutuals = data.val()
                                            }
                                            if (!(mutuals?.includes(output?.UserName))) {
                                                mutuals.push(output?.UserName)
                                                update(ref(db, `Users/${props.userCredentials?.UserName}`), {
                                                    mutualFriends: mutuals
                                                })
                                            }
                                        })
                                    get(ref(db, `Users/${output?.UserName}/mutualFriends`))
                                        .then((data) => {
                                            if (data.exists()) {
                                                friendMutuals = data.val()
                                            }
                                            if (!(friendMutuals?.includes(output?.UserName))) {
                                                friendMutuals.push(props.userCredentials?.UserName)
                                                update(ref(db, `Users/${output?.UserName}`), {
                                                    mutualFriends: friendMutuals
                                                })
                                            }
                                        })
                                })
                        }
                        else {
                            if (message1) {
                                props.setChatInfo(M => message1)
                                let mutuals;
                                let friendMutual;
                                get(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`))
                                    .then((data) => {
                                        mutuals = data.val()
                                        const findFriend = mutuals?.find(friend =>
                                            friend == output?.UserName
                                        )
                                        if (!findFriend || findFriend.length == 0) {
                                            mutuals.push(output?.UserName)
                                            update(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`), {
                                                mutualFriends: mutuals
                                            })
                                        }
                                    })
                            }
                            else if (message2) {
                                props.setChatInfo(M => message2)
                            }
                        }
                    })
            })
    }

    const preview = (data, type) => {
        previewSrc.current = data
        previewType.current = type
        setPreviewMedia(() => true)
    }
    const typing = () => {
        if (userPrompt.current.value.length == 0) {
            setMicShow(() => true)
            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                .then((output) => {
                    let typingUsers = []
                    if (output.exists()) {
                        typingUsers = output.val()
                        const checkType = typingUsers.filter(typer => typer != userName)
                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                            type: checkType
                        })
                    }
                })
        }
        else if (userPrompt.current.value.length > 0) {
            setMicShow(() => false)
            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                .then((output) => {
                    let typingUsers = []
                    if (output.exists()) {
                        typingUsers = output.val()
                        const checkType = typingUsers.filter(typer => typer == userName)
                        if (checkType.length == 0) {
                            typingUsers.push(userName)
                            update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                type: typingUsers
                            })
                        }
                    }
                    else {
                        typingUsers.push(userName)
                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                            type: typingUsers
                        })
                    }
                })
        }
    }
    const closeVn = () => {
        audioTag.current.pause()
        setVoiceNoteSrc(null)
        setMicShow(() => true)
        vnData.current = null
        setRecordState(() => recordVoice)
        setVoicePreviewState(() => pauseBtn)
    }
    const streamNote = useRef()
    const voiceData = useRef()
    const chunks = useRef([])
    const voiceNote = async () => {
        if (recordState == recordVoice) {
            streamNote.current = await navigator.mediaDevices.getUserMedia({ audio: true })
            voiceData.current = new MediaRecorder(streamNote.current, {
                mimeType: 'audio/webm;codecs=opus'
            })
            setRecordState(stopVoiceRecording)
            voiceData.current.ondataavailable = (e) => {
                chunks.current.push(e.data)
            }

        }
        else {
            setRecordState(recordVoice)
            if (voiceData.current.state === 'recording') {
                voiceData.current.stop();
            }
        }
        voiceData.current.onstop = () => {
            const blob = new Blob(chunks.current, { type: "audio/webm;codecs=opus" })
            const reader = new FileReader
            reader.addEventListener("load", (e) => {
                vnData.current = e?.target?.result
            })
            reader.readAsDataURL(blob)
            const url = URL.createObjectURL(blob)
            chunks.current = []
            setVoiceNoteSrc(url)
        }
        voiceData.current.start()
    }
    const pausePlayVoice = () => {
        if (voicePreviewState == playBtn) {
            audioTag.current.play()
            setVoicePreviewState(pauseBtn)
        }
        else {
            audioTag.current.pause()
            setVoicePreviewState(playBtn)
        }
    }
    const scrollChat = useRef(null)
    const scrollToBottom = () => {
        scrollChat.current?.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" })
    };
    const userNameGet = localStorage.getItem("TilChat")
    useEffect(() => {
        if (!userNameGet || userNameGet.profileId == "123" || userNameGet == {}) {
            navigate("/signup")
        }
        else {
            setUserName(JSON.parse(userNameGet).UserName)

        }
    }, [navigate])

    const holdPropsChat = useRef()
    useEffect(() => {
        groupMsgRequested.current = true
        setForwardBlock(false)
        setVoiceNoteSrc(null)
        setPreviewBlock(false)
        setMicShow(() => true)
        setFriendOptions(() => false)
        const checkFriendWallpaper = props.friendsWallpaper.filter(wallpaper => Object.keys(wallpaper)[0] == props.chatFriendDetail?.UserName)
        if (checkFriendWallpaper.length > 0) {
            setFriendWallpaper(checkFriendWallpaper[0][props.chatFriendDetail?.UserName])
        }
        else {
            setFriendWallpaper(props.currentWallpaper)
        }
        const filterBlocked = props.chatBlocked.filter(friend => friend == props.chatFriendDetail?.UserName)
        if (filterBlocked.length > 0) {
            setChatBlocked(true)
        }
        else {
            setChatBlocked(false)
        }
        const filterArchived = props.archivedArray.filter(friend => friend == props.chatFriendDetail?.UserName)
        if (filterArchived.length > 0) {
            setArchived(true)
        }
        else {
            setArchived(false)
        }
        getChat(props.chatInfo)
            .then((output) => {
                setOnChat(true)
                if (output) {
                    const filterOut = output.filter(chat => chat != undefined || chat != null)
                    props.setChatArray(filterOut)
                }
                else {
                    props.setChatArray([])
                }
                set(ref(db, `RTCExchange/${props.chatInfo}`), null)
            })
            .finally(() => {
                holdPropsChat.current = props.chatInfo
                if (userPrompt?.current?.value) {
                    userPrompt.current.value = ""
                }
                get(ref(db, `Users/${userName}/type`))
                    .then((output) => {
                        if (output.exists()) {
                            let typingFriends = output.val().type
                            allType.current = output.val().type
                            const checkFriendTyping = typingFriends.filter(typing => typing == props.chatFriendDetail?.UserName)
                            if (checkFriendTyping.length > 0) {
                                setFriendTyping(() => true)
                                setTimeout(() => {
                                    // scrollToBottom()
                                }, 500);
                            }
                            else {
                                setFriendTyping(() => false)
                            }
                            const filterFriendTyping = typingFriends.filter(typing => typing != props.chatFriendDetail?.UserName)
                            update(ref(db, `Users/${userName}/type`), {
                                type: filterFriendTyping
                            })
                        }
                        else {
                            setFriendTyping(() => false)
                        }
                        clearOpt()
                    })
            })
    }, [props.chatInfo])

    useEffect(() => {
        if (props.chatEdited) {
            if (props.chatInfo) {
                props.setChatArray(prev => prev.map((output) => {
                    const user = Object.keys(output)[0]
                    if (output[user].id == props.chatEdited.id) {
                        return {
                            [user]: {
                                ...props.chatEdited
                            }
                        }
                    }
                    return output
                }))
                props.setChatEdited(false)
            }
        }
    }, [props.chatEdited])


    useEffect(() => {
        const filterBlocked = props.chatBlocked.filter(friend => friend == props.chatFriendDetail?.UserName)
        if (filterBlocked.length > 0) {
            setChatBlocked(true)
        }
        else {
            setChatBlocked(false)
        }
    }, [props.chatBlocked])

    useEffect(() => {
        const checkFriendWallpaper = props.friendsWallpaper.filter(wallpaper => Object.keys(wallpaper)[0] == props.chatFriendDetail?.UserName)
        if (checkFriendWallpaper.length > 0) {
            setFriendWallpaper(checkFriendWallpaper[0][props.chatFriendDetail?.UserName])
        }
    }, [props.friendsWallpaper])

    useEffect(() => {
        const filterName = props.friendsBlocked.filter(friend => friend == props.chatFriendDetail?.UserName)
        if (filterName.length > 0) {
            setAccessChat(false)
        }
        else {
            setAccessChat(true)
        }
    }, [props.friendsBlocked])

    useEffect(() => {
        const device = props.deviceUserAgent
        if (props.chatInfo) {
            if (props.chatInfo == props.chatFriendDetail?.UserName + userName || holdPropsChat.current == userName + props.chatFriendDetail?.UserName) {
                const deviceMsg = onValue(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`), (output) => {
                    if (output.exists()) {
                        const allResult = output.val()
                        props.setChatArray(prev => {
                            const updatedArray = [...prev];
                            allResult?.forEach(newResult => {
                                const sender = Object.keys(newResult)[0];
                                const newId = newResult[sender]?.id;
                                const newChat = {
                                    [sender]: {
                                        ...newResult[sender],
                                        progress: sent
                                    }
                                };

                                if (!newId) {
                                    return newResult
                                }
                                let foundIndex = -1;
                                for (let i = 0; i < updatedArray.length; i++) {
                                    const existingChat = updatedArray[i];
                                    const existingSender = Object.keys(existingChat)[0];
                                    if (existingChat[existingSender]?.id === newId) {
                                        foundIndex = i;
                                        break;
                                    }
                                }

                                if (foundIndex >= 0) {
                                    updatedArray[foundIndex] = newChat;
                                } else {
                                    updatedArray.push(newChat);
                                }
                            });

                            return updatedArray;
                        })
                        scrollToBottom()
                        set(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), null);
                    }
                })
                return deviceMsg
            }
        }
    }, [props.chatInfo, props.chatFriendDetail, onChat, userName])

    useEffect(() => {
        const device = props.deviceUserAgent
        if (props.chatInfo) {
            if (props.chatInfo == props.chatFriendDetail?.UserName + userName || holdPropsChat.current == userName + props.chatFriendDetail?.UserName) {
                const deleteMsgCheck = onValue(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.chatInfo}/chat`), (output) => {
                    if (output.exists()) {
                        const deletedArray = output.val()
                        deletedArray.map((id) => {
                            props.setChatArray(prev => {
                                return prev.map((output) => {
                                    if (output) {
                                        const user = Object.keys(output)[0]
                                        if (output[user].id == id) {
                                            return {
                                                [user]: {
                                                    deleted: true
                                                }
                                            }
                                        }
                                        return output
                                    }
                                })
                            })
                        })
                        set(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.chatInfo}`), null);
                    }
                })
                return deleteMsgCheck
            }
        }
    }, [props.chatInfo, props.chatFriendDetail, onChat, userName])


    useEffect(() => {
        const checkTyping = onValue(ref(db, `Users/${userName}/type`), (output) => {
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing => typing == props.chatFriendDetail?.UserName)
                if (checkFriendTyping.length > 0) {
                    setFriendTyping(() => true)
                    setTimeout(() => {
                        scrollToBottom()
                    }, 1000);
                }
                else {
                    setFriendTyping(() => false)
                }
                setTimeout(() => {
                    const checkFriendTyping = typingFriends.filter(typing => typing != props.chatFriendDetail?.UserName)
                    update(ref(db, `Users/${userName}/type`), {
                        type: checkFriendTyping
                    })
                }, 3000);
            }
            else {
                setFriendTyping(() => false)
            }
        })
        return checkTyping
    }, [userName, props.chatFriendDetail])

    const resendChat = (output) => {
        // console.log(output)
        if (output[`${userName}`]?.type == "group") {
            return
        }
        if (output[`${userName}`]?.voiceNote) {
            reSendVN(output)
        }
        else if (output[`${userName}`]?.media && output[`${userName}`]?.mediaType) {
            reSendMediaChat(output)
        }
        else {
            if (output[`${userName}`]?.id) {
                reSendChat(output)
            }
        }
    }
    const chatDuplicate = useRef()
    useEffect(() => {
        saveChat(props.chatInfo, props.chatArray)
        holdChat.current = props.chatArray
        if (props.chatArray && props.chatArray.length > 0) {
            props.chatArray.map((chat) => {
                if (chat) {

                    const obj = Object.keys(chat)
                    let user
                    if (obj && obj.length > 0) {

                        user = obj[0]
                    }
                    if (user) {
                        if (chat[user]?.progress == sending) {
                            resendChat(chat)
                        }
                    }
                }
            })
            const ids = new Set();
            let hasDuplicates = false;

            props.chatArray.forEach(item => {
                if (item) {
                    const key = Object.keys(item)[0];
                    const id = item[key]?.id;
                    if (id) {
                        if (ids.has(id)) hasDuplicates = true;
                        ids.add(id);
                    }
                }
            });

            if (hasDuplicates) {
                setTimeout(() => {
                    props.setChatArray(prev => {
                        const seen = new Set();
                        const result = [];
                        for (let i = prev.length - 1; i >= 0; i--) {
                            const item = prev[i]
                            if (!item) continue

                            const key = Object.keys(item)[0];
                            const id = item[key]?.id
                            if (id) {
                                if (!seen.has(id)) {
                                    seen.add(id)
                                    result.unshift(item)
                                }
                            } else {
                                result.unshift(item)
                            }
                        }

                        return result
                    })
                }, 0)
            }
        }
    }, [props.chatArray])
    useEffect(() => {
        if (props.chatInfo && onChat) {
            getChat(`${props.chatInfo}_Index`)
                .then((output) => {
                    let lastIndex = 0
                    if (output) {
                        lastIndex = output
                    }
                    get(ref(db, `AllGroup/${props.chatInfo}/lastIndex`))
                        .then(async (lastData) => {
                            if (lastData.val() > output) {
                                const difference = lastData.val() - output
                                console.log("difference", difference);
                                for (let index = 0; index <= difference; index++) {
                                    const response = await fetch("http://localhost:3409/getMsg", {
                                        method: 'POST',
                                        headers: {
                                            'Content-Type': 'application/json',
                                        },
                                        body: JSON.stringify({
                                            UUID: props.chatInfo,
                                            index: lastIndex,
                                            username: userName,
                                        })
                                    });
                                }
                            }
                        })
                })
        }
    }, [props.chatInfo, onChat])

    useEffect(() => {
        propsValue.current = props.chatInfo
        if (onChat) {
            const requestValue = onValue(ref(db, "Messages/" + props.chatInfo + "/"), (output) => {
                if (props.chatInfo == propsValue.current) {
                    if (output.val()?.chatArray) {
                        if (output.val()?.chatArray != "No message") {
                            if (output.val()?.message != "hello") {
                                const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                                if (Object.keys(output.val().chatArray[0])[0] != userName) {
                                    set(ref(db, "Messages/" + props.chatInfo), {
                                        chatArray: "No message"
                                    })
                                    props.setChatArray(prev => [...prev, ...output.val().chatArray])
                                    let messageToSend = output.val().chatArray
                                    props.otherDevices?.map((device) => {
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                            .then((msg) => {
                                                if (msg.exists()) {
                                                    messages = msg.val()
                                                    messageToSend.map((forwardMsg) => {
                                                        messages.push(forwardMsg)
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                                else {
                                                    messageToSend.map((forwardMsg) => {
                                                        messages.push(forwardMsg)
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                            })
                                    })
                                }

                            }
                        }
                        else {
                            const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/readReceipt`))
                                .then((receipt) => {
                                    if (!receipt.exists() || receipt.val() != false) {
                                        props.setChatArray(prev => prev.map(item => {
                                            if (item) {
                                                if (item[userName]) {
                                                    return {
                                                        ...item,
                                                        [userName]: {
                                                            ...item[userName],
                                                            progress: item[userName].progress === sent || item[userName].progress === online ? seen : item[userName].progress
                                                        }
                                                    };
                                                }
                                            }
                                            return item;
                                        }));
                                    }
                                })
                        }
                        scrollToBottom()
                    }
                }

            })
            return requestValue
        }
    }, [props.chatInfo, onChat])

    const sentImage = sent
    const onlineImage = online
    useEffect(() => {
        if (props.chatFriendDetail?.type === "group") {
            return
        }
        const checkOnline = onValue(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), (result) => {
            if (!result.val()) {
                props.setChatArray(prev => prev.map(item => {
                    if (item[userName]) {
                        return {
                            ...item,
                            [userName]: {
                                ...item[userName],
                                progress: item[userName].progress === sentImage ? onlineImage : item[userName].progress
                            }
                        };
                    }
                    return item;
                }));
            }
        })
        return checkOnline
    }, [props.chatFriendDetail, userName])

    const reply = (id, user) => {
        if (id && id != "") {
            const filterChat = props.chatArray.filter(friend => friend[user]?.id == id)
            if (filterChat && filterChat.length > 0) {
                setReplyMsgCon(() => filterChat[0][user])
                const check = {
                    id: filterChat[0][user].id,
                    user: user
                }

                setReplyMsg(() => check)
            }
        }
        userPrompt.current.focus()
    }
    const closeReply = () => {
        setReplyMsg(null)
        setReplyMsgCon(null)
    }

    const sendToNodeServer = async (recipientUserId, senderUserName, message) => {
        try {
            await fetch('https://tilchat.onrender.com/send-notification', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    toUserId: recipientUserId,
                    fromUser: senderUserName,
                    message: message
                })
            });
        } catch (error) {
        }
    };

    const randomGenerate = () => {
        const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
        let randomValue = ""
        for (let index = 0; index < 20; index++) {
            const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
            randomValue = randomValue + generateRandom
        }
        return randomValue
    }

    const sendVN = () => {
        get(ref(db, "Messages/" + props.chatInfo))
            .then((output) => {
                const random = randomGenerate()
                const id = `${userName}${random}`
                if (!output.val().chatArray || output.val().chatArray == "No message" || typeof (output.val().message) == "string") {

                    props.setChatArray(prev => [...prev, {
                        [userName]: {
                            voiceNote: vnData.current,
                            progress: sending,
                            reply: replyMsg,
                            id
                        }
                    }])
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: [{
                            [userName]: {
                                voiceNote: vnData.current,
                                reply: replyMsg,
                                id
                            }
                        }]
                    })
                        .then(() => {
                            setMediaOption(() => true)
                            setMediaOption(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            sendToNodeServer(props.chatFriendDetail?.UserName, "TilChat", `${userName} sent you a voice note`)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: userName
                            })
                            props.setChatArray(prev => {
                                return prev.map((chat) => {
                                    const user = Object.keys(chat)[0]
                                    if (chat[user]?.id == id) {
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
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                .then((result) => {
                                    let friendNotifications = []
                                    const valueToPush = {
                                        prompt: `${userName} sent you a voice note`,
                                        sender: userName,
                                        reply: replyMsg,
                                    }
                                    if (result.exists()) {
                                        friendNotifications = result.val()
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                    else {
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                })
                            props.otherDevices?.map((device) => {
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg) => {
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: vnData.current,
                                                    progress: sent,
                                                    reply: replyMsg,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                        else {
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: vnData.current,
                                                    progress: sent,
                                                    reply: replyMsg,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                    })
                            })
                        })
                }
                else {
                    let tempData = output.val().chatArray
                    tempData.push({
                        [userName]: {
                            voiceNote: vnData.current,
                            reply: replyMsg,
                            id
                        }
                    })
                    props.setChatArray(prev => [...prev, {
                        [userName]: {
                            voiceNote: vnData.current,
                            progress: sending,
                            reply: replyMsg,
                            id
                        }
                    }])
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: tempData
                    })
                        .then(() => {
                            setMediaOption(() => true)
                            setMediaOption(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            sendToNodeServer(props.chatFriendDetail?.UserName, "TilChat", `${userName} sent you a voice note`)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                            let randomValue = ""
                            for (let index = 0; index < 12; index++) {
                                const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                                randomValue = randomValue + generateRandom
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: randomValue
                            })
                            props.setChatArray(prev => {
                                return prev.map((chat) => {
                                    const user = Object.keys(chat)[0]
                                    if (chat[user]?.id == id) {
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
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                .then((result) => {
                                    let friendNotifications = []
                                    const valueToPush = {
                                        prompt: `${userName} sent you a voice note`,
                                        sender: userName,
                                        reply: replyMsg
                                    }
                                    if (result.exists()) {
                                        friendNotifications = result.val()
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                    else {
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                })
                            props.otherDevices?.map((device) => {
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg) => {
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: vnData.current,
                                                    reply: replyMsg,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                        else {
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: vnData.current,
                                                    reply: replyMsg,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                    })
                            })

                        })
                }
                clearOpt()
                closeReply()
            })
    }

    const reSendVN = (param) => {
        get(ref(db, "Messages/" + props.chatInfo))
            .then((output) => {
                if (!output.val().chatArray || output.val().chatArray == "No message" || typeof (output.val().message) == "string") {
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: [{
                            [userName]: {
                                voiceNote: param[`${userName}`].voiceNote,
                                reply: param[`${userName}`]?.reply,
                                id: param[`${userName}`].id
                            }
                        }]
                    })
                        .then(() => {
                            setMediaOption(() => true)
                            setMediaOption(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            sendToNodeServer(props.chatFriendDetail?.UserName, "TilChat", `${userName} sent you a voice note`)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: userName
                            })
                        })
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                .then((result) => {
                                    let friendNotifications = []
                                    const valueToPush = {
                                        prompt: `${userName} sent you a voice note`,
                                        sender: userName,
                                        reply: param[`${userName}`]?.reply,
                                    }
                                    if (result.exists()) {
                                        friendNotifications = result.val()
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                    else {
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                })
                            props.otherDevices?.map((device) => {
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg) => {
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: param[`${userName}`].voiceNote,
                                                    reply: param[`${userName}`]?.reply,
                                                    id: param[`${userName}`].id,
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                        else {
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: param[`${userName}`].voiceNote,
                                                    reply: param[`${userName}`]?.reply,
                                                    id: param[`${userName}`].id,
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                    })
                            })
                        })
                }
                else {
                    let tempData = output.val().chatArray
                    tempData.push({
                        [userName]: {
                            voiceNote: param[`${userName}`].voiceNote,
                            reply: param[`${userName}`]?.reply,
                            id: param[`${userName}`].id,
                        }
                    })
                    // props.setChatArray(prev=>[...prev, {[userName]:{
                    //     voiceNote: vnData.current,
                    //     progress: sending,
                    //     reply:replyMsg,
                    //     id
                    // }}])
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: tempData
                    })
                        .then(() => {
                            setMediaOption(() => true)
                            setMediaOption(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            sendToNodeServer(props.chatFriendDetail?.UserName, "TilChat", `${userName} sent you a voice note`)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                            let randomValue = ""
                            for (let index = 0; index < 12; index++) {
                                const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                                randomValue = randomValue + generateRandom
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: randomValue
                            })
                            // props.setChatArray((prev)=>prev.slice(0, -1))
                            // props.setChatArray(prev=>[...prev, {[userName]:{
                            //     voiceNote: vnData.current,
                            //     progress: sent,
                            //     reply:replyMsg,
                            //     id
                            // }}])
                        })
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                .then((result) => {
                                    let friendNotifications = []
                                    const valueToPush = {
                                        prompt: `${userName} sent you a voice note`,
                                        sender: userName,
                                        reply: param[`${userName}`]?.reply
                                    }
                                    if (result.exists()) {
                                        friendNotifications = result.val()
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                    else {
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                            notifications: friendNotifications
                                        })
                                    }
                                })
                            props.otherDevices?.map((device) => {
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg) => {
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: param[`${userName}`].voiceNote,
                                                    reply: param[`${userName}`]?.reply,
                                                    id: param[`${userName}`].id,
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                        else {
                                            messages.push({
                                                [userName]: {
                                                    voiceNote: param[`${userName}`].voiceNote,
                                                    reply: param[`${userName}`]?.reply,
                                                    id: param[`${userName}`].id,
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                        }
                                    })
                            })

                        })
                }
            })
    }

    const groupChat = () => {
        const msg = userPrompt.current.value
        userPrompt.current.value = ""
        groupMsg(props.setChatArray, props.chatFriendDetail?.UUID, userName, msg, replyMsg)
    }

    const sendChat = () => {
        const random = randomGenerate()
        const id = `${userName}${random}`
        if (!loading) {
            setReplyMsg(() => null)
            setLoading(() => true)
            const message = userPrompt.current.value
            if (message || message.trim() != "") {
                get(ref(db, "Messages/" + props.chatInfo))
                    .then((output) => {
                        if (!output.val()?.chatArray || output.val()?.chatArray == "No message" || typeof (output.val().message) == "string") {
                            props.setChatArray(prev => [...prev, {
                                [userName]: {
                                    prompt: message,
                                    progress: sending,
                                    reply: replyMsg,
                                    id
                                }
                            }])
                            set(ref(db, "Messages/" + props.chatInfo), {
                                chatArray: [{
                                    [userName]: {
                                        prompt: message,
                                        reply: replyMsg,
                                        id
                                    }
                                }]
                            })
                                .then(() => {
                                    userPrompt.current.value = ""
                                    setMediaOption(() => true)
                                    setMediaOption(() => false)
                                    setLoading(() => false)
                                    setMicShow(() => true)
                                    sendToNodeServer(props.chatFriendDetail?.UserName, userName, message)
                                    const friendsList = props.mutualRender
                                    const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                                    if (getFriend && getFriend.length > 0) {
                                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                                    }
                                    set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                        user: userName
                                    })
                                    props.setChatArray(prev => {
                                        return prev.map((chat) => {
                                            const user = Object.keys(chat)[0]
                                            if (chat[user]?.id == id) {
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
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                        .then((output) => {
                                            let typingUsers = []
                                            if (output.exists()) {
                                                typingUsers = output.val()
                                                const checkType = typingUsers.filter(typer => typer != userName)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                                    type: checkType
                                                })
                                            }
                                        })
                                        .finally(() => {
                                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                                .then((result) => {
                                                    let friendNotifications = []
                                                    const valueToPush = {
                                                        prompt: message,
                                                        mediaType: null,
                                                        media: null,
                                                        sender: userName,
                                                        reply: replyMsg,
                                                    }
                                                    if (result.exists()) {
                                                        friendNotifications = result.val()
                                                        friendNotifications.push(valueToPush)
                                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                            notifications: friendNotifications
                                                        })
                                                    }
                                                    else {
                                                        friendNotifications = []
                                                        friendNotifications.push(valueToPush)
                                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                            notifications: friendNotifications
                                                        })
                                                    }
                                                })
                                            props.otherDevices?.map((device) => {
                                                let messages = []
                                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                                    .then((msg) => {
                                                        if (msg.exists()) {
                                                            messages = msg.val()
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: replyMsg,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                        else {
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: replyMsg,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                    })
                                            })
                                        })
                                })
                        }
                        else {
                            let tempData = output.val().chatArray
                            tempData.push({
                                [userName]: {
                                    prompt: userPrompt.current.value,
                                    reply: replyMsg,
                                    id
                                }
                            })
                            props.setChatArray(prev => [...prev, {
                                [userName]: {
                                    prompt: userPrompt.current.value,
                                    progress: sending,
                                    reply: replyMsg,
                                    id
                                }
                            }])
                            set(ref(db, "Messages/" + props.chatInfo), {
                                chatArray: tempData
                            })
                                .then(() => {
                                    userPrompt.current.value = ""
                                    setMediaOption(() => true)
                                    setMediaOption(() => false)
                                    setLoading(() => false)
                                    setMicShow(() => true)
                                    sendToNodeServer(props.chatFriendDetail?.UserName, userName, message)
                                    const friendsList = props.mutualRender
                                    const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)
                                    if (getFriend && getFriend.length > 0) {
                                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                                    }
                                    const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                                    let randomValue = ""
                                    for (let index = 0; index < 12; index++) {
                                        const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                                        randomValue = randomValue + generateRandom
                                    }
                                    set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                        user: randomValue
                                    })
                                    props.setChatArray(prev => {
                                        return prev.map((chat) => {
                                            if (chat) {
                                                const user = Object.keys(chat)[0]
                                                if (chat[user]?.id == id) {
                                                    return {
                                                        [user]: {
                                                            ...chat[user],
                                                            progress: sent,
                                                        }
                                                    }
                                                }
                                                return chat;
                                            }
                                        })
                                    })
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                        .then((output) => {
                                            let typingUsers = []
                                            if (output.exists()) {
                                                typingUsers = output.val()
                                                const checkType = typingUsers.filter(typer => typer != userName)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                                    type: checkType
                                                })
                                            }
                                        })
                                        .finally(() => {
                                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                                .then((result) => {
                                                    let friendNotifications = []
                                                    const valueToPush = {
                                                        prompt: message,
                                                        mediaType: null,
                                                        media: null,
                                                        sender: userName,
                                                        reply: replyMsg
                                                    }
                                                    if (result.exists()) {
                                                        friendNotifications = result.val()
                                                        friendNotifications.push(valueToPush)
                                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                            notifications: friendNotifications
                                                        })
                                                    }
                                                    else {
                                                        friendNotifications = []
                                                        friendNotifications.push(valueToPush)
                                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                            notifications: friendNotifications
                                                        })
                                                    }
                                                })
                                            props.otherDevices?.map((device) => {
                                                let messages = []
                                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                                    .then((msg) => {
                                                        if (msg.exists()) {
                                                            messages = msg.val()
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: replyMsg,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                        else {
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: replyMsg,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                    })
                                            })

                                        })
                                })
                        }
                    })
                scrollToBottom()
                clearOpt()
                closeReply()
            }
        }
    }

    const reSendChat = (param) => {
        const id = param[`${userName}`].id
        if (!loading) {
            setReplyMsg(() => null)
            setLoading(() => true)
            const message = param[`${userName}`].prompt
            if (message) {
                get(ref(db, "Messages/" + props.chatInfo))
                    .then((output) => {
                        if (!output.val()?.chatArray || output.val()?.chatArray == "No message" || typeof (output.val().message) == "string") {
                            set(ref(db, "Messages/" + props.chatInfo), {
                                chatArray: [{
                                    [userName]: {
                                        prompt: message,
                                        reply: param[`${userName}`]?.reply ?? null,
                                        id,
                                        uneditable: param[`${userName}`]?.uneditable ?? null
                                    }
                                }]
                            })
                                .then(() => {
                                    setMediaOption(() => true)
                                    setMediaOption(() => false)
                                    setLoading(() => false)
                                    setMicShow(() => true)
                                    if (param[`${userName}`]?.uneditable != true) {
                                        sendToNodeServer(props.chatFriendDetail?.UserName, userName, message)
                                    }
                                    const friendsList = props.mutualRender
                                    const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                                    if (getFriend && getFriend.length > 0) {
                                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                                    }
                                    set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                        user: userName
                                    })
                                    props.setChatArray(prev => {
                                        return prev.map((chat) => {
                                            if (chat) {
                                                const user = Object.keys(chat)[0]
                                                if (chat[user]?.id == id) {
                                                    return {
                                                        [user]: {
                                                            ...chat[user],
                                                            progress: sent,
                                                        }
                                                    }
                                                }
                                                return chat;
                                            }
                                        })
                                    })
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                        .then((output) => {
                                            let typingUsers = []
                                            if (output.exists()) {
                                                typingUsers = output.val()
                                                const checkType = typingUsers.filter(typer => typer != userName)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                                    type: checkType
                                                })
                                            }
                                        })
                                        .finally(() => {
                                            if (param[`${userName}`].uneditable != true) {
                                                get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                                    .then((result) => {
                                                        let friendNotifications = []
                                                        const valueToPush = {
                                                            prompt: message,
                                                            sender: userName,
                                                            reply: param[`${userName}`]?.reply ?? null,
                                                        }
                                                        if (result.exists()) {
                                                            friendNotifications = result.val()
                                                            friendNotifications.push(valueToPush)
                                                            update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                                notifications: friendNotifications
                                                            })
                                                        }
                                                        else {
                                                            friendNotifications = []
                                                            friendNotifications.push(valueToPush)
                                                            update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                                notifications: friendNotifications
                                                            })
                                                        }
                                                    })
                                            }
                                            props.otherDevices?.map((device) => {
                                                let messages = []
                                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                                    .then((msg) => {
                                                        if (msg.exists()) {
                                                            messages = msg.val()
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: param[`${userName}`]?.reply ?? null,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                        else {
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: param[`${userName}`]?.reply ?? null,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                    })
                                            })
                                        })
                                })
                        }
                        else {
                            let tempData = output.val().chatArray
                            tempData.push({
                                [userName]: {
                                    prompt: message,
                                    reply: param[`${userName}`]?.reply ?? null,
                                    id,
                                    uneditable: param[`${userName}`]?.uneditable ?? null
                                }
                            })
                            set(ref(db, "Messages/" + props.chatInfo), {
                                chatArray: tempData
                            })
                                .then(() => {
                                    userPrompt.current.value = ""
                                    setMediaOption(() => true)
                                    setMediaOption(() => false)
                                    setLoading(() => false)
                                    setMicShow(() => true)
                                    if (param[`${userName}`]?.uneditable != true) {
                                        sendToNodeServer(props.chatFriendDetail?.UserName, userName, message)
                                    }
                                    const friendsList = props.mutualRender
                                    const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)
                                    if (getFriend && getFriend.length > 0) {
                                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                                    }
                                    const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                                    let randomValue = ""
                                    for (let index = 0; index < 12; index++) {
                                        const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                                        randomValue = randomValue + generateRandom
                                    }
                                    set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                        user: randomValue
                                    })
                                    props.setChatArray(prev => {
                                        return prev.map((chat) => {
                                            if (chat) {
                                                const user = Object.keys(chat)[0]
                                                if (chat[user]?.id == id) {
                                                    return {
                                                        [user]: {
                                                            ...chat[user],
                                                            progress: sent,
                                                        }
                                                    }
                                                }
                                                return chat
                                            }
                                        })
                                    })
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                        .then((output) => {
                                            let typingUsers = []
                                            if (output.exists()) {
                                                typingUsers = output.val()
                                                const checkType = typingUsers.filter(typer => typer != userName)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                                    type: checkType
                                                })
                                            }
                                        })
                                        .finally(() => {
                                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                                .then((result) => {
                                                    let friendNotifications = []
                                                    const valueToPush = {
                                                        prompt: message,
                                                        sender: userName,
                                                        reply: param[`${userName}`]?.reply ?? null
                                                    }
                                                    if (result.exists()) {
                                                        friendNotifications = result.val()
                                                        friendNotifications.push(valueToPush)
                                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                            notifications: friendNotifications
                                                        })
                                                    }
                                                    else {
                                                        friendNotifications = []
                                                        friendNotifications.push(valueToPush)
                                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                            notifications: friendNotifications
                                                        })
                                                    }
                                                })
                                            props.otherDevices?.map((device) => {
                                                let messages = []
                                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                                    .then((msg) => {
                                                        if (msg.exists()) {
                                                            messages = msg.val()
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: param[`${userName}`]?.reply ?? null,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                        else {
                                                            messages.push({
                                                                [userName]: {
                                                                    prompt: message,
                                                                    reply: param[`${userName}`]?.reply ?? null,
                                                                    id
                                                                }
                                                            })
                                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                        }
                                                    })
                                            })

                                        })
                                })
                        }
                    })
                scrollToBottom()
            }
        }
    }

    // const forwardSendChat = async(param) =>{
    //     const random = randomGenerate()
    //     const id = `${userName}${random}`
    //     if (!loading) {
    //         setReplyMsg(()=>null)
    //         setLoading(()=>true)
    //         const message = param?.prompt
    //         if(message){
    //             get(ref(db, "Messages/"+props.chatInfo))
    //             .then((output)=>{
    //                 if(!output.val()?.chatArray || output.val()?.chatArray == "No message" || typeof(output.val().message) == "string"){
    //                     props.setChatArray(prev=>[...prev, {[userName]:{
    //                         progress: sending,
    //                         prompt:message,
    //                         reply:param?.reply ?? null,
    //                         id,
    //                     }}])
    //                     set(ref(db,"Messages/"+props.chatInfo),{
    //                         chatArray: [{[userName]:{
    //                             prompt:message,
    //                             reply:param?.reply ?? null,
    //                             id,
    //                         }}]
    //                     })
    //                     .then(()=>{
    //                         setMediaOption(()=>true)
    //                         setMediaOption(()=>false)
    //                         setLoading(()=>false)
    //                         setMicShow(()=>true)
    //                         if (param[`${userName}`]?.uneditable != true) {
    //                             sendToNodeServer(props.chatFriendDetail?.UserName, userName, message)
    //                         }
    //                         const friendsList = props.mutualRender
    //                         const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
    //                         const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

    //                         if (getFriend && getFriend.length > 0) {
    //                             props.setMutualRender([...getOtherFriend, getFriend[0]])
    //                         }
    //                         set(ref(db,`Users/${props.chatFriendDetail?.UserName}/onlineCheck`),{
    //                             user: userName
    //                         })
    //                         props.setChatArray(prev=>{
    //                             return prev.map((chat)=>{
    //                                 if (chat) {
    //                                     const user = Object.keys(chat)[0]
    //                                     if (chat[user]?.id == id) {
    //                                         return{
    //                                             [user]:{
    //                                             ...chat[user],
    //                                             progress: sent,
    //                                         }}
    //                                     }
    //                                     return chat;
    //                                 }
    //                             })
    //                         })
    //                     })
    //                     .finally(()=>{
    //                         get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
    //                         .then((output)=>{
    //                             let typingUsers = []
    //                             if (output.exists()) {
    //                                 typingUsers = output.val()
    //                                 const checkType = typingUsers.filter(typer=> typer != userName)
    //                                 update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`),{
    //                                     type: checkType
    //                                 })
    //                             } 
    //                         })
    //                         .finally(()=>{
    //                             if (param?.uneditable != true) {
    //                                 get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
    //                                 .then((result)=>{
    //                                     let friendNotifications = []
    //                                     const valueToPush = {
    //                                         prompt: message,
    //                                         sender: userName,
    //                                         reply:param?.reply  ?? null,
    //                                     }
    //                                     if (result.exists()) {
    //                                         friendNotifications = result.val()
    //                                         friendNotifications.push(valueToPush)
    //                                         update(ref(db, `Users/${props.chatFriendDetail?.UserName}`),{
    //                                             notifications : friendNotifications
    //                                         })
    //                                     }
    //                                     else{
    //                                         friendNotifications = []
    //                                         friendNotifications.push(valueToPush)
    //                                         update(ref(db, `Users/${props.chatFriendDetail?.UserName}`),{
    //                                             notifications : friendNotifications
    //                                         })
    //                                     }
    //                                 })
    //                             }
    //                             props.otherDevices?.map((device)=>{
    //                                 let messages = []
    //                                 get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
    //                                 .then((msg)=>{
    //                                     if (msg.exists()) {
    //                                         messages = msg.val()
    //                                         messages.push({
    //                                             [userName]: {
    //                                                 prompt:message,
    //                                                 reply:param?.reply  ?? null,
    //                                                 id
    //                                             }
    //                                         })
    //                                         update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
    //                                     }
    //                                     else{
    //                                         messages.push({
    //                                             [userName]: {
    //                                                 prompt:message,
    //                                                 reply:param?.reply  ?? null,
    //                                                 id
    //                                             }
    //                                         })
    //                                         update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
    //                                     }
    //                                 })
    //                             })
    //                         })
    //                     })
    //                 }
    //                 else{   
    //                         let tempData = output.val().chatArray
    //                         tempData.push({[userName]:{
    //                             prompt:message,
    //                             reply:param?.reply  ?? null,
    //                             id,
    //                             uneditable: param?.uneditable  ?? null
    //                         }})
    //                         props.setChatArray(prev=>[...prev, {[userName]:{
    //                             progress: sending,
    //                             prompt:message,
    //                             reply:param?.reply ?? null,
    //                             id,
    //                         }}])
    //                         set(ref(db,"Messages/"+props.chatInfo),{
    //                             chatArray: tempData
    //                         })
    //                         .then(()=>{
    //                             setMediaOption(()=>true)
    //                             setMediaOption(()=>false)
    //                             setLoading(()=>false)
    //                             setMicShow(()=>true)
    //                             if (param?.uneditable != true) {
    //                                 sendToNodeServer(props.chatFriendDetail?.UserName, userName, message)
    //                             }
    //                             const friendsList = props.mutualRender
    //                             const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
    //                             const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)
    //                             if (getFriend && getFriend.length > 0) {
    //                                 props.setMutualRender([...getOtherFriend, getFriend[0]])
    //                             }
    //                             const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
    //                             let randomValue = ""
    //                             for (let index = 0; index < 12; index++) {
    //                                 const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
    //                                 randomValue = randomValue + generateRandom
    //                             }
    //                             set(ref(db,`Users/${props.chatFriendDetail?.UserName}/onlineCheck`),{
    //                                 user: randomValue
    //                             })
    //                             props.setChatArray(prev=>{
    //                                 return prev.map((chat)=>{
    //                                     if (chat) {
    //                                         const user = Object.keys(chat)[0]
    //                                         if (chat[user]?.id == id) {
    //                                             return{
    //                                                 [user]:{
    //                                                 ...chat[user],
    //                                                 progress: sent,
    //                                             }}
    //                                         }
    //                                         return chat
    //                                     }
    //                                 })
    //                             })
    //                         })
    //                         .finally(()=>{
    //                             get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
    //                             .then((output)=>{
    //                                 let typingUsers = []
    //                                 if (output.exists()) {
    //                                     typingUsers = output.val()
    //                                     const checkType = typingUsers.filter(typer=> typer != userName)
    //                                     update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`),{
    //                                         type: checkType
    //                                     })
    //                                 } 
    //                             })
    //                             .finally(()=>{
    //                                     get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
    //                                     .then((result)=>{
    //                                         let friendNotifications = []
    //                                         const valueToPush = {
    //                                             prompt: message,
    //                                             sender: userName,
    //                                             reply:  param?.reply ?? null
    //                                         }
    //                                         if (result.exists()) {
    //                                             friendNotifications = result.val()
    //                                             friendNotifications.push(valueToPush)
    //                                             update(ref(db, `Users/${props.chatFriendDetail?.UserName}`),{
    //                                                 notifications : friendNotifications
    //                                             })
    //                                         }
    //                                         else{
    //                                             friendNotifications = []
    //                                             friendNotifications.push(valueToPush)
    //                                             update(ref(db, `Users/${props.chatFriendDetail?.UserName}`),{
    //                                                 notifications : friendNotifications
    //                                             })
    //                                         }
    //                                     })
    //                                 props.otherDevices?.map((device)=>{
    //                                     let messages = []
    //                                     get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
    //                                     .then((msg)=>{
    //                                         if (msg.exists()) {
    //                                             messages = msg.val()
    //                                             messages.push({
    //                                                 [userName]: {
    //                                                     prompt:message,
    //                                                     reply:param?.reply  ?? null,
    //                                                     id
    //                                                 }
    //                                             })
    //                                             update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
    //                                         }
    //                                         else{
    //                                             messages.push({
    //                                                 [userName]: {
    //                                                     prompt:message,
    //                                                     reply:param?.reply  ?? null,
    //                                                     id
    //                                                 }
    //                                             })
    //                                             update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
    //                                         }
    //                                     })
    //                                 })

    //                             })
    //                         })
    //                     }
    //             })
    //             scrollToBottom()
    //         }
    //     }
    // }

    const sendMediaChat = async () => {
        setDisplayMedia(() => false)
        const random = randomGenerate()
        const id = `${userName}${random}`
        setReplyMsg(() => null)
        setMicShow(() => true)
        vnData.current = null
        setVoiceNoteSrc(null)
        setRecordState(() => recordVoice)
        setVoicePreviewState(() => pauseBtn)
        setLoading(() => true)
        const message = collectInputTemp
        get(ref(db, "Messages/" + props.chatInfo))
            .then(async (output) => {
                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                let randomValue = ""
                for (let index = 0; index < 12; index++) {
                    const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                    randomValue = randomValue + generateRandom
                }
                let dataParticlesCollection = []
                let dataParticleSize = 15000
                if (!output.val().chatArray || output.val().chatArray == "No message" || typeof (output.val().message) == "string") {
                    props.setChatArray(prev => [...prev, {
                        [userName]: {
                            prompt: message,
                            progress: sending,
                            media: displayUrl,
                            mediaType: mediaType,
                            reply: replyMsg,
                            id
                        }
                    }])
                    const form = new FormData()
                    form.append("image", fileHolder.current)
                    const ImageUrl = await axios.post("https://tilchat-media-backend.onrender.com/uploadMedia", form, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: [{
                            [userName]: {
                                prompt: message,
                                mediaLink: ImageUrl?.data?.message,
                                mediaType: mediaType,
                                reply: replyMsg,
                                id
                            }
                        }]
                    })
                        .then(() => {
                            setCollectInputTemp(() => null)
                            setMediaOption(() => false)
                            setDisplayMedia(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            sendToNodeServer(props.chatFriendDetail?.UserName, "TIlChat", `${userName} sent you a media`)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: randomValue
                            })
                            props.setChatArray(prev => {
                                return prev.map((chat) => {
                                    if (chat) {
                                        const user = Object.keys(chat)[0]
                                        if (chat[user]?.id == id) {
                                            return {
                                                [user]: {
                                                    ...chat[user],
                                                    progress: sent,
                                                }
                                            }
                                        }
                                        return chat
                                    }
                                })
                            })
                        })
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                .then((output) => {
                                    let typingUsers = []
                                    if (output.exists()) {
                                        typingUsers = output.val()
                                        const checkType = typingUsers.filter(typer => typer != userName)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                            type: checkType
                                        })
                                    }
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                        .then((result) => {
                                            let friendNotifications = []
                                            const valueToPush = {
                                                prompt: `${userName} sent you a media`,
                                                sender: userName
                                            }
                                            if (result.exists()) {
                                                friendNotifications = result.val()
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                            else {
                                                friendNotifications = []
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                        })
                                    props.otherDevices?.map((device) => {
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                            .then((msg) => {
                                                if (msg.exists()) {
                                                    messages = msg.val()
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: replyMsg,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                                else {
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: replyMsg,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                            })
                                    })
                                })
                        })
                }
                else {
                    let tempData = output.val().chatArray
                    const blob = new Blob([displayUrl], { type: mediaType });
                    const url = URL.createObjectURL(blob);
                    props.setChatArray(prev => [...prev, {
                        [userName]: {
                            prompt: message,
                            media: displayUrl,
                            progress: sending,
                            mediaType: mediaType,
                            reply: replyMsg,
                            id
                        }
                    }])
                    const form = new FormData()
                    form.append("image", fileHolder.current)
                    const ImageUrl = await axios.post("https://tilchat-media-backend.onrender.com/uploadMedia", form, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    tempData.push({
                        [userName]: {
                            prompt: message,
                            progress: sending,
                            mediaLink: ImageUrl?.data?.message,
                            mediaType: mediaType,
                            reply: replyMsg,
                            id
                        }
                    })
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: tempData
                    })
                        .then(() => {
                            setCollectInputTemp(() => null)
                            setMediaOption(() => false)
                            setDisplayMedia(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            sendToNodeServer(props.chatFriendDetail?.UserName, "TIlChat", `${userName} sent you a media`)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: randomValue
                            })
                            props.setChatArray(prev => {
                                return prev.map((chat) => {
                                    if (chat) {
                                        const user = chat && Object.keys(chat)[0]
                                        if (chat[user]?.id == id) {
                                            return {
                                                [user]: {
                                                    ...chat[user],
                                                    progress: sent,
                                                }
                                            }
                                        }
                                        return chat
                                    }
                                })
                            })
                        })
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                .then((output) => {
                                    let typingUsers = []
                                    if (output.exists()) {
                                        typingUsers = output.val()
                                        const checkType = typingUsers.filter(typer => typer != userName)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                            type: checkType
                                        })
                                    }
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                        .then((result) => {
                                            let friendNotifications = []
                                            const valueToPush = {
                                                prompt: `${userName} sent you a media`,
                                                sender: userName
                                            }
                                            if (result.exists()) {
                                                friendNotifications = result.val()
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                            else {
                                                friendNotifications = []
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                        })
                                    props.otherDevices?.map((device) => {
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                            .then((msg) => {
                                                if (msg.exists()) {
                                                    messages = msg.val()
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: "no med",
                                                            mediaType: mediaType,
                                                            reply: replyMsg,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                                else {
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: replyMsg,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                            })
                                    })
                                })
                        })
                }
            })
        scrollToBottom()
        clearOpt()
        closeReply()
    }

    const reSendMediaChat = (param) => {
        const randoms = "abcdefghijklmnA1234567890BCDOELQPMLS"
        const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
        const mediaType = param[`${userName}`]?.mediaType
        const id = param[`${userName}`]?.id
        holdDisplayUrl.current = param[`${userName}`]?.media
        const getFile = new File([param[`${userName}`]?.media], generateRandom, { type: mediaType })
        fileHolder.current = getFile
        setReplyMsg(() => null)
        setMicShow(() => true)
        vnData.current = null
        setVoiceNoteSrc(null)
        setRecordState(() => recordVoice)
        setVoicePreviewState(() => pauseBtn)
        setLoading(() => true)
        const message = param[`${userName}`].prompt
        get(ref(db, "Messages/" + props.chatInfo))
            .then(async (output) => {
                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                let randomValue = ""
                for (let index = 0; index < 12; index++) {
                    const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                    randomValue = randomValue + generateRandom
                }
                if (!output.val().chatArray || output.val().chatArray == "No message" || typeof (output.val().message) == "string") {
                    const randoms = "abcdefghijklmnA1234567890BCDOELQPMLS"
                    const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                    const form = new FormData()
                    form.append("image", fileHolder.current)
                    const ImageUrl = await axios.post("https://tilchat-media-backend.onrender.com/uploadMedia", form, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: [{
                            [userName]: {
                                prompt: message,
                                mediaLink: ImageUrl?.data?.message,
                                mediaType: mediaType,
                                reply: param[`${userName}`]?.reply ?? null,
                                id
                            }
                        }]
                    })
                        .then(() => {
                            setCollectInputTemp(() => null)
                            setMediaOption(() => false)
                            setDisplayMedia(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            if (param[`${userName}`]?.uneditable != true) {
                                sendToNodeServer(props.chatFriendDetail?.UserName, "TIlChat", `${userName} sent you a media`)
                            }
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: randomValue
                            })
                            props.setChatArray(prev => {
                                return prev.map((chat) => {
                                    if (chat) {
                                        const user = Object.keys(chat)[0]
                                        if (chat[user]?.id == id) {
                                            return {
                                                [user]: {
                                                    ...chat[user],
                                                    progress: sent,
                                                }
                                            }
                                        }
                                        return chat
                                    }
                                })
                            })
                        })
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                .then((output) => {
                                    let typingUsers = []
                                    if (output.exists()) {
                                        typingUsers = output.val()
                                        const checkType = typingUsers.filter(typer => typer != userName)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                            type: checkType
                                        })
                                    }
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                        .then((result) => {
                                            let friendNotifications = []
                                            const valueToPush = {
                                                prompt: `${userName} sent you a media`,
                                                sender: userName
                                            }
                                            if (result.exists()) {
                                                friendNotifications = result.val()
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                            else {
                                                friendNotifications = []
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                        })
                                    props.otherDevices?.map((device) => {
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                            .then((msg) => {
                                                if (msg.exists()) {
                                                    messages = msg.val()
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: param[`${userName}`]?.reply ?? null,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                                else {
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: param[`${userName}`]?.reply ?? null,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                            })
                                    })
                                })
                        })
                }
                else {
                    let tempData = output.val().chatArray
                    const blob = new Blob([holdDisplayUrl.current], { type: mediaType });
                    const url = URL.createObjectURL(blob);
                    const form = new FormData()
                    form.append("image", fileHolder.current)
                    const ImageUrl = await axios.post("https://tilchat-media-backend.onrender.com/uploadMedia", form, {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                    tempData.push({
                        [userName]: {
                            prompt: message,
                            progress: sending,
                            mediaLink: ImageUrl?.data?.message,
                            mediaType: mediaType,
                            reply: param[`${userName}`]?.reply ?? null,
                            id
                        }
                    })
                    set(ref(db, "Messages/" + props.chatInfo), {
                        chatArray: tempData
                    })
                        .then(() => {
                            setCollectInputTemp(() => null)
                            setMediaOption(() => false)
                            setDisplayMedia(() => false)
                            setLoading(() => false)
                            setMicShow(() => true)
                            if (param[`${userName}`]?.uneditable != true) {
                                sendToNodeServer(props.chatFriendDetail?.UserName, "TIlChat", `${userName} sent you a media`)
                            }
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                user: randomValue
                            })
                            props.setChatArray(prev => {
                                return prev.map((chat) => {
                                    if (chat) {
                                        const user = Object.keys(chat)[0]
                                        if (chat[user]?.id == id) {
                                            return {
                                                [user]: {
                                                    ...chat[user],
                                                    progress: sent,
                                                }
                                            }
                                        }
                                        return chat
                                    }
                                })
                            })
                        })
                        .finally(() => {
                            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                .then((output) => {
                                    let typingUsers = []
                                    if (output.exists()) {
                                        typingUsers = output.val()
                                        const checkType = typingUsers.filter(typer => typer != userName)
                                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                            type: checkType
                                        })
                                    }
                                })
                                .finally(() => {
                                    get(ref(db, `Users/${props.chatFriendDetail?.UserName}/notifications`))
                                        .then((result) => {
                                            let friendNotifications = []
                                            const valueToPush = {
                                                prompt: `${userName} sent you a media`,
                                                sender: userName
                                            }
                                            if (result.exists()) {
                                                friendNotifications = result.val()
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                            else {
                                                friendNotifications = []
                                                friendNotifications.push(valueToPush)
                                                update(ref(db, `Users/${props.chatFriendDetail?.UserName}`), {
                                                    notifications: friendNotifications
                                                })
                                            }
                                        })
                                    props.otherDevices?.map((device) => {
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                            .then((msg) => {
                                                if (msg.exists()) {
                                                    messages = msg.val()
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: param[`${userName}`]?.reply ?? null,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                                else {
                                                    messages.push({
                                                        [userName]: {
                                                            prompt: message,
                                                            media: ImageUrl?.data?.message,
                                                            mediaType: mediaType,
                                                            reply: param[`${userName}`]?.reply ?? null,
                                                            id
                                                        }
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                }
                                            })
                                    })
                                })
                        })
                }
            })
        scrollToBottom()
    }

    const changeMediaOption = () => {
        if (mediaOption) {
            setMediaOption(() => false)
        }
        else {
            setMediaOption(() => true)
        }
    }
    const displayGallery = async (e) => {
        const file = e.target.files[0]
        setMediaOption(false)
        if (file.type > 5000000) {
            alert("file size it too big")
            return
        }

        try {
            const result = await reduceMediaQualityToFile(file, 0.7, 800);
            const blob = new Blob([result.file], { type: result.file.type })
            setDisplayUrl(() => blob)
            if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
                setMediaType(() => "image")
                setDisplayMedia(() => true)
                setMediaFileName(() => file.name)
            }
            else if (file.type == "video/mp4") {
                setMediaType(() => "video")
                setDisplayMedia(() => true)
                setMediaFileName(() => file.name)
            }

            else {
                alert("Invalid media type")
            }
        } catch (error) {

        }

    }
    const documentUpload = (e) => {
        const file = e.target.files[0]
        const reader = new FileReader
        reader.addEventListener("load", (e) => {
            const bufferResult = e.target.result
            const uint8Array = new Uint8Array(bufferResult)
            setDisplayUrl(() => uint8Array)
            setMediaType(() => file.type)
            setDisplayMedia(() => true)
        })
        reader.readAsDataURL(file)
    }
    useEffect(() => {
        const fetchMedia = async () => {
            const arrayToMap = props.chatArray
            let arrayToAdjust = props.chatArray
            for (let index = 0; index < arrayToMap.length; index++) {
                const output = arrayToMap[index]
                if (output) {
                    const user = Object.keys(output)[0]
                    const userData = output[user]
                    if (user != userName && userData?.mediaLink && !userData?.media) {
                        const blob = await fetch(userData?.mediaLink).then(res => res.blob())
                        const url = URL.createObjectURL(blob);
                        props.setChatArray(prev => prev.map((data, i) =>
                            i == index ? { ...data, [user]: { ...data[user], media: blob } } : data
                        ))
                        // get(ref(db, `Media/${userData.mediaLink}`))
                        // .then((response)=>{
                        //     if (response.exists()) {
                        //         const allChunks = response.val()
                        //         let collectData = []
                        //         allChunks?.map((output, index) => {
                        //             collectData.push(output.data)
                        //         })
                        //         const uint8Chunks = collectData.map(chunk => new Uint8Array(chunk));
                        //         
                        //     }
                        // })
                    }
                }
            }
        }
        fetchMedia()
    }, [props.chatArray])

    const changeShowType = () => {
        if (window.innerWidth <= 800) {
            setAccessChat(true)
            setPreviewBlock(false)
            setOnChat(false)
            get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                .then((output) => {
                    let typingUsers = []
                    if (output.exists()) {
                        typingUsers = output.val()
                        const checkType = typingUsers.filter(typer => typer != userName)
                        update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                            type: checkType
                        })
                    }
                })
            navigate("/menu")
        }
    }

    const ReplyComponent = ({ id, user }) => {
        if (id && user) {

            const filterChat = props.chatArray.filter(friend => friend && user && friend[user] && friend[user]?.id == id)
            if (filterChat && filterChat.length > 0) {
                return (
                    <div className='repliedMsg' disabled onClick={() => { locateReply(id) }}>
                        <div className='mediaParent'>
                            {filterChat[0][user]?.media ?
                                <div className='mediaPrev' disabled>
                                    <MediaTypesSelect type={filterChat[0][user].mediaType} data={filterChat[0][user].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType={previewType} statusPreview={statusPreview} />
                                </div>
                                : null}
                            <h5>{filterChat[0][user]?.prompt}</h5>
                        </div>
                        {filterChat[0][user].voiceNote ? <audio src={filterChat[0][user].voiceNote} controls></audio> : null}
                    </div>
                )
            }
        }
    }

    const locateReply = (id) => {
        const element = document.getElementById(id)
        element.scrollIntoView({ behavior: "auto", block: "nearest", inline: "start" })
        element.style.background = "#36323273"
        setTimeout(() => {
            element.style.background = ""
        }, 1000);
    }

    // const [moreOption, setMoreOption] = useState(true) 
    const displayOpt = (e, id) => {
        const parent = e?.target?.offsetParent
        const option = parent.children[0]
        document.querySelectorAll(".optionList").forEach((opt) => {
            opt.style.display = "none"
        })
        document.querySelectorAll(".moreIcon").forEach((icon) => {
            icon.style.display = "none"
        })
        document.querySelector(".wallpapper").style.filter = "invert(0) blur(10px) opacity(.5)"
        document.querySelectorAll(".request").forEach((chat) => {
            chat.style.filter = "blur(10px)"
            chat.style.pointerEvent = "none"
        })
        document.querySelectorAll(".response").forEach((chat) => {
            chat.style.filter = "blur(10px)"
            chat.style.pointerEvent = "none"
        })
        document.getElementById(id).style.filter = "blur(0px)"
        document.getElementById(id).style.pointerEvent = "d"
        option.style.display = "flex"
        if (window.innerWidth <= 550) {
            document.querySelectorAll(".optET").forEach((opt) => {
                opt.style.flexDirection = "column-reverse"
            })
            document.querySelectorAll(`.response .optionList`).forEach((opt) => {
                opt.style.marginLeft = "42px"
            })
            document.querySelectorAll(`.request .optionList`).forEach((opt) => {
                opt.style.marginRight = "42px"
            })
            document.querySelectorAll(".view-overall .welcome-view-ai .chat-log .response .optET").forEach((optET) => {
                optET.style.alignItems = "flex-start"
            })
        }
    }

    const clearOpt = (e) => {
        if (e?.target?.className == "moreIcon") {
            return
        }
        document.querySelector(".wallpapper").style.filter = "invert(0) blur(0px) opacity(.5)"
        setFriendOptions(() => false)
        // setMediaOption(false)
        document.querySelectorAll(".optionList").forEach((opt) => {
            opt.style.display = "none"
        })
        document.querySelectorAll(".moreIcon").forEach((icon) => {
            icon.style.display = "block"
        })
        document.querySelectorAll(".request").forEach((chat) => {
            chat.style.filter = "blur(0px)"
            chat.style.pointerEvent = "d"
        })
        document.querySelectorAll(".response").forEach((chat) => {
            chat.style.filter = "blur(0px)"
            chat.style.pointerEvent = "d"
        })
        return
    }

    const holdTimer = useRef()

    const startHold = (e, id) => {
        e.preventDefault()
        holdTimer.current = setTimeout(() => {
            displayOpt(e, id)
        }, 300);
    }

    const cancelHold = () => {
        clearTimeout(holdTimer.current)
    }

    const copyChat = async (text) => {
        await navigator.clipboard.writeText(text)
        setAlertBlock(true)
        setAlertPrompt("Text Copied!")
    }

    useEffect(() => {
        if (alertReturn == "Done") {
            setAlertBlock(false)
            setAlertReturn()
        }
    }, [alertReturn])

    const holdEditingId = useRef()
    const editChat = (chat) => {
        setEditPrompt(chat.prompt)
        setEditBlock(true)
        holdEditingId.current = chat.id

    }


    useEffect(() => {
        setEditBlock(false)
        if (editReturn == true) {
            if (holdEditingId.current) {

                props.setChatArray(prev => {
                    return prev.map((output) => {
                        if (output) {
                            let user
                            const obj = Object.keys(output)
                            if (obj && obj.length > 0) {
                                user = obj[0]
                            }
                            if (output[user]?.id == holdEditingId.current) {
                                return {
                                    [user]: {
                                        ...output[user],
                                        progress: sending,
                                        prompt: editPrompt,
                                        uneditable: true
                                    }
                                }
                            }
                        }
                        return output
                    })
                })
            }
            setEditReturn()
            setEditPrompt()
        }
        else if (editReturn == false) {
            setEditReturn()
            holdEditingId.current = undefined
            setEditPrompt()

        }
    }, [editReturn])

    const starChat = (param) => {
        const id = param.id
        props.setChatArray(prev => {
            return prev.map((output) => {
                if (output) {
                    const user = Object.keys(output)[0]
                    if (output[user].id == id) {
                        return {
                            [user]: {
                                ...output[user],
                                star: true
                            }
                        }
                    }
                    return output
                }
            })
        })
    }

    const unStarChat = (param) => {
        const id = param.id
        props.setChatArray(prev => {
            return prev.map((output) => {
                if (output) {
                    const user = Object.keys(output)[0]
                    if (output[user].id == id) {
                        return {
                            [user]: {
                                ...output[user],
                                star: false
                            }
                        }
                    }
                    return output
                }
            })
        })
    }
    const holdDeleteId = useRef()
    const deleteChat = (param, user) => {
        holdDeleteId.current = param.id
        if (user == 'request') {
            setDeleteUserType(true)
        }
        else {
            setDeleteUserType(false)
        }
        setDeleteBlock(true)
    }

    useEffect(() => {
        if (deleteReturn == "cancel") {
            setDeleteBlock(false)
            holdDeleteId.current = ""
            setDeleteUserType()
            setDeleteReturn()
        }
        else if (deleteReturn == "for everyone") {
            const id = holdDeleteId.current
            holdDeleteId.current = ""
            setDeleteBlock(false)
            setDeleteUserType()
            setDeleteReturn()
            let deletedArray = []
            get(ref(db, `DeletedMsg/${props.chatInfo}`))
                .then((output) => {
                    if (output.val()) {
                        deletedArray = output.val()
                        deletedArray.push(id)
                        set(ref(db, `DeletedMsg`), {
                            [props.chatInfo]: deletedArray
                        })
                    }
                    else {
                        deletedArray.push(id)
                        set(ref(db, `DeletedMsg`), {
                            [props.chatInfo]: deletedArray
                        })
                    }
                })
                .finally(() => {
                    props.setChatArray(prev => {
                        return prev.map((output) => {
                            if (output) {
                                const user = Object.keys(output)[0]
                                if (output[user].id == id) {
                                    return {
                                        [user]: {
                                            deleted: true
                                        }
                                    }
                                }
                                return output
                            }
                        })
                    })
                })
        }
        else if (deleteReturn == "for me") {
            const id = holdDeleteId.current
            holdDeleteId.current = ""
            setDeleteBlock(false)
            setDeleteUserType()
            setDeleteReturn()
            props.otherDevices?.map((device) => {
                get(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.chatInfo}/chat`))
                    .then((Dmsg) => {
                        let deletedMsg = []
                        if (Dmsg.exists()) {
                            deletedMsg = Dmsg.val()
                        }
                        deletedMsg.push(id)
                        set(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.chatInfo}`), {
                            chat: deletedMsg
                        })
                    })
            })
            props.setChatArray(prev => {
                return prev.map((output) => {
                    if (output) {
                        const user = Object.keys(output)[0]
                        if (output[user].id == id) {
                            return {
                                [user]: {
                                    deleted: true
                                }
                            }
                        }
                        return output
                    }
                })
            })
        }
    }, [deleteReturn])

    useEffect(() => {
        if (props.chatInfo) {
            if (onChat) {
                const checkDelete = onValue(ref(db, `DeletedMsg/${props.chatInfo}`), (output) => {
                    if (output.val()) {
                        if (props.chatInfo == userName + props.chatFriendDetail?.UserName || props.chatInfo == props.chatFriendDetail?.UserName + userName) {
                            const deletedArray = output.val()
                            deletedArray.map((id) => {
                                props.setChatArray(prev => {
                                    return prev.map((output) => {
                                        if (output) {
                                            const user = Object.keys(output)[0]
                                            if (output[user].id == id) {
                                                return {
                                                    [user]: {
                                                        deleted: true
                                                    }
                                                }
                                            }
                                            return output
                                        }
                                    })
                                })
                            })
                            props.otherDevices?.map((device) => {
                                get(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((Dmsg) => {

                                        let deletedMsg = []
                                        if (Dmsg.exists()) {
                                            deletedMsg = Dmsg.val()
                                        }
                                        deletedArray.map((id) => {
                                            deletedMsg.push(id)
                                        })
                                        set(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.chatInfo}`), {
                                            chat: deletedMsg
                                        })
                                    })
                            })
                            set(ref(db, `DeletedMsg/${props.chatInfo}`), null)
                        }
                    }
                })
                return checkDelete
            }
        }
    }, [props.chatInfo, props.chatArray, props.chatFriendDetail])

    const currentKeyIndex = useRef(0)
    const apiKeys = useRef([
        process.env.REACT_APP_API_KEY_1,
        process.env.REACT_APP_API_KEY_2,
        process.env.REACT_APP_API_KEY_3,
        process.env.REACT_APP_API_KEY_4,
        process.env.REACT_APP_API_KEY_5,
        process.env.REACT_APP_API_KEY_6,
        process.env.REACT_APP_API_KEY_7,
        process.env.REACT_APP_API_KEY_8,
        process.env.REACT_APP_API_KEY_9,
        process.env.REACT_APP_API_KEY_10,
        process.env.REACT_APP_API_KEY_11,
        process.env.REACT_APP_API_KEY_12,
        process.env.REACT_APP_API_KEY_13,
        process.env.REACT_APP_API_KEY_14
    ])

    const summarizeChat = async (prompt, user) => {
        const ai = new GoogleGenAI({
            apiKey: apiKeys.current[currentKeyIndex.current]
        })
        setQuickSummaryBlock(true)
        setSummaryPrompt(prompt)
        setSummaryResult()
        try {
            if (user == "request") {
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash-lite",
                    contents: `i'm chatting with someone, i typed this to the person an i need quick summary on it: ${prompt}`
                })
                const formatedText = result.text.replace(/\*\*/g, '')
                setSummaryResult(formatedText)
            }
            else {
                const result = await ai.models.generateContent({
                    model: "gemini-2.5-flash-lite",
                    contents: `i'm chatting with someone and the person said this, i need quick summary on it: ${prompt}`
                });
                const formatedText = result.text.replace(/\*\*/g, '')
                setSummaryResult(formatedText)
            }
        }
        catch (error) {
            if (currentKeyIndex.current >= apiKeys.current.length - 1) {
            }
            else {
                currentKeyIndex.current = currentKeyIndex.current + 1
                summarizeChat(prompt, user)
            }
        }
    }

    const forwardChat = (param) => {
        setForwardBlock(true)
        props.forwardCred.current = param
    }

    const showProfile = () => {
        setPreviewBlock(true)
        clearOpt()
    }

    const checkFriendOption = () => {
        if (friendOptions) {
            setFriendOptions(() => false)
        }
        else {
            document.querySelector(".wallpapper").style.filter = "invert(0) blur(10px) opacity(.5)"
            setFriendOptions(() => true)
            document.querySelectorAll(".request").forEach((chat) => {
                chat.style.filter = "blur(10px)"
                chat.style.pointerEvent = "none"
            })
            document.querySelectorAll(".response").forEach((chat) => {
                chat.style.filter = "blur(10px)"
                chat.style.pointerEvent = "none"
            })
        }
    }


    useEffect(() => {
        if (props.triggerSend) {
            previewUsers()
        }
        props.setTriggerSend(false)
        props.setTriggerForward(false)
    }, [props.triggerSend])

    const sendForwardMsg = async (info) => {
        const userCred = props.mutualRender.filter(user => user?.UserName + userName == info || userName + user?.UserName == info)
        props.setChatFriendDetail(userCred[0])
        props.setChatInfo(info)
        localTriggerSend.current = true

    }

    useEffect(() => {
        if (localTriggerSend.current) {
            const output = props.forwardCred.current
            const random = randomGenerate()
            const id = `${userName}${random}`
            output.id = id
            output.progress = sending
            getChat(props.chatInfo)
                .then((chatLog) => {
                    if (chatLog) {
                        props.setChatArray(chatLog)
                        props.setChatArray(prev => [...prev, { [userName]: output }])
                        localTriggerSend.current = false
                    }
                    else {
                        props.setChatArray([])
                    }
                })
        }
    }, [props.chatInfo])

    const previewUsers = async () => {
        const allInfo = props.forwardChatInfo.current
        for (const info of allInfo) {
            await sendForwardMsg(info)

            // if (output?.voiceNote) {
            //     sendVN(output)
            // }
            // else if(output?.media && output?.mediaType){
            //     sendMediaChat(output)
            // }
            // else{
            //     if (output?.id) {
            //         alert()
            //         await forwardSendChat(output)
            //     }
            // }
        }
    }

    const archiveFriend = (detail) => {
        get(ref(db, `Archived/${userName}`))
            .then((output) => {
                let allValue = []
                if (output.val()) {
                    const filterBlocked = output.val().filter(all => all != detail.UserName)
                    allValue = filterBlocked
                }
                allValue.push(detail.UserName)
                update(ref(db, `Archived`), {
                    [userName]: allValue
                })
                    .then((output) => {
                        props.setArchivedArray(prev => [...prev, detail.UserName])
                    })
            })
            .finally(() => {
                setArchived(true)
                clearOpt()
            })

    }

    const unarchiveFriend = (detail) => {
        get(ref(db, `Archived/${userName}`))
            .then((output) => {
                if (output.exists()) {
                    let holdValue = output.val()
                    const filterUser = holdValue.filter(friend => friend != detail.UserName)
                    update(ref(db, `Archived`), {
                        [userName]: filterUser
                    })
                        .then(() => {
                            props.setArchivedArray(filterUser)
                        })
                }
            })
            .finally(() => {
                setArchived(false)
                clearOpt()
            })
    }

    const clearChat = () => {
        setClearChatPrompt(true)
        clearOpt()
    }
    useEffect(() => {
        if (clearChatReturn) {
            props.setChatArray([])
            saveChat(props.chatInfo, props.chatArray)
            setClearChatReturn(false)
        }
    }, [clearChatReturn])

    const blockChat = () => {
        const friendName = props.chatFriendDetail?.UserName
        if (!friendName) {
            clearOpt()
            return
        }
        get(ref(db, `Blocked/${friendName}`))
            .then((output) => {
                let allBlocked = []
                if (output.exists()) {
                    const filterBlocked = output.val().filter(all => all != userName)
                    allBlocked = (filterBlocked)
                }
                allBlocked.push(userName)
                update(ref(db, `Blocked`), {
                    [friendName]: allBlocked
                })
                    .then(() => {
                        clearOpt()
                        props.setChatBlocked(prev => [...prev, friendName])
                        let holdBlocked = props.chatBlocked
                        holdBlocked.push(friendName)
                        update(ref(db, `UserBlock`), {
                            [userName]: holdBlocked
                        })
                        setChatBlocked(true)
                    })
            })
    }


    const unBlockChat = () => {
        const friendName = props.chatFriendDetail?.UserName
        if (!friendName) {
            clearOpt()
            return
        }
        get(ref(db, `Blocked/${friendName}`))
            .then((output) => {
                if (output.exists()) {
                    const filterBlocked = output.val().filter(all => all != userName)

                    update(ref(db, `Blocked`), {
                        [friendName]: filterBlocked
                    })
                        .then(() => {
                            clearOpt()
                            let holdBlocked = props.chatBlocked
                            if (holdBlocked) {
                                holdBlocked.filter(friend => friend != friendName)
                            }
                            props.setChatBlocked(holdBlocked)
                            update(ref(db, `UserBlock`), {
                                [userName]: holdBlocked
                            })
                            setChatBlocked(false)
                        })
                }
                else {
                    clearOpt()
                    let holdBlocked = props.chatBlocked
                    const filterHoldBlock = holdBlocked.filter(friend => friend != friendName)
                    props.setChatBlocked(filterHoldBlock)
                    update(ref(db, `UserBlock`), {
                        [userName]: filterHoldBlock
                    })
                    setChatBlocked(false)
                }
            })
    }

    const callFriend = (output, callType) => {
        props.setCallActive(true)
        props.setCallBlock(true)
        props.setCallChatInfo(props.chatInfo)
        props.setCurrentCallWallpaper(friendWallpaper)
        setVoiceCall(true)
        if (window.innerWidth <= 600) {
            props.setDisplayCallBlock("mobile")
        }
        else {
            props.setDisplayCallBlock("display")
        }
        props.setCurrentCallCred(output)
        const random = randomGenerate()
        const id = `${userName}${random}`
        props.setCallChatId(id)
        if (!loading) {
            setReplyMsg(() => null)
            setLoading(() => true)
            get(ref(db, "Messages/" + props.chatInfo))
                .then((output) => {
                    if (!output.val()?.chatArray || output.val()?.chatArray == "No message" || typeof (output.val().message) == "string") {
                        props.setChatArray(prev => [...prev, {
                            [userName]: {
                                call: callType,
                                acccept: "outgoing",
                                id
                            }
                        }])
                        set(ref(db, "Messages/" + props.chatInfo), {
                            chatArray: [{
                                [userName]: {
                                    call: callType,
                                    acccept: "incoming",
                                    id
                                }
                            }]
                        })
                            .then(() => {
                                setMediaOption(() => true)
                                setMediaOption(() => false)
                                setLoading(() => false)
                                setMicShow(() => true)
                                sendToNodeServer(props.chatFriendDetail?.UserName, userName, `${userName} is calling you on voice`)
                                const friendsList = props.mutualRender
                                const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                                const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)

                                if (getFriend && getFriend.length > 0) {
                                    props.setMutualRender([...getOtherFriend, getFriend[0]])
                                }
                                set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                    user: userName
                                })
                                props.setChatArray(prev => {
                                    return prev.map((chat) => {
                                        const user = Object.keys(chat)[0]
                                        if (chat[user]?.id == id) {
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
                            .finally(() => {
                                get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                    .then((output) => {
                                        let typingUsers = []
                                        if (output.exists()) {
                                            typingUsers = output.val()
                                            const checkType = typingUsers.filter(typer => typer != userName)
                                            update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                                type: checkType
                                            })
                                        }
                                    })
                                    .finally(() => {
                                        props.otherDevices?.map((device) => {
                                            let messages = []
                                            get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                                .then((msg) => {
                                                    if (msg.exists()) {
                                                        messages = msg.val()
                                                        messages.push({
                                                            [userName]: {
                                                                call: callType,
                                                                acccept: "outgoing",
                                                                id
                                                            }
                                                        })
                                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                    }
                                                    else {
                                                        messages.push({
                                                            [userName]: {
                                                                call: callType,
                                                                acccept: "outgoing",
                                                                id
                                                            }
                                                        })
                                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                    }
                                                })
                                        })
                                    })
                            })
                    }
                    else {
                        let tempData = output.val().chatArray
                        tempData.push({
                            [userName]: {
                                call: callType,
                                acccept: "incoming",
                                id
                            }
                        })
                        props.setChatArray(prev => [...prev, {
                            [userName]: {
                                call: callType,
                                acccept: "outgoing",
                                id
                            }
                        }])
                        set(ref(db, "Messages/" + props.chatInfo), {
                            chatArray: tempData
                        })
                            .then(() => {
                                setMediaOption(() => true)
                                setMediaOption(() => false)
                                setLoading(() => false)
                                setMicShow(() => true)
                                sendToNodeServer(props.chatFriendDetail?.UserName, userName, `${userName} is calling you on voice`)
                                const friendsList = props.mutualRender
                                const getFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName == friend.UserName)
                                const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail?.UserName != friend.UserName)
                                if (getFriend && getFriend.length > 0) {
                                    props.setMutualRender([...getOtherFriend, getFriend[0]])
                                }
                                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                                let randomValue = ""
                                for (let index = 0; index < 12; index++) {
                                    const generateRandom = randoms[Math.floor(Math.random() * randoms.length)]
                                    randomValue = randomValue + generateRandom
                                }
                                set(ref(db, `Users/${props.chatFriendDetail?.UserName}/onlineCheck`), {
                                    user: randomValue
                                })
                                props.setChatArray(prev => {
                                    return prev.map((chat) => {
                                        if (chat) {
                                            const user = Object.keys(chat)[0]
                                            if (chat[user]?.id == id) {
                                                return {
                                                    [user]: {
                                                        ...chat[user],
                                                        progress: sent,
                                                    }
                                                }
                                            }
                                            return chat;
                                        }
                                    })
                                })
                            })
                            .finally(() => {
                                get(ref(db, `Users/${props.chatFriendDetail?.UserName}/type/type`))
                                    .then((output) => {
                                        let typingUsers = []
                                        if (output.exists()) {
                                            typingUsers = output.val()
                                            const checkType = typingUsers.filter(typer => typer != userName)
                                            update(ref(db, `Users/${props.chatFriendDetail?.UserName}/type`), {
                                                type: checkType
                                            })
                                        }
                                    })
                                    .finally(() => {
                                        props.otherDevices?.map((device) => {
                                            let messages = []
                                            get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                                .then((msg) => {
                                                    if (msg.exists()) {
                                                        messages = msg.val()
                                                        messages.push({
                                                            [userName]: {
                                                                call: callType,
                                                                acccept: "outgoing",
                                                                id
                                                            }
                                                        })
                                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                    }
                                                    else {
                                                        messages.push({
                                                            [userName]: {
                                                                call: callType,
                                                                acccept: "outgoing",
                                                                id
                                                            }
                                                        })
                                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), { chat: messages })
                                                    }
                                                })
                                        })

                                    })
                            })
                    }
                })
            scrollToBottom()
            clearOpt()
            closeReply()
        }
    }

    const voiceCallFriend = (output) => {
        props.setCallType("voice")
        callFriend(output, "voice")
    }
    const videoCallFriend = (output) => {
        props.setCallType("video")
        callFriend(output, "video")
    }

    return (
        <main className='main-overall' style={{ display: "flex", width: "calc(100% - 00px)" }}>
            <img src={friendWallpaper} className="wallpapper" alt="" />
            {displayMedia ?
                <ChatMediaSend displayUrl={displayUrl} setDisplayMedia={setDisplayMedia} mediaType={mediaType} sendMediaChat={sendMediaChat} setCollectInputTemp={setCollectInputTemp} collectInputTemp={collectInputTemp} loading={loading} /> :
                <div className="main-parent">
                    {previewBlock ? <ProfiileView setFriendsWallpaper={props.setFriendsWallpaper} setWallPaperArray={props.setWallPaperArray} friendsWallpaper={props.friendsWallpaper} wallPaperArray={props.wallPaperArray} userCredentials={props.chatFriendDetail} state={setPreviewBlock} /> : null}
                    {props.displayCallBlock == "display" ? <Call localVideoTrack={props.localVideoTrack} remoteVideoTrack={props.remoteVideoTrack} setVideoView={props.setVideoView} videoView={props.videoView} localAudio={props.localAudio} remoteAudio={props.remoteAudio} callType={props.callType} cleanupCall={props.cleanupCall} handleEndCall={props.handleEndCall} setCallEnded={props.setCallEnded} setCurrentIncomingCall={props.setCurrentIncomingCall} callAccepted={props.callAccepted} callTimerDown={props.callTimerDown} callEndTimer={props.callEndTimer} setCallType={props.setCallType} setDisplayCallBlock={props.setDisplayCallBlock} setCurrentCallWallpaper={props.setCurrentCallWallpaper} setChatFriendDetail={props.setChatFriendDetail} setChatInfo={props.setChatInfo} setChatState={props.setChatState} setCallChatInfo={props.setCallChatInfo} callChatInfo={props.callChatInfo} setCallActive={props.setCallActive} callActive={props.callActive} setMicActive={props.setMicActive} micActive={props.micActive} currentCount={props.currentCount} setCurrentCount={props.setCurrentCount} setCallBlock={props.setDisplayCallBlock} currentCallCred={props.currentCallCred} /> : null}
                    <div className={previewBlock ? "previewBlockCheck view-overall" : "view-overall"}>
                        {previewMedia ? <PreviewMedia previewSrc={previewSrc.current} previewType={previewType.current} setPreviewMedia={setPreviewMedia} /> : null}
                        {forwardBlock ? <ForwardDialogue forwardCred={props.forwardCred} setTriggerForward={props.setTriggerForward} forwardArray={props.forwardArray} mutualRender={props.mutualRender} state={setForwardBlock} /> : null}
                        <header>
                            {
                                props.chatFriendDetail?.type == "group" ?
                                    <div className="profile">
                                        <img src={profileArrow} className='navigateArrow' onClick={changeShowType} />
                                        <img onClick={showProfile} src={props.chatFriendDetail?.groupImg == "default" || !props.chatFriendDetail?.groupImg ? groupImg : props.chatFriendDetail?.groupImg} alt="" style={{ filter: "invert(0) opacity(.8)", border: "2px solidrgb(0, 4, 222)" }} />
                                        <div style={{ display: "flex", flexDirection: "column" }} onClick={showProfile}>
                                            <p>{props.chatFriendDetail?.name}</p>
                                            {friendTyping ? <small style={{ color: 'whitesmoke' }}>Typing...</small> : <small style={{ color: 'whitesmoke' }}>@group</small>}
                                        </div>
                                    </div>
                                    :
                                    <div className="profile">
                                        <img src={profileArrow} className='navigateArrow' onClick={changeShowType} />
                                        <img onClick={showProfile} src={props.chatFriendDetail?.profilePic == "/src/images/user.png" || props.chatFriendDetail?.profilePic == "/assets/user.png" ? userImg : props.chatFriendDetail?.profilePic} alt="" style={{ filter: "invert(0) opacity(.8)", border: "2px solidrgb(0, 4, 222)" }} />
                                        <div style={{ display: "flex", flexDirection: "column" }} onClick={showProfile}>
                                            <p>{props.chatFriendDetail?.FullName}</p>
                                            {friendTyping ? <small style={{ color: 'whitesmoke' }}>Typing...</small> : <small style={{ color: 'whitesmoke' }}>@{props.chatFriendDetail?.UserName}</small>}
                                        </div>
                                    </div>
                            }
                            <div className="settings">
                                <img onClick={() => voiceCallFriend(props.chatFriendDetail)} src={voiceCallIcon} alt="" />
                                <img onClick={() => videoCallFriend(props.chatFriendDetail)} src={videoCallIcon} alt="" />
                                <img src={more} onClick={checkFriendOption} alt="" title='delete' />
                                <div className="profileOptionList" style={friendOptions == true ? { display: "flex" } : null}>
                                    <div className="option" onClick={showProfile}><p>Info</p></div>
                                    {archived ? <div className="option" onClick={() => unarchiveFriend(props.chatFriendDetail)}><p>Unarchive Chat </p></div> : <div className="option" onClick={() => archiveFriend(props.chatFriendDetail)}><p>Archive Chat </p></div>}
                                    <div className="option" onClick={clearChat}><p>Clear Chat</p></div>
                                    {chatBlocked ? <div className="option" onClick={unBlockChat}><p>Unblock</p></div> : <div className="option" onClick={blockChat}><p>Block</p></div>}
                                    <div className="option"><p>Delete Chat</p></div>
                                </div>
                            </div>
                        </header>
                        <div className='welcome-view-ai'>
                            {editBlock ? <EditDialogue setEditPrompt={setEditPrompt} prompt={editPrompt} returnState={setEditReturn} /> : null}
                            {alertBlock ? <AlertComponent query={alertQuery} prompt={alertPrompt} returnState={setAlertReturn} /> : null}
                            {deleteBlock ? <DeleteDialogue returnState={setDeleteReturn} userType={deleteUserType} /> : null}
                            {quickSummaryBlock ? <QuickSummary state={setQuickSummaryBlock} prompt={summaryPrompt} result={summaryResult} /> : null}
                            {clearChatPrompt ? <ClearChatPrompt setClearChatPrompt={setClearChatPrompt} setClearChatReturn={setClearChatReturn} /> : null}
                            <div className='chat-log-overflow' onClick={(e) => { clearOpt(e) }}>
                                <div className="chat-log blurItem">
                                    {
                                        props.chatArray.map((output, index) => {
                                            if (output) {
                                                if (Object.keys(output)[0] == userName) {
                                                    return (
                                                        <div className='request chat-request' key={index} id={output[`${userName}`]?.id ? output[`${userName}`]?.id : ""} onDoubleClick={() => { reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`) }} onDrag={() => { reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`) }} draggable>
                                                            <div className="optET">
                                                                {output[`${Object.keys(output)[0]}`].deleted == true ? null :
                                                                    <div id={`${output[`${userName}`]?.id}opt`} className="optionList" >
                                                                        <div className="option" onClick={() => { reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`) }}><p>Reply ↩️</p></div>
                                                                        <div className="option" onClick={() => { forwardChat(output[`${Object.keys(output)[0]}`]) }}><p>Forward ⏩️</p></div>
                                                                        <div className="option" onClick={() => copyChat(output[`${userName}`].prompt)}><p>Copy 📋</p></div>
                                                                        {output[`${Object.keys(output)[0]}`].star == true ? <div className="option" onClick={() => { unStarChat(output[`${userName}`]) }}><p>unstar ☆</p></div> : <div className="option" onClick={() => { starChat(output[`${userName}`]) }}><p>Star ⭐</p></div>}
                                                                        {output[`${userName}`]?.uneditable == true || output[`${userName}`].voiceNote ? null : <div className="option" onClick={() => { editChat(output[`${userName}`]) }}><p>Edit ✏️</p></div>}
                                                                        <div className="option" onClick={() => deleteChat(output[`${userName}`], "request")}><p>Delete 🗑️</p></div>
                                                                        <div className="option"><p>Info ℹ️</p></div>
                                                                        <div className="option" onClick={() => { summarizeChat(output[`${userName}`].prompt, "request") }}><p>Quick Summary</p></div>
                                                                    </div>
                                                                }
                                                                {output[`${Object.keys(output)[0]}`].deleted == true ? null :
                                                                    <img src={more} onClick={(e) => { displayOpt(e, output[`${userName}`]?.id) }} alt="" className='moreIcon' />
                                                                }
                                                                {
                                                                    output[`${Object.keys(output)[0]}`]?.deleted == true ?
                                                                        <main>
                                                                            <i>This message was deleted</i>
                                                                            <div className="chat-tail tail-right"></div>
                                                                        </main>
                                                                        :
                                                                        output[`${Object.keys(output)[0]}`]?.call ?
                                                                            <main className="call-diablogue">
                                                                                <div className='inner'>
                                                                                    {output[`${Object.keys(output)[0]}`]?.call == "voice" ? <img src={voiceCallIcon} alt="" /> : <img src={videoCallIcon} alt="" />}
                                                                                    <div className="call-detail">
                                                                                        <p>{output[`${Object.keys(output)[0]}`]?.call}</p>
                                                                                        {output[`${Object.keys(output)[0]}`]?.time ? <p>{output[`${Object.keys(output)[0]}`]?.time}</p> : null}
                                                                                        <h4>{output[`${Object.keys(output)[0]}`]?.acccept}</h4>
                                                                                    </div>
                                                                                </div>
                                                                                <div className="chat-tail tail-right"></div>
                                                                            </main>

                                                                            :
                                                                            <main onTouchStart={(e) => { startHold(e, output[`${userName}`]?.id) }} onMouseUp={cancelHold} onMouseLeave={cancelHold} onTouchEnd={cancelHold} onTouchCancel={cancelHold}>
                                                                                {output[`${Object.keys(output)[0]}`].star == true ? <h1>⭐</h1> : null}
                                                                                {output[`${userName}`]?.reply ? <ReplyComponent id={output[`${userName}`]?.reply.id} user={output[`${userName}`]?.reply?.user} /> : null}
                                                                                <MediaTypesSelect type={output[`${userName}`].mediaType} data={output[`${userName}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType={previewType} statusPreview={statusPreview} />
                                                                                <MediaTypesSelect type={'audio/webm;codecs=opus'} data={output[`${userName}`].voiceNote} statusPreview={statusPreview} />
                                                                                <p>{output[`${userName}`].prompt}<img src={output[`${userName}`].progress} alt="" className='progress' onClick={output[`${userName}`].progress == sending ? () => { resendChat(output) } : null} /></p>
                                                                                {output[`${userName}`]?.uneditable == true ? <small>Edited</small> : null}
                                                                                <div className="chat-tail tail-right"></div>
                                                                            </main>
                                                                }
                                                            </div>
                                                            <section>
                                                                <img src={props.userCredentials.profilePic} alt="" className="userProf" />
                                                                <p>{userName}</p>
                                                            </section>
                                                        </div>
                                                    )
                                                }
                                                else {
                                                    return (
                                                        <div className='response chat-response' key={index} id={output[`${Object.keys(output)[0]}`]?.id ? output[`${Object.keys(output)[0]}`]?.id : ""} onDoubleClick={() => { reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`) }} onDrag={() => { reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`) }} draggable>
                                                            <div className="optET">
                                                                {output[`${Object.keys(output)[0]}`]?.deleted == true ? null :
                                                                    <div id={`${output[`${Object.keys(output)[0]}`]?.id}opt`} className="optionList" >
                                                                        <div className="option" onClick={() => { reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`) }}><p>Reply ↩️</p></div>
                                                                        <div className="option" onClick={() => { forwardChat(output[`${Object.keys(output)[0]}`]) }}><p>Forward ⏩️</p></div>
                                                                        <div className="option" onClick={() => { copyChat(output[`${Object.keys(output)[0]}`].prompt) }}><p>Copy  📋</p></div>
                                                                        {output[`${Object.keys(output)[0]}`]?.star == true ? <div className="option" onClick={() => { unStarChat(output[`${Object.keys(output)[0]}`]) }}><p>unstar ☆</p></div> : <div className="option" onClick={() => { starChat(output[`${Object.keys(output)[0]}`]) }}><p>Star ⭐</p></div>}
                                                                        <div className="option" onClick={() => { deleteChat(output[`${Object.keys(output)[0]}`], "response") }}><p>Delete 🗑️</p></div>
                                                                        <div className="option"><p>Info ℹ️</p></div>
                                                                        <div className="option" onClick={() => { summarizeChat(output[`${Object.keys(output)[0]}`].prompt, "response") }}><p>Quick Summary</p></div>
                                                                    </div>
                                                                }
                                                                {output[`${Object.keys(output)[0]}`]?.deleted == true ? null : <img src={more} onClick={(e) => { displayOpt(e, output[`${Object.keys(output)[0]}`]?.id) }} alt="" className='moreIcon' />}
                                                                {output[`${Object.keys(output)[0]}`]?.deleted == true ?
                                                                    <main>
                                                                        <i>This message was deleted</i>
                                                                        <div className="chat-tail tail-left"></div>
                                                                    </main> :
                                                                    output[`${Object.keys(output)[0]}`]?.call ?
                                                                        <main className="call-diablogue">
                                                                            <div className='inner'>
                                                                                {output[`${Object.keys(output)[0]}`]?.call == "voice" ? <img src={voiceCallIcon} alt="" /> : <img src={videoCallIcon} alt="" />}
                                                                                <div className="call-detail">
                                                                                    <p>{output[`${Object.keys(output)[0]}`]?.call}</p>
                                                                                    {output[`${Object.keys(output)[0]}`]?.time ? <p>{output[`${Object.keys(output)[0]}`]?.time}</p> : null}
                                                                                    <h4>{output[`${Object.keys(output)[0]}`]?.acccept}</h4>
                                                                                </div>
                                                                            </div>
                                                                            <div className="chat-tail tail-left"></div>
                                                                        </main>

                                                                        :
                                                                        <main onTouchStart={(e) => { startHold(e, output[`${Object.keys(output)[0]}`]?.id) }} onMouseUp={cancelHold} onMouseLeave={cancelHold} onTouchEnd={cancelHold} onTouchCancel={cancelHold}>
                                                                            {output[`${Object.keys(output)[0]}`]?.star == true ? <h1>⭐</h1> : null}
                                                                            {output[`${Object.keys(output)[0]}`]?.reply ? (<ReplyComponent id={output[`${Object.keys(output)[0]}`]?.reply?.id} user={output[`${Object.keys(output)[0]}`]?.reply?.user} />) : null}
                                                                            <MediaTypesSelect type={output[`${Object.keys(output)[0]}`].mediaType} data={output[`${Object.keys(output)[0]}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType={previewType} statusPreview={statusPreview} />
                                                                            <MediaTypesSelect type={'audio/webm;codecs=opus'} data={output[`${Object.keys(output)[0]}`].voiceNote} statusPreview={statusPreview} />
                                                                            <p>{output[`${Object.keys(output)[0]}`].prompt}</p>
                                                                            {output[`${Object.keys(output)[0]}`]?.uneditable == true ? <small>Edited</small> : null}
                                                                            <div className="chat-tail tail-left"></div>
                                                                        </main>
                                                                }
                                                            </div>
                                                            <section>
                                                                <img src={props.chatFriendDetail?.profilePic == "/src/images/user.png" || props.chatFriendDetail?.profilePic == "/assets/user.png" ? userImg : props.chatFriendDetail?.profilePic} onClick={showProfile} alt="" className="userProf" />
                                                                <p>{Object.keys(output)[0]}</p>
                                                            </section>
                                                        </div>
                                                    )
                                                }
                                            }
                                        })
                                    }
                                    <div>
                                        {
                                            friendTyping ?
                                                <div className='response chat-response' >
                                                    <main>
                                                        <div className="typeDotParent">
                                                            <div className="typingDots"></div>
                                                            <div className="typingDots"></div>
                                                            <div className="typingDots"></div>
                                                        </div>
                                                    </main>
                                                </div>
                                                : null
                                        }
                                    </div>
                                    <div>
                                        <section ref={scrollChat}></section>
                                    </div>
                                </div>
                            </div>
                            {replyMsgCon ?
                                <div className='replyMsg' disabled>
                                    <div className='mediaParent'>
                                        {replyMsgCon?.media ?
                                            <div className='mediaPrev'>
                                                <MediaTypesSelect type={replyMsgCon.mediaType} data={replyMsgCon.media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType={previewType} statusPreview={statusPreview} />
                                            </div>
                                            : null}
                                        <h5>{replyMsgCon?.prompt}</h5>
                                    </div>
                                    {replyMsgCon.voiceNote ? <audio src={replyMsgCon.voiceNote} controls></audio> : null}

                                    <img src={close} onClick={closeReply} alt="" className='closeImg' />
                                </div>
                                : null}
                        </div>
                        {
                            mediaOption ?
                                <div className="mediaType">
                                    <input type="file" id='galleryUpload' onChange={(e) => { displayGallery(e) }} name='galleryUpload' style={{ display: "none" }} />
                                    <input type="file" id='documentUpload' onChange={(e) => { documentUpload(e) }} name='documentUpload' style={{ display: "none" }} />
                                    <label htmlFor="galleryUpload">
                                        <div>
                                            <img src={gallery} alt="" />
                                            <p>Photos & Videos</p>
                                        </div>
                                    </label>
                                    <label>
                                        <div>
                                            <img src={documentIcon} alt="" />
                                            <p>Document</p>
                                        </div>
                                    </label>
                                    <label htmlFor="">
                                        <div>
                                            <img src={contactIcon} alt="" />
                                            <p>Contact</p>
                                        </div>
                                    </label>
                                    <label htmlFor="">
                                        <div>
                                            <img src={locationIcon} alt="" />
                                            <p>Location</p>
                                        </div>
                                    </label>
                                    <label htmlFor="">
                                        <div>
                                            <img src={videoNoteIcon} alt="" />
                                            <p>Video Note</p>
                                        </div>
                                    </label>
                                    <label htmlFor="">
                                        <div>
                                            <img src={pollIcon} alt="" />
                                            <p>Poll</p>
                                        </div>
                                    </label>
                                    <label htmlFor="">
                                        <div>
                                            <img src={meetingIcon} alt="" />
                                            <p>Meeting</p>
                                        </div>
                                    </label>
                                </div> :
                                null
                        }

                        <audio src={voiceNoteSrc} ref={audioTag} autoPlay style={{ display: "none" }} onEnded={() => setVoicePreviewState(playBtn)}></audio>
                        {
                            chatBlocked ?
                                <div className="voiceNote" onClick={unBlockChat}>
                                    <i>Tap to Unblock</i>
                                </div>
                                :
                                !accessChat ?
                                    <div className="voiceNote">
                                        <i>Unable To Access</i>
                                    </div>
                                    :
                                    voiceNoteSrc ?
                                        <div className="voiceNote">
                                            <img src={deleteImg} onClick={closeVn} />
                                            <img src={voicePreviewState} onClick={pausePlayVoice} />
                                            <img src={send} onClick={(e) => { props.chatFriendDetail?.type == "group" ? groupVnSend(vnData.current, props.chatFriendDetail, props.userCredentials?.UserName) : sendVN() }} style={{ filter: "opacity(.6) invert(1)", width: "25px" }} />
                                        </div>
                                        :
                                        <div className="welcome-input chat-in">
                                            <textarea autoComplete='on' rows="5" cols="30" autoCorrect='on' type="text" ref={userPrompt} id='userPromptDom' onChange={typing} />
                                            <img src={linkBtn} alt="" onClick={changeMediaOption} className='addBtn' />
                                            {micShow ? <img src={recordState} className={recordState == stopVoiceRecording ? "recordingPauseBtn" : null} onClick={voiceNote} alt="" /> : <img src={send} onClick={() => { props.chatFriendDetail?.type == "group" ? groupChat() : sendChat() }} alt="" />}
                                        </div>
                        }
                    </div>
                </div>
            }
        </main>
    )
}


export default ChatDisplay
