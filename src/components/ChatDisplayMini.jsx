import React, { useState,useEffect, useRef, useMemo, useCallback, useEffectEvent } from 'react'
import "../Styles/ChatDisplayMini.css"
import send from "../images/paper-plane.png"
import pauseBtn from "../images/pause.png"
import {app, db} from '../firebase/config'
import {ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
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
import more from "../images/more.png"
import ForwardDialogue from './ForwardDialogue.jsx'
import { ProfiileView } from './ProfiileView.jsx'
import videoCallIcon from "../images/cam-recorder.png"
import voiceCallIcon from "../images/phone.png"
import { useChatDB } from '../chatDb.js'


const ChatDisplayMini = (props) => {

    const navigate = useNavigate()
    // const useVal = ()=>{val()}
    const [onChat, setOnChat] = useState(false)
    const propsValue = useRef()
    const [userName, setUserName] = useState()
    const [mediaOption, setMediaOption] = useState(false)
    const [displayUrl, setDisplayUrl] = useState()
    const [displayMedia, setDisplayMedia] = useState(false)
    const [mediaType, setMediaType] = useState()
    const [previewMedia, setPreviewMedia] = useState(false)
    const [collectInputTemp, setCollectInputTemp] = useState(null)
    const [loading, setLoading] = useState(false)
    const [statusPreview, setStatusPreview] = useState(false)
    const previewSrc = useRef(null)
    const previewType = useRef(null)
    const userPrompt = useRef("")
    const allType = useRef([])
    const [friendTyping, setFriendTyping] = useState(false)
    const [micShow, setMicShow] = useState(true)
    const [recordState, setRecordState] = useState(recordVoice)
    const [voiceNoteSrc, setVoiceNoteSrc] = useState()
    const [voicePreviewState, setVoicePreviewState] = useState(pauseBtn)
    const [replyMsgCon, setReplyMsgCon] = useState()
    const audioTag = useRef("")
    const holdChat = useRef([])
    const [forwardBlock, setForwardBlock] = useState(false)
    const [previewBlock, setPreviewBlock] = useState(false)
    const [friendOptions, setFriendOptions] = useState(false)
    const [friendWallpaper, setFriendWallpaper] = useState()
    const [archived, setArchived] = useState(false)
    const [chatBlocked, setChatBlocked] = useState(false)
    
    
    const preview = (data, type) =>{
        previewSrc.current = data
        previewType.current = type
        setPreviewMedia(()=>true)
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
    
    const { 
        saveChat, 
        getChat, 
        getAllDirectories,
        getStats 
    } = useChatDB();
    const holdPropsChat = useRef()
    useEffect(() => {
        setForwardBlock(false)
        setVoiceNoteSrc(null)
        setPreviewBlock(false)
        setMicShow(()=>true)
        setFriendOptions(()=>false)
        const checkFriendWallpaper = props.friendsWallpaper.filter(wallpaper=> Object.keys(wallpaper)[0] == props.miniChatFriendDetails?.UserName)
        if (checkFriendWallpaper.length > 0) {
            setFriendWallpaper(checkFriendWallpaper[0][props.miniChatFriendDetails?.UserName])
        }
        else{
            setFriendWallpaper(props.currentWallpaper)
        }
        const filterBlocked = props.chatBlocked.filter(friend=> friend == props.miniChatFriendDetails?.UserName)
        console.log("Chat blocked", filterBlocked);
        if (filterBlocked.length > 0) {
            setChatBlocked(true)
        }
        else{
            setChatBlocked(false)
        }
        const filterArchived = props.archivedArray.filter(friend => friend == props.miniChatFriendDetails?.UserName)
        if (filterArchived.length > 0) {
            setArchived(true)
        }
        else{
            setArchived(false)
        }
        console.log(props.miniChatInfo);
        
        getChat(props.miniChatInfo)
        .then((output)=>{
            setOnChat(true)
            if (output) {
                const filterOut = output.filter(chat=> chat != undefined || chat != null)
                props.setMiniChatArray(filterOut) 
            }
            else{
                props.setMiniChatArray([])
            }
        })
        .finally(()=>{
            holdPropsChat.current = props.miniChatInfo
            if (userPrompt?.current?.value) {
                userPrompt.current.value = ""
            }
            get(ref(db, `Users/${userName}/type`))
            .then((output)=>{
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing=> typing == props.miniChatFriendDetails?.UserName)
                if (checkFriendTyping.length > 0) {
                    setFriendTyping(()=>true)
                    setTimeout(() => {
                        // scrollToBottom()
                    }, 500);
                }
                else{
                    setFriendTyping(()=>false)
                }
                const filterFriendTyping = typingFriends.filter(typing=> typing != props.miniChatFriendDetails?.UserName)
                update(ref(db, `Users/${userName}/type`),{
                    type: filterFriendTyping
                })
            }
            else{
                setFriendTyping(()=>false)
            }
        })
        })
    }, [props.miniChatInfo])

    useEffect(()=>{
        const filterBlocked = props.chatBlocked.filter(friend=> friend == props.miniChatFriendDetails?.UserName)
        console.log("Chat blocked", filterBlocked);
        if (filterBlocked.length > 0) {
            setChatBlocked(true)
        }
        else{
            setChatBlocked(false)
        }
    },[props.chatBlocked])

    useEffect(() => {
        const checkFriendWallpaper = props.friendsWallpaper.filter(wallpaper=> Object.keys(wallpaper)[0] == props.miniChatFriendDetails?.UserName)
        if (checkFriendWallpaper.length > 0) {
            setFriendWallpaper(checkFriendWallpaper[0][props.miniChatFriendDetails?.UserName])
        }
    }, [props.friendsWallpaper])

    useEffect(() => {
        const device = props.deviceUserAgent
        if (props.miniChatInfo) {
            if (props.miniChatInfo == props.miniChatFriendDetails?.UserName + userName || holdPropsChat.current == userName + props.miniChatFriendDetails?.UserName) {
                const deviceMsg = onValue(ref(db, `DevicesMessages/${userName}/"${device}"/${props.miniChatInfo}/chat`), (output)=>{
                    if (output.exists()) {
                        const allResult = output.val()
                        props.setMiniChatArray(prev => {
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
                                
                                if (!newId){
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
                        set(ref(db, `DevicesMessages/${userName}/"${device}"/${props.miniChatInfo}`), null);
                    }
                })
                return  deviceMsg
            }
        }
    }, [props.miniChatInfo, props.miniChatFriendDetails, onChat, userName])
    
    useEffect(() => {
        const device = props.deviceUserAgent
        if (props.miniChatInfo) {
            if (props.miniChatInfo == props.miniChatFriendDetails?.UserName + userName || holdPropsChat.current == userName + props.miniChatFriendDetails?.UserName) {
                const deleteMsgCheck = onValue(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.miniChatInfo}/chat`), (output)=>{
                    if (output.exists()) {
                        const deletedArray = output.val()
                        deletedArray.map((id)=>{
                                props.setMiniChatArray(prev=>{
                                    return prev.map((output)=>{
                                        if (output) {
                                            const user = Object.keys(output)[0]
                                            if (output[user].id == id) {
                                                return{
                                                    [user]:{
                                                        deleted: true
                                                    }
                                                }
                                            }
                                            return output
                                        }
                                    })
                                })
                            })
                        set(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.miniChatInfo}`), null);
                    }
                })
                return  deleteMsgCheck
            }
        }
    }, [props.miniChatInfo, props.miniChatFriendDetails, onChat, userName])
    

    useEffect(() => {
        const checkTyping = onValue(ref(db, `Users/${userName}/type`),(output)=>{
            if (output.exists()) {
                let typingFriends = output.val().type
                allType.current = output.val().type
                const checkFriendTyping = typingFriends.filter(typing=> typing == props.miniChatFriendDetails?.UserName)
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
                    const checkFriendTyping = typingFriends.filter(typing=> typing != props.miniChatFriendDetails?.UserName)
                    update(ref(db, `Users/${userName}/type`),{
                        type: checkFriendTyping
                    })
                }, 3000);
            }
            else{
                setFriendTyping(()=>false)
            }
        })
        return checkTyping
    }, [userName, props.miniChatFriendDetails])

    const chatDuplicate = useRef()


    useEffect(() => {
        if (props.miniChatArray.length > 0) {
            saveChat(props.miniChatInfo, props.miniChatArray)
            holdChat.current = props.miniChatArray
            scrollToBottom()
            if (props.miniChatArray && props.miniChatArray.length > 0) {
                const ids = new Set();
                let hasDuplicates = false;
    
                props.miniChatArray.forEach(item => {
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
                        props.setMiniChatArray(prev => {
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
        }
    }, [props.miniChatArray])
    const checkDuplicate = () =>{
        
    }
    useEffect(() => {
        propsValue.current = props.miniChatInfo
        if (onChat) {
            const requestValue = onValue(ref(db,"Messages/"+props.miniChatInfo+"/"),(output)=>{
                if (props.miniChatInfo == propsValue.current) {
                    if (output.val()?.chatArray) {
                        if (output.val().chatArray != "No message") {
                            if (output.val()?.message != "hello") {
                                const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                                if(Object.keys(output.val().chatArray[0])[0] != userName){
                                    set(ref(db,"Messages/"+props.miniChatInfo),{
                                        chatArray: "No message"
                                    })
                                    props.setMiniChatArray(prev=>[...prev, ...output.val().chatArray])
                                    let messageToSend = output.val().chatArray
                                    props.otherDevices?.map((device)=>{
                                        let messages = []
                                        get(ref(db, `DevicesMessages/${userName}/"${device}"/${props.miniChatInfo}/chat`))
                                        .then((msg)=>{
                                            if (msg.exists()) {
                                                messages = msg.val()
                                                messageToSend.map((forwardMsg)=>{
                                                    messages.push(forwardMsg)
                                                })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.miniChatInfo}`), {chat:messages})
                                                }
                                                else{
                                                    messageToSend.map((forwardMsg)=>{
                                                        messages.push(forwardMsg)
                                                    })
                                                    update(ref(db, `DevicesMessages/${userName}/"${device}"/${props.miniChatInfo}`), {chat:messages})
                                                }
                                        })
                                    })
                                }
                                
                            }
                        }
                        else{
                            const userName = JSON.parse(localStorage.getItem("TilChat")).UserName
                            get(ref(db, `Users/${props.miniChatFriendDetails?.UserName}/readReceipt`))
                            .then((receipt)=>{
                                if (!receipt.exists() || receipt.val() != false) {
                                    props.setMiniChatArray(prev => prev.map(item => {
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
    }, [props.miniChatInfo, onChat])

    const sentImage = sent
    const onlineImage = online
    useEffect(() => {
        const checkOnline = onValue(ref(db,`Users/${props.miniChatFriendDetails?.UserName}/onlineCheck`),(result)=>{
            if (!result.val()) {
                props.setMiniChatArray(prev => prev.map(item => {
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
    }, [props.miniChatFriendDetails, userName])

    useEffect(() => {
        const fetchMedia = async() =>{
            const arrayToMap = props.miniChatArray
            let arrayToAdjust = props.miniChatArray
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
                                props.setMiniChatArray(prev=>prev.map((data, i) =>
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
    }, [props.miniChatArray])

    const locateReply = (id) =>{        
        const element = document.getElementById(id)
        element.scrollIntoView({ behavior: "auto",block:"nearest", inline:"start" })
        element.style.background = "#36323273"
        setTimeout(() => {
        element.style.background = ""
        }, 1000);
    }

    const ReplyComponent = ({id, user}) =>{
        if (id && user) {
            const filterChat = props.miniChatArray.filter(friend => friend && user && friend[user] && friend[user]?.id == id)
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


    useEffect(() => {
        if (props.miniChatInfo) {
            if (onChat) {
                const checkDelete = onValue(ref(db, `DeletedMsg/${props.miniChatInfo}`),(output)=>{
                    if (output.val()) {
                        if (props.miniChatInfo == userName+props.miniChatFriendDetails?.UserName || props.miniChatInfo == props.miniChatFriendDetails?.UserName+userName) {
                            const deletedArray = output.val()
                            deletedArray.map((id)=>{
                                props.setMiniChatArray(prev=>{
                                    return prev.map((output)=>{
                                        if (output) {
                                            const user = Object.keys(output)[0]
                                            if (output[user].id == id) {
                                                return{
                                                    [user]:{
                                                        deleted: true
                                                    }
                                                }
                                            }
                                            return output
                                        }
                                    })
                                })
                            })
                            console.log("start");
                            props.otherDevices?.map((device)=>{
                                get(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.miniChatInfo}/chat`))
                                .then((Dmsg)=>{
                                console.log("dd", Dmsg.val());
                                
                                    let deletedMsg = []
                                    if (Dmsg.exists()) {
                                        deletedMsg = Dmsg.val()
                                    }
                                    deletedArray.map((id)=>{
                                        deletedMsg.push(id)
                                    })
                                    set(ref(db, `DevicesMessagesDeleted/${userName}/"${device}"/${props.miniChatInfo}`),{
                                        chat: deletedMsg
                                    })
                                })
                            })
                            set(ref(db, `DeletedMsg/${props.miniChatInfo}`), null)
                        }
                    }
                })
                return checkDelete
            }
        }
    }, [props.miniChatInfo, props.miniChatArray, props.miniChatFriendDetails])

        const archiveFriend = (detail) =>{
        get(ref(db, `Archived/${userName}`))
        .then((output)=>{
            let allValue = []
            if (output.val()) {
                const filterBlocked = output.val().filter(all => all != detail.UserName)
                allValue = filterBlocked
            }
            allValue.push(detail.UserName)
            update(ref(db,  `Archived`), {
                [userName] : allValue
            })
            .then((output)=>{
                props.setArchivedArray(prev=> [...prev, detail.UserName])
            })
        })
        .finally(()=>{
            setArchived(true)
        })

    }

    const unarchiveFriend = (detail) =>{
        get(ref (db, `Archived/${userName}`))
        .then((output)=>{
            if (output.exists()) {
                let holdValue = output.val()
                const filterUser = holdValue.filter(friend => friend != detail.UserName)
                update(ref (db, `Archived`),{
                    [userName] : filterUser
                })
                .then(()=>{
                    props.setArchivedArray(filterUser)
                })
            }
        })
        .finally(()=>{
            setArchived(false)
        })
    }

    const clearChat = () =>{
        props.setMiniChatArray([])
        saveChat(props.miniChatInfo, props.miniChatArray)
    }

    const blockChat = () =>{
        const friendName = props.miniChatFriendDetails?.UserName
        if (!friendName) {
            return
        }
        get(ref (db, `Blocked/${friendName}`))
        .then((output)=>{
            console.log(output.val());
            let allBlocked = []
            if (output.exists()) {
                const filterBlocked = output.val().filter(all => all != userName)
                allBlocked = (filterBlocked)
            }
            allBlocked.push(userName)
            console.log(allBlocked)
            update(ref (db, `Blocked`),{
                [friendName] : allBlocked
            })
            .then(()=>{
                props.setChatBlocked(prev=> [...prev, friendName])
                let holdBlocked = props.chatBlocked
                holdBlocked.push(friendName)
                update(ref (db, `UserBlock`),{
                    [userName] : holdBlocked
                })
                setChatBlocked(true)
            })
        })
    }


    const unBlockChat = () =>{
        const friendName = props.miniChatFriendDetails?.UserName
        if (!friendName) {
            return
        }
        get(ref (db, `Blocked/${friendName}`))
        .then((output)=>{
            console.log(output.val());
            if (output.exists()) {
                const filterBlocked = output.val().filter(all => all != userName)
                update(ref (db, `Blocked`),{
                    [friendName] : filterBlocked
                })
                .then(()=>{
                    let holdBlocked = props.chatBlocked
                    if (holdBlocked) {
                        holdBlocked.filter(friend=> friend != friendName)
                    }
                    props.setChatBlocked(holdBlocked)
                    update(ref (db, `UserBlock`),{
                        [userName] : holdBlocked
                    })
                    setChatBlocked(false)
                })
            }
            else{
                let holdBlocked = props.chatBlocked
                const filterHoldBlock = holdBlocked.filter(friend=> friend != friendName)
                console.log(filterHoldBlock);
                props.setChatBlocked(filterHoldBlock)
                update(ref (db, `UserBlock`),{
                    [userName] : filterHoldBlock
                })
                setChatBlocked(false)
            }
        })
    }

    const removeMini = () =>{
        props.setMiniShow(false)
    }



  return(
        <section className="overSea-m" onClick={removeMini}>
            <main className='chat-mini'>
            <img src={friendWallpaper} className="wallpapper" alt="" />
                <div className="main-parent">
                    <div className={previewBlock? "previewBlockCheck view-overall": "view-overall"}>
                        {previewMedia? <PreviewMedia previewSrc={previewSrc.current} previewType = {previewType.current} setPreviewMedia={setPreviewMedia}/> : null}
                        <header>
                            <div className="profile">
                                <div style={{display:"flex",flexDirection:"column"}}>
                                    <p>{props.miniChatFriendDetails?.FullName}</p>
                                    {friendTyping? <small style={{color:'whitesmoke'}}>Typing...</small>:null}
                                </div>
                            </div>
                        </header>
                        <div className='welcome-view-ai'>
                            <div className='chat-log-overflow'>
                                <div className="chat-log blurItem">
                                    {
                                        props.miniChatArray.map((output,index)=>{
                                            if(output){
                                                if (Object.keys(output)[0] == userName) {
                                                    return(
                                                        <div className='request chat-request' key={index} id={output[`${userName}`]?.id? output[`${userName}`]?.id : ""}>
                                                            <div className="optET">
                                                                {
                                                                    output[`${Object.keys(output)[0]}`].deleted == true? 
                                                                        <main>
                                                                            <i>This message was deleted</i>
                                                                            <div className="chat-tail tail-right"></div>
                                                                        </main>
                                                                    :
                                                                    output[`${Object.keys(output)[0]}`]?.call? 
                                                                        <main className="call-diablogue">
                                                                            <div className='inner'>
                                                                                {output[`${Object.keys(output)[0]}`]?.call == "voice"? <img src={voiceCallIcon} alt="" /> : <img src={videoCallIcon} alt="" />}
                                                                                <div className="call-detail">
                                                                                    <p>{output[`${Object.keys(output)[0]}`]?.call}</p>
                                                                                    {output[`${Object.keys(output)[0]}`]?.time? <p>{output[`${Object.keys(output)[0]}`]?.time}</p>: null}
                                                                                    <h4>{output[`${Object.keys(output)[0]}`]?.acccept}</h4>
                                                                                </div>
                                                                            </div>
                                                                            <div className="chat-tail tail-right"></div>
                                                                        </main>
                                                                    
                                                                    :
                                                                        <main>
                                                                            {output[`${Object.keys(output)[0]}`].star == true? <h1>⭐</h1> : null}
                                                                            {output[`${userName}`]?.reply? <ReplyComponent id={output[`${userName}`]?.reply.id} user={output[`${userName}`]?.reply?.user}/>: null}
                                                                            <MediaTypesSelect type={output[`${userName}`].mediaType} data={output[`${userName}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                                                            <MediaTypesSelect type={'audio/webm;codecs=opus'} data={output[`${userName}`].voiceNote} statusPreview={statusPreview}/>
                                                                            <p>{output[`${userName}`].prompt}<img src={output[`${userName}`].progress} alt="" className='progress'/></p>
                                                                            {output[`${userName}`]?.uneditable == true ? <small>Edited</small> : null}
                                                                            <div className="chat-tail tail-right"></div>
                                                                        </main>
                                                                }
                                                            </div>
                                                        </div>
                                                    )
                                                }
                                                else{
                                                    return(
                                                        <div className='response chat-response' key={index} id={output[`${Object.keys(output)[0]}`]?.id? output[`${Object.keys(output)[0]}`]?.id : ""} >
                                                            <div className="optET">
                                                                {output[`${Object.keys(output)[0]}`]?.deleted == true? 
                                                                <main>
                                                                    <i>This message was deleted</i>
                                                                    <div className="chat-tail tail-left"></div>
                                                                </main>:
                                                                output[`${Object.keys(output)[0]}`]?.call? 
                                                                    <main className="call-diablogue">
                                                                        <div className='inner'>
                                                                            {output[`${Object.keys(output)[0]}`]?.call == "voice"? <img src={voiceCallIcon} alt="" /> : <img src={videoCallIcon} alt="" />}
                                                                            <div className="call-detail">
                                                                                <p>{output[`${Object.keys(output)[0]}`]?.call}</p>
                                                                                {output[`${Object.keys(output)[0]}`]?.time? <p>{output[`${Object.keys(output)[0]}`]?.time}</p>: null}
                                                                                <h4>{output[`${Object.keys(output)[0]}`]?.acccept}</h4>
                                                                            </div>
                                                                        </div>
                                                                    <div className="chat-tail tail-left"></div>
                                                                    </main>
                                                                
                                                                :
                                                                <main>
                                                                    {output[`${Object.keys(output)[0]}`]?.star == true? <h1>⭐</h1> : null}
                                                                    {output[`${Object.keys(output)[0]}`]?.reply? (<ReplyComponent id={output[`${Object.keys(output)[0]}`]?.reply?.id} user={output[`${Object.keys(output)[0]}`]?.reply?.user}/>) : null}
                                                                    <MediaTypesSelect type={output[`${Object.keys(output)[0]}`].mediaType} data={output[`${Object.keys(output)[0]}`].media} setPreviewMedia={setPreviewMedia} previewSrc={previewSrc} previewType = {previewType} statusPreview={statusPreview}/>
                                                                    <MediaTypesSelect type={'audio/webm;codecs=opus'} data={output[`${Object.keys(output)[0]}`].voiceNote} statusPreview={statusPreview}/>
                                                                    <p>{output[`${Object.keys(output)[0]}`].prompt}</p>
                                                                    {output[`${Object.keys(output)[0]}`]?.uneditable == true ? <small>Edited</small> : null}
                                                                    <div className="chat-tail tail-left"></div>
                                                                </main>
                                                                }
                                                            </div>
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
                        </div>
                    </div>
                </div>
                <div className="settings">
                        <div className="profileOptionList" style={friendOptions == true? {display: "flex"}: null}>
                            {archived? <div className="option" onClick={()=>unarchiveFriend(props.miniChatFriendDetails)}><p>Unarchive Chat </p></div> : <div className="option" onClick={()=>archiveFriend(props.miniChatFriendDetails)}><p>Archive Chat </p></div>}
                            <div className="option" onClick={clearChat}><p>Clear Chat</p></div>
                            {chatBlocked? <div className="option" onClick={unBlockChat}><p>Unblock</p></div> : <div className="option" onClick={blockChat}><p>Block</p></div>}
                            <div className="option"><p>Delete Chat</p></div>
                        </div>
                    </div>
        </main>
        </section>
    )
}

export default ChatDisplayMini
