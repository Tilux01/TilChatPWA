import React, { useState, useEffect, useRef } from "react";
import "../Styles/friendsComponent.css"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey,update,startAt,endAt} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import Loader from "./Loader";
import more from "../images/more.png"
import userImg from "../images/user.png"


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


const FriendsComponent = (props) => {
    const [userCredentials, setUserCredentials] = useState([])
    const [friends, setFriends] = useState([])
    const [listArray, setListArray] = useState([])
    const [search, setUserSearch] = useState("")
    const [DisplaySearch, setDisplaySearch] = useState(undefined)
    const [buttonActive, setButtonActive] = useState(true)

    useEffect(() => {
        const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
        get(ref(db,`Users/${userNameLoc.UserName}`))
        .then((output)=>{
            if(output.exists()){
                setUserCredentials(output.val())                
            }
        })
    }, [])


    useEffect(() => {
        const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
        onValue(ref(db,`Users/${userNameLoc.UserName}/friendsArray`),(output)=>{
            if(output.exists()){
                setFriends(output.val())
            }
        })
    }, [])

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


    const searchFriends = async () => {
        setButtonActive(false)
        const searchTerm = search.toLowerCase();
        setListArray([]);
        document.querySelector(".friends-parent h2").style.display = "none"
        try {
            const nameQuery = query(
                ref(db, "Users"),
                orderByChild("_search/fullName"),
                startAt(searchTerm),
                endAt(searchTerm + "\uf8ff")
            );
            const usernameQuery = query(
                ref(db, "Users"),
                orderByChild("_search/userName"),
                startAt(searchTerm),
                endAt(searchTerm + "\uf8ff")
            );
            const [nameSnapshot, usernameSnapshot] = await Promise.all([
                get(nameQuery),
                get(usernameQuery)
            ]);
            const combinedResults = {};
            if (nameSnapshot.exists()) {
                Object.assign(combinedResults, nameSnapshot.val());
            }

            if (usernameSnapshot.exists()) {
                Object.assign(combinedResults, usernameSnapshot.val());
            }

            const results = Object.entries(combinedResults).map(([username, userData]) => ({
            username,
            ...userData
            }));

            setListArray(results);
            document.querySelector(".friends-parent h2").style.display = "block"
            setButtonActive(B=>true)
        } catch (error) {
            console.error("Search failed:", error);
            setListArray([]);
        }
    };

    useEffect(() => {
        if (listArray.length == 0) {
            setDisplaySearch("No Result Found")
        }
        else{
            setDisplaySearch("Search Result")
        }
    }, [listArray])
    const [addFriendGo, setAddFriendGO] = useState(false)
    const addFriend = (params,e) =>{
        const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
        const userName = userNameLoc.UserName
        const parentId = e.target.offsetParent.id
        let paramsArray = []
        document.querySelector(`#${parentId} .message-btn`).style.display = "block"
        document.querySelector(`#${parentId}  .add-btn`).style.display = "none"
        document.querySelector(`#${parentId} .remove-btn`).style.display = "none"
        get(ref(db,`Users/${params.UserName}/friendsArray`))
        .then((data)=>{
            if(data.exists()){
                paramsArray = data.val()
            }
            update(ref(db,"Users/"+params.UserName),{
                friendsArray:[...paramsArray,{UserName:userName,Validate:false,FullName:userCredentials.FullName}],
            })
            update(ref(db,"Users/"+userName),{
                friendsArray:[...friends,{UserName:params.UserName,Validate:true,FullName:params.FullName}],
            })
            sendToNodeServer(props.chatFriendDetail.UserName, "TIlChat", `${userCredentials.UserName} sent you a  friend request`)
        })
    }

    const confirmFriend = (output,index,e) =>{
        const previousFriend = [...friends]
        previousFriend[index].Validate = true
        let mutuals = []
        let friendMutuals = []
        update(ref(db,`Users/${userCredentials.UserName}`),{
            friendsArray:previousFriend
        })
        get(ref(db,`Users/${userCredentials.UserName}/mutualFriends`))
        .then((data)=>{
            if(data.exists()){
                mutuals = data.val()
            }
            if(!(mutuals.includes(output.UserName))){
                mutuals.push(output.UserName)
                update(ref(db, `Users/${userCredentials.UserName}`),{
                    mutualFriends: mutuals
                })
            }
        })
        .finally(()=>{
            let friend = []
            get(ref(db,`Users/${userCredentials.UserName}/newFriends`))
            .then((data)=>{
                if(data.exists()){
                    friend = data.val()
                }  
                friend.push(output.UserName)
                update(ref(db, `Users/${userCredentials.UserName}`),{
                    newFriends: friend
                })
            })
            .finally(()=>{
                get(ref(db,`Users/${output.UserName}/mutualFriends`))
                .then((data)=>{
                    if(data.exists()){
                        friendMutuals = data.val()
                    }  
                    if(!(friendMutuals.includes(userCredentials.UserName))){
                        friendMutuals.push(userCredentials.UserName)
                        update(ref(db, `Users/${output.UserName}`),{
                            mutualFriends: friendMutuals
                        })
                    }
                    const parentId = e.target.offsetParent?.id
                    // document.querySelector(`#${parentId} .message-btn`).style.display = "block"
                    // document.querySelector(`#${parentId}  .add-btn`).style.display = "none"
                })
                .finally(()=>{
                    let newFriend = []
                    get(ref(db,`Users/${output.UserName}/newFriends`))
                    .then((data)=>{
                        if(data.exists()){
                            newFriend = data.val()
                        }  
                        newFriend.push(userCredentials.UserName)
                        update(ref(db, `Users/${output.UserName}`),{
                            newFriends: newFriend
                        })
                        sendToNodeServer(props.chatFriendDetail.UserName, "TIlChat", `${userCredentials.UserName} confirmed your friend request`)
                    })
                })
            })
        })
    }
    const [firstGo, setFirstGo] = useState(false)
    const [secondGo, setSecondGo] = useState(false)
    const [msgGotten, setMsgGotten] = useState(false)
    
    const message = (output) =>{
        if(window.innerWidth <= 800){
            props.setChatState(()=>"chat")
        }
        const allList = props.mutualRender
        const userIndex = allList.findIndex(friend=> friend.UserName == output.UserName)
        console.log(userIndex);
        props.setMutualRender(prev=>prev.map((data, i) =>
            i == userIndex? {...data,unreadMsg: false} : data
        ))
        props.setChatFriendDetail(C=>output)    
        props.setChatView(true)
        const Msg1 = output.UserName + userCredentials.UserName
        const Msg2 = userCredentials.UserName + output.UserName
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
                })
            }
            else{
                if(message1){
                    
                    props.setChatInfo(M=>message1)
                    let mutuals;
                    let friendMutual;
                }
                else if(message2){
                    props.setChatInfo(M=>message2)
                }
            }
        })
    }
    const[mge, setMessage] = useState("")

    const [friendStatus, setFriendStatus] = useState("");
    const [go, setGo] = useState(false)
    const [friendGo, setFriendGo] = useState(false)
    const checkFriendStatus = useRef([])
    const checkFriendArrayStatus = useRef([])

    const [moreOption, setMoreOption] = useState(null)
    const openMoreOption =() =>{
        if (moreOption) {
            setMoreOption(()=>null)
        }
        else{
            setMoreOption(()=>"show")
        }
    }

    const settingsComp = () =>{
        props.setChangeSection(()=>"settings")
    }

    return (
        <div className="friends-overall">
            <h1>Friends</h1>
            <img className='moreOption' src={more} alt="" onClick={openMoreOption}/>
            <div className="optionList" style={moreOption?{display:"flex"}: {display:"none"}}>
                <div className="option settings" onClick={settingsComp}><p>Settings</p></div>
                <div className="option" ><p>Chat Blog</p></div>
                <div className="option"><p>About</p></div>
                <div className="option"><p>Donate</p></div>
                <div className="option"><p>Log out</p></div>
            </div>
            <div style={{display:"flex", justifyContent:"center", alignItems:"center"}}>
                <input type="text" placeholder='Search'value={search} onChange={(e)=>setUserSearch(e.target.value)}/>
                {buttonActive?<button onClick={searchFriends} className="SearchBtn">Search</button>:<button className="SearchBtn"><Loader/></button>}
            </div>
            <div className="friends-parent">
                <h2>{DisplaySearch}</h2>
                {
                    listArray?.map((output, index) => {
                        const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
                        const userName = userNameLoc?.UserName
                        if (output?.UserName != userName) {
                            if (friends?.length === 0) {
                                return (
                                    <div id={`parent${index}`} className="friends" key={`empty-${index}`}>
                                        <img src={output?.profilePic || userImg} alt="" />
                                        <div>
                                            <p style={{ marginTop: "-15px" }}>{output?.FullName}</p>
                                            <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output?.UserName}</small>
                                            <div className="Btn">
                                                <button onClick={(e) => addFriend(output,e)} className="add-btn">Add</button>
                                                    <button className="remove-btn">Remove</button>
                                                <button style={{display:"none"}} className='message-btn'>Cancel Request</button>
                                            </div>
                                        </div>
                                    </div>
                                );
                                }
                                
                                else {
                                // setFriendStatus()
                                const outputName = output?.UserName
                                const friendMatch = friends.find(friend => 
                                    friend.UserName ==  outputName  
                                )
                                const outputMatch = output.friendsArray.find(friend =>
                                    friend.UserName == userName
                                )
                                if(friendMatch && outputMatch){
                                    if(friendMatch?.Validate == false && outputMatch?.Validate == true){
                                        
                                        return(
                                            <div id={`parent${index}`} className="friends" key={`nonfriend-${index}`}>
                                                <img src={output?.profilePic} alt="" />
                                                <div>
                                                    <p style={{ marginTop: "-15px" }}>{output?.FullName}</p>
                                                    <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output?.UserName}</small>
                                                    <div className="Btn">
                                                        <button onClick={(e) => confirmFriend(output,index,e)} style={{width:"150px"}} className="add-btn">confirm</button>
                                                    </div>
                                                </div>
                                            </div>
                                        )
                                    }
                                    else if(friendMatch?.Validate == true && outputMatch?.Validate == true){
                                        return (
                                                <div id={`parent${index}`} className="friends" key={`friend-${index}`}>
                                                    <img src={output?.profilePic} alt="" />
                                                    <div>
                                                        <p style={{ marginTop: "-15px" }}>{output?.FullName}</p>
                                                        <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output?.UserName}</small>
                                                        <div className="Btn">
                                                            <button onClick={()=>{message(output)}} className='message-btn'>Message</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                    }
                                    else if (friendMatch?.Validate == true && outputMatch?.Validate == false) {
                                        return (
                                                <div id={`parent${index}`} className="friends" key={`friend-${index}`}>
                                                    <img src={output?.profilePic} alt="" />
                                                    <div>
                                                        <p style={{ marginTop: "-15px" }}>{output?.FullName}</p>
                                                        <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output?.UserName}</small>
                                                        <div className="Btn">
                                                            <button className='message-btn'>Cancel Request</button>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                    }
                                }
                                else{
                                    return (
                                            <div id={`parent${index}`} className="friends" key={`nonfriend-${index}`}>
                                                <img src={output.profilePic} alt="" />
                                                <div>
                                                    <p style={{ marginTop: "-15px" }}>{output.FullName}</p>
                                                    <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output.UserName}</small>
                                                    <div className="Btn">
                                                        <button onClick={(e) => addFriend(output,e)} className="add-btn">Add</button>
                                                        <button className="remove-btn">Remove</button>
                                                        <button style={{display:"none"}} className='message-btn'>Cancel Request</button>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                }
                            }
                        }
                        else{
                            return (
                                <div id={`parent${index}`} className="friends" key={`friend-${index}`}>
                                    <img src={output.profilePic} alt="" />
                                    <div>
                                        <p style={{ marginTop: "-15px" }}>{output.FullName}</p>
                                        <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output.UserName}</small>
                                        <div className="Btn">
                                            <button onClick={()=>{message(output)}} className='message-btn'>Message</button>
                                        </div>
                                    </div>
                                </div>
                            );
                        }
                    })
                }
                {/* {
                (friends.find(friend=>friend.Validate == false))
                ?<h3 style={{color:"whitesmoke",fontSize:"30px"}}>Friend Request</h3>
                :null
                } */}
                {
                    friends.map((output, index) => {
                    if (output.Validate == false) {
                        return(
                            <div id={`parent${index}`} className="friends" key={`empty-${index}`}>
                                <img src={output.profilePic} alt="" />
                                <div>
                                    <p style={{ marginTop: "-15px" }}>{output.FullName}</p>
                                    <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output.UserName}</small>
                                    <div className="Btn">
                                        <button onClick={(e) => confirmFriend(output,index,e)} style={{width:"150px"}} className="add-btn">confirm</button>
                                        <button onClick={()=>{message(output)}} className="message-btn" style={{display:"none"}}>Message</button>
                                    </div>
                                </div>
                            </div>
                        )
                    }
                })
                }
                {props.mutualRender != []?<h3 style={{marginTop:"15px",color:"whitesmoke",fontSize:"27px"}}>Friends</h3>:null}
                {
                    props.mutualRender.slice().reverse().map((output, index) => {
                        return (
                                <div id={`parent${index}`} className="friends" key={`friend-${index}`}>
                                    <img src={output.profilePic} alt="" />
                                    <div>
                                    <p style={{ marginTop: "-15px" }}>{output.FullName}</p>
                                    <small style={{ color: "white", position: "absolute", bottom: "10px" }}>@{output.UserName}</small>
                                    <div className="Btn">
                                        <button onClick={()=>{message(output)}} className='message-btn'>Message</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div> 
    );
};

export default FriendsComponent;
