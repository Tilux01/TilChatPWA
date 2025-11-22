import React, { useEffect, useState, useMemo } from 'react'
import "../Styles/DisplaySend.css"
import send from "../images/paper-plane.png"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import { initializeApp } from 'firebase/app'
import playBtn  from "../images/play-1073616_640.png"
import imagePreview from "../images/photo (1).png"
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey,update,startAt,endAt} from "firebase/database"
import MediaTypesSelect from './MediaTypesSelect'
import loader from "../images/loading.png"

const ChatMediaSend = (props) => {
    const [caption, setCaption] = useState("")
    const [mutualFriends, setMutualFriends] = useState([])
    const [userPrompt, setUserPrompt] = useState("")
    const [mediaType, setMediaType] = useState("")
    const [mediaData, setMediaData] = useState("")
    const [statusPreview, setStatusPreview] = useState(true)
    const closeSend = () =>{
        props.setDisplayMedia(()=>false)
    }
    useEffect(() => {
        setMediaData(()=>props.displayUrl)
        setMediaType(()=>props.mediaType)
    }, [])
    let userName 
    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem("TilChat"))
        userName = localData.UserName
    }, [])
    const MediaSelect = useMemo(() => {
        return <MediaTypesSelect type={props.mediaType} data={props.displayUrl} statusPreview={statusPreview} />
    }, [props.mediaType, props.displayUrl])
    return (
        <div className='sendOverall'>
            {props.loading? <img src={loader} alt=""  className='loaderImg'/> : null}
            <div className="previewBox">
                {MediaSelect}
            </div>  
            <div className="caption">
                <div className="shrink">
                    <input type="text"  placeholder='write a caption' value={props.collectInputTemp} onChange={(e)=>{props.setCollectInputTemp(e.target.value)}}/>
                    <img src={send} onClick={props.sendMediaChat}/>   
                </div>
            </div>
            <img src={close} alt="" className="close" onClick={closeSend}/>
        </div>
    )
}

export default ChatMediaSend