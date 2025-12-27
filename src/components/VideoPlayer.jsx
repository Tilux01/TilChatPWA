import React, { useEffect, useState } from 'react'
import "../Styles/viewWelcome.css"
import profileArrow from "../images/left-arrow-white.png"

const VideoPlayer = (props) => {
  const changeShowType = () =>{ 
    if(window.innerWidth <= 800){
        props.setIframeLink()
        props.setChatState(()=>"sider")
    }
  }
  const [iframeSrc, setIframeSrc] = useState()
  useEffect(() => {
    setIframeSrc(`https://www.youtube.com/embed/${props.iframeLink}?autoplay=1&rel=0`)
  }, [props.iframeLink])
  return (
    <div className='main-video-player' style={{width:"100%"}}>
    <header className='headHide'>
        <div className="profile">
            <img src={profileArrow} alt="" className='' onClick={changeShowType}/>
            <img src={props.userCredentials.profilePic} alt="" />
        </div>
    </header>
       <iframe src={iframeSrc} frameborder="0" style={{width:"100%",height:"100vh"}} allowFullScreen></iframe>
    </div>
  )
}

export default VideoPlayer
