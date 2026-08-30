import React, { useEffect, useState } from 'react'
import "../Styles/DisplaySend.css"
import send from "../images/paper-plane.png"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import {app, db} from '../firebase/config'
import {ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey,update,startAt,endAt} from "firebase/database"


const DisplaySend = (props) => {
    const [caption, setCaption] = useState("")
    const [mutualFriends, setMutualFriends] = useState([])
    const data = Date.now()
    const closeSend = () =>{
        props.setBase64(undefined)
    }
    let userName 
    useEffect(() => {
        const localData = JSON.parse(localStorage.getItem("TilChat"))
        userName = localData.UserName
    }, [])
    const sendStatus = () =>{
        const localData = JSON.parse(localStorage.getItem("TilChat"))
        const userName = localData.UserName
        const date = new Date
        const Hour = date.getHours().length == 1? "0"+date.getHours():date.getHours()
        const Minute = date.getMinutes().length == 1? "0"+date.getMinutes():date.getMinutes()
        const Seconds = date.getSeconds().length == 1? "0"+date.getSeconds():date.getSeconds()
        const season = date.getHours() > 12? "pm" :"am"
        const displayTime = Hour+":"+Minute+":"+Seconds+season
        const TimeStamp = Date.now()
        const endStamp = Date.now() + (24 * 60 * 60 * 1000)
        props.setStatusArray([...props.statusArray, {Img:props.base64,Content:caption, views:0, like:0, displayTime, TimeStamp, endStamp}])
        props.setBase64(undefined)
        let keyNeeded;
        
        push(ref(db, `Statuses/${userName}`),{Img:props.base64,Content:caption,userName, views:0, like:0, displayTime, TimeStamp, endStamp})
        .then((generate)=>{
            keyNeeded = generate.key
            get(ref(db, `Users/${userName}/mutualFriends`))
            .then((output)=>{
                if(output.exists()){
                    const list = output.val()
                    list.map((friends)=>{
                        get(ref(db, `Users/${friends}/StatusPending/list`))
                        .then((getStatus)=>{
                            if(getStatus.exists()){
                                const friendStatusPending = getStatus.val()
                                const info = {
                                    key: keyNeeded,
                                    userName
                                }
                                friendStatusPending.push(info)
                                set(ref(db, `Users/${friends}/StatusPending`),{
                                    list:friendStatusPending
                                })
                            }
                            else{
                                const info = [{
                                    key: keyNeeded,
                                    userName
                                }]
                                set(ref(db, `Users/${friends}/StatusPending`),{
                                    list:info
                                })
                            }
                        })
                    })
                }
            })
            
        })
    }
    return (
        <div className='sendOverall status-send'>
            <div className="previewBox">
                <img src={props.base64}/>
            </div>
            <div className="caption">
                <div className="shrink">
                    <input type="text"  placeholder='write a caption' onChange={(e)=>{setCaption(e.target.value)}}/>
                    <img src={send} onClick={sendStatus}/>   
                </div>
            </div>
            <img src={close} alt="" className="close" onClick={closeSend}/>
        </div>
    )
}

export default DisplaySend
