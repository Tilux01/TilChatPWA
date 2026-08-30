import React from 'react'
import "../Styles/CallHighline.css"
import endCallIcon from '../images/endCall.png'


const IncomingCallMini = ({cred, mutualRender, setIncomingCallMini, vibrationTone, callAcceptTimer, setCurrentIncomingCall}) => {
    const changeView = () =>{
        setIncomingCallMini()
    }
  return (
    <div className='highline-overall'>
        <img src={endCallIcon} alt="" className='acceptCall'/>
        <div onClick={changeView}>
            <p>{cred?.cred?.UserName}</p>
            <small>.{cred?.cred?.Type} call</small>
        </div>
        <img className='end' src={endCallIcon} alt="" />
    </div>
  )
}

export default IncomingCallMini