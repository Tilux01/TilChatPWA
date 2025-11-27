import React, { useEffect, useRef, useState } from 'react'
import "../Styles/Chats.css"
import archive from "../images/archive.png"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import more from "../images/more.png"
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey,update,startAt,endAt} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';


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

const Chats = (props) => {

    const searchChat = (e) =>{
        let values = (e.target.value)
        if(values == ""){
            props.setChatSearchFilter(props.mutualRender)
        }
        else{
            props.setChatSearchFilter(props.mutualRender.filter((friend)=>friend.UserName?.includes(values.toLowerCase()) || friend.FullName?.includes(values.toLowerCase())))
        }
    }
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
        const Msg1 = output.UserName + props.userCredentials.UserName
        const Msg2 = props.userCredentials.UserName + output.UserName
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
                    get(ref(db,`Users/${props.userCredentials.UserName}/mutualFriends`))
                    .then((data)=>{
                        if(data.exists()){
                            mutuals = data.val()
                        }
                        if(!(mutuals?.includes(output.UserName))){
                            mutuals.push(output.UserName)
                            update(ref(db, `Users/${props.userCredentials.UserName}`),{
                                mutualFriends: mutuals
                            })
                        }
                    })
                    get(ref(db,`Users/${output.UserName}/mutualFriends`))
                    .then((data)=>{
                        if(data.exists()){
                            friendMutuals = data.val()
                        } 
                        if(!(friendMutuals?.includes(output.UserName))){
                            friendMutuals.push(props.userCredentials.UserName)
                            update(ref(db, `Users/${output.UserName}`),{
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
                    get(ref(db,`Users/${props.userCredentials.UserName}/mutualFriends`))
                    .then((data)=>{
                        mutuals = data.val()
                        const findFriend = mutuals.find(friend=>
                            friend == output.UserName
                        )
                        if(!findFriend || findFriend.length == 0){
                            mutuals.push(output.UserName)
                            update(ref(db, `Users/${props.userCredentials.UserName}/mutualFriends`),{
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
    const [moreOption, setMoreOption] = useState(null)
    const openMoreOption =() =>{
        if (moreOption) {
            setMoreOption(()=>null)
        }
        else{
            setMoreOption(()=>"show")
        }
    }
    const blogComp = () =>{
        if(window.innerWidth <= 800){
            props.setChatState(()=>"chat")
        }
        props.setChatView(false)
        props.setViewState(()=>"blog")
    }
    return (
        <div className='chats-overall'>
            <h1>Chats</h1>
            <img className='moreOption' src={more} alt="" onClick={openMoreOption}/>
            <div className="optionList" style={moreOption?{display:"flex"}: {display:"none"}}>
                <div className="option settings"><p>Settings</p></div>
                <div className="option" onClick={blogComp}><p>Chat Blog</p></div>
                <div className="option"><p>About</p></div>
                <div className="option"><p>Donate</p></div>
                <div className="option"><p>Log out</p></div>
            </div>
            <input type="text" placeholder='Search' onChange={(e)=>searchChat(e)}/>
            <div className="archived-parent">
            <div>
                <img src={archive} alt="" />
                <p>Archive</p>
            </div>
            <h6>@</h6>
            </div>
            <div className="chats-parent">
                {
                    props.chatSearchFilter.slice().reverse().map((output,index)=>(  
                        <div className='chat' key={index} onClick={()=>message(output)}>
                            <img src={output.profilePic} alt="" />
                            <div style={{display:"flex",flexDirection:"column"}}>
                                <p>{output.FullName}</p>
                                <small style={{color:'whitesmoke'}}>@{output.UserName}</small>
                                {output.unreadMsg? <main className='unread'></main>: null}
                            </div>
                        </div>
                    ))
                }
            </div>
        </div>
    )
}

export default Chats
