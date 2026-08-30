import React, { useState } from 'react'
import "../Styles/Sider.css"
import update from "../images/updates.png"
import chat from "../images/bubble-chat.png"
import friends from "../images/friends.png"
import ai from "../images/bot.png"
import live from "../images/live.png"
import settings from "../images/optimization.png"
import userImg from "../images/user.png"
import { useNavigate } from 'react-router-dom'



const Sider = (props) => {
  const navigate = useNavigate()
  const [onAi, setOnAi] = useState(false)
  const Update = () => {
    props.setChangeSection("Updates")
  }
  const chats = () => {
    props.setChangeSection("Chats")
  }
  const ChatBot = () => {
    props.setChatView(false)
    props.setViewState("ChatBot")
    if (window.innerWidth <= 800) {      
      navigate("/view")
    }
  }
  const Friends = () => {
    props.setChangeSection("friends")
  }
  const livePage = () => {
    props.setChangeSection("live")
    props.fetchVideo("sport")
  }
  const settingsPage = () => {
    props.setChangeSection("settings")
  }
  const startAI = () => {
    props.setIsAwake(true)
  }
  return (
    <div className='sider-parent' >
      <h1 onClick={startAI}>T</h1>
      <div className="sider-app">
        <div className={props.changeSection == "Chats" && props.changeSection != "ChatBot" ? "selected-app" : null} onClick={chats}>
          <img src={chat} alt="" />
        </div>
        <div className={props.changeSection == "Updates" ? "selected-app" : null} onClick={Update}>
          <img src={update} alt="" />
        </div>
        <div className={props.changeSection == "friends" ? "selected-app" : null} onClick={Friends}>
          <img src={friends} alt="" />
        </div>
        <div onClick={ChatBot}>
          <img src={ai} alt="" />
        </div>
        <div className={props.changeSection == "live" ? "selected-app" : null} onClick={livePage}>
          <img src={live} alt="" />
        </div>
        <div className={props.changeSection == "settings" ? "selected-app settingsIconSider" : "settingsIconSider"} onClick={settingsPage}>
          <img src={settings} alt="" />
        </div>
      </div>
      <img src={props.userCredentials.profilePic || userImg} alt="" onClick={settingsPage} />
    </div>
  )
}

export default Sider
