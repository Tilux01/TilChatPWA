import React, { useState } from 'react'
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

const SignIn = () => {
      const [UserName, setUserName] = useState("")
      const [Password, setPassword] = useState("")
      const UserNameCheck = (e) =>{
          setUserName(U=>e.target.value)
      }
      const PasswordCheck = (e) =>{
          setPassword(P=>e.target.value)
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
              <button>SignUp</button>
              <p>Forgot Password?</p>
            </div>
          </div>
        </div>
  )
}

export default SignIn
