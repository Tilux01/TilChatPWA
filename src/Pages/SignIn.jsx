import React, { useEffect, useState } from 'react'
import "./Styles/SignUp.css"
import github from "../images/github (1).png"
import Tilux from "../images/social.png"
import Google from "../images/search (2).png"
import name from "../images/user.png"
import email from "../images/download-file.png"
import passwordImg from "../images/padlock.png"
import {ref,push,set,get, query, update} from "firebase/database"
import {app, db} from '../firebase/config'
import { BrowserRouter as Router, Routes, Route,Navigate, useNavigate } from 'react-router-dom';
import bg from "../images/wallpaper10.png"
import SignUp from './SignUp'


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

  const gotToSignup = () =>{
    navigate("/signup")
  }

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
        if (output.exists()) {
          if (output.val().Password == Password) {
            localStorage.setItem("TilChat",JSON.stringify({UserName: output.val().UserName,uniqueId: output.val().uniqueId,profileId: output.val().profileId, profilePic:output.val().profilePic}))
            let devices = []
            get(ref(db, `Devices/${UserName}`))
            .then((output)=>{
              if (output.exists) {
                devices = output.val()
                const userAgent = navigator.userAgent 
                const filterDevice = devices.filter(device=> device != userAgent) 
                filterDevice.push(userAgent)
                update(ref(db, `Devices`),{
                  [UserName] : filterDevice
                })
              }
              else{
                const userAgent = navigator.userAgent     
                devices.push(userAgent)
                update(ref(db, `Devices`),{
                  [UserName] : devices
                })
              }
            })
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
      <img src={bg} className='bg' alt="" />
          <div className="sign-overall" style={{flexDirection:"row"}}>
            <div className="form lastInfo" style={{borderRadius:"0px 15px 15px 0px"}}>
              <h1 style={{fontSize:'35px'}}>Sign In To TIlChat</h1>
              <div className="icons">
                <img src={Google} alt="" />
                <img src={github} alt="" />
              </div>
              <div className="input">
                <img src={email} style={{filter:"invert(0)"}} alt="" />
                <input type="text" placeholder='username' value={UserName} onChange={UserNameCheck}/>
              </div>
              <div className="input">
                <img src={passwordImg} alt="" />
                <input type="password" placeholder='password' value={Password} onChange={PasswordCheck}/>
              </div>
              <button onClick={signIn}>Sign In</button>
              <p>Forgot Password?</p>
              <h6 onClick={gotToSignup} >Don't have an account? sign Up</h6>
            </div>
          </div>
        </div>
  )
}

export default SignIn
