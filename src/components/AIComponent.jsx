import React, { useState, useRef, useEffect } from 'react'
import profileArrow from "../images/left-arrow-white.png"
import archive from "../images/archive.png"
import deleteImg from "../images/delete.png"
import ai from "../images/bot.png"
import send from "../images/paper-plane.png"
import "../Styles/AIChat.css"
import axios from 'axios'
import { GoogleGenAI } from '@google/genai';
import wallPapper from "../images/DefaultWallpapre.jpg"
import ClearChatPrompt from './ClearChatPrompt'
import { useNavigate } from 'react-router-dom'


const WelcomeComponent = () => {
    return (
        <>
            <img src={ai} alt="" />
            <p>Start&nbsp;Typing....</p>
        </>
    )
}

const ChatComponent = (props) => {
    const scrollChat = useRef(null)
    const scrollToBottom = () => {
        scrollChat.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom()
    }, [props.chatArray])
    return (
        <>
            <div className='chat-log-overflow'>
                <div className="chat-log">
                    {
                        props.chatArray.map((output, index) => (
                            <div className={output.className} key={index}>
                                <main>
                                    <p className='AIText'>{output.Text}</p>
                                </main>
                            </div>
                        ))
                    }
                    {
                        props.Typing ?
                            <div className='response chat-response' >
                                <main>
                                    <div className="typeDotParent">
                                        <div className="typingDots"></div>
                                        <div className="typingDots"></div>
                                        <div className="typingDots"></div>
                                    </div>
                                </main>
                            </div>
                            : null
                    }
                    <section ref={scrollChat}></section>
                </div>
            </div>
        </>
    )
}

const AIComponent = (props) => {
    const navigate = useNavigate()
    const [chatArray, setChatArray] = useState([])
    const [Section, setSection] = useState(true)
    const [userPrompt, setUserPrompt] = useState('');
    const [response, setResponse] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [Typing, setTyping] = useState(false)
    const currentKeyIndex = useRef(0)

    const query = async () => {
        setUserPrompt("")
        setTyping(true)
        setIsLoading(true);
        axios.post("https://tilchat-api-backend.onrender.com/Ai", {
            prompt: userPrompt
        })
            .then((result) => {
                console.log("result", result);
                setChatArray(C => [...C, result?.data])
            })
            .catch((error) => {
                console.log(error);

            })
            .finally(() => {
                setTyping(false)
                setIsLoading(false);
            })

    }

    const sendQuery = () => {
        const isOnline = (window.clientInformation.onLine);
        if (isOnline == true) {
            if (userPrompt.length > 0) {
                currentKeyIndex.current = 0
                setSection(false)
                setChatArray(C => [...C, { Text: userPrompt, className: "request" }])
                query()
            }
        }
        else {
            alert("Pls connect to internet")
        }

    }

    const changeViewState = () => {
        if (window.innerWidth <= 800) {
            navigate("/menu")
        }
    }
    const clearChat = () => {
        setChatArray([])
    }
    return (
        <div className='view-overall'>
            <img src={wallPapper} className="wallpapper" alt="" />
            <header>
                <div className="profile">
                    <img src={profileArrow} alt="" onClick={changeViewState} />
                    <img src={ai} alt="" style={{ filter: "invert(1) opacity(.8)", border: "2px solid #DE8900" }} />
                    <p>ChatBot</p>
                </div>
                <div className="settings">
                    <img src={deleteImg} alt="" onClick={clearChat} title='delete' />
                </div>
            </header>
            <div className="welcome-view-ai">
                {Section ? <WelcomeComponent /> : <ChatComponent Typing={Typing} chatArray={chatArray} />}
            </div>
            <div className="welcome-input ai">
                <input type="text" placeholder='Type Something....' value={userPrompt} onChange={(e) => { setUserPrompt(e.target.value) }} autoFocus />
                <img className='aiSend' src={send} onClick={sendQuery} alt="" disabled={isLoading} />
            </div>

        </div>
    )
}

export default AIComponent
