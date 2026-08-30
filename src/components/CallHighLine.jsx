import React, { useState } from 'react'
import "../Styles/CallHighline.css"
import microphone from '../images/microphone.png'
import mute from "../images/mute (1).png"
import endCallIcon from '../images/endCall.png'


const CallHighLine = ({currentCallCred, currentCount, setDisplayCallBlock, micActive, setMicActive}) => {
    const changeView = () =>{
        if(window.innerWidth <= 600){
            setDisplayCallBlock("mobile")
        }
        else{
            setDisplayCallBlock("display")
        }
    }
    const changeMic = () =>{
        setMicActive(!micActive)
    }
  return (
    <div className='highline-overall'>
        {micActive? <img src={mute} onClick={changeMic} alt="" className='mic' /> : <img src={microphone} onClick={changeMic} alt="" className='mic'/>}
        <div onClick={changeView}>
            <p>{currentCallCred.UserName}</p>
            <small>{currentCount}</small>
        </div>
        <img className='end' src={endCallIcon} alt="" />
    </div>
  )
}

export default CallHighLine