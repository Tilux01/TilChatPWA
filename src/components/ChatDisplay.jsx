import React, { useState,useEffect, useRef, useMemo, useCallback } from 'react'
import "../Styles/AIChat.css"
import send from "../images/paper-plane.png"
import profileArrow from "../images/left-arrow-white.png"
import ai from "../images/bot.png"
import deleteImg from "../images/delete.png"
import linkBtn from "../images/link.png"
import gallery from "../images/picture.png"
import imagePreview from "../images/photo (1).png"
import videoPreview from "../images/video.png"
import cameraIcon from "../images/camera.png"
import playBtn  from "../images/play-buttton.png"
import pauseBtn from "../images/pause.png"
import documentIcon from "../images/documentation.png"
import contactIcon from "../images/mobile.png"
import locationIcon from "../images/location (1).png"
import videoNoteIcon from "../images/clapperboard.png"
import pollIcon from "../images/poll.png"
import meetingIcon from "../images/discussion.png"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import ChatMediaSend from './ChatMediaSend'
import VideoPlayer from './VideoPlayer'
import PreviewMedia from './PreviewMedia'
import MediaTypesSelect from './MediaTypesSelect'
import sent from "../images/doneThick.png"
import sending from "../images/rotate.png"
import errorSend from "../images/mark (1).png"
import online from "../images/double-tick (2).png"
import seen from "../images/double-tick (1).png"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import recordVoice from "../images/mic.png"
import stopVoiceRecording from "../images/stop-button.png"
import {reduceMediaQualityToFile, formatBytes} from "../fileReducer.js"
import more from "../images/more.png"



const firebaseConfig = {
  apiKey: "AIzaSyCoDIlOAkemogzj-Gw2G_lVO7VI7uEeIG8",
  authDomain: "tilchat-91043.firebaseapp.com",
  databaseURL: "https://tilchat-91043-default-rtdb.firebaseio.com",
  projectId: "tilchat-91043",
  storageBucket: "tilchat-91043.firebasestorage.app",
  messagingSenderId: "293755713788",
  appId: "1:293755713788:web:a28845400f6f8992a87f79",
  measurementId: "G-CP47MXQ3MG"
};

const appSettings = {
    databaseURL: "https://tilchat-91043-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app)
const analytics = getAnalytics(app);


const ChatDisplay = (props) => {
  const navigate = useNavigate()
    // const useVal = ()=>{val()}
    const [chatArray, setChatArray] = useState([])
    const propsValue = useRef()
    const [userName, setUserName] = useState()
    const [mediaOption, setMediaOption] = useState(false)
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
    
    
    const preview = (data, type) =>{
        previewSrc.current = data
        previewType.current = type
        setPreviewMedia(()=>true)
    }
    const typing = () =>{
        if (userPrompt.current.value.length == 0) {
            setMicShow(()=>true)
            get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
            .then((output)=>{
                let typingUsers = []
                if (output.exists()) {
                    typingUsers = output.val()
                    const checkType = typingUsers.filter(typer=> typer != userName)
                    update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                        type: checkType
                    })
                } 
            })
        }
        else if(userPrompt.current.value.length > 0){
            setMicShow(()=>false)
            get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
            .then((output)=>{
                let typingUsers = []
                if (output.exists()) {
                    typingUsers = output.val()
                    const checkType = typingUsers.filter(typer=> typer == userName)
                    if (checkType.length == 0) {
                        typingUsers.push(userName)
                        update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                            type: typingUsers
                        })
                    }
                }
                else{
                    typingUsers.push(userName)
                    update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                        type: typingUsers
                    })
                }
            })
        }
    }
    const closeVn = () =>{
        audioTag.current.pause()
        setVoiceNoteSrc(null)
        setMicShow(()=>true)
        vnData.current = null
        setRecordState(()=>recordVoice)
        setVoicePreviewState(()=>pauseBtn)
    }
    const streamNote = useRef()
    const voiceData = useRef()
    const chunks = useRef([])
    const voiceNote = async() =>{
        if(recordState == recordVoice){
            streamNote.current = await navigator.mediaDevices.getUserMedia({audio: true})
            voiceData.current = new MediaRecorder(streamNote.current, { 
            mimeType: 'audio/webm;codecs=opus' 
            })
            setRecordState(stopVoiceRecording)
            voiceData.current.ondataavailable = (e)=>{
                chunks.current.push(e.data)
            }
            
        }
        else{
            setRecordState(recordVoice)
            if (voiceData.current.state === 'recording') {
                voiceData.current.stop();
            }
        }
        voiceData.current.onstop = ()=>{
            const blob = new Blob(chunks.current, {type: "audio/webm;codecs=opus"})
            const reader = new FileReader
            reader.addEventListener("load", (e)=>{
                vnData.current =  e?.target?.result
            })
            reader.readAsDataURL(blob)
            const url = URL.createObjectURL(blob)
            chunks.current = []
            setVoiceNoteSrc(url)
        }
        voiceData.current.start()
    }
    const pausePlayVoice = () =>{
        if (voicePreviewState == playBtn) {
            audioTag.current.play()
            setVoicePreviewState(pauseBtn)
        }
        else{
            audioTag.current.pause()
            setVoicePreviewState(playBtn)
        }
    }
    const scrollChat = useRef(null)
    const scrollToBottom = () => {
        scrollChat.current?.scrollIntoView({ behavior: "auto",block:"nearest", inline:"start" })
    };
    const userNameGet = localStorage.getItem("TilChat")
    useEffect(() => {
        if(!userNameGet || userNameGet.profileId == "123"|| userNameGet == {}){
            navigate("/signup")
        }
        else{
            setUserName(JSON.parse(userNameGet).UserName)
            
        }
    }, [navigate])
    
    const openDB = () => {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open('TilDB', 1)
            request.onupgradeneeded = (event) => {
            const db = event.target.result
            if (!db.objectStoreNames.contains('chats')) {
                db.createObjectStore('chats')
            }
            }

            request.onsuccess = () => resolve(request.result)
            request.onerror = () => reject(request.error)
        })
    }
    const  saveChat = async(directory, data) => {
    const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('chats', 'readwrite')
            const store = tx.objectStore('chats')
            store.put(data, directory)
            tx.oncomplete = () => resolve(true)
            tx.onerror = () => reject(tx.error)
        })
    }
    const getChat = async(key) =>{
        const db = await openDB()
        return new Promise((resolve, reject) => {
            const tx = db.transaction('chats', 'readonly')
            const store = tx.objectStore('chats')
            const request = store.get(key)
            request.onsuccess = () => resolve(request.result || null)
            request.onerror = () => reject(request.error)
        })
    }
    const holdPropsChat = useRef()
    useEffect(() => {
        setMicShow(()=>true)
        getChat(props.chatInfo)
        .then((output)=>{
            if (output) {
                setChatArray(output) 
            }
            else{
                setChatArray([])
            }
        })
        .finally(()=>{
            holdPropsChat.current = props.chatInfo
            if (userPrompt?.current?.value) {
                userPrompt.current.value = ""
            }
            get(ref(db, `Users/${userName}/type`))
            .then((output)=>{
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing=> typing == props.chatFriendDetail.UserName)
                if (checkFriendTyping.length > 0) {
                    setFriendTyping(()=>true)
                    setTimeout(() => {
                        scrollToBottom()
                    }, 1000);
                }
                else{
                    setFriendTyping(()=>false)
                }
                const filterFriendTyping = typingFriends.filter(typing=> typing != props.chatFriendDetail.UserName)
                update(ref(db, `Users/${userName}/type`),{
                    type: filterFriendTyping
                })
            }
            else{
                setFriendTyping(()=>false)
            }
            clearOpt()
        })
        })
    }, [props.chatInfo])

    useEffect(() => {
        const device = props.deviceUserAgent
        if (holdPropsChat.current) {
            if (holdPropsChat.current == props.chatFriendDetail.UserName + userName || holdPropsChat.current == userName + props.chatFriendDetail.UserName) {
                onValue(ref(db, `DevicesMessages/${userName}/"${device}"/${holdPropsChat.current}/chat`), (output)=>{
                    console.log("as how", holdPropsChat.current);
                    if (output.exists()) {
                            
                        const allResult = output.val()
                        const doubleArray = []
                        allResult?.map((result)=>{  
                            const sender = Object.keys(result)[0]
                            result[sender].progress = sent
                            const checkExistence = holdChat.current.filter(user => user[sender]?.id == result[sender]?.id)
                            if (checkExistence.length == 0) {
                                const checkDouble = doubleArray.filter(user => user[sender]?.id == result[sender]?.id)
                                if (checkDouble.length == 0) {
                                    doubleArray.push(result)
                                    setChatArray(prev=> [...prev, result])
                                }
                            }
                        })
                        set(ref(db, `DevicesMessages/${userName}/"${device}"/${holdPropsChat.current}`), null)
                    }
                })
            }
        }
    }, [props.chatInfo]) 
    

    useEffect(() => {
        onValue(ref(db, `Users/${userName}/type`),(output)=>{
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing=> typing == props.chatFriendDetail.UserName)
                if (checkFriendTyping.length > 0) {
                    setFriendTyping(()=>true)
                    setTimeout(() => {
                        scrollToBottom()
                    }, 1000);
                }
                else{
                    setFriendTyping(()=>false)
                }
                setTimeout(() => {
                    const checkFriendTyping = typingFriends.filter(typing=> typing != props.chatFriendDetail.UserName)
                    update(ref(db, `Users/${userName}/type`),{
                        type: checkFriendTyping
                    })
                }, 3000);
            }
            else{
                setFriendTyping(()=>false)
            }
        })
    }, [userName, props.chatFriendDetail])

    const resendChat = (output) =>{
        if (output[`${userName}`].voiceNote) {
            reSendVN(output)
        }
        else if(output[`${userName}`].media && output[`${userName}`].mediaType){
            reSendMediaChat(output)
        }
        else{
            reSendChat(output)
        }
    }
    const chatDuplicate = useRef()


    useEffect(() => {
        saveChat(props.chatInfo, chatArray)
        holdChat.current = chatArray
        holdChat.current
        console.log(chatArray);
        
        if (chatArray && chatArray.length > 0) {
            chatArray.map((chat)=>{
                if (chat) {
                    const obj = Object.keys(chat)
                    let user 
                    if (obj && obj.length == 0) {
                        user = obj[0]
                    }
                    if (user) {
                        if (chat[user]?.progress == sending) {
                            console.log(chat);
                            resendChat(chat)
                        }
                    }
                }
            })
             const ids = new Set();
        let hasDuplicates = false
        
        chatArray.forEach(item => {
            if (item) {
                const key = Object.keys(item)[0];
            const id = item[key]?.id
            if (id) {
                if (ids.has(id)) hasDuplicates = true;
                ids.add(id)
            }
            }
        })
        if (hasDuplicates) {
            console.log("Found duplicates, cleaning up...");
            setTimeout(() => {
                setChatArray(prev => {
                    const seen = new Set()
                    const unique = []
                    
                    prev.forEach(item => {
                        const key = Object.keys(item)[0];
                        const id = item[key]?.id;
                        
                        if (id && !seen.has(id)) {
                            seen.add(id)
                            unique.push(item)
                        }
                    })
                    
                    return unique
                })
            }, 0)
        }
        }
    }, [chatArray])
    const checkDuplicate = () =>{
        
    }
    useEffect(() => {
        propsValue.current = props.chatInfo
        const requestValue = onValue(ref(db,"Messages/"+props.chatInfo+"/"),(output)=>{
            if (props.chatInfo == propsValue.current) {
                if (output.val()?.chatArray) {
                    if (output.val().chatArray != "No message") {
                        if (output.val()?.message != "hello") {
                            const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                            if(Object.keys(output.val().chatArray[0])[0] != userName){
                                set(ref(db,"Messages/"+props.chatInfo),{
                                    chatArray: "No message"
                                })
                                setChatArray(prev=>[...prev, ...output.val().chatArray])
                                let messageToSend = output.val().chatArray
                                props.otherDevices?.map((device)=>{
                                    let messages = []
                                    get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg)=>{
                                        
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messageToSend.map((forwardMsg)=>{
                                                messages.push(forwardMsg)
                                            })
                                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                            }
                                            else{
                                                messageToSend.map((forwardMsg)=>{
                                                    messages.push(forwardMsg)
                                                })
                                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                            }
                                    })
                                })
                            }
                            
                        }
                    }
                    else{
                        const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                        get(ref(db, `Users/${props.chatFriendDetail.UserName}/readReceipt`))
                        .then((receipt)=>{
                            if (!receipt.exists() || receipt.val() != false) {
                                setChatArray(prev => prev.map(item => {
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
    }, [props.chatInfo])

    const sentImage = sent
    const onlineImage = online
    useEffect(() => {
        const checkOnline = onValue(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),(result)=>{
            if (!result.val()) {
                setChatArray(prev => prev.map(item => {
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
    }, [props.chatFriendDetail.UserName, userName])

    const reply = (id, user) =>{
        if (id && id != "") {
            const filterChat = chatArray.filter(friend => friend[user]?.id == id)
            if (filterChat && filterChat.length > 0) {
                setReplyMsgCon(()=>filterChat[0][user])
                const check = {
                    id : filterChat[0][user].id,
                    user : user
                }
                
                setReplyMsg(()=>check)
            }
        }
        userPrompt.current.focus()
    }
    const closeReply = () =>{
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

    const randomGenerate = () =>{
        const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
        let randomValue = ""
        for (let index = 0; index < 20; index++) {
            const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
            randomValue = randomValue + generateRandom
        }
        return randomValue
    }

    const sendVN = () =>{
        get(ref(db, "Messages/"+props.chatInfo))
        .then((output)=>{
            const random = randomGenerate()
            const id = `${userName}${random}`
            if(!output.val().chatArray || output.val().chatArray == "No message" || typeof(output.val().message) == "string"){
                
                setChatArray(prev=>[...prev, {[userName]:{
                    voiceNote: vnData.current,
                    progress: sending,
                    reply:replyMsg,
                    id
                }}])
                set(ref(db,"Messages/"+props.chatInfo),{
                    chatArray: [{[userName]:{
                        voiceNote: vnData.current,
                        reply:replyMsg,
                        id
                    }}]
                })
                .then(()=>{
                    setMediaOption(()=>true)
                    setMediaOption(()=>false)
                    setLoading(()=>false)
                    setMicShow(()=>true)
                    sendToNodeServer(props.chatFriendDetail.UserName, "TilChat", `${userName} sent you a voice note`)
                    const friendsList = props.mutualRender
                    const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                    
                    if (getFriend && getFriend.length > 0) {
                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                    }
                    set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                        user: userName
                    })
                    setChatArray((prev)=>prev.slice(0, -1))
                    setChatArray(prev=>[...prev, {[userName]:{
                        voiceNote: vnData.current,
                        progress: sent,
                        reply:replyMsg,
                        id
                    }}])
                })
                .finally(()=>{
                    get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                    .then((result)=>{
                        let friendNotifications = []
                        const valueToPush = {
                            prompt: `${userName} sent you a voice note`,
                            sender: userName,
                            reply:replyMsg,
                        }
                        if (result.exists()) {
                            friendNotifications = result.val()
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                        else{
                            friendNotifications = []
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                    })
                    props.otherDevices?.map((device)=>{
                        let messages = []
                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                        .then((msg)=>{
                            if (msg.exists()) {
                                messages = msg.val()
                                messages.push({
                                    [userName]: {
                                        voiceNote: vnData.current,
                                        progress: sent,
                                        reply:replyMsg,
                                        id
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                            else{
                                messages.push({
                                    [userName]: {
                                        voiceNote: vnData.current,
                                        progress: sent,
                                        reply:replyMsg,
                                        id
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                        })
                    })
                })
            }
            else{
                let tempData = output.val().chatArray
                tempData.push({[userName]:{
                    voiceNote: vnData.current,
                    reply:replyMsg,
                    id
                }})
                setChatArray(prev=>[...prev, {[userName]:{
                    voiceNote: vnData.current,
                    progress: sending,
                    reply:replyMsg,
                    id
                }}])
                set(ref(db,"Messages/"+props.chatInfo),{
                    chatArray: tempData
                })
                .then(()=>{
                    setMediaOption(()=>true)
                    setMediaOption(()=>false)
                    setLoading(()=>false)
                    setMicShow(()=>true)
                    sendToNodeServer(props.chatFriendDetail.UserName, "TilChat", `${userName} sent you a voice note`)
                    const friendsList = props.mutualRender
                    const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                    
                    if (getFriend && getFriend.length > 0) {
                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                    }
                    const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                    let randomValue = ""
                    for (let index = 0; index < 12; index++) {
                        const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                        randomValue = randomValue + generateRandom
                    }
                    set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                        user: randomValue
                    })
                    setChatArray((prev)=>prev.slice(0, -1))
                    setChatArray(prev=>[...prev, {[userName]:{
                        voiceNote: vnData.current,
                        progress: sent,
                        reply:replyMsg,
                        id
                    }}])
                })
                .finally(()=>{
                    get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                    .then((result)=>{
                        let friendNotifications = []
                        const valueToPush = {
                            prompt: `${userName} sent you a voice note`,
                            sender: userName,
                            reply:replyMsg
                        }
                        if (result.exists()) {
                            friendNotifications = result.val()
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                        else{
                            friendNotifications = []
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                    })
                    props.otherDevices?.map((device)=>{
                        let messages = []
                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                        .then((msg)=>{
                            if (msg.exists()) {
                                messages = msg.val()
                                messages.push({
                                    [userName]: {
                                        voiceNote: vnData.current,
                                        reply:replyMsg,
                                        id
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                            else{
                                messages.push({
                                    [userName]: {
                                        voiceNote: vnData.current,
                                        reply:replyMsg,
                                        id
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                        })
                    })
                    
                })
            }
            clearOpt()
        })
    }

    const reSendVN = (param) =>{
        get(ref(db, "Messages/"+props.chatInfo))
        .then((output)=>{
            // const random = randomGenerate()
            if(!output.val().chatArray || output.val().chatArray == "No message" || typeof(output.val().message) == "string"){
                // setChatArray(prev=>[...prev, {[userName]:{
                //     voiceNote: vnData.current,
                //     progress: sending,
                //     reply:replyMsg,
                //     id
                // }}])
                set(ref(db,"Messages/"+props.chatInfo),{
                    chatArray: [{[userName]:{
                        voiceNote: param[`${userName}`].voiceNote,
                        reply: param[`${userName}`].reply,
                        id: param[`${userName}`].id
                    }}]
                })
                .then(()=>{
                    setMediaOption(()=>true)
                    setMediaOption(()=>false)
                    setLoading(()=>false)
                    setMicShow(()=>true)
                    sendToNodeServer(props.chatFriendDetail.UserName, "TilChat", `${userName} sent you a voice note`)
                    const friendsList = props.mutualRender
                    const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                    
                    if (getFriend && getFriend.length > 0) {
                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                    }
                    set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                        user: userName
                    })
                    alert("done")
                    // setChatArray((prev)=>prev.slice(0, -1))
                    // setChatArray(prev=>[...prev, {[userName]:{
                    //     voiceNote: vnData.current,
                    //     progress: sent,
                    //     reply:replyMsg,
                    //     id
                    // }}])
                })
                .finally(()=>{
                    get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                    .then((result)=>{
                        let friendNotifications = []
                        const valueToPush = {
                            prompt: `${userName} sent you a voice note`,
                            sender: userName,
                            reply: param[`${userName}`].reply,
                        }
                        if (result.exists()) {
                            friendNotifications = result.val()
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                        else{
                            friendNotifications = []
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                    })
                    props.otherDevices?.map((device)=>{
                        let messages = []
                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                        .then((msg)=>{
                            if (msg.exists()) {
                                messages = msg.val()
                                messages.push({
                                    [userName]: {
                                        voiceNote: param[`${userName}`].voiceNote,
                                        reply: param[`${userName}`].reply,
                                        id: param[`${userName}`].id,
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                            else{
                                messages.push({
                                    [userName]: {
                                        voiceNote: param[`${userName}`].voiceNote,
                                        reply: param[`${userName}`].reply,
                                        id: param[`${userName}`].id,
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                        })
                    })
                })
            }
            else{
                let tempData = output.val().chatArray
                tempData.push({[userName]:{
                    voiceNote: param[`${userName}`].voiceNote,
                    reply: param[`${userName}`].reply,
                    id: param[`${userName}`].id,
                }})
                // setChatArray(prev=>[...prev, {[userName]:{
                //     voiceNote: vnData.current,
                //     progress: sending,
                //     reply:replyMsg,
                //     id
                // }}])
                set(ref(db,"Messages/"+props.chatInfo),{
                    chatArray: tempData
                })
                .then(()=>{
                    setMediaOption(()=>true)
                    setMediaOption(()=>false)
                    setLoading(()=>false)
                    setMicShow(()=>true)
                    sendToNodeServer(props.chatFriendDetail.UserName, "TilChat", `${userName} sent you a voice note`)
                    const friendsList = props.mutualRender
                    const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                    const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                    
                    if (getFriend && getFriend.length > 0) {
                        props.setMutualRender([...getOtherFriend, getFriend[0]])
                    }
                    const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                    let randomValue = ""
                    for (let index = 0; index < 12; index++) {
                        const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                        randomValue = randomValue + generateRandom
                    }
                    set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                        user: randomValue
                    })
                    alert("done")
                    // setChatArray((prev)=>prev.slice(0, -1))
                    // setChatArray(prev=>[...prev, {[userName]:{
                    //     voiceNote: vnData.current,
                    //     progress: sent,
                    //     reply:replyMsg,
                    //     id
                    // }}])
                })
                .finally(()=>{
                    get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                    .then((result)=>{
                        let friendNotifications = []
                        const valueToPush = {
                            prompt: `${userName} sent you a voice note`,
                            sender: userName,
                            reply:param[`${userName}`].reply
                        }
                        if (result.exists()) {
                            friendNotifications = result.val()
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                        else{
                            friendNotifications = []
                            friendNotifications.push(valueToPush)
                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                notifications : friendNotifications
                            })
                        }
                    })
                    props.otherDevices?.map((device)=>{
                        let messages = []
                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                        .then((msg)=>{
                            if (msg.exists()) {
                                messages = msg.val()
                                messages.push({
                                    [userName]: {
                                        voiceNote: param[`${userName}`].voiceNote,
                                        reply: param[`${userName}`].reply,
                                        id: param[`${userName}`].id,
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                            else{
                                messages.push({
                                    [userName]: {
                                        voiceNote: param[`${userName}`].voiceNote,
                                        reply: param[`${userName}`].reply,
                                        id: param[`${userName}`].id,
                                    }
                                })
                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                            }
                        })
                    })
                    
                })
            }
        })
    }

    const sendChat = () =>{
        const random = randomGenerate()
        const id = `${userName}${random}`
        if (!loading) {
            setReplyMsg(()=>null)
            setLoading(()=>true)
            const message = userPrompt.current.value
            if(message || message != " "){
                get(ref(db, "Messages/"+props.chatInfo))
                .then((output)=>{
                    if(!output.val()?.chatArray || output.val()?.chatArray == "No message" || typeof(output.val().message) == "string"){
                        setChatArray(prev=>[...prev, {[userName]:{
                            prompt:message,
                            progress: sending,
                            reply:replyMsg,
                            id
                        }}])
                        set(ref(db,"Messages/"+props.chatInfo),{
                            chatArray: [{[userName]:{
                                prompt:message,
                                reply:replyMsg,
                                id
                            }}]
                        })
                        .then(()=>{
                            userPrompt.current.value = ""
                            setMediaOption(()=>true)
                            setMediaOption(()=>false)
                            setLoading(()=>false)
                            setMicShow(()=>true)
                            sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                            
                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                                user: userName
                            })
                            setChatArray(prev=>{
                                return prev.map((chat)=>{
                                    const user = Object.keys(chat)[0]
                                    console.log(user);
                                    if (chat[user]?.id == id) {
                                        return{
                                            [user]:{
                                            ...chat[user],
                                            progress: sent,
                                        }}
                                    }
                                    return chat;
                                })
                            })
                        })
                        .finally(()=>{
                            get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                            .then((output)=>{
                                let typingUsers = []
                                if (output.exists()) {
                                    typingUsers = output.val()
                                    const checkType = typingUsers.filter(typer=> typer != userName)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                        type: checkType
                                    })
                                } 
                            })
                            .finally(()=>{
                                get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                                .then((result)=>{
                                    let friendNotifications = []
                                    const valueToPush = {
                                        prompt: message,
                                        mediaType: null,
                                        media: null,
                                        sender: userName,
                                        reply:replyMsg,
                                    }
                                    if (result.exists()) {
                                        friendNotifications = result.val()
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                            notifications : friendNotifications
                                        })
                                    }
                                    else{
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                            notifications : friendNotifications
                                        })
                                    }
                                })
                                props.otherDevices?.map((device)=>{
                                    let messages = []
                                    get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg)=>{
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messages.push({
                                                [userName]: {
                                                    prompt:message,
                                                    reply:replyMsg,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                        }
                                        else{
                                            messages.push({
                                                [userName]: {
                                                    prompt:message,
                                                    reply:replyMsg,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                        }
                                    })
                                })
                            })
                        })
                    }
                    else{   
                            let tempData = output.val().chatArray
                            tempData.push({[userName]:{
                                prompt:userPrompt.current.value,
                                reply:replyMsg,
                                id
                            }})
                            setChatArray(prev=>[...prev, {[userName]:{
                                prompt:userPrompt.current.value,
                                progress: sending,
                                reply:replyMsg,
                                id
                            }}])
                            set(ref(db,"Messages/"+props.chatInfo),{
                                chatArray: tempData
                            })
                            .then(()=>{
                                userPrompt.current.value = ""
                                setMediaOption(()=>true)
                                setMediaOption(()=>false)
                                setLoading(()=>false)
                                setMicShow(()=>true)
                                sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                const friendsList = props.mutualRender
                                const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                                const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                                if (getFriend && getFriend.length > 0) {
                                    props.setMutualRender([...getOtherFriend, getFriend[0]])
                                }
                                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                                let randomValue = ""
                                for (let index = 0; index < 12; index++) {
                                    const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                                    randomValue = randomValue + generateRandom
                                }
                                set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                                    user: randomValue
                                })
                                setChatArray(prev=>{
                                    return prev.map((chat)=>{
                                        const user = Object.keys(chat)[0]
                                        console.log(user);
                                        if (chat[user]?.id == id) {
                                            return{
                                                [user]:{
                                                ...chat[user],
                                                progress: sent,
                                            }}
                                        }
                                        return chat;
                                    })
                                })
                            })
                            .finally(()=>{
                                get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                                .then((output)=>{
                                    let typingUsers = []
                                    if (output.exists()) {
                                        typingUsers = output.val()
                                        const checkType = typingUsers.filter(typer=> typer != userName)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                            type: checkType
                                        })
                                    } 
                                })
                                .finally(()=>{
                                    get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                                    .then((result)=>{
                                        let friendNotifications = []
                                        const valueToPush = {
                                            prompt: message,
                                            mediaType: null,
                                            media: null,
                                            sender: userName,
                                            reply:replyMsg
                                        }
                                        if (result.exists()) {
                                            friendNotifications = result.val()
                                            friendNotifications.push(valueToPush)
                                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                                notifications : friendNotifications
                                            })
                                        }
                                        else{
                                            friendNotifications = []
                                            friendNotifications.push(valueToPush)
                                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                                notifications : friendNotifications
                                            })
                                        }
                                    })
                                    props.otherDevices?.map((device)=>{
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                        .then((msg)=>{
                                            if (msg.exists()) {
                                                messages = msg.val()
                                                messages.push({
                                                    [userName]: {
                                                        prompt:message,
                                                        reply:replyMsg,
                                                        id
                                                    }
                                                })
                                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                            }
                                            else{
                                                messages.push({
                                                    [userName]: {
                                                        prompt:message,
                                                        reply:replyMsg,
                                                        id
                                                    }
                                                })
                                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                            }
                                        })
                                    })
                                    
                                })
                            })
                        }
                })
                scrollToBottom()
                clearOpt()
            }
        }
    }

    const reSendChat = (param) =>{
        const id = param[`${userName}`].id
        if (!loading) {
            setReplyMsg(()=>null)
            setLoading(()=>true)
            const message = param[`${userName}`].prompt
            if(message){
                get(ref(db, "Messages/"+props.chatInfo))
                .then((output)=>{
                    if(!output.val()?.chatArray || output.val()?.chatArray == "No message" || typeof(output.val().message) == "string"){
                        set(ref(db,"Messages/"+props.chatInfo),{
                            chatArray: [{[userName]:{
                                prompt:message,
                                reply:param[`${userName}`].reply,
                                id
                            }}]
                        })
                        .then(()=>{
                            setMediaOption(()=>true)
                            setMediaOption(()=>false)
                            setLoading(()=>false)
                            setMicShow(()=>true)
                            sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                            const friendsList = props.mutualRender
                            const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                            const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                            
                            if (getFriend && getFriend.length > 0) {
                                props.setMutualRender([...getOtherFriend, getFriend[0]])
                            }
                            set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                                user: userName
                            })
                            setChatArray(prev=>{
                                return prev.map((chat)=>{
                                    const user = Object.keys(chat)[0]
                                    console.log(user);
                                    if (chat[user]?.id == id) {
                                        return{
                                            [user]:{
                                            ...chat[user],
                                            progress: sent,
                                        }}
                                    }
                                    return chat;
                                })
                            })
                            // setChatArray((prev)=>prev.slice(0, -1))
                            // setChatArray(prev=>[...prev, {[userName]:{
                            //     prompt:message,
                            //     progress: sent,
                            //     media: null,
                            //     mediaType: null,
                            //     mediaLink: null,
                            //     reply:replyMsg,
                            //     id
                            // }}])
                        })
                        .finally(()=>{
                            get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                            .then((output)=>{
                                let typingUsers = []
                                if (output.exists()) {
                                    typingUsers = output.val()
                                    const checkType = typingUsers.filter(typer=> typer != userName)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                        type: checkType
                                    })
                                } 
                            })
                            .finally(()=>{
                                get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                                .then((result)=>{
                                    let friendNotifications = []
                                    const valueToPush = {
                                        prompt: message,
                                        sender: userName,
                                        reply:param[`${userName}`].reply,
                                    }
                                    if (result.exists()) {
                                        friendNotifications = result.val()
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                            notifications : friendNotifications
                                        })
                                    }
                                    else{
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                            notifications : friendNotifications
                                        })
                                    }
                                })
                                props.otherDevices?.map((device)=>{
                                    let messages = []
                                    get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                    .then((msg)=>{
                                        if (msg.exists()) {
                                            messages = msg.val()
                                            messages.push({
                                                [userName]: {
                                                    prompt:message,
                                                    reply:param[`${userName}`].reply,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                        }
                                        else{
                                            messages.push({
                                                [userName]: {
                                                    prompt:message,
                                                    reply:param[`${userName}`].reply,
                                                    id
                                                }
                                            })
                                            update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                        }
                                    })
                                })
                            })
                        })
                    }
                    else{   
                            let tempData = output.val().chatArray
                            tempData.push({[userName]:{
                                prompt:message,
                                reply:param[`${userName}`].reply,
                                id
                            }})
                            set(ref(db,"Messages/"+props.chatInfo),{
                                chatArray: tempData
                            })
                            .then(()=>{
                                userPrompt.current.value = ""
                                setMediaOption(()=>true)
                                setMediaOption(()=>false)
                                setLoading(()=>false)
                                setMicShow(()=>true)
                                sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                const friendsList = props.mutualRender
                                const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                                const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                                if (getFriend && getFriend.length > 0) {
                                    props.setMutualRender([...getOtherFriend, getFriend[0]])
                                }
                                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                                let randomValue = ""
                                for (let index = 0; index < 12; index++) {
                                    const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                                    randomValue = randomValue + generateRandom
                                }
                                set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                                    user: randomValue
                                })
                                setChatArray(prev=>{
                                    return prev.map((chat)=>{
                                        const user = Object.keys(chat)[0]
                                        console.log(user);
                                        if (chat[user]?.id == id) {
                                            return{
                                                [user]:{
                                                ...chat[user],
                                                progress: sent,
                                            }}
                                        }
                                    })
                                })
                            })
                            .finally(()=>{
                                get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                                .then((output)=>{
                                    let typingUsers = []
                                    if (output.exists()) {
                                        typingUsers = output.val()
                                        const checkType = typingUsers.filter(typer=> typer != userName)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                            type: checkType
                                        })
                                    } 
                                })
                                .finally(()=>{
                                    get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                                    .then((result)=>{
                                        let friendNotifications = []
                                        const valueToPush = {
                                            prompt: message,
                                            sender: userName,
                                            reply:  param[`${userName}`].reply
                                        }
                                        if (result.exists()) {
                                            friendNotifications = result.val()
                                            friendNotifications.push(valueToPush)
                                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                                notifications : friendNotifications
                                            })
                                        }
                                        else{
                                            friendNotifications = []
                                            friendNotifications.push(valueToPush)
                                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                                notifications : friendNotifications
                                            })
                                        }
                                    })
                                    props.otherDevices?.map((device)=>{
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                        .then((msg)=>{
                                            if (msg.exists()) {
                                                messages = msg.val()
                                                messages.push({
                                                    [userName]: {
                                                        prompt:message,
                                                        reply:param[`${userName}`].reply,
                                                        id
                                                    }
                                                })
                                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                            }
                                            else{
                                                messages.push({
                                                    [userName]: {
                                                        prompt:message,
                                                        reply:param[`${userName}`].reply,
                                                        id
                                                    }
                                                })
                                                update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
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


    const sendMediaChat = () =>{
        const random = randomGenerate()
        const id = `${userName}${random}`
        if (!loading) {
            setReplyMsg(()=>null)
            setMicShow(()=>true)
            vnData.current = null
            setVoiceNoteSrc(null)
            setRecordState(()=>recordVoice)
            setVoicePreviewState(()=>pauseBtn)
            setLoading(()=>true)
            const message = collectInputTemp
            get(ref(db, "Messages/"+props.chatInfo))
            .then((output)=>{
                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                let randomValue = ""
                for (let index = 0; index < 12; index++) {
                    const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                    randomValue = randomValue + generateRandom
                }
                let dataParticlesCollection = []
                let dataParticleSize = 15000
                for (let index = 0; index < displayUrl.length; index += dataParticleSize) {
                    const particles  = displayUrl.slice(index, index + dataParticleSize)
                    dataParticlesCollection.push(particles)
                }
                if(!output.val().chatArray || output.val().chatArray == "No message" || typeof(output.val().message) == "string"){
                    setChatArray(prev=>[...prev, {[userName]:{
                            prompt: message,
                            progress: sending,
                            media: displayUrl,
                            mediaType: mediaType,
                            reply:replyMsg,
                            id  
                    }}])
                    const randoms = "abcdefghijklmnA1234567890BCDOELQPMLS"
                    const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                    for (let index = 0; index < dataParticlesCollection.length; index++) {
                        set(ref(db, `Media/${randomValue}/${[index]}`),{
                            data : dataParticlesCollection[index]
                        })
                    }
                    set(ref(db,"Messages/"+props.chatInfo),{
                        chatArray: [{[userName]:{
                            prompt:message,
                            mediaLink: randomValue,
                            mediaType: mediaType,
                            reply:replyMsg,
                            id
                        }}]
                    })
                    .then(()=>{
                        setCollectInputTemp(()=>null)
                        setMediaOption(()=>false)
                        setDisplayMedia(()=>false)
                        setLoading(()=>false)   
                        setMicShow(()=>true)
                        sendToNodeServer(props.chatFriendDetail.UserName, "TIlChat", `${userName} sent you a media`)
                        const friendsList = props.mutualRender
                        const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                        const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                        
                        if (getFriend && getFriend.length > 0) {
                            props.setMutualRender([...getOtherFriend, getFriend[0]])
                        }
                        set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                            user: randomValue
                        })
                         setChatArray(prev=>{
                            return prev.map((chat)=>{
                                const user = Object.keys(chat)[0]
                                console.log(user);
                                if (chat[user]?.id == id) {
                                    return{
                                        [user]:{
                                        ...chat[user],
                                        progress: sent,
                                    }}
                                }
                            })
                        })
                    })
                    .finally(()=>{
                        get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                        .then((output)=>{
                            let typingUsers = []
                            if (output.exists()) {
                                typingUsers = output.val()
                                const checkType = typingUsers.filter(typer=> typer != userName)
                                update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                    type: checkType
                                })
                            } 
                        })
                        .finally(()=>{
                            get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                            .then((result)=>{
                                let friendNotifications = []
                                const valueToPush = {
                                    prompt: `${userName} sent you a media`,
                                    sender: userName
                                }
                                if (result.exists()) {
                                    friendNotifications = result.val()
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                                else{
                                    friendNotifications = []
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                            })
                            props.otherDevices?.map((device)=>{
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                .then((msg)=>{
                                    if (msg.exists()) {
                                        messages = msg.val()
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:replyMsg,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                    else{
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:replyMsg,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                })
                            })
                        })
                    })
                }
                else{
                    let tempData = output.val().chatArray
                    const blob = new Blob([displayUrl], { type: mediaType });
                    const url = URL.createObjectURL(blob);
                    setChatArray(prev=> [...prev, {[userName]:{
                        prompt:message,
                        media: displayUrl,
                        progress: sending,
                        mediaType: mediaType,
                        reply:replyMsg,
                        id
                    }}])
                    for (let index = 0; index < dataParticlesCollection.length; index++) {
                        set(ref(db, `Media/${randomValue}/${[index]}`),{
                            data : dataParticlesCollection[index]
                        })
                    }
                    tempData.push({[userName]:{
                        prompt:message,
                        progress: sending,
                        mediaLink: randomValue,
                        mediaType: mediaType,
                        reply:replyMsg,
                        id
                    }})
                    set(ref(db,"Messages/"+props.chatInfo),{
                        chatArray: tempData
                    })
                    .then(()=>{
                        setCollectInputTemp(()=>null)
                        setMediaOption(()=>false)
                        setDisplayMedia(()=>false)
                        setLoading(()=>false)
                        setMicShow(()=>true)
                        sendToNodeServer(props.chatFriendDetail.UserName, "TIlChat", `${userName} sent you a media`)
                        const friendsList = props.mutualRender
                        const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                        const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                        
                        if (getFriend && getFriend.length > 0) {
                            props.setMutualRender([...getOtherFriend, getFriend[0]])
                        }
                        set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                            user: randomValue
                        })
                         setChatArray(prev=>{
                            return prev.map((chat)=>{
                                const user = Object.keys(chat)[0]
                                console.log(user);
                                if (chat[user]?.id == id) {
                                    return{
                                        [user]:{
                                        ...chat[user],
                                        progress: sent,
                                    }}
                                }
                            })
                        })
                    })
                    .finally(()=>{
                        get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                        .then((output)=>{
                            let typingUsers = []
                            if (output.exists()) {
                                typingUsers = output.val()
                                const checkType = typingUsers.filter(typer=> typer != userName)
                                update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                    type: checkType
                                })
                            } 
                        })
                        .finally(()=>{
                            get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                            .then((result)=>{
                                let friendNotifications = []
                                const valueToPush = {
                                    prompt: `${userName} sent you a media`,
                                    sender: userName
                                }
                                if (result.exists()) {
                                    friendNotifications = result.val()
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                                else{
                                    friendNotifications = []
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                            })
                            props.otherDevices?.map((device)=>{
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                .then((msg)=>{
                                    if (msg.exists()) {
                                        messages = msg.val()
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: "no med",
                                                mediaType: mediaType,
                                                reply:replyMsg,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                    else{
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:replyMsg,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                })
                            })
                        })
                    })
                }
            })
            scrollToBottom()
            clearOpt()

        }
    }

    const reSendMediaChat = (param) =>{
        const id = param[`${userName}`].id
        if (!loading) {
            setReplyMsg(()=>null)
            setMicShow(()=>true)
            vnData.current = null
            setVoiceNoteSrc(null)
            setRecordState(()=>recordVoice)
            setVoicePreviewState(()=>pauseBtn)
            setLoading(()=>true)
            const message = param[`${userName}`].prompt
            get(ref(db, "Messages/"+props.chatInfo))
            .then((output)=>{
                const randoms = "-_--_abcdefghijklmnA1234567890ABCDEFGHIJKLMNO-__-"
                let randomValue = ""
                for (let index = 0; index < 12; index++) {
                    const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                    randomValue = randomValue + generateRandom
                }
                let dataParticlesCollection = []
                let dataParticleSize = 15000
                for (let index = 0; index < displayUrl.length; index += dataParticleSize) {
                    const particles  = displayUrl.slice(index, index + dataParticleSize)
                    dataParticlesCollection.push(particles)
                }
                if(!output.val().chatArray || output.val().chatArray == "No message" || typeof(output.val().message) == "string"){
                    // setChatArray(prev=>[...prev, {[userName]:{
                    //         prompt: message,
                    //         progress: sending,
                    //         media: displayUrl,
                    //         mediaType: mediaType,
                    //         reply:replyMsg,
                    //         id  
                    // }}])
                    const randoms = "abcdefghijklmnA1234567890BCDOELQPMLS"
                    const generateRandom = randoms[Math.floor(Math.random()*randoms.length)]
                    for (let index = 0; index < dataParticlesCollection.length; index++) {
                        set(ref(db, `Media/${randomValue}/${[index]}`),{
                            data : dataParticlesCollection[index]
                        })
                    }
                    set(ref(db,"Messages/"+props.chatInfo),{
                        chatArray: [{[userName]:{
                            prompt:message,
                            mediaLink: randomValue,
                            mediaType: mediaType,
                            reply:param[`${userName}`].reply,
                            id
                        }}]
                    })
                    .then(()=>{
                        setCollectInputTemp(()=>null)
                        setMediaOption(()=>false)
                        setDisplayMedia(()=>false)
                        setLoading(()=>false)   
                        setMicShow(()=>true)
                        sendToNodeServer(props.chatFriendDetail.UserName, "TIlChat", `${userName} sent you a media`)
                        const friendsList = props.mutualRender
                        const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                        const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                        
                        if (getFriend && getFriend.length > 0) {
                            props.setMutualRender([...getOtherFriend, getFriend[0]])
                        }
                        set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                            user: randomValue
                        })
                         setChatArray(prev=>{
                            return prev.map((chat)=>{
                                const user = Object.keys(chat)[0]
                                console.log(user);
                                if (chat[user]?.id == id) {
                                    return{
                                        [user]:{
                                        ...chat[user],
                                        progress: sent,
                                    }}
                                }
                            })
                        })
                    })
                    .finally(()=>{
                        get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                        .then((output)=>{
                            let typingUsers = []
                            if (output.exists()) {
                                typingUsers = output.val()
                                const checkType = typingUsers.filter(typer=> typer != userName)
                                update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                    type: checkType
                                })
                            } 
                        })
                        .finally(()=>{
                            get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                            .then((result)=>{
                                let friendNotifications = []
                                const valueToPush = {
                                    prompt: `${userName} sent you a media`,
                                    sender: userName
                                }
                                if (result.exists()) {
                                    friendNotifications = result.val()
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                                else{
                                    friendNotifications = []
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                            })
                            props.otherDevices?.map((device)=>{
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                .then((msg)=>{
                                    if (msg.exists()) {
                                        messages = msg.val()
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:param[`${userName}`].reply,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                    else{
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:param[`${userName}`].reply,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                })
                            })
                        })
                    })
                }
                else{
                    let tempData = output.val().chatArray
                    const blob = new Blob([displayUrl], { type: mediaType });
                    const url = URL.createObjectURL(blob);
                    // setChatArray(prev=> [...prev, {[userName]:{
                    //     prompt:message,
                    //     media: displayUrl,
                    //     progress: sending,
                    //     mediaType: mediaType,
                    //     reply:replyMsg,
                    //     id
                    // }}])
                    for (let index = 0; index < dataParticlesCollection.length; index++) {
                        set(ref(db, `Media/${randomValue}/${[index]}`),{
                            data : dataParticlesCollection[index]
                        })
                    }
                    tempData.push({[userName]:{
                        prompt:message,
                        progress: sending,
                        mediaLink: randomValue,
                        mediaType: mediaType,
                        reply:param[`${userName}`].reply,
                        id
                    }})
                    set(ref(db,"Messages/"+props.chatInfo),{
                        chatArray: tempData
                    })
                    .then(()=>{
                        setCollectInputTemp(()=>null)
                        setMediaOption(()=>false)
                        setDisplayMedia(()=>false)
                        setLoading(()=>false)
                        setMicShow(()=>true)
                        sendToNodeServer(props.chatFriendDetail.UserName, "TIlChat", `${userName} sent you a media`)
                        const friendsList = props.mutualRender
                        const getFriend = friendsList.filter(friend => props.chatFriendDetail.UserName == friend.UserName)
                        const getOtherFriend = friendsList.filter(friend => props.chatFriendDetail.UserName != friend.UserName)
                        
                        if (getFriend && getFriend.length > 0) {
                            props.setMutualRender([...getOtherFriend, getFriend[0]])
                        }
                        set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                            user: randomValue
                        })
                         setChatArray(prev=>{
                            return prev.map((chat)=>{
                                const user = Object.keys(chat)[0]
                                console.log(user);
                                if (chat[user]?.id == id) {
                                    return{
                                        [user]:{
                                        ...chat[user],
                                        progress: sent,
                                    }}
                                }
                            })
                        })
                    })
                    .finally(()=>{
                        get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
                        .then((output)=>{
                            let typingUsers = []
                            if (output.exists()) {
                                typingUsers = output.val()
                                const checkType = typingUsers.filter(typer=> typer != userName)
                                update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                                    type: checkType
                                })
                            } 
                        })
                        .finally(()=>{
                            get(ref(db, `Users/${props.chatFriendDetail.UserName}/notifications`))
                            .then((result)=>{
                                let friendNotifications = []
                                const valueToPush = {
                                    prompt: `${userName} sent you a media`,
                                    sender: userName
                                }
                                if (result.exists()) {
                                    friendNotifications = result.val()
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                                else{
                                    friendNotifications = []
                                    friendNotifications.push(valueToPush)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                            })
                            props.otherDevices?.map((device)=>{
                                let messages = []
                                get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}/chat`))
                                .then((msg)=>{
                                    if (msg.exists()) {
                                        messages = msg.val()
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:param[`${userName}`].reply,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
                                    }
                                    else{
                                        messages.push({
                                            [userName]: {
                                                prompt: message,
                                                media: displayUrl,
                                                mediaType: mediaType,
                                                reply:param[`${userName}`].reply,
                                                id  
                                            }
                                        })
                                        update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.chatInfo}`), {chat:messages})
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

    const changeMediaOption = () =>{
        if (mediaOption) {
            setMediaOption(()=>false)
        }
        else{
            setMediaOption(()=>true)
        }
    }
    const displayGallery = async(e) =>{
        const file = e.target.files[0]
        if (file.type > 5000000) {
            alert("file size it too big")
            return
        }
        
        try {
            const result = await reduceMediaQualityToFile(file, 0.7, 800);
            let reader = new FileReader
            reader.addEventListener("load", (e)=>{
                const bufferResult = e.target.result
                const uint8Array = new Uint8Array(bufferResult)
                setDisplayUrl(()=>uint8Array)
                if (file.type == "image/png" || file.type == "image/jpg" || file.type == "image/jpeg") {
                    setMediaType(()=>"image")
                    setDisplayMedia(()=>true)
                    setMediaFileName(()=>file.name)
                }
                else if (file.type == "video/mp4") {
                    setMediaType(()=>"video")
                    setDisplayMedia(()=>true)
                    setMediaFileName(()=>file.name)
                }
                
                else{
                    alert("Invalid media type")
                }
        })
        reader.readAsArrayBuffer(result.file)
        } catch (error) {
            
        }
        
     } 
    const documentUpload = (e) =>{
        const file = e.target.files[0]
        const reader = new FileReader
        reader.addEventListener("load",(e)=>{
            const bufferResult = e.target.result
            const uint8Array = new Uint8Array(bufferResult)
            setDisplayUrl(()=>uint8Array)
            setMediaType(()=>file.type)
            setDisplayMedia(()=>true)
        })
        reader.readAsDataURL(file)
    }
    useEffect(() => {
        const fetchMedia = async() =>{
            const arrayToMap = chatArray
            let arrayToAdjust = chatArray
            for (let index = 0; index < arrayToMap.length; index++) {
                const output = arrayToMap[index]
                if (output) {
                    const user = Object.keys(output)[0]
                    const userData = output[user]
                    if(user != userName && userData?.mediaLink && !userData?.media){
                        get(ref(db, `Media/${userData.mediaLink}`))
                        .then((response)=>{
                            if (response.exists()) {
                                const allChunks = response.val()
                                let collectData = []
                                allChunks?.map((output, index) => {
                                    collectData.push(output.data)
                                })
                                const uint8Chunks = collectData.map(chunk => new Uint8Array(chunk));
                                const blob = new Blob(uint8Chunks, { type: arrayToAdjust[index][user].mediaType });
                                const url = URL.createObjectURL(blob);
                                setChatArray(prev=>prev.map((data, i) =>
                                    i == index? {...data,[user]: {...data[user],media: blob}} : data
                                ))
                                allChunks.map((output, index)=>{
                                    set(ref(db, `Media/${userData.mediaLink}/${index}`), null)
                                    .then(()=>{
                                    })
                                })
                            }
                        })
                    }
                }
            }
        }
        fetchMedia()
    }, [chatArray])

    const changeShowType = () =>{ 
        if(window.innerWidth <= 800){
            props.setChatState(()=>"sider")
            props.setChatInfo(()=>"")
            get(ref(db, `Users/${props.chatFriendDetail.UserName}/type/type`))
            .then((output)=>{
                let typingUsers = []
                if (output.exists()) {
                    typingUsers = output.val()
                    const checkType = typingUsers.filter(typer=> typer != userName)
                    update(ref(db, `Users/${props.chatFriendDetail.UserName}/type`),{
                        type: checkType
                    })
                } 
            })
        }
    }

    const ReplyComponent = ({id, user}) =>{
        if (id && user) {
            const filterChat = chatArray.filter(friend => friend[user]?.id == id)
            if (filterChat && filterChat.length > 0) {
                return(
                    <div className='repliedMsg' disabled onClick={()=>{locateReply(id)}}>
                        <div className='mediaParent'>
                            {filterChat[0][user]?.media? 
                                <div className='mediaPrev' disabled>
                                    <MediaTypesSelect type={filterChat[0][user].mediaType} data={filterChat[0][user].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                </div>
                            :null}
                            <h5>{filterChat[0][user]?.prompt}</h5>
                        </div>
                        {filterChat[0][user].voiceNote? <audio src={filterChat[0][user].voiceNote} controls></audio> : null}
                    </div>
                )
            }
        }
    }

    const locateReply = (id) =>{        
        const element = document.getElementById(id)
        element.scrollIntoView({ behavior: "auto",block:"nearest", inline:"start" })
        element.style.background = "#36323273"
        setTimeout(() => {
        element.style.background = ""
        }, 1000);
    }

    // const [moreOption, setMoreOption] = useState(true) 
    const displayOpt = (e, id) =>{
        const parent = e?.target?.offsetParent
        const option = parent.children[0]
        document.querySelectorAll(".optionList").forEach((opt)=>{
            opt.style.display = "none"
        })
        document.querySelectorAll(".moreIcon").forEach((icon)=>{
            icon.style.display = "none"
        })
        document.querySelectorAll(".request").forEach((chat)=>{
            chat.style.filter = "blur(10px)"
            chat.style.pointerEvent = "none"
        })
        document.querySelectorAll(".response").forEach((chat)=>{
            chat.style.filter = "blur(10px)"
            chat.style.pointerEvent = "none"
        })
        document.getElementById(id).style.filter = "blur(0px)"
        document.getElementById(id).style.pointerEvent = "d"
        option.style.display = "flex"
    }

    const clearOpt = (e) =>{
        if (e?.target?.className == "moreIcon") {
            return
        }
        document.querySelectorAll(".optionList").forEach((opt)=>{
            opt.style.display = "none"
        })
        document.querySelectorAll(".moreIcon").forEach((icon)=>{
            icon.style.display = "block"
        })
        document.querySelectorAll(".request").forEach((chat)=>{
            chat.style.filter = "blur(0px)"
            chat.style.pointerEvent = "d"
        })
        document.querySelectorAll(".response").forEach((chat)=>{
            chat.style.filter = "blur(0px)"
            chat.style.pointerEvent = "d"
        })
    }


    return (
        <main className='main-overall' style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"calc(100% - 00px)"}}>
            {displayMedia?
                <ChatMediaSend displayUrl={displayUrl} setDisplayMedia={setDisplayMedia} mediaType={mediaType} sendMediaChat={sendMediaChat} setCollectInputTemp={setCollectInputTemp} collectInputTemp={collectInputTemp} loading={loading}/>:
                <div className='view-overall'>
                {previewMedia? <PreviewMedia previewSrc={previewSrc.current} previewType = {previewType.current} setPreviewMedia={setPreviewMedia}/> : null}
                <header>
                    <div className="profile">
                        <img src={profileArrow} className='navigateArrow' onClick={changeShowType}/>
                        <img src={props.chatFriendDetail.profilePic} alt="" style={{filter: "invert(0) opacity(.8)",border: "2px solidrgb(0, 4, 222)"}}/>
                        <div style={{display:"flex",flexDirection:"column"}}>
                            <p>{props.chatFriendDetail.FullName}</p>
                            {friendTyping? <small style={{color:'whitesmoke'}}>Typing...</small>:<small style={{color:'whitesmoke'}}>@{props.chatFriendDetail.UserName}</small>}
                        </div>
                    </div>
                    <div className="settings">
                        <img src={deleteImg} alt="" title='delete'/>
                    </div>
                </header>
                <div className='welcome-view-ai'>
                    <div className='chat-log-overflow' onClick={(e)=>{clearOpt(e)}}>
                        <div className="chat-log blurItem">
                            {
                                chatArray.map((output,index)=>{
                                    if(output){
                                        if (Object.keys(output)[0] == userName) {
                                            return(
                                                <div className='request chat-request' key={index} id={output[`${userName}`]?.id? output[`${userName}`]?.id : ""} onDoubleClick={()=>{reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`)}} onDrag={()=>{reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`)}} draggable>
                                                    <div className="optET">
                                                        <div id={`${output[`${userName}`]?.id}opt`} className="optionList" >
                                                            <div className="option settings"><p>Settings</p></div>
                                                            <div className="option" ><p>Chat Blog</p></div>
                                                            <div className="option"><p>About</p></div>
                                                            <div className="option"><p>Donate</p></div>
                                                            <div className="option"><p>Log out</p></div>
                                                        </div>
                                                        <img src={more} onClick={(e)=>{displayOpt(e, output[`${userName}`]?.id)}} alt="" className='moreIcon' />
                                                        <main>
                                                            {output[`${userName}`]?.reply? <ReplyComponent id={output[`${userName}`]?.reply.id} user={output[`${userName}`]?.reply?.user}/>: null}
                                                            <MediaTypesSelect type={output[`${userName}`].mediaType} data={output[`${userName}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                                            <MediaTypesSelect type={'audio/webm;codecs=opus'} data={output[`${userName}`].voiceNote} statusPreview={statusPreview}/>
                                                            <p>{output[`${userName}`].prompt}<img src={output[`${userName}`].progress} alt="" className='progress' onClick={output[`${userName}`].progress == sending? ()=>{resendChat(output)} : null}/></p>
                                                            <div className="chat-tail tail-right"></div>
                                                        </main>
                                                    </div>
                                                    <section>
                                                        <img src={props.userCredentials.profilePic} alt="" className="userProf" />
                                                        <p>{userName}</p>
                                                    </section>
                                                </div>
                                            )
                                        }
                                        else{
                                            return(
                                                <div className='response chat-response' key={index} id={output[`${Object.keys(output)[0]}`]?.id? output[`${Object.keys(output)[0]}`]?.id : ""} onDoubleClick={()=>{reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`)}} onDrag={()=>{reply(output[`${Object.keys(output)[0]}`].id, `${Object.keys(output)[0]}`)}} draggable>
                                                    <div className="optET">
                                                        <div id={`${output[`${Object.keys(output)[0]}`]?.id}opt`} className="optionList" >
                                                            <div className="option settings"><p>Settings</p></div>
                                                            <div className="option" ><p>Chat Blog</p></div>
                                                            <div className="option"><p>About</p></div>
                                                            <div className="option"><p>Donate</p></div>
                                                            <div className="option"><p>Log out</p></div>
                                                        </div>
                                                        <img src={more} onClick={(e)=>{displayOpt(e, output[`${Object.keys(output)[0]}`]?.id)}} alt="" className='moreIcon' />
                                                        <main>
                                                            {output[`${Object.keys(output)[0]}`]?.reply? (<ReplyComponent id={output[`${Object.keys(output)[0]}`]?.reply?.id} user={output[`${Object.keys(output)[0]}`]?.reply?.user}/>) : null}
                                                            <MediaTypesSelect type={output[`${Object.keys(output)[0]}`].mediaType} data={output[`${Object.keys(output)[0]}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                                            <MediaTypesSelect type={'audio/webm;codecs=opus'} data={output[`${Object.keys(output)[0]}`].voiceNote} statusPreview={statusPreview}/>
                                                            <p>{output[`${Object.keys(output)[0]}`].prompt}</p>
                                                            <div className="chat-tail tail-left"></div>
                                                        </main>
                                                   </div>
                                                    <section>
                                                        <img src={props.chatFriendDetail.profilePic} alt="" className="userProf" />
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
                                    friendTyping?
                                    <div className='response chat-response' >
                                        <main>
                                                <div className="typeDotParent">
                                                    <div className="typingDots"></div>
                                                    <div className="typingDots"></div>
                                                    <div className="typingDots"></div>
                                                </div>
                                        </main>
                                    </div>
                                    :null
                                }
                            </div>
                            <div>
                                <section ref={scrollChat}></section>
                            </div>
                        </div>
                    </div>
                    {replyMsgCon? 
                    <div className='replyMsg' disabled>
                        <div className='mediaParent'>
                            {replyMsgCon?.media? 
                                <div className='mediaPrev'>
                                    <MediaTypesSelect type={replyMsgCon.mediaType} data={replyMsgCon.media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                </div>
                            :null}
                            <h5>{replyMsgCon?.prompt}</h5>
                        </div>
                        {replyMsgCon.voiceNote? <audio src={replyMsgCon.voiceNote} controls></audio> : null}
                        
                        <img src={close} onClick={closeReply} alt="" className='closeImg' />
                    </div>
                : null}
                </div>
                {
                    mediaOption?
                    <div className="mediaType">
                        <input type="file" id='galleryUpload' onChange={(e)=>{displayGallery(e)}} name='galleryUpload' style={{display:"none"}}/>
                        <input type="file" id='documentUpload' onChange={(e)=>{documentUpload(e)}} name='documentUpload' style={{display:"none"}}/>
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
                    </div>:
                    null
                }
                
                <audio src={voiceNoteSrc} ref={audioTag} autoPlay style={{display:"none"}} onEnded={()=>setVoicePreviewState(playBtn)}></audio>
                {voiceNoteSrc? 
                    <div className="voiceNote">
                        <img src={deleteImg} onClick={closeVn}/>
                        <img src={voicePreviewState} onClick={pausePlayVoice}/>
                        <img src={send} onClick={sendVN} style={{filter:"opacity(.6) invert(1)", width:"25px"}}/>
                    </div>
                : 
                    <div className="welcome-input">
                        <textarea autoComplete='on' rows="5" cols="30" autoCorrect='on' type="text" ref={userPrompt} id='userPromptDom' onChange={typing}/>
                        <img src={linkBtn} alt="" onClick={changeMediaOption}  className='addBtn'/>
                        {micShow? <img src={recordState} className={recordState == stopVoiceRecording? "recordingPauseBtn" : null} onClick={voiceNote} alt=""/> : <img src={send} onClick={sendChat} alt=""/>}
                    </div>
                }
                
            </div>
            }
        </main>
    )
}


export default ChatDisplay
