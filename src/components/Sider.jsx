import React from 'react'
import "../Styles/Sider.css"
import update from "../images/updates.png"
import chat from "../images/bubble-chat.png"
import friends from "../images/friends.png"
import ai from "../images/bot.png"
import live from "../images/live.png"
import settings from "../images/optimization.png"


const Sider = (props) => {
  const Update = () =>{
    props.setChangeSection("Updates")
  }
  const chats = () =>{
    props.setChangeSection("Chats")
  }
  const ChatBot = () =>{
    props.setChatView(false)
    props.setViewState("ChatBot")
    if(window.innerWidth <= 800){
        props.setChatState(()=>"chat")
    }
  }
  const Friends = () =>{
    props.setChangeSection("friends")
  }
  const livePage = () =>{
    props.setChangeSection("live")
    props.fetchVideo("sport")
  }
  const settingsPage = () =>{
    props.setChangeSection("settings")
  }
  return (
    <div className='sider-parent'>
      <div onClick={chats}>
        <img src={chat} alt="" />
        <p>chat</p>
      </div>
      <div onClick={Update}>
        <img src={update} alt="" />
        <p>Updates</p>
      </div>
      <div onClick={Friends}>
        <img src={friends} alt="" />
        <p>Friends</p>
      </div>
      <div onClick={ChatBot}>
        <img src={ai} alt="" />
        <p>AI</p>
      </div>
      <div onClick={livePage}>
        <img src={live} alt="" />
        <p>Live</p>
      </div>
      <div className='settingsIconSider' onClick={settingsPage}>
        <img src={settings} alt="" />
        <p>Settings</p>
      </div>
    </div>
  )
}

export default Sider
