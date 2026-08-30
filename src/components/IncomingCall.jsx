import React, { useState, useEffect } from 'react'
import "../Styles/IncomingCall.css"
import userImg from "../images/user.png"
import endCallIcon from '../images/endCall.png'
import hide from "../images/archive.png"
import {app, db} from '../firebase/config'
import {ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"




const IncomingCall = ({cred, mutualRender, setIncomingCallMini, vibrationTone, callAcceptTimer, setCurrentIncomingCall, setCallAccept, rejectCall}) => {
    const [image, setImage] = useState()
    const [fullName, setFullName] = useState()
    useEffect(() => {
        const filterUser = mutualRender.filter(friend=> friend?.UserName == cred?.cred?.UserName)
        if (filterUser.length > 0) {
            setImage(filterUser[0]?.profilePic)
            setFullName(filterUser[0]?.FullName)
        }
    }, [mutualRender])

    const changeView = () =>{
        setIncomingCallMini(true)
        // vibrationTone.current.pause()
        // ringTone.current.pause()
        // vibrationTone.current.currentTIme = 0
        // ringTone.current.currentTIme = 0
    }
    const handleReject = () =>{
        // vibrationTone.current.pause()
        // ringTone.current.pause()
        // vibrationTone.current.currentTIme = 0
        // ringTone.current.currentTIme = 0
        setIncomingCallMini(false)
        clearTimeout(callAcceptTimer.current)
        const holdCurrentIncomeCall = cred.cred.UserName
        setCurrentIncomingCall()
        const user = JSON.parse(localStorage.getItem("TilChat"));
        rejectCall()
    }
    const acceptCallRequest = () =>{
        // vibrationTone.current.pause()
        // ringTone.current.pause()
        // vibrationTone.current.currentTIme = 0
        // ringTone.current.currentTIme = 0
        setIncomingCallMini(false)
        clearTimeout(callAcceptTimer.current)
        const holdCurrentIncomeCall = cred.cred
        setCallAccept(true)
        update(ref (db, `Call/${holdCurrentIncomeCall?.info}`),{
            accepted: "true"
        })
    }
  return (
    <div className='incomingOverall'>
        <img src={image? image: userImg} className='profile' alt="" />
        <div className="profileDetail">
            <small>.{cred?.cred?.Type} call    @{cred?.cred?.UserName}</small>
            <p>{fullName}</p>
        </div>
        <div className="actionBtn">
            <img src={hide} onClick={changeView} className='hideCall' alt="" />
            <img src={endCallIcon} onClick={acceptCallRequest} className='acceptCall' alt="" />
            <img src={endCallIcon} onClick={handleReject} className='endCall' alt="" />
        </div>
    </div>
  )
}

export default IncomingCall