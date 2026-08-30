import React, { useEffect, useRef, useState } from 'react'
import "../Styles/Chats.css"
import archive from "../images/archive.png"
import more from "../images/more.png"
import userImg from "../images/user.png"
import { app, db } from '../firebase/config'
import { ref, push, set, get, query, onValue, orderByChild, equalTo, orderByKey, update, startAt, endAt } from "firebase/database"
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import profileArrow from "../images/left-arrow-white.png"
import { useChatDB } from "../chatDb";
import groupImg from "../images/group.png"





const Chats = (props) => {
    const navigate = useNavigate()
    const checkActive = useRef(true)
    const checkJustActive = useRef(true)
    const [archives, setArchives] = useState(false)
    const [currentChat, setCurrentChat] = useState(null)
    const searchChat = (e) => {
        let values = (e.target.value)
        if (values == "") {
            props.setChatSearchFilter(props.mutualRender)
        }
        else {
            props.setChatSearchFilter(props.mutualRender.filter((friend) => friend.UserName?.includes(values.toLowerCase()) || friend?.FullName?.includes(values.toLowerCase())))
        }
    }
    const {
        saveChat,
        getChat,
        getAllDirectories,
        getStats
    } = useChatDB();

    useEffect(() => {
      if (window.innerWidth <= 600 && !props.userCredentials || props.userCredentials?.length == 0) {
            navigate("/dashboard")
            return
        }
    }, [])
    

    const clearOpt = () => {
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
    }

    const message = (output, index) => {
        setCurrentChat(index)
        clearOpt()
        // alert(checkActive.current)
        // if (props.miniShow) {
        //     return
        // }
        if (output?.type == "group") {
            props.setChatInfo(output?.UUID)
            const allList = props.mutualRender
            const userIndex = allList.findIndex(friend => friend?.UserName == output?.UserName)
            props.setMutualRender(prev => prev.map((data, i) =>
                i == userIndex ? { ...data, unreadMsg: false } : data
            ))
            props.setChatFriendDetail(C => output)
            props.setChatView(true)
            getChat(output?.UUID)
                .then((output1) => {
                    if (output != props.chatInfo) {
                        if (output1) {
                            const filterOut = output1.filter(chat => chat != undefined || chat != null)
                            props.setChatArray(filterOut)
                            if (window.innerWidth <= 800) {
                                if (window.innerWidth <= 600) {
                                    navigate("/chat")
                                    return
                                }
                                props.setChatState(() => "chat")
                            }
                            return
                        }
                    }
                })
            return
        }
        console.log("message check", props.userCredentials);
        if (!props.userCredentials || !props.userCredentials?.UserName) {
            return
        }
        const allList = props.mutualRender
        const userIndex = allList.findIndex(friend => friend?.UserName == output?.UserName)
        props.setMutualRender(prev => prev.map((data, i) =>
            i == userIndex ? { ...data, unreadMsg: false } : data
        ))
        props.setChatFriendDetail(C => output)
        props.setChatView(true)
        const Msg1 = output?.UserName + props.userCredentials?.UserName
        const Msg2 = props.userCredentials?.UserName + output?.UserName
        let Msg;
        let message1;
        let message2;
        
        getChat(Msg1)
            .then((output1) => {
                if (output != props.chatInfo) {
                    if (output1) {
                        // alert("chaii")
                        props.setChatInfo(() => Msg1)
                        const filterOut = output1.filter(chat => chat != undefined || chat != null)
                        props.setChatArray(filterOut)
                        if (window.innerWidth <= 800) {
                            navigate("/chat")
                        }
                        return
                    }
                    else {
                        getChat(Msg2)
                            .then((output2) => {
                                if (output2) {
                                    props.setChatInfo(() => Msg2)
                                    const filterOut = output2.filter(chat => chat != undefined || chat != null)
                                    props.setChatArray(filterOut)
                                    if (window.innerWidth <= 800) {
                                        navigate("/chat")
                                        return
                                    }
                                    return
                                }
                                else {
                                    if (window.innerWidth <= 800) {
                                        props.setChatInfo("")
                                        navigate("/chat", {state:{
                                            Msg1,
                                            Msg2,
                                            output
                                        }})
                                        return
                                    }
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
                                                                    const findFriend = mutuals.find(friend =>
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
                            })
                    }
                }
            })
    }
    const [moreOption, setMoreOption] = useState(null)
    const openMoreOption = () => {
        if (moreOption) {
            setMoreOption(() => null)
        }
        else {
            setMoreOption(() => "show")
        }
    }
    const blogComp = () => {
        props.setChatView(false)
        props.setViewState(() => "blog")
        if (window.innerWidth <= 800) {
            navigate("/chat")
        }
    }
    const settings = () => {
        props.setChangeSection(() => "settings")
    }



    const forwardInfoGet = async (output) => {
        const allList = props.mutualRender
        const userIndex = allList.findIndex(friend => friend?.UserName == output)
        const Msg1 = output + props.userCredentials?.UserName
        const Msg2 = props.userCredentials?.UserName + output
        let Msg;
        let message1;
        let message2;
        return getChat(Msg1)
            .then((output) => {
                if (output != props.chatInfo) {
                    if (output) {
                        return Msg1
                        // props.setChatInfo(()=>Msg1)
                    }
                    else {
                        return getChat(Msg2)
                            .then((output2) => {
                                if (output2) {
                                    return Msg2
                                    // props.setChatInfo(()=>Msg2)
                                }
                            })
                    }
                }
                else {
                    return get(ref(db, `Messages/${Msg1}`))
                        .then((output1) => {
                            if (output1.exists()) {
                                message1 = Msg1
                            }
                        })
                        .finally(() => {
                            return get(ref(db, `Messages/${Msg2}`))
                                .then((output2) => {
                                    if (output2.exists()) {
                                        message2 = Msg2
                                    }
                                    if (!message1 && !message2) {
                                        return update(ref(db, `Messages/${Msg1}`), {
                                            message: "hello"
                                        })
                                            .then(() => {
                                                // props.setChatInfo(M=>Msg1)
                                                let mutuals = []
                                                let friendMutuals = []
                                                return get(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`))
                                                    .then((data) => {
                                                        if (data.exists()) {
                                                            mutuals = data.val()
                                                        }
                                                        if (!(mutuals?.includes(output))) {
                                                            mutuals.push(output)
                                                            update(ref(db, `Users/${props.userCredentials?.UserName}`), {
                                                                mutualFriends: mutuals
                                                            })
                                                        }
                                                        return get(ref(db, `Users/${output?.UserName}/mutualFriends`))
                                                            .then((data) => {
                                                                if (data.exists()) {
                                                                    friendMutuals = data.val()
                                                                }
                                                                if (!(friendMutuals?.includes(output))) {
                                                                    friendMutuals.push(props.userCredentials?.UserName)
                                                                    return update(ref(db, `Users/${output}`), {
                                                                        mutualFriends: friendMutuals
                                                                    })
                                                                }
                                                                return Msg1
                                                            })
                                                    })
                                            })
                                    }
                                    else {
                                        if (message1) {
                                            return message1
                                            let mutuals;
                                            let friendMutual;
                                            return get(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`))
                                                .then((data) => {
                                                    mutuals = data.val()
                                                    const findFriend = mutuals.find(friend =>
                                                        friend == output
                                                    )
                                                    if (!findFriend || findFriend.length == 0) {
                                                        mutuals.push(output)
                                                        return update(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`), {
                                                            mutualFriends: mutuals
                                                        })
                                                    }
                                                })
                                        }
                                        else if (message2) {
                                            return message2
                                        }
                                    }
                                })
                        })
                }
            })
    }


    useEffect(() => {
        if (props.triggerForward == true) {
            mapForwardArray()
        }
    }, [props.triggerForward])
    const mapForwardArray = async () => {
        const holdArray = props.forwardArray.current
        for (const user of holdArray) {
            const getInfo = await forwardInfoGet(user)
            props.forwardChatInfo.current.push(getInfo)
        }
        props.setTriggerSend(true)
    }
    const showArchive = () => {
        setArchives(true)
    }
    const closeArchive = () => {
        setArchives(false)
        props.setMiniShow(false)
    }
    useEffect(() => {
        if (!props.openMsg) {
            return
        }
        let values = props.openMsg.toLowerCase().replace(/[.,]/g, "")
        if (values != "" && values) {
            const allFriends = props.mutualRender
            const exactMatch = allFriends.filter(friend => values.includes(friend?.UserName))
            const friendUserName = allFriends.filter(friend => values.includes(friend?.UserName))
            const friendName = allFriends.filter(friend => values.includes(friend?.FullName))
            const allGotten = [...exactMatch, ...friendUserName, ...friendName]
            console.log("allGotten", friendUserName);
            if (allGotten.length > 0) {
                const user = allGotten[0]
                const userIndex = allFriends.findIndex(friend => friend?.UserName == user?.UserName)
                console.log(user, userIndex);
                message(user, userIndex)
                props.setAskMsg(values)
            }
            else {
                props.setReturnStatement(`Sorry, could not find friend with the username of ${values}`)
            }
        }
    }, [props.openMsg])
    const holdTimer = useRef(null);
    const [preventDefault, setPreventDefault] = useState(true);
    const [isHolding, setIsHolding] = useState(false);

    const startHold = (e, output) => {
        if (props.miniShow) {
            props.setMiniShow(false)
            return
        }
        if (!props.userCredentials || !props.userCredentials?.UserName) {
            return
        }
        // e.preventDefault();
        checkActive.current = false
        setIsHolding(true);
        setPreventDefault(false);
        holdTimer.current = setTimeout(() => {
            props.setMiniShow(true);
            holdTimer.current = null;
            const allList = props.mutualRender
            const userIndex = allList.findIndex(friend => friend?.UserName == output?.UserName)
            props.setMutualRender(prev => prev.map((data, i) =>
                i == userIndex ? { ...data, unreadMsg: false } : data
            ))
            props.setMiniChatFriendDetail(C => output)
            props.setChatView(true)
            const Msg1 = output?.UserName + props.userCredentials?.UserName
            const Msg2 = props.userCredentials?.UserName + output?.UserName
            console.log(Msg1);
            console.log(Msg2);

            let Msg;
            let message1;
            let message2;
            getChat(Msg1)
                .then((output1) => {
                    if (output != props.miniChatInfo) {
                        console.log("output1", output);
                        if (output1) {
                            const filterOut = output1.filter(chat => chat != undefined || chat != null)
                            props.setMiniChatArray(filterOut)
                            props.setMiniChatInfo(() => Msg1)

                            return
                        }
                        else {
                            getChat(Msg2)
                                .then((output2) => {
                                    console.log("output2", output);
                                    if (output2) {
                                        const filterOut = output2.filter(chat => chat != undefined || chat != null)
                                        props.setMiniChatArray(filterOut)
                                        props.setMiniChatInfo(() => Msg2)
                                        return
                                    }
                                    else {
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
                                                                    props.setMiniChatInfo(M => Msg1)
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
                                                                props.setMiniChatInfo(M => message1)
                                                                let mutuals;
                                                                let friendMutual;
                                                                get(ref(db, `Users/${props.userCredentials?.UserName}/mutualFriends`))
                                                                    .then((data) => {
                                                                        mutuals = data.val()
                                                                        const findFriend = mutuals.find(friend =>
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
                                                                props.setMiniChatInfo(M => message2)
                                                            }
                                                        }
                                                    })
                                            })
                                    }
                                })
                        }
                    }
                })
        }, 300);
    };
    const preventScroll = useRef(true)
    const endHold = (e, output, index) => {
        console.log("just touch");

        e.preventDefault();
        setIsHolding(false);
        setPreventDefault(true);
        checkActive.current = true

        if (holdTimer.current) {
            clearTimeout(holdTimer.current);
            holdTimer.current = null;
        }
        if (!props.miniShow) {
            console.log(output);
            if (preventScroll.current) {
                console.log("message");
                
                message(output, index)
            }
            else {
                preventScroll.current = true
            }
        }
    };
    const closeTopOption = (e) => {
        if (e.target.className != "moreOption") {
            setMoreOption(false)
        }
    }
    const checkEvent = () => {
        preventScroll.current = false
    }
    return (
        <div className='chats-overall' onClick={(e) => { closeTopOption(e) }}>
            {archives ? <img src={profileArrow} className="navArrow" alt="" onClick={closeArchive} /> : null}
            <h1>{archives ? "Archive" : "TilChat"}</h1>
            {!archives ? <img className='moreOption' src={more} alt="" onClick={openMoreOption} /> : null}
            <div className="optionList" style={moreOption ? { display: "flex" } : { display: "none" }}>
                <div className="option" onClick={() => { props.setCreateGroup(true) }}><p>New Group</p></div>
                <div className="option settings" onClick={settings}><p>Settings</p></div>
                <div className="option" onClick={blogComp}><p>Chat Blog</p></div>
                <div className="option"><p>About</p></div>
                <div className="option"><p>Donate</p></div>
            </div>
            <input type="text" placeholder='Search' onChange={(e) => searchChat(e)} />
            {!archives ? (
                <div className="archived-parent" onClick={showArchive}>
                    <div>
                        <img src={archive} alt="" />
                        <p>Archive</p>
                    </div>
                    <h6>@</h6>
                </div>
            )
                : null}
            <div className="chats-parent">
                {archives ?
                    props.chatSearchFilter.slice().reverse().map((output, index) => {
                        if (output?.type == "group") {
                            return (
                                <div className='chat' key={index} onMouseDown={(e) => { startHold(e, output) }} onTouchMove={checkEvent} onTouchStart={(e) => { startHold(e, output) }} onMouseUp={(e) => endHold(e, output, index)} onTouchCancel={(e) => endHold(e, output.index)} onTouchEnd={(e) => endHold(e, output, index)}>
                                    {currentChat == index ? (<div className="selectedChat"></div>) : null}
                                    <img src={output?.groupImg === "default" || !output?.groupImg ? groupImg : output?.groupImg} alt="" />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <p>{output?.name}</p>
                                        <small style={{ color: 'whitesmoke' }}>@group</small>
                                        {output?.unreadMsg ? <main className='unread'></main> : null}
                                    </div>
                                </div>
                            )
                        }
                        if (output?.UserName) {
                            const filterArchive = props.archivedArray.filter(friend => friend == output?.UserName)
                            if (filterArchive.length > 0) {
                                return (
                                    <div className='chat' key={index} onMouseDown={(e) => { startHold(e, output) }} onTouchStart={(e) => { startHold(e, output) }} onMouseUp={(e) => endHold(e, output, index)} onTouchCancel={(e) => endHold(e, output, index)} onTouchEnd={(e) => endHold(e, output, index)}>
                                        {currentChat == index ? (<div className="selectedChat"></div>) : null}
                                        <img src={output?.profilePic == "/src/images/user.png" || output?.profilePic == "/assets/user.png" ? userImg : output?.profilePic} alt="" />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <p>{output?.FullName}</p>
                                            <small style={{ color: 'whitesmoke' }}>@{output?.UserName}</small>
                                            {output?.unreadMsg ? <main className='unread'></main> : null}
                                        </div>
                                    </div>
                                )
                            }
                        }
                    })
                    :
                    props.chatSearchFilter.slice().reverse().map((output, index) => {
                        if (output?.type == "group") {
                            return (
                                <div className='chat' key={index} onMouseDown={(e) => { startHold(e, output) }} onTouchMove={checkEvent} onTouchStart={(e) => { startHold(e, output) }} onMouseUp={(e) => endHold(e, output, index)} onTouchCancel={(e) => endHold(e, output.index)} onTouchEnd={(e) => endHold(e, output, index)}>
                                    {currentChat == index ? (<div className="selectedChat"></div>) : null}
                                    <img src={output?.groupImg === "default" || !output?.groupImg ? groupImg : output?.groupImg} alt="" />
                                    <div style={{ display: "flex", flexDirection: "column" }}>
                                        <p>{output?.name}</p>
                                        <small style={{ color: 'whitesmoke' }}>@group</small>
                                        {output?.unreadMsg ? <main className='unread'></main> : null}
                                    </div>
                                </div>
                            )
                        }
                        if (output?.UserName) {
                            const filterArchive = props.archivedArray.filter(friend => friend == output?.UserName)
                            if (filterArchive.length == 0) {
                                return (
                                    <div className='chat' key={index} onMouseDown={(e) => { startHold(e, output) }} onTouchMove={checkEvent} onTouchStart={(e) => { startHold(e, output) }} onMouseUp={(e) => endHold(e, output, index)} onTouchCancel={(e) => endHold(e, output.index)} onTouchEnd={(e) => endHold(e, output, index)}>
                                        {currentChat == index ? (<div className="selectedChat"></div>) : null}
                                        <img src={output?.profilePic == "/src/images/user.png" || output?.profilePic == "/assets/user.png" ? userImg : output?.profilePic} alt="" />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <p>{output?.FullName}</p>
                                            <small style={{ color: 'whitesmoke' }}>@{output?.UserName}</small>
                                            {output?.unreadMsg ? <main className='unread'></main> : null}
                                        </div>
                                    </div>
                                )
                            }
                        }
                    })
                }
            </div>
        </div>
    )
}

export default Chats
