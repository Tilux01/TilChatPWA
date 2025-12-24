import React, { useState,useRef,useEffect, cache } from 'react'
import Status from './StatusPage.jsx'
import "../Styles/SideComponents.css"
import Sider from './Sider.jsx'
import Chats from "./Chats.jsx"
import FriendsComponent from './FriendsComponent.jsx'
import Live from './Live.jsx'
import UserStatus from './UserStatus.jsx'
import StatusPage from "./StatusPage.jsx"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,onChildAdded,ref, query, orderByChild, limitToLast, onValue,get, onChildChanged,set, update} from "firebase/database"
import axios from 'axios'
import logo from "../images/clinic-02.svg"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import Settings from './Settings.jsx'


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

const SideComponents = (props) => {
    const navigate = useNavigate()
    let userName 
    const localData = JSON.parse(localStorage.getItem("TilChat"))
    if (!localData || localData.profileId == "123"|| localData == {}) {
        navigate("/signup")
    }
    else{
        userName = localData?.UserName
    }
    useEffect(() => {
        // onChildAdded(ref(db, `Statuses`), (snapshot) => {
            //     const lastMessage = snapshot.val();
      // })

    }, [])
    const [statusArray, setStatusArray] = useState([])
    const [statusType, setStatusType] = useState(false)
    const holdRender = useRef([])
    const userCredRender = useRef([])
    
    const [changeSection, setChangeSection] = useState("Updates")
    const currentKeyIndex = useRef(0)
    
    const notification = (message = `sent you a message`, sender, media) =>{
        if("Notification" in window){
            if(Notification.permission == "default"){
                Notification.requestPermission()
                .then((permission)=>{
                    if(permission == "granted"){
                        Notify(message, sender, media)
                    }
                })
            }
            else if(Notification.permission == "granted"){
                Notify(message, sender, media)
            }
        }
    }
    const Notify = (message, sender, media) =>{
        const notification = new Notification(sender,{body:message, icon:media})
        notification.addEventListener("click", ()=>{
            window.focus()
            notification.close()
            const userCred = holdRender.current.filter(friend => friend?.UserName == sender)
            if (userCred.length == 1) {
                messageBack(userCred[0])
            }
        })
    }
    useEffect(() => {
        userCredRender.current = props.userCredentials
    }, [props.userCredentials])
    const messageBack = (output) =>{
        if(window.innerWidth <= 800){
            props.setChatState(()=>"chat")
        }
        props.setChatFriendDetail(C=>output)
        props.setChatView(true)
        const Msg1 = output?.UserName + userCredRender.current?.UserName
        const Msg2 = userCredRender.current?.UserName + output?.UserName
        let Msg;
        let message1;
        let message2;
        get(ref(db,`Messages/${Msg1}`))
        .then((output1)=>{
            if(output1.exists()){
                message1 = Msg1
            }
        }) 
        get(ref(db,`Messages/${Msg2}`))
        .then((output2)=>{
            if (output2.exists()) {
                message2 = Msg2
            }
        })
        .finally(()=>{
            if(!message1 && !message2){
                update(ref(db, `Messages/${Msg1}`),{
                    message:"hello"
                })
                .then(()=>{
                    props.setChatInfo(M=>Msg1)
                    let mutuals = []
                    let friendMutuals = []
                    get(ref(db,`Users/${userCredRender.current?.UserName}/mutualFriends`))
                    .then((data)=>{
                        if(data.exists()){
                            mutuals = data.val()
                        }
                        if(!(mutuals?.includes(output?.UserName))){
                            mutuals.push(output?.UserName)
                            update(ref(db, `Users/${userCredRender.current?.UserName}`),{
                                mutualFriends: mutuals
                            })
                        }
                    })
                    get(ref(db,`Users/${output?.UserName}/mutualFriends`))
                    .then((data)=>{
                        if(data.exists()){
                            friendMutuals = data.val()
                        } 
                        if(!(friendMutuals?.includes(output?.UserName))){
                            friendMutuals.push(userCredRender.current?.UserName)
                            update(ref(db, `Users/${output?.UserName}`),{
                                mutualFriends: friendMutuals
                            })
                        }
                    })
                })
            }
            else{
                if(message1){
                    props.setChatInfo(M=>message1)
                    let mutuals;
                    let friendMutual;
                    get(ref(db,`Users/${userCredRender.current?.UserName}/mutualFriends`))
                    .then((data)=>{
                        mutuals = data.val()
                        const findFriend = mutuals.find(friend=>
                            friend == output?.UserName
                        )
                        if(!findFriend){
                            mutuals.push(output?.UserName)
                            update(ref(db, `Users/${userCredRender.current?.UserName}/mutualFriends`),{
                                mutualFriends: mutuals
                            })
                        }
                    })
                }
                else if(message2){
                    props.setChatInfo(M=>message2)
                }
            }
        })
    }
    

    const apiKeys = useRef([
        "AIzaSyCwBD9L_ZyuBOLkCDEmNaSg1edHrQ5ZhMw",
        "AIzaSyB-6MJy50nYXmnIpx7qmqYSXcC_wf6kETI",
        "AIzaSyC6UFOM9Os-3KDkKN_OZAnu_uybL32Nm_k",
        "AIzaSyBgrnCL5ejBgt4QsWb-SswGgRbLd6qYA8w",
        "AIzaSyCKVVpOIcFHRyJyr-ui7j_ln49CIyn3wZk",
        "AIzaSyDTAfESXlqUZHdhBzKXg4FXnpu4Ypvx57M",
        "AIzaSyABTAd0wBKQPLQ55QqU5O-9jgHePpTpqoU",
        "AIzaSyAaXXCURcc9GRb0Kvj1LLvBp6jJDjOyVEw",
        "AIzaSyBr4JTEnGvyi_ckOQJilC9JPESiMIkoe58",
        "AIzaSyBODDvw4PWNosDtVTVJ7QMeHyYhVdLMV3k",
        "AIzaSyBnB5Io2sC4fDCUSeIF6XBSIbc3rhk6dGo",
        "AIzaSyDpHMdIAJKnGaOYxD-k2KSOXcK2tMZcu6I",
        "AIzaSyAVyZhPvqPFPHSvuHnBzBrQJVdrdOQhqzM",
        "AIzaSyDgbZ-fYb5jgLamjJLmXr77SLBfJQR169w",
        "AIzaSyArBJAmT2tJUbABRM3Ee54m-wZgLGGzWUY",
        "AIzaSyD0-lTek_Pe8-5mPiPjZUmMwmOeeJEL30Y",
    ])

    const [videoItems, setVideoItems] = useState([])
    const [videoSearch, setVideoSearch] = useState("sport")
    const [fetchStatus, setFetchStatus] = useState()
    

    const [friendStatusArray, setFriendStatusArray] = useState([])
    const [statusCollection, setStatusCollection] = useState([])
    const [pendingStatusCollection, setPendingStatusCollection] = useState([])
    const [filterStatus, setFilterStatus] = useState([])
    const [proceedSave, setProceedSave] = useState(false)
    const [proceedAfterDelete, setProceedAFterDelete] = useState(false)
    
    
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

    const [mutualFriendsArray, setMutualFriendsArray] = useState([])
    const [mutualRenderInverse, setMutualRenderInverse] = useState()
    const [chatSearchFilter, setChatSearchFilter] = useState([])
    
    const confirmMutual = useRef(true)
    const [allowCheck, setAllowCheck] = useState(false)
    useEffect(() => {
        getChat("friendsList")
        .then((output) =>{
            if (output) {
                props.setMutualRender(()=>output)
                const storageHold = output
                const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
                let holdData
                if (confirmMutual.current == true) {
                    get(ref(db, `Users/${userNameLoc? userNameLoc?.UserName : null}/mutualFriends`))
                    .then((output)=>{
                        if (output.exists()) {
                            holdData = output.val()
                            setMutualFriendsArray(output.val())
                        }
                        confirmMutual.current = false
                    })
                    .finally(()=>{
                        if (storageHold.length == 0 || storageHold == []) {
                            holdData?.map((data, index) => {
                                get(ref(db, `Users/${data}`))
                                .then((output)=>{
                                    props.setMutualRender(M=>[...M,output.val()])
                                })
                            })
                        }
                        else{
                            holdData?.map((data, index) => {
                                const segmentFind = storageHold.filter((friend)=>friend?.UserName == data)
                                if (segmentFind.length == 0) {
                                    get(ref(db, `Users/${data}`))
                                    .then((output)=>{
                                        props.setMutualRender(M=>[...M,output.val()])
                                    })
                                }
                            })
                        }
                    })
                }
            }
            else{
                const storageHold = []
                const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
                let holdData
                if (confirmMutual.current == true) {
                    get(ref(db, `Users/${userNameLoc? userNameLoc?.UserName : null}/mutualFriends`))
                    .then((output)=>{
                        if (output.exists()) {
                            holdData = output.val()
                            setMutualFriendsArray(output.val())
                        }
                        confirmMutual.current = false
                    })
                    .finally(()=>{
                        holdData?.map((data, index) => {
                            get(ref(db, `Users/${data}`))
                            .then((output)=>{
                                props.setMutualRender(M=>[...M,output.val()])
                            })
                        })
                    })
                }
            }
        })
    }, [])


    useEffect(() => {
        const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
        onValue(ref(db,`Users/${userNameLoc? userNameLoc?.UserName : null}/newFriends`),(data)=>{
            if (data.val()) {
                let holdData
                holdData = data.val()
                holdData?.map((data, index) => {
                    get(ref(db, `Users/${data}`))
                    .then((output)=>{
                        props.setMutualRender(M=>[...M,output.val()])
                    })
                })
                set(ref(db,`Users/${userNameLoc?.UserName}/newFriends`),null)
            }
        })
    }, [])

    useEffect(() => {
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"));
    
    onValue(ref(db, `Users/${userNameLoc?.UserName}/notifications`), (output) => {
            if (output.exists()) {
            const holdNotification = output.val();
            set(ref(db, `Users/${userNameLoc?.UserName}/notifications`), null);
            let arrayList = props.mutualRender
            let checkArray = []
            holdNotification.map((note) => {
                const filterNote = arrayList.filter(friend=> note.sender != friend?.UserName)
                const senderNote = arrayList.filter(friend=> note.sender == friend?.UserName)
                if (filterNote && filterNote.length > 0) {
                    checkArray = filterNote
                    const friend = senderNote[0]
                    const pushFriend = friend
                    
                    pushFriend.unreadMsg = true
                    checkArray.push(pushFriend)
                    arrayList = checkArray
                    props.setMutualRender(()=>arrayList)
                }
                // if(props.chatInfo === userNameLoc.UserName+note.sender || 
                // props.chatInfo === note.sender+userNameLoc.UserName) {
                    // return; 
                    // }
                    
                //     const senderImg = holdRender.current.find(friend => friend.UserName === note.sender);
                // const profilePic = senderImg?.profilePic || logo;
            })
        }
        return
    });
    }, [props.mutualRender]);

    useEffect(() => {
        setChatSearchFilter(props.mutualRender)
        holdRender.current = props.mutualRender
        if(props.mutualRender.length > 0){
            saveChat("friendsList", props.mutualRender)
        }
    }, [props.mutualRender])

    const saveUserStatus = async(directory, data) =>{
        const cache = await caches.open('TilCache')
        const response = new Response(JSON.stringify(data))
        await cache.put(directory, response)
    }

    const getUserStatus = async(key)=>{
        const cache = await caches.open("TilCache")
        const response = await cache.match(key)
        return response? await response.json() : null
    }

    useEffect(() => {
        if (filterStatus.length == 0) {
            getUserStatus('/TilChatStatus')
            .then((output)=>{
                if (output) {
                    setFilterStatus(()=>output)
                }
            })
        }
        setProceedSave(()=>true)
    }, [])

    useEffect(()=>{
        if (proceedSave) {
            if(filterStatus.length !== 0){
                saveUserStatus('/TilChatStatus', filterStatus)
            }
        }
    }, [filterStatus])


    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem("TilChat"))
        const userName = localData? localData?.UserName : null
        onValue(ref(db, `Users/${userName}/StatusPending/list`),(output)=>{
            if (output.exists()) {
                if (statusCollection.length == 0) {
                    setStatusCollection(()=>output.val())
                    set(ref(db, `Users/${userName}/StatusPending`), null)
                    .then(()=>{
                    })
                    .catch((err)=>{
                        
                    })
                }
                else{
                    setPendingStatusCollection(prev=>[...prev, output.val()])
                    set(ref(db, `Users/${userName}/StatusPending`), null)
                    .then(()=>{
                    })
                    .catch((err)=>{
                    })
                }
            }
        })
    }, [])
    
        useEffect(() => {
            if(pendingStatusCollection.length > 0){
                if(statusCollection.length == 0){
                    setStatusCollection(()=>pendingStatusCollection)
                }
            }
        }, [statusCollection, pendingStatusCollection])
    
        useEffect(() => {
            if (statusCollection.length > 0) {
                statusCollection.map((output)=>{
                    get(ref(db, `Statuses/${output?.userName}/${output.key}`))
                    .then((output)=>{
                        setFilterStatus(prev=>[...prev, output.val()])
                    })
                })
                setStatusCollection(()=>[])
            }
        }, [statusCollection])
        
        const [allStatusUser, setAllStatusUser] = useState([])
        useEffect(() => {
            let tempHold
            tempHold = allStatusUser
            const localData = JSON.parse(localStorage.getItem("TilChat"))
            const userName = localData? localData?.UserName : null
            setAllStatusUser(()=>[])
            filterStatus.map((output)=>{
                if (!tempHold?.includes(output?.userName)) {
                    if(output?.userName != userName){
                        tempHold.push(output?.userName)
                        setAllStatusUser(()=>tempHold)
                    }
                }
            })
        }, [filterStatus])

        useEffect(() => {
            if (filterStatus.length > 0) {
                deleteOutdatedStatus()
            }
        }, [filterStatus])

        const [sortUsers, setSortUsers] = useState([])
        const deleteOutdatedStatus = () =>{
            if(filterStatus && filterStatus.length > 0){   
                let allData
                let allIndex = []
                filterStatus.map((output, index)=>{
                    const currentDate = Date.now()
                    if (currentDate > output.endStamp) {
                        allIndex.push(index)
                    }
                })
                allIndex.map((index)=>{
                    allData = filterStatus
                    allData.splice(index, 1)
                    setFilterStatus(()=>allData)
                })
                let testData =[]
                setSortUsers(()=>[])
                const collectSortedUsers = []
                allStatusUser.map((output, index)=>{
                    testData = []
                    filterStatus.map((status,index)=>{
                        if (output == status?.userName) {
                            testData.push(status)
                        }
                    })
                    collectSortedUsers.push({[output]:testData})
                    setSortUsers(()=>collectSortedUsers)
                    testData = []
                })
                saveUserStatus('/TilChatStatus', filterStatus)
            }
        }
        let testData =[]
        useEffect(() => {
            setSortUsers(()=>[])
            const collectSortedUsers = []
            allStatusUser.map((output, index)=>{
                testData = []
                filterStatus.map((status,index)=>{
                    if (output == status?.userName) {
                        testData.push(status)
                    }
                })
                collectSortedUsers.push({[output]:testData})
                setSortUsers(()=>collectSortedUsers)
                testData = []
            })
        }, [filterStatus,allStatusUser])



    const [feed, setFeed] = useState([])
    // Feed section
        // useEffect(() => {
        //     axios.get("https://newsapi.org/v2/top-headlines?country=us&apiKey=41181213ecd644ae9230d93ad0b40544")
        //     .then((output)=>{
        //         setFeed(()=>output.data.articles)
        //     })
        // }, [])
    // 
    
    const fetchVideo = (params) => {
        const sport = params;
        const API_KEY = apiKeys.current[currentKeyIndex.current]
        fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&eventType=live&type=video&maxResults=12&q=${encodeURIComponent(sport)}&key=${API_KEY}`)
            .then(response => {
            if (!response.ok) {
            }
            return response.json();
        })
        .then(data => {
            if(data.items != undefined){
                setVideoItems(V=>data.items)
                currentKeyIndex.current = 0
                return Promise.reject('Items Recieved')

            }
            if(data.error.message?.includes("The request cannot be completed because you have exceeded your")){
                if(currentKeyIndex.current >= apiKeys.current.length-1){
                    alert("server error, pls try  again later")
                }
                else{
                    currentKeyIndex.current = currentKeyIndex.current + 1
                    fetchVideo()
                }
            }
            })
            .catch(error => {
                if (error.message?.includes("Failed to fetch")) {
                    console.error("Network/CORS Issue Detected");
                }
        });
    };
  if (changeSection == "Updates") {
      return (
        <div className='side-components-parent' style={props.chatState == "chat"? {display: "none"} : {display: "flex"}}>
            <Sider setChatState={props.setChatState} setChangeSection={setChangeSection} setViewState={props.setViewState} ViewState={props.ViewState} fetchVideo={fetchVideo} setChatView={props.setChatView}/>
            <div className='status-Parent' style={{height:"100%"}}>
                {statusType?<UserStatus setChangeSection={setChangeSection} userCredentials={props.userCredentials} setChatState={props.setChatState} statusArray={statusArray} setStatusArray={setStatusArray} setStatusType={setStatusType}/>:<StatusPage setChangeSection={setChangeSection} setChatState={props.setChatState} userCredentials={props.userCredentials} setStatusType={setStatusType} sortUsers={sortUsers} allStatusUser={allStatusUser} filterStatus={filterStatus} feed={feed} setFeed={setFeed} setViewState={props.setViewState} ViewState={props.ViewState} feedObject={props.feedObject} setFeedObject={props.setFeedObject} setChatView={props.setChatView}/>}
            </div>
        </div>
      )
    }
  else if(changeSection == "Chats"){
      return (
        <div className='side-components-parent' style={props.chatState == "chat"? {display: "none"} : {display: "flex"}}>
            <Sider setChatState={props.setChatState} setChangeSection={setChangeSection} setViewState={props.setViewState} ViewState={props.ViewState} fetchVideo={fetchVideo} setChatView={props.setChatView}/>
            <div className='chats-Parent-overall'>
                <Chats setChangeSection={setChangeSection} setViewState={props.setViewState} setChatSearchFilter={setChatSearchFilter} chatSearchFilter={chatSearchFilter} setChatView={props.setChatView} setChatState={props.setChatState} setChatInfo={props.setChatInfo} chatInfo={props.chatInfo} setChatFriendDetail={props.setChatFriendDetail} mutualRender={props.mutualRender} setMutualRender={props.setMutualRender} userCredentials={props.userCredentials}/>
            </div>
        </div>
      )
  }
  else if(changeSection == "friends"){
      return (
        <div className='side-components-parent' style={props.chatState == "chat"? {display: "none"} : {display: "flex"}}>
            <Sider setChatState={props.setChatState} setChangeSection={setChangeSection} setViewState={props.setViewState} ViewState={props.ViewState} fetchVideo={fetchVideo} setChatView={props.setChatView}/>
            <div className='chats-Parent-overall' >
                <FriendsComponent setChangeSection={setChangeSection} mutualRenderInverse={mutualRenderInverse} mutualRender={props.mutualRender} setMutualRender={props.setMutualRender} setChatState={props.setChatState} setChatView={props.setChatView} setChatInfo={props.setChatInfo} chatInfo={props.chatInfo} setChatFriendDetail={props.setChatFriendDetail}/>
            </div>
        </div>
      )
  }
  else if(changeSection == "live"){
      return (
        <div className='live-side side-components-parent' style={props.chatState == "chat"? {display: "none"} : {display: "flex"}}>
            <Sider setChatState={props.setChatState} setChangeSection={setChangeSection} setViewState={props.setViewState} ViewState={props.ViewState} fetchVideo={fetchVideo} setChatView={props.setChatView}/>
            <div className='chats-Parent-overall'>
                <Live setChangeSection={setChangeSection} setChatState={props.setChatState} fetchVideo={fetchVideo} videoItems={videoItems} setVideoSearch={setVideoSearch} videoSearch={videoSearch} setViewState={props.setViewState} ViewState={props.ViewState} setIframeLink={props.setIframeLink} setChatView={props.setChatView}/>
            </div>
        </div>
      )
  }
  else if(changeSection == "settings"){
    return(
        <div className='side-components-parent' style={props.chatState == "chat"? {display: "none"} : {display: "flex"}}>
            <Sider setChatState={props.setChatState} setChangeSection={setChangeSection} setViewState={props.setViewState} ViewState={props.ViewState} fetchVideo={fetchVideo} setChatView={props.setChatView}/>
            <div className='chats-Parent-overall'>
                <Settings userCredentials={props.userCredentials} setChatState={props.setChatState} fetchVideo={fetchVideo} videoItems={videoItems} setVideoSearch={setVideoSearch} videoSearch={videoSearch} setViewState={props.setViewState} ViewState={props.ViewState} setIframeLink={props.setIframeLink} setChatView={props.setChatView}/>
            </div>
        </div>
    )
  }
}

export default SideComponents
