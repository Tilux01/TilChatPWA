import React, { useEffect, useState, useRef } from 'react'
import "../Styles/Call.css"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import userImg from "../images/user.png"
import endCallIcon from '../images/endCall.png'
import VideoCall  from '../images//cam-recorder.png'
import microphone from '../images/microphone.png'
import mute from "../images/mute (1).png"
import msgBtn from "../images/message_icon_244225.png"
import {app, db} from '../firebase/config'
import {ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"
import { useNavigate } from 'react-router-dom'

const Call = ({setCallBlock, currentCallCred, currentCount, setMicActive, micActive, setCallActive, callActive, setCurrentCount, setChatInfo, setCallChatInfo, callChatInfo, setChatState, setChatFriendDetail, setCurrentCallWallpaper, setDisplayCallBlock, setCallType, callEndTimer, callTimerDown, callAccepted, setCurrentIncomingCall, setCallEnded, handleEndCall, cleanupCall, callType, currentCallWallpaper, remoteAudio, localAudio, setVideoView, videoView, remoteVideoTrack, localVideoTrack}) => {
    const navigate = useNavigate()
    const handleView = () =>{
        if (currentCount == "No response") {
            setChatFriendDetail(()=>currentCallCred)
            setCallBlock(false)
            setDisplayCallBlock(false)
            setCallActive(false)
            setCurrentCount("Calling...")
            setMicActive(true)
            setCallChatInfo()
            setCurrentCallWallpaper()
            setCallType()
            return
        }
        setCallBlock("highline")
    }
    const changeMic = () =>{
        setMicActive(!micActive)
    }
    const recall = () =>{
        clearTimeout(callEndTimer.current)
        setCallActive(true)
        clearTimeout(callTimerDown.current)
        setCurrentCount("Calling...")
    }
    const messageUser = () =>{
        setChatInfo(()=>callChatInfo)
        setCallBlock(false)
        if (window.innerWidth <= 800) {
            navigate("/chat")
        }
    }
    const endCall = () =>{
        let holdTIme
      // if (hourCount.current != 0) {
      //   if (hourCount.current == 1 && minCount.current == 1) {
      //     holdTIme = `${hourCount.current}hour ${minCount.current}min`
      //   }
      //   else if(hourCount.current != 1 && minCount.current == 1){
      //     holdTIme = `${hourCount.current}hours ${minCount.current}min`
      //   }
      //   else if (hourCount.current == 1 && minCount.current != 1) {
      //     holdTIme = `${hourCount.current}hour ${minCount.current}mins`
      //   }
      //   else{
      //     holdTIme = `${hourCount.current}hours ${minCount.current}mins`
      //   }
      // }
      // else if(minCount.current != 0){
      //   if (minCount.current == 1 && secCount.current == 1) {
      //     holdTIme = `${minCount.current}min ${secCount.current}sec`
      //   }
      //   else if(minCount.current != 1 && secCount.current == 1){
      //     holdTIme = `${minCount.current}mins ${secCount.current}sec`
      //   }
      //   else if (minCount.current == 1 && secCount.current != 1) {
      //     holdTIme = `${minCount.current}min ${secCount.current}secs`
      //   }
      //   else{
      //     holdTIme = `${minCount.current}mins ${secCount.current}secs`
      //   }
      // }
      // else{
      //   if (secCount.current == 1) {
      //     holdTIme = `${secCount.current}sec`
      //   }
      //   else{
      //     holdTIme = `${secCount.current}secs`
      //   }
      // }
      // getChat(currentCall.current?.others.info)
      //   .then((output)=>{
      //     alert("cut")
      //     if (output) {
      //       let holdOutput = output
      //       const filterChat = holdOutput.findIndex(chat=> chat[UserName]?.id == currentCall.current?.others?.id)
      //       if (filterChat) {
      //         alert(filterChat)
      //         holdOutput[filterChat][UserName].acccept = "call ended"
      //         holdOutput[filterChat][UserName].time = holdTIme
      //         console.log(holdOutput[filterChat][UserName].time);
              
      //         console.log(holdOutput[filterChat].acccept);
      //         saveChat(currentCall.current?.others?.info, holdOutput)
      //         .then(()=>{
      //           setChatEdited(true)
      //         })
      //       }
      //     }
      //   })
      //   .finally(()=>{
      //     cleanupCall()
      //   })
        const currentCredHold = currentCallCred.UserName
        setCallBlock(false)
        const user = JSON.parse(localStorage.getItem("TilChat"));
        setCurrentIncomingCall(false)
        setCallEnded(true)
        handleEndCall()
        setDisplayCallBlock(false)
    }
    const changeView = () =>{
        setVideoView(!videoView)
    }
  return (
    <div className='call-overall'>
        <img src={currentCallWallpaper} alt="" className='background'/> 
        {callType != "voice" && callActive? <video ref={localVideoTrack} className={videoView? "videoMini": null} onClick={()=>{if(videoView){changeView()}}} autoPlay muted></video> : null}
        {callActive && callType != "voice"? <video className={!videoView? "videoMini": null} onClick={()=>{if(!videoView){changeView()}}} ref={remoteVideoTrack} autoPlay></video>: null}
        <img src={currentCallWallpaper} alt="" className='background'/>
        <div className='callHeader'>
            <img className='changeShow' onClick={handleView} src={close} alt="" />    
            <h2>{currentCallCred?.FullName}</h2>
            <small>@{currentCallCred?.UserName}</small>
            <p className='counter'>{currentCount}</p>
        </div>
        {callType == "voice"? <img src={currentCallCred?.profilePic} alt="" className="profileImg" /> : null}
        
        {
            callActive? 
                <div className="callOption">
                <img src={VideoCall} alt="" />
                {micActive? <img src={mute} onClick={changeMic}/> : <img src={microphone} onClick={changeMic}/>}
                <img src={endCallIcon} onClick={endCall} alt="" />
                </div>
            :
            <div className="recall">
                <small>Call Again</small>
                <div>
                    <img src={endCallIcon} onClick={recall} className='callIcon' alt="" />
                    <img src={msgBtn} onClick={messageUser} alt="" className="messageBtn" />
                </div>
            </div>
        }
    </div> 
  )
}

export default Call