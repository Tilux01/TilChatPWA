import React, { useRef, useState,useEffect, cache } from 'react'
import "../Styles/status.css"
import arrow from "../images/left-arrow-white.png"
import addIcon from "../images/add.png"
import send from "../images/paper-plane.png"
import feedIcon from "../images/newspaper.png"
import like from "../images/icon-star.svg"
import more from "../images/more.png"


import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey,update,startAt,endAt} from "firebase/database"
import axios from 'axios'
import Loader from './Loader'

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


const Status = (props) => {
    const [checkRerun, setCheckRerun] = useState(0)
    const statusNo = useRef(0)
    const [activePreview, setActivePreview] = useState(false)
    let loader = undefined
    let outParent = undefined
    const [buttonActive, setButtonActive] = useState(true)
    const preview = (e) =>{
        setActivePreview(true)
        document.querySelector(".profile-arrow").style.display = "block"
        // document.querySelectorAll(".user-status .caption").forEach((caption)=>{
        //     caption.style.display = "flex"
        // })
        clearInterval(loader)
        const allStatuses = document.querySelectorAll(".user-status")
        const parentElement = e.target.offsetParent
        const parent = parentElement.id
        
        
        allStatuses.forEach((status)=>{
            status.style.display ="none"
        })
        document.getElementById(parent).style.display = "flex"
        parentElement.classList.add("preview")
        outParent = parent
        const moveLine = document.querySelector(`#${parent} #move${statusNo.current} div`)
        moveLine.classList.add("move")
        const nextBtn = document.querySelector(`#${parent} .right-arrow`)
        document.querySelector(`#${parent} #move${statusNo.current} .move`).style.animation = "move 5s 1"
        const caption = document.querySelector(`#${parent} #caption${statusNo.current}`)
        caption.style.display = "flex"
        // loader = setInterval(() => {
        //     const nextBtn = document.querySelector(`#${outParent} .right-arrow`)
        //     const parent  = nextBtn.offsetParent.id;
        //     const captureStatus = document.querySelector(`#${outParent} #status${statusNo.current}`)
            
        //     document.querySelector(`#${outParent} #move${statusNo.current} .move`).style.animation = "tt"
        //     captureStatus.style.display = "none"
        //     statusNo.current += 1
        //     const nextStat = document.querySelector(`#${outParent} #status${statusNo.current}`)
        //     if(nextStat){
        //         nextStat.style.display = "block"
        //     }
        //     else{
        //         captureStatus.style.display = "block"
        //         statusNo.current -= 1
        //     }
        //     moveLine.classList.add("move")
        //     document.querySelector(`#${parent} #move${statusNo.current} .move`).style.animation = "move 5s 1"
        // }, 5000);
    }

    const navigateBack = (e) =>{
        clearInterval(loader)
        setActivePreview(false)
        const allStatuses = document.querySelectorAll(".user-status")
        allStatuses.forEach((status)=>{
            status.style.display ="flex"
        })
        // document.querySelectorAll(".user-status .caption").forEach((caption)=>{
        //     caption.style.display = "none"
        // })
        document.querySelectorAll(".preview").forEach((preview)=>{preview.classList.remove("preview")})
        document.querySelector(".profile-arrow").style.display = "none"
        statusNo.current = 0
        document.querySelectorAll(`.move`).forEach((move)=>{move.style.animation = "tt"}) 
        document.querySelectorAll(`.lines`).forEach((move)=>{move.classList.remove("move")})
        document.querySelectorAll(".status").forEach((status)=>{status.style.display = "none"})
        const caption = document.querySelectorAll(`.caption`)
        caption.forEach((cap)=>{
            cap.style.display = "none"
        })
        firstShow()
    }

    const firstShow = () =>{
        setTimeout(() => {
            const firstStatus = document.querySelectorAll(`#status0`)
            firstStatus.forEach((status)=>{
                status.style.display = "block"
            })
        }, 300); 
    }


    const nextStatus = (e) =>{
        clearInterval(loader)
        const parent  = e.target.offsetParent.id;

        const captureStatus = document.querySelector(`#${parent} #status${statusNo.current}`)
        
        if (captureStatus) {
            captureStatus.style.display = "none"
            document.querySelector(`#${parent} #move${statusNo.current} .move`).style.animation = "tt"
            statusNo.current += 1
            outParent = parent
            const moveLine = document.querySelector(`#${parent} #move${statusNo.current} div`)
            moveLine.classList.add("move")
            document.querySelector(`#${parent} #move${statusNo.current} .move`).style.animation = "move 5s 1"
            const nextStat = document.querySelector(`#${parent} #status${statusNo.current}`)
            const caption = document.querySelectorAll(`.caption`)
            caption.forEach((cap)=>{
                cap.style.display = "none"
            })
            if(nextStat){
                nextStat.style.display = "block"
                const caption = document.querySelector(`#${parent} #caption${statusNo.current}`)
                caption.style.display = "flex"
            }
            else{
            captureStatus.style.display = "block"
                statusNo.current -= 1
                const caption = document.querySelector(`#${parent} #caption${statusNo.current}`)
                caption.style.display = "flex"
            }
            setInterval(loader)
        }
    }

    const previousStatus =(e) =>{
        if(statusNo.current > 0){
            clearInterval(loader)
            const parent  = e.target.offsetParent.id;
            const moveLine = document.querySelector(`#${parent} #move${statusNo.current} div`)
            moveLine.classList.remove("move")
            moveLine.style.animation = "tt"
            const captureStatus = document.querySelector(`#${parent} #status${statusNo.current}`)
            captureStatus.style.display = "none"
            statusNo.current -= 1
            const moveLine2 = document.querySelector(`#${parent} #move${statusNo.current} div`)
            moveLine2.style.animation = "move 5s 1"
            const nextStat = document.querySelector(`#${parent} #status${statusNo.current}`)
            nextStat.style.display = "block"
            const allCaption = document.querySelectorAll(`.caption`)
            allCaption.forEach((cap)=>{
                cap.style.display = "none"
            })
            const caption = document.querySelector(`#${parent} #caption${statusNo.current}`)
            caption.style.display = "flex"
            setInterval(loader)
        }
    }
    

    const changeUserStat = () =>{
        props.setStatusType(true)
    }


    const feedPreviewShow = (feedObj) =>{
        props.setChatView(false)
        props.setViewState(V=>"feed")
        props.setFeedObject(F=>feedObj)
        if(window.innerWidth <= 800){
            props.setChatState(()=>"chat")
        }
    }

    useEffect(() => {
        axios.get(`https://gnews.io/api/v4/top-headlines?category=%27%20+%20category%20+%20%27&lang=en&country=ng&max=10&apikey=89bf5943fba1916d39f48ea649942452`)
            .then((output)=>{
                console.log(output);
                
                props.setFeed(output.data.articles)
            })
    }, [])
    const [feedSearchInput, setFeedSearchInput] = useState("")
    const feedSearch = () =>{
        if (feedSearchInput.length > 1) {
            setButtonActive(()=>false)
            axios.get(`https://newsapi.org/v2/everything?q=${feedSearchInput}&sortBy=popularity&apiKey=41181213ecd644ae9230d93ad0b40544`)
            .then((output)=>{
                props.setFeed(output.data.articles)
                setButtonActive(()=>true)
            })
        }
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

        const settingsComp = () =>{
            props.setChangeSection(()=>"settings")
        }

    return (
        <div className="stat-overall">
            <h1>Status</h1>
            <img className='moreOption' src={more} alt="" onClick={openMoreOption}/>
            <div className="optionList" style={moreOption?{display:"flex"}: {display:"none"}}>
                <div className="option settings" onClick={settingsComp}><p>Settings</p></div>
                <div className="option"><p>Chat Blog</p></div>
                <div className="option"><p>About</p></div>
                <div className="option"><p>Donate</p></div>
                <div className="option"><p>Log out</p></div>
            </div>
            <div className='updateSearch'>
                <input type="text" onChange={(e)=>{setFeedSearchInput(e.target.value)}} value={feedSearchInput} id="" placeholder='Search'/>
                {buttonActive? <button onClick={feedSearch}>Search</button>:<button><Loader/></button> }
            </div>
            <div className="scrollParent">
                <div className='status-Parent'>
                    <div className="shrink">
                        <img src={arrow} alt="" className='profile-arrow' onClick={navigateBack}/>
                        <div style={{border:"2px solid red", height:"173px"}} onClick={changeUserStat} className='userAddStatus'>
                            <img src={props.userCredentials.profilePic} alt="" className='profileImg'/>
                            <img src={addIcon} alt="" className='addIcon'/>
                        </div>
                        {
                            props.sortUsers.map((TotalResult,index)=>{
                                const value = Object.keys(TotalResult)[0]
                                const mapItem = props.sortUsers[index][value]
                                return(
                                    <div className="user-status" key={index} onClick={activePreview?null:preview} id={`userSatus${index}`}>
                                        <div className='scroll'>
                                            {
                                                mapItem.map((status,lineIndex)=>{
                                                    return(
                                                        <div key={lineIndex} className='lines' id={`move${lineIndex}`}>
                                                            <div></div>
                                                        </div>
                                                    )
                                                })
                                            }
                                            
                                        </div>
                                        <img src={arrow} alt="" className='left-arrow'onClick={previousStatus}/>
                                        <img src={arrow} alt="" className='right-arrow' onClick={nextStatus}/>
                                        <img alt="" className='profile-mini'/>
                                        <div className='status-upload-parent'>
                                            {
                                                mapItem.map((status,statusIndex)=>{
                                                    return(
                                                        <img src={status.Img} key={statusIndex}  id={`status${statusIndex}`} style={{display:"none"}} className='status' />
                                                    )
                                                })
                                            }
                                            <p>{mapItem.length > 0? mapItem[0].userName : null}</p>
                                                {
                                                    mapItem.map((status,statusIndex)=>{
                                                        return(
                                                            <div className="caption" key={statusIndex} id={`caption${statusIndex}`} style={{display:"none"}}>
                                                                <h5>
                                                                    {status.Content}
                                                                </h5>
                                                                <div className="reply">
                                                                    <div className="replyInput">
                                                                        <input type="text" placeholder='Reply' style={{outline:0, border:0}}/>
                                                                        <img src={send} alt="" className="sendIcon" />
                                                                    </div>
                                                                    <img src={like} alt="" className='likeIcon'/>
                                                                </div>
                                                            </div>
                                                        )
                                                    })
                                                }
                                        </div>
                                    </div>
                                    
                                )
                            })
                        
                        }
                    </div>
                    {
                        firstShow()                
                    }
                </div>
                <div className="feed">
                    <div className="headline">
                        <p>Feed</p>
                        <small>Explore</small>
                    </div>
                    <div className="displayFeed">
                        {
                            props.feed.map((output)=>(
                                <div className="new" onClick={()=>{feedPreviewShow(output)}}>
                                        <img src={output.image? output.image : feedIcon} alt="" />
                                    <p>{output.title}</p>
                                </div>
                                
                            ))
                        }
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Status   