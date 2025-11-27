import React, { useEffect, useRef, useState } from 'react'
import linkBtn from "../images/link.png"
import send from "../images/paper-plane.png"
import "../Styles/BlogSend.css"
import profileArrow from "../images/left-arrow-white.png"
import PreviewMedia from './PreviewMedia'
import logo from "../images/clinic-02.svg"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query, onValue, orderByChild, equalTo, orderByKey, update} from "firebase/database"
import {reduceImageQualityToBase64} from "../ImageConverter"



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


const BlogSend = () => {
    const userPrompt = useRef("")
    const [previewMedia, setPreviewMedia] = useState(false)
    const [blogArray, setBlogArray] = useState([])
    const [gallery, setGallery] = useState(null)
    const setGo = useRef(false)
    const sendBlog = () =>{
        setBlogArray(B=>[...B, {prompt: userPrompt.current.value, media:gallery}])
    }
    
    useEffect(() => {
        if (blogArray.length > 0) {
            set(ref(db, `Blog`),{
                blogArray
            })
        }
    }, [blogArray])

    useEffect(() => {
        get(ref(db, `Blog/blogArray`))
        .then((output)=>{
            if (output.exists()) {
                setBlogArray(()=>output.val())
            }
        })
        .finally(()=>{
            setGo.current = true
        })
    }, [])



    const displayGallery = async(e) =>{
        const file = e.target.files[0]
        const reducedQualityBase64 = await reduceImageQualityToBase64(file, 0.7, 1024, 1024);
        console.log(reducedQualityBase64);
        setGallery(reducedQualityBase64.base64)
     } 
  return (
    <main className='blogSend'>
        {/* {previewMedia? <PreviewMedia previewSrc={previewSrc.current} previewType = {previewType.current} setPreviewMedia={setPreviewMedia}/> : null} */}
        <header>
            <div className="profile">
                <img src={logo} alt="" style={{filter: "invert(0) opacity(.8)",border: "2px solidrgb(0, 4, 222)"}}/>
                <div style={{display:"flex",flexDirection:"column"}}>
                    <p>TilChat Blog</p>
                </div>
            </div>
        </header>
        <div className="blogContent">
            <main>
            {
                blogArray.map((output)=>{
                    return(
                        <div>
                            <img src={output?.media} alt="" />
                            <p>{output?.prompt}</p>
                        </div>
                    )
                })
            }
            </main>
        </div>
        <input type="file" id='galleryUpload' onChange={(e)=>{displayGallery(e)}} name='galleryUpload' style={{display:"none"}}/>
        <div className="welcome-input">
            <input type="text" ref={userPrompt}/>
            <label htmlFor="galleryUpload">
                <img src={linkBtn} alt=""  className='addBtn'/>
            </label>
            <img src={send} onClick={sendBlog} alt=""/>
        </div>
    </main>
  )
}

export default BlogSend
