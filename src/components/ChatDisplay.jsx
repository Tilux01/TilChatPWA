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
import playBtn  from "../images/play-1073616_640.png"
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
    
    
    const preview = (data, type) =>{
        previewSrc.current = data
        previewType.current = type
        setPreviewMedia(()=>true)
    }
    const typing = () =>{
        if (userPrompt.current.value.length == 0) {
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
    const scrollChat = useRef(null)
    const scrollToBottom = () => {
        scrollChat.current?.scrollIntoView({ behavior: "smooth" })
    };
    const userNameGet = localStorage.getItem("TilChat")
    useEffect(() => {
        if(!userNameGet){
            navigate("/signup")
        }
        else{
            setUserName(JSON.parse(userNameGet).UserName)
            
        }
    }, [navigate])
    const [chatArray, setChatArray] = useState([])
    const propsValue = useRef()
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

    useEffect(() => {
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
            userPrompt.current.value = ""
            get(ref(db, `Users/${userName}/type`))
            .then((output)=>{
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing=> typing == props.chatFriendDetail.UserName)
                if (checkFriendTyping.length > 0) {
                    setFriendTyping(()=>true)
                    scrollToBottom()
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
        })
        })
    }, [props.chatInfo])


    useEffect(() => {
        onValue(ref(db, `Users/${userName}/type`),(output)=>{
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing=> typing == props.chatFriendDetail.UserName)
                if (checkFriendTyping.length > 0) {
                    setFriendTyping(()=>true)
                    scrollToBottom()
                }
                else{
                    setFriendTyping(()=>false)
                }
                setTimeout(() => {
                    const checkFriendTyping = typingFriends.filter(typing=> typing != props.chatFriendDetail.UserName)
                    update(ref(db, `Users/${userName}/type`),{
                        type: checkFriendTyping
                    })
                }, 20000);
            }
            else{
                setFriendTyping(()=>false)
            }
        })
    }, [userName, props.chatFriendDetail])

    useEffect(() => {
        saveChat(props.chatInfo, chatArray)
    }, [chatArray])
    const checkUser = useRef()
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
                            }
                            
                        }
                    }
                    else{
                        const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                        setChatArray(prev => prev.map(item => {
                            if (item[userName]) {
                                return {
                                    ...item,
                                        [userName]: {
                                        ...item[userName],
                                        progress: item[userName].progress === sent || item[userName].progress === online ? seen : item[userName].progress
                                    }
                                };
                            }
                            return item;
                        }));
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

    const reply = (msg) =>{
        setReplyMsg(()=>msg)
    }
    const closeReply = () =>{
        setReplyMsg(null)
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
            console.log('Node server notification failed:', error);
        }
    };

    const sendChat = () =>{
        if (!loading) {
            setReplyMsg(()=>null)
            setLoading(()=>true)
            const message = userPrompt.current.value
            if(message){
                get(ref(db, "Messages/"+props.chatInfo))
                .then((output)=>{
                    if(!output.val().chatArray || output.val().chatArray == "No message" || typeof(output.val().message) == "string"){
                        setChatArray(prev=>[...prev, {[userName]:{
                            prompt:message,
                            progress: sending,
                            media: null,
                            mediaType: null,
                            mediaLink: null,
                            reply:replyMsg
                        }}])
                        set(ref(db,"Messages/"+props.chatInfo),{
                            chatArray: [{[userName]:{
                                prompt:message,
                                media: null,
                                mediaType: null,
                                mediaLink: null,
                                reply:replyMsg
                            }}]
                        })
                        .then(()=>{
                            userPrompt.current.value = ""
                            setMediaOption(()=>true)
                            setMediaOption(()=>false)
                            setLoading(()=>false)
                            set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                                user: userName
                            })
                            setChatArray((prev)=>prev.slice(0, -1))
                            setChatArray(prev=>[...prev, {[userName]:{
                                prompt:message,
                                progress: sent,
                                media: null,
                                mediaType: null,
                                mediaLink: null,
                                reply:replyMsg
                            }}])
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
                                        sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                            notifications : friendNotifications
                                        })
                                    }
                                    else{
                                        friendNotifications = []
                                        friendNotifications.push(valueToPush)
                                        sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                        update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                            notifications : friendNotifications
                                        })
                                    }
                                })
                            })
                        })
                    }
                    else{
                            let tempData = output.val().chatArray
                            tempData.push({[userName]:{prompt:userPrompt.current.value}})
                            setChatArray(prev=>[...prev, {[userName]:{
                                prompt:userPrompt.current.value,
                                progress: sending,
                                reply:replyMsg
                            }}])
                            set(ref(db,"Messages/"+props.chatInfo),{
                                chatArray: tempData
                            })
                            .then(()=>{
                                userPrompt.current.value = ""
                                setMediaOption(()=>true)
                                setMediaOption(()=>false)
                                setLoading(()=>false)
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
                                    prompt:message,
                                    progress: sent,
                                    media: null,
                                    mediaType: null,
                                    mediaLink: null,
                                    reply:replyMsg
                                }}])
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
                                            sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                                notifications : friendNotifications
                                            })
                                        }
                                        else{
                                            friendNotifications = []
                                            friendNotifications.push(valueToPush)
                                            sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                            update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                                notifications : friendNotifications
                                            })
                                        }
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
        if (!loading) {
            setReplyMsg(()=>null)
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
                            reply:replyMsg  
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
                            reply:replyMsg
                        }}]
                    })
                    .then(()=>{
                        setCollectInputTemp(()=>null)
                        setMediaOption(()=>false)
                        setDisplayMedia(()=>false)
                        setLoading(()=>false)   
                        set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                            user: randomValue
                        })
                        setChatArray((prev)=>prev.slice(0, -1))
                        setChatArray(prev=>[...prev, {[userName]:{
                            progress: sent,
                            prompt:message,
                            media: displayUrl,
                            mediaType: mediaType,
                            reply:replyMsg
                        }}])
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
                                    sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                                else{
                                    friendNotifications = []
                                    friendNotifications.push(valueToPush)
                                    sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
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
                        reply:replyMsg
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
                        reply:replyMsg
                    }})
                    set(ref(db,"Messages/"+props.chatInfo),{
                        chatArray: tempData
                    })
                    .then(()=>{
                        setCollectInputTemp(()=>null)
                        setMediaOption(()=>false)
                        setDisplayMedia(()=>false)
                        setLoading(()=>false)
                        set(ref(db,`Users/${props.chatFriendDetail.UserName}/onlineCheck`),{
                            user: randomValue
                        })
                        setChatArray((prev)=>prev.slice(0, -1))
                        setChatArray(prev=>[...prev, {[userName]:{
                            progress: sent,
                            prompt:message,
                            mediaType: mediaType,
                            media: displayUrl,
                            reply: replyMsg
                        }}])
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
                                    sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
                                else{
                                    friendNotifications = []
                                    friendNotifications.push(valueToPush)
                                    sendToNodeServer(props.chatFriendDetail.UserName, userName, message)
                                    update(ref(db, `Users/${props.chatFriendDetail.UserName}`),{
                                        notifications : friendNotifications
                                    })
                                }
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
    const displayGallery = (e) =>{
        const file = e.target.files[0]
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
        reader.readAsArrayBuffer(file)
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
                const user = Object.keys(output)[0]
                const userData = output[user]
                if(user != userName && userData?.mediaLink && !userData?.media){
                    get(ref(db, `Media/${userData.mediaLink}`))
                    .then((response)=>{
                        const allChunks = response.val()
                        let collectData = []
                        allChunks.map((output, index) => {
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
                    })
                }
            }
            
        }
        fetchMedia()
    }, [chatArray])
    // useEffect(() => {
    //     scrollToBottom()
    // }, [chatArray])
    const changeShowType = () =>{ 
        if(window.innerWidth <= 800){
            props.setChatState(()=>"sider")
            props.setChatInfo(()=>null)
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
    return (
        <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
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
                    <div className='chat-log-overflow'>
                        <div className="chat-log">
                            {
                                chatArray.map((output,index)=>{
                                    if(output){
                                        if (Object.keys(output)[0] == userName) {
                                            return(
                                                <div className='request chat-request' key={index}>
                                                    <main>
                                                        {output[`${userName}`]?.reply? (<h5 className='repliedMsg'>{output[`${userName}`].reply}</h5>) : null}
                                                        <MediaTypesSelect type={output[`${userName}`].mediaType} data={output[`${userName}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                                        <p>{output[`${userName}`].prompt}<img src={output[`${userName}`].progress} alt="" className='progress'/></p>
                                                    </main>
                                                </div>
                                            )
                                        }
                                        else{
                                            return(
                                                <div className='response chat-response' key={index} onDoubleClick={()=>{reply(output[`${Object.keys(output)[0]}`].prompt)}} onDrag={()=>{reply(output[`${Object.keys(output)[0]}`].prompt)}} draggable>
                                                    <main>
                                                        {output[`${Object.keys(output)[0]}`].reply? (<h5 className='repliedMsg'>{output[`${Object.keys(output)[0]}`].reply}</h5>) : null}
                                                        <MediaTypesSelect type={output[`${Object.keys(output)[0]}`].mediaType} data={output[`${Object.keys(output)[0]}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                                        <p>{output[`${Object.keys(output)[0]}`].prompt}</p>
                                                    </main>
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
                            <section ref={scrollChat}></section>
                        </div>
                    </div>
                    {replyMsg? <div className='replyMsg'><h5>{replyMsg}</h5><img src={close} onClick={closeReply} alt="" /></div>: null}
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
                <div className="welcome-input">
                    <input type="text" ref={userPrompt} id='userPromptDom' onChange={typing}/>
                    <img src={linkBtn} alt="" onClick={changeMediaOption}  className='addBtn'/>
                    <img src={send} onClick={sendChat} alt=""/>
                </div>
            </div>
            }
        </main>
    )
}


export default ChatDisplay
