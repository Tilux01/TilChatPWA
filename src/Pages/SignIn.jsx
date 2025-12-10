import React, { useEffect, useState } from 'react'
import "./Styles/SignUp.css"
import github from "../images/github (1).png"
import Tilux from "../images/social.png"
import Google from "../images/search (2).png"
import name from "../images/user.png"
import email from "../images/download-file.png"
import passwordImg from "../images/padlock.png"
import { initializeApp } from 'firebase/app'
import { getAnalytics } from "firebase/analytics";
import {getDatabase,ref,push,set,get, query} from "firebase/database"
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';




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

const SignIn = () => {
  const navigate = useNavigate()
  const [UserName, setUserName] = useState("")
  const [Password, setPassword] = useState("")
  const [navigateUser, setNavigateUser] = useState(false)

  const UserNameCheck = (e) =>{
      setUserName(U=>e.target.value)
  }

  const PasswordCheck = (e) =>{
      setPassword(P=>e.target.value)
  }

  useEffect(() => {
    if (navigateUser) {
        navigate("/")
    }
  }, [navigateUser])

  const signIn = () =>{
    if (!UserName) {
      alert("username is required")
    }
    else if(!Password){
      alert("Password is required")
    }
    else{
      get(ref(db, `Users/${UserName}`))
      .then((output)=>{
        console.log(output.val());
        if (output.exists()) {
          if (output.val().Password == Password) {
            localStorage.setItem("TilChat",JSON.stringify({UserName: output.val().UserName,uniqueId: output.val().uniqueId,profileId: output.val().profileId, profilePic:output.val().profilePic}))
            alert(`Welcome ${UserName}`)
            setNavigateUser(true)
          }
          else{
            alert("Password is incorrect")
          }
        }
        else{
          alert("Username does not exist")
        }
      })
    }
  }
  return (
    <div className='signup-parent'>
          <div className="sign-overall" style={{flexDirection:"row"}}>
            <div className="info" style={{borderRadius:"15px 0px 0px 15px"}}>
              <h1>Welcome to Tilchat</h1>
              <p>New here?</p>
              <button>SIGN UP</button>
            </div>
            <div className="form" style={{borderRadius:"0px 15px 15px 0px"}}>
              <h1>Log in to Tilchat</h1>
              <div className="auto-log">
                <img src={Google} alt="" />
                <img src={github} alt="" />
                <img src={Tilux} alt="" />
              </div>
              <h5>or use your email account</h5>
              <div className="input">
                <img src={email} style={{filter:"invert(0)"}} alt="" />
                <input type="text" placeholder='username' value={UserName} onChange={UserNameCheck}/>
              </div>
              <div className="input">
                <img src={passwordImg} alt="" />
                <input type="text" placeholder='password' value={Password} onChange={PasswordCheck}/>
              </div>
              <button onClick={signIn}>SignUp</button>
              <p>Forgot Password?</p>
            </div>
          </div>
        </div>
  )
}

export default SignIn
