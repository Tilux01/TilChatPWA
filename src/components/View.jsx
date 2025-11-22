import React, { useState,createContext } from 'react'
import ViewWelcome from './ViewWelcome'
import AIComponent from './AIComponent'
import Sider from './Sider'
import VideoPlayer from './VideoPlayer'
import ChatDisplay from './ChatDisplay'
import FeedPreview from './FeedPreview'
import { useEffect } from 'react'
import chatMediaSend from './ChatMediaSend'
import Blog from './Blog'


const View = (props) => {
  if (props.ViewState == "welcome") {
    return(
      <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
        <ViewWelcome userCredentials={props.userCredentials} setViewState={props.setViewState} ViewState={props.ViewState}/> 
      </main>
    )
  }
  else if(props.ViewState == "ChatBot"){
    return(
      <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
        <AIComponent setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState}/>
      </main>
    )
  }
  else if(props.ViewState == "VideoPlayer"){
    return(
      <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
        <VideoPlayer setChatState={props.setChatState} userCredentials={props.userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} iframeLink={props.iframeLink}/>
      </main>
    )
  }
  else if(props.ViewState == "chat"){
    return(
      <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
        <chatMediaSend setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState} iframeLink={props.iframeLink}/>
      </main>
    )
  }
  else if(props.ViewState == "feed"){
    return(
      <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
        <FeedPreview setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState} feedObject={props.feedObject} setFeedObject={props.setFeedObject}/>
      </main>
    )
  }
  else if(props.ViewState == "blog"){
    return(
      <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
        <Blog userCredentials={props.userCredentials} setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState}/>
      </main>
    )
  }
}
export default View
