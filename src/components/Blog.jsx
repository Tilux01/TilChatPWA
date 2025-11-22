import React, { useState,useEffect, useRef, useMemo, useCallback } from 'react'
import "../Styles/AIChat.css"
import send from "../images/paper-plane.png"
import profileArrow from "../images/left-arrow-white.png"
import ai from "../images/bot.png"
import deleteImg from "../images/delete.png"
import logo from "../images/clinic-02.svg"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import ChatMediaSend from './ChatMediaSend'
import VideoPlayer from './VideoPlayer'
import PreviewMedia from './PreviewMedia'
import MediaTypesSelect from './MediaTypesSelect'
import sent from "../images/doneThick.png"
import sending from "../images/rotate.png"
import errorSend from "../images/mark (1).png"
import online from "../images/double-tick (2).png"
import seen from "../images/double-tick (1).png"
import close from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"


const firebaseConfig = {
  apiKey: "AIzaSyCoDIlOAkemogzj-Gw2G_lVO7VI7uEeIG8",
  authDomain: "tilchat-91043.firebaseapp.com",
  databaseURL: "https://tilchat-91043-default-rtdb.firebaseio.com",
  projectId: "tilchat-91043",
  storageBucket: "tilchat-91043.firebasestorage.app",
  messagingSenderId: "293755713788",
  appId: "1:293755713788:web:a28845400f6f8992a87f79",
  measurementId: "G-CP47MXQ3MG"
};

const appSettings = {
    databaseURL: "https://tilchat-91043-default-rtdb.firebaseio.com/"
}

const app = initializeApp(firebaseConfig);
const db = getDatabase(app)
const analytics = getAnalytics(app);

const Blog = (props) => {
      const navigate = useNavigate()

    // const useVal = ()=>{val()}
    const [userName, setUserName] = useState()
    const [mediaOption, setMediaOption] = useState(false)
    const [previewMedia, setPreviewMedia] = useState(false)
    const [statusPreview, setStatusPreview] = useState(false)
    const previewSrc = useRef(null)
    const previewType = useRef(null)
    useEffect(() => {
        onValue(ref(db, `Blog/blogArray`),(output)=>{
            if (output.exists()) {
                console.log(output.val());
                setBlogArray(()=>output.val())
                
            }
        })
    }, [])
    const preview = (data, type) =>{
        previewSrc.current = data
        previewType.current = type
        setPreviewMedia(()=>true)
    }
    const scrollChat = useRef(null)
    const scrollToBottom = () => {
        scrollChat.current?.scrollIntoView({ behavior: "smooth" })
    };
    const userNameGet = localStorage.getItem("TilChat")
    useEffect(() => {
        if(!userNameGet){
            navigate("/signup")
        }
        else{
            setUserName(JSON.parse(userNameGet).UserName)
            
        }
    }, [navigate])
    const [blogArray, setBlogArray] = useState([])
    const propsValue = useRef()
    const openDB = () => {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('TilDB', 1)

        request.onupgradeneeded = (event) => {
        const db = event.target.result
        if (!db.objectStoreNames.contains('chats')) {
            db.createObjectStore('chats')
        }
        }

        request.onsuccess = () => resolve(request.result)
        request.onerror = () => reject(request.error)
    })
    }
    const  saveChat = async(directory, data) => {
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readwrite')
        const store = tx.objectStore('chats')
        store.put(data, directory)
        tx.oncomplete = () => resolve(true)
        tx.onerror = () => reject(tx.error)
    })
    }
    const getChat = async(key) =>{
    const db = await openDB()
    return new Promise((resolve, reject) => {
        const tx = db.transaction('chats', 'readonly')
        const store = tx.objectStore('chats')
        const request = store.get(key)
        request.onsuccess = () => resolve(request.result || null)
        request.onerror = () => reject(request.error)
    })
    }

    const previousChat = useRef()

    useEffect(() => {
        getChat("TilBlog")
        .then((output)=>{
            if (output) {
                setBlogArray(output) 
            }
            else{
                setBlogArray([])
            }
        })
    }, [props.chatInfo])
    useEffect(() => {
        saveChat("TilBlog", blogArray)
    }, [blogArray])
    const checkUser = useRef()
    const changeMediaOption = () =>{
        if (mediaOption) {
            setMediaOption(()=>false)
        }
        else{
            setMediaOption(()=>true)
        }
    }

    useEffect(() => {
        scrollToBottom()
    }, [blogArray])
    const changeShowType = () =>{ 
        if(window.innerWidth <= 800){
            props.setChatState(()=>"sider")
        }
    }
    return (
        <main style={props.chatState == "sider"? {display: "none"} : {display: "flex", width:"100%"}}>
            {previewMedia? <PreviewMedia previewSrc={previewSrc.current} previewType = {previewType.current} setPreviewMedia={setPreviewMedia}/> : null}
            <header>    
                <div className="profile">
                    <img src={profileArrow} className='navigateArrow' onClick={changeShowType}/>
                    <img src={logo} alt="" style={{filter: "invert(0) opacity(.8)",border: "2px solidrgb(0, 4, 222)"}}/>
                    <div style={{display:"flex",flexDirection:"column"}}>
                        <p>TilChat Blog</p>
                    </div>
                </div>
            </header>
            <div className='welcome-view-ai'>
                <div className='chat-log-overflow'>
                    <div className="chat-log">
                        {
                            blogArray.map((output,index)=>{
                                if(output){
                                    return(
                                        <div className='response chat-response' key={index} draggable>
                                            <main>
                                                <img src={output.media} alt="" />
                                                <p>{output.prompt}</p>
                                            </main>
                                        </div>
                                    )
                                }
                            })
                        }
                        <section ref={scrollChat}></section>
                    </div>
                </div>
            </div>
        </main>
    )
}

export default Blog
