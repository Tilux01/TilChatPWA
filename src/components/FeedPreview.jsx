import React, { useEffect, useState } from 'react'
import profileImg from "../images/user.png"
import profileArrow from "../images/left-arrow-white.png"
import deleteImg from "../images/delete.png"
import "../Styles/feedPreview.css"
import axios from 'axios'




const FeedPreview = (props) => {
    const [feed, setFeed] = useState([])
    const openNews = (url) =>{
        window.open(url)
    }
    const [userCredentials, setUserCredentials] = useState([])
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    const changePage = () => {
        props.setViewState("ChatBot")
    }
return (
    <div className='feedPreview'>
        {/* <img src={feed[0].urlToImage} className='backgroundImg' /> */}
        <header>
            <div className="profile">
                <img src={profileArrow} alt="" className='navigateArrow'/>
                <img src={profileImg} alt="" />
                <p>{userNameLoc.UserName}</p>
            </div>
        </header>
        <div className="previewParent">
            <small>{props.feedObject.name}</small>
            <div className="headline">
                <h1>{props.feedObject.title}</h1>
                <button onClick={()=>{openNews(props.feedObject.url)}}>Read News</button>
            </div>
            <div className='imageParent'>
                <img src={props.feedObject.urlToImage} className='image' />
            </div>
            <div className='source'>
                <h6>{props.feedObject.author}</h6>
                <h6>@{props.feedObject.source.name}</h6>
            </div>
            <div className='contentParent'>
                <p className='description'>{props.feedObject.description}</p>
                <p className='content'>{props.feedObject.content}</p>
                <button onClick={()=>{openNews(props.feedObject.url)}}>Read News</button>
            </div>
        </div>
    </div> 
)
}

export default FeedPreview
