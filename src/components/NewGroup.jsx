import React, { useEffect, useRef, useState } from 'react'
import userImg from "../images/user.png"
import "../Styles/ForwardDialogue.css"
import groupImg from "../images/group.png"
import axios from 'axios'
import Loader from './Loader'
const NewGroup = ({ mutualRender, setCreateGroup, userCredentials,setMutualRender }) => {
    useEffect(() => {
        console.log(mutualRender);
    }, [mutualRender])
    
    const [groupName, setGroupName] = useState("")
    const [proceed, setProceed] = useState(false)
    const usersArray = useRef([])
    const [loading, setLoading] = useState(false)
    const cancelGroup = () => {
        setCreateGroup(false)
    }
    const createGroup = () => {
        if (usersArray.current?.length == 0) {
            alert("Please add at least one user")
            return
        }
        setLoading(true)
        axios.post("http://localhost:3409/createGroup", {
            groupImg: "default",
            groupName,
            groupMemebers: usersArray.current,
            groupAdmin: [userCredentials?.UserName],
        })
        .then((output)=>{
            console.log(output?.data?.message);
            
            setMutualRender(prev=> [...prev, output?.data?.message])
        })
        .catch((error)=>{
            console.log(error?.response);
            alert("Server error, sorry for the inconvinence")
        })
        .finally(()=>{
            setLoading(false)
            cancelGroup()
        })
    }
    const proceedCreation = () =>{
        if (groupName?.trim() == ""){
            alert("Please input group name")
            return
        }
        setProceed(true)
    }
    const chooseUser = (e, userName) =>{
        const btn = e.target
        if (btn.className == "choosed") {
            btn.className = "choose"
            const removeUser = usersArray.current.filter(user=> user != userName)
            usersArray.current = removeUser
        }
        else{
            usersArray.current.push(userName)
            btn.className = "choosed"
        }
    }
    return (
        <div className='forwardOverAll createGroup'>
            <div className="parentBtn">
                <button onClick={cancelGroup}>Cancel</button>
                {proceed? <p>Add Users</p>: null}
                {proceed? loading? <button className="SearchBtn"><Loader/></button> : <button onClick={createGroup}>Done</button>: null}
            </div>
            {proceed? <input type="text" placeholder='search' /> : null}
            
            <div className="forwardParent">
                {proceed ?
                        mutualRender.map((output, index) => {
                            if (output.UserName == userCredentials?.UserName) {
                                return
                            }
                            if (output.UserName) {
                                return (
                                    <div className='chat' key={index} >
                                        <img src={output?.profilePic == "/src/images/user.png" || output?.profilePic == "/assets/user.png" ? userImg : output?.profilePic} alt="" />
                                        <div style={{ display: "flex", flexDirection: "column" }}>
                                            <p>{output?.FullName}</p>
                                            <small style={{ color: 'whitesmoke' }}>@{output?.UserName}</small>
                                            {output?.unreadMsg ? <main className='unread'></main> : null}
                                        </div>
                                        <div className="choose" onClick={(e) => chooseUser(e, output?.UserName)}></div>
                                    </div>
                                )
                            }
                        })
                    : 
                        <div className="createGp">
                            <img src={groupImg} alt="" />
                            <input type="text" placeholder='Group Name' value={groupName} onChange={(e)=>{setGroupName(e.target.value)}}/>
                            <button onClick={proceedCreation}>Proceed</button>
                        </div>
                    }
            </div>
        </div>
    )
}

export default NewGroup
