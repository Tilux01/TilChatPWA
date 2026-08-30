import React, { useState, useRef, useEffect } from "react";
import "../Styles/Live.css";
import axios from "axios";
import Loader from "./Loader";
import more from "../images/more.png"
import { useNavigate } from "react-router-dom";


const Live = (props) => {
    const navigate = useNavigate()
    const [searchLive, setSearchLive] = useState("")
    const [buttonActive, setButtonActive] = useState(true)
    const watch = (e) => {
        props.setChatView(false)
        props.setViewState(V => "VideoPlayer")
        const parent = e.target.offsetParent.id
        const Id = document.querySelector(`#${parent} small`).textContent
        props.setIframeLink(I => Id)
        if (window.innerWidth <= 800) {
            navigate("/chat")
        }
    }
    const [moreOption, setMoreOption] = useState(null)
    const openMoreOption = () => {
        if (moreOption) {
            setMoreOption(() => null)
        }
        else {
            setMoreOption(() => "show")
        }
    }
    const settingsComp = () => {
        props.setChangeSection(() => "settings")
    }
    const closeTopOption = (e) => {
        if (e.target.className != "moreOption") {
            setMoreOption(false)
        }
    }
    return (
        <div className="live-overall" onClick={(e) => { closeTopOption(e) }}>
            <h1>Live</h1>
            <img className='moreOption' src={more} alt="" onClick={openMoreOption} />
            <div className="optionList" style={moreOption ? { display: "flex" } : { display: "none" }}>
                <div className="option"><p>New Group</p></div>
                <div className="option settings" onClick={settingsComp}><p>Settings</p></div>
                <div className="option"><p>Chat Blog</p></div>
                <div className="option"><p>About</p></div>
                <div className="option"><p>Donate</p></div>
            </div>
            <div className="search-parent">
                <input type="text" placeholder="Search" value={searchLive} onChange={(e) => setSearchLive(S => e.target.value)} />
                {buttonActive ? <button onClick={() => { props.fetchVideo(searchLive) }}>Search</button> : <button><Loader /></button>}
            </div>
            <div className="liveBrowse">
                <h2>Browse</h2>
                <div>
                    <button className="liveBrowse-btn" onClick={() => { props.fetchVideo("sport") }}>Sport</button>
                    <button className="liveBrowse-btn" onClick={() => { props.fetchVideo("entertainment") }}>Entertainment</button>
                    <button className="liveBrowse-btn" onClick={() => { props.fetchVideo("music") }}>Music</button>
                    <button className="liveBrowse-btn" onClick={() => { props.fetchVideo("News") }}>News</button>
                    <button className="liveBrowse-btn" onClick={() => { props.fetchVideo("Game") }}>Gaming</button>
                    <button className="liveBrowse-btn" onClick={() => { props.fetchVideo("Video") }}>Videos</button>
                </div>
            </div>
            <div className="live-parent">
                {props.videoItems.map((output, index) => (
                    <div className="live" key={index} id={"videoParent" + index}>
                        <img src={output.snippet.thumbnails.high.url} alt="" />
                        <div>
                            <div>
                                <p>{output.snippet.title}</p>
                                <small style={{ display: "none" }}>{output.id.videoId}</small>
                            </div>
                            <button onClick={watch}>Watch Live</button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Live;
