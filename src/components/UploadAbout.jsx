import React, { useState } from 'react'
import userImg from "../images/user.png"
import "../Styles/UploadAbout.css"
import {app, db} from '../firebase/config'
import {ref, update} from "firebase/database"


const UploadAbout = ({userCredentials, setUserAbout}) => {
    const [bioInput, setBioInput] = useState("")
    const [alertUser, setAlertUser] = useState("")
    const uploadBio = () =>{
        if (bioInput.length < 20) {
            setAlertUser("please write minimum of 20 characters")
            setTimeout(() => {
                setAlertUser(()=>"")
            }, 5000);
        }
        else if(bioInput.length > 300){
            setAlertUser("please write maximum of 300 characters")
            setTimeout(() => {
                setAlertUser(()=>"")
            }, 5000);
        }
        else{
            setUserAbout(false)
            update(ref(db, `Users/${userCredentials?.UserName}`),{
                about: bioInput
            })
            alert("profile updated successfully")
        }
    }
    return (
        <div className='about-overall'>
        <div className='about-parent'>
            <h1>{userCredentials?.FullName}</h1>
            <p>@{userCredentials?.UserName}</p>
            <img src={userCredentials?.profilePic} alt="" />
            <h2>Let's get to know more about you, Pls update your bio</h2>
            <small>{alertUser}</small>
            <textarea name="" value={bioInput} onChange={(e)=>setBioInput(e.target.value)} placeholder='Write you bio here ...' id=""></textarea>
            <button onClick={uploadBio}>Update Bio</button>
        </div>
        </div>
    )
}

export default UploadAbout
