import React, { useEffect, useState } from 'react'
import profileArrow from "../images/left-arrow-white.png"
import archive from "../images/archive.png"
import deleteImg from "../images/delete.png"
import welcome from "../images/motion-sensor.png"
import send from "../images/paper-plane.png"
import "../Styles/viewWelcome.css"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';


const ViewWelcome = (props) => {
    const [userCredentials, setUserCredentials] = useState([])
    const userNameLoc = JSON.parse(localStorage.getItem("TilChat"))
    const navigate = useNavigate()
    if (!userNameLoc) {
        navigate("/signup")
    }
    const changePage = () => {
        props.setViewState("ChatBot")
    }

    return (
        <div className='view-overall'>
            <header>
                <div className="profile">
                    <img src={profileArrow} alt="" className='navigateArrow'/>
                    <img src={props.userCredentials.profilePic} alt="" />
                </div>
            </header>
            <div className="welcome-view">
                <img src={welcome} alt="" />
                <p>Welcome, Explore</p>
            </div>
            <div className="welcome-input">
                <input type="text" placeholder='Chat With AI' onClick={changePage}/>
                <img src={send} alt="" />
            </div>
        </div>
    )
}

export default ViewWelcome
