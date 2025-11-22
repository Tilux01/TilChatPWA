
import React, { useRef, useState,useEffect } from 'react'
import "../Styles/status.css"
import arrow from "../images/left-arrow-white.png"
import addIcon from "../images/add.png"
import deleteIcon from "../images/delete.png"
import DisplaySend from './DisplaySend'
import navigate from "../images/left-arrow-white.png"
// import { reduceImageQualityToBase64 } from "../ImageConverter";
import axios from 'axios'


const UserStatus = (props) => {
    const [arrayList, setArrayList] = useState()
    let statusNo = 0
    let loader = undefined
    let outParent = undefined
    const preview = (e) =>{
        document.querySelector(".profile-arrow").style.display = "flex"
        clearInterval(loader)
        const allStatuses = document.querySelectorAll(".user-status")
        const parentElement = e.target.offsetParent
        const parent = parentElement.id
        allStatuses.forEach((status)=>{
            status.style.display ="none"
        })
        document.getElementById(parent).style.display = "flex"
        parentElement.classList.add("preview")
        outParent = parent
        const moveLine = document.querySelector(`#${parent} #move${statusNo} div`)
        moveLine.classList.add("move")
        const nextBtn = document.querySelector(`#${parent} .right-arrow`)
        document.querySelector(`#${parent} #move${statusNo} .move`).style.animation = "move 50s 1"
        loader = setInterval(() => {
            const nextBtn = document.querySelector(`#${outParent} .right-arrow`)
            const parent  = nextBtn.offsetParent.id;
            const captureStatus = document.querySelector(`#${outParent} #status${statusNo}`)
            document.querySelector(`#${outParent} #move${statusNo} .move`).style.animation = ""
            captureStatus.style.display = "none"
            statusNo++;
            
            const nextStat = document.querySelector(`#${outParent} #status${statusNo}`)
            if(nextStat){
                nextStat.style.display = "block"
            }
            else{
            captureStatus.style.display = "block"
                statusNo--
            }
            const moveLine = document.querySelector(`#${parent} #move${statusNo} div`)
            moveLine.classList.add("move")
            document.querySelector(`#${parent} #move${statusNo} .move`).style.animation = "move 50s 1"
        }, 5000);
    }

    const navigateBack = (e) =>{
        clearInterval(loader)
        const allStatuses = document.querySelectorAll(".user-status")
        allStatuses.forEach((status)=>{
            status.style.display ="flex"
        })
        document.querySelectorAll(".preview").forEach((preview)=>{preview.classList.remove("preview")})
        document.querySelector(".profile-arrow").style.display = "none"
        statusNo=0
        document.querySelectorAll(`.move`).forEach((move)=>{move.style.animation = ""}) 
        document.querySelectorAll(`.lines`).forEach((move)=>{move.classList.remove("move")})
        document.querySelectorAll(".status").forEach((status)=>{status.style.display = "none"})
        firstShow()
    }

    document.addEventListener("keydown",(e)=>{
        if(e.key == "Escape"){
            navigateBack()
        }
        
    })

    const firstShow = () =>{
        setTimeout(() => {
            const firstStatus = document.querySelectorAll(`#status0`)
            firstStatus.forEach((status)=>{
                status.style.display = "block"
            })
        }, 300);
    }


    const nextStatus = (e) =>{
        clearInterval(loader)
        const parent  = e.target.offsetParent.id;
        const captureStatus = document.querySelector(`#${parent} #status${statusNo}`)
        captureStatus.style.display = "none"
        document.querySelector(`#${parent} #move${statusNo} .move`).style.animation = ""
        statusNo++;
        
        const nextStat = document.querySelector(`#${parent} #status${statusNo}`)
        if(nextStat){
            nextStat.style.display = "block"
        }
        else{
        captureStatus.style.display = "block"
            statusNo--
        }
        setInterval(loader)
    }

    const previousStatus =(e) =>{
        if(statusNo > 0){
            clearInterval(loader)
            const parent  = e.target.offsetParent.id;
            const moveLine = document.querySelector(`#${parent} #move${statusNo} div`)
            moveLine.classList.remove("move")
            moveLine.style.animation = ""
            const captureStatus = document.querySelector(`#${parent} #status${statusNo}`)
            captureStatus.style.display = "none"
            statusNo--;
            const moveLine2 = document.querySelector(`#${parent} #move${statusNo} div`)
            moveLine2.style.animation = "move 50s 1"
            const nextStat = document.querySelector(`#${parent} #status${statusNo}`)
            nextStat.style.display = "block"
            setInterval(loader)
        }
    }

    const deletePost = (index) =>{
        const check = window.confirm("Do you want to delete status", index+1)
        if(check){
            props.setStatusArray(props.statusArray.filter((_,i)=>i !== index))
            
        }
    }

    const [base64, setBase64] = useState()
    const uploadStat = async() =>{
        const raw = document.getElementById("statusUpload")
        const file = raw.files[0]
        const reader = new FileReader
        // const reducedQualityBase64 = await reduceImageQualityToBase64(file, 0.5, 1024);
        // setBase64(reducedQualityBase64.base64)
        raw.value = ""
    }

    const allStatuses = () =>{
        props.setStatusType(false)
    }

    return (
        <div className="stat-overall" style={{width:"100%",overflowX:"hidden"}}>
            <img src={navigate} alt="" onClick={allStatuses} className='navigateBackIcon'/>
            <h1 style={{marginBottom:"20px", marginTop:"0px"}}>My Status</h1>
            <div className='UserStatus-Parent'>
                <div className="shrink">
                    <img src={arrow} alt="" className='profile-arrow' onClick={navigateBack}/>
                    
                    {
                        props.statusArray.map((output,index)=>{
                            return(
                                (
                                    <div className="user-status" key={index} id={`userSatus${index}`}>
                                        <div onClick={preview} className="checkStatus">
                                            <div className='scroll'>
                                                <div key={index} className='lines'  id={`move${index}`}><div></div></div>
                                            </div>
                                            <div className='status-upload-parent'>
                                                <img src={output.Img} key={index}  id={`status${index}`} alt="" className='UserStatus'/>
                                            </div>
                                            <p style={{marginLeft:"60px"}} className="hiddenItems">{}Views</p>
                                        </div>
                                        <div className="options" onClick={()=>{deletePost(index)}}>
                                            <img src={deleteIcon} alt="" />
                                        </div>
                                    </div>
                                )
                            )
                        })
                    
                    }
                    <input type="file" name="statusUpload" id="statusUpload" onChange={uploadStat} style={{display:"none"}}/>
                    <label htmlFor="statusUpload">
                        <div className='userAddStatusLog'>
                            <img src={props.userCredentials.profilePic} alt="" className='profileImg'/>
                            <img src={addIcon} alt="" className='addIcon'/>
                        </div>
                    </label>
                </div>
                {
                    firstShow()                
                }
            </div>
            
            {base64?<DisplaySend base64={base64} setBase64={setBase64} setStatusArray={props.setStatusArray} statusArray={props.statusArray}/>:<></>}
        </div>
    )
}

export default UserStatus
