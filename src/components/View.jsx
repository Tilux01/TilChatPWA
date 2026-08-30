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
  console.log(props.ViewState);
  useEffect(() => {
    console.log(props.ViewState);
    
  }, [props.ViewState])
  
  
  if (props.ViewState == "welcome") {
    return(
      <main style={{display: "flex", width:"100%", height:"100dvh"}}>
        <ViewWelcome userCredentials={props.userCredentials} setViewState={props.setViewState} ViewState={props.ViewState}/> 
      </main>
    )
  }
  else if(props.ViewState == "ChatBot"){
    return(
      <main style={{display: "flex", width:"100%", height:"100dvh"}}>
        <AIComponent setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState}/>
      </main>
    )
  }
  else if(props.ViewState == "VideoPlayer"){
    return(
      <main style={{display: "flex", width:"100%", height:"100dvh"}}>
        <VideoPlayer setChatState={props.setChatState} userCredentials={props.userCredentials} setViewState={props.setViewState} ViewState={props.ViewState} setIframeLink={props.setIframeLink} iframeLink={props.iframeLink}/>
      </main>
    )
  }
  else if(props.ViewState == "chat"){
    return(
      <main style={{display: "flex", width:"100%", height:"100dvh"}}>
        <chatMediaSend setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState} iframeLink={props.iframeLink}/>
      </main>
    )
  }
  else if(props.ViewState == "feed"){
    return(
      <main style={{display: "flex", width:"100%", height:"100%"}}>
        <FeedPreview setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState} feedObject={props.feedObject} setFeedObject={props.setFeedObject}/>
      </main>
    )
  }
  else if(props.ViewState == "blog"){
    return(
      <main style={{display: "flex", height:"100dvh"}}>
        <Blog userCredentials={props.userCredentials} setChatState={props.setChatState} setViewState={props.setViewState} ViewState={props.ViewState}/>
      </main>
    )
  }
}
export default View
