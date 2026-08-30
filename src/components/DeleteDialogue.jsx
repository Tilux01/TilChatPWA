import React from 'react'
import "../Styles/DeleteDialogue.css"
import cancelBtn from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"

const DeleteDialogue = ({returnState, userType}) => {
    const setState = (param) =>{
        returnState(param)
    }
    return (
        <div className='deleteDialogue'>
            {
                userType == true?
                    <div className="deleteParent">
                        <img onClick={()=>{setState("cancel")}} src={cancelBtn} alt="" />
                        <div className="btnParent">
                            <button onClick={()=>{setState("for everyone")}}>Delete for everyone</button>
                            <button onClick={()=>{setState("for me")}}>Delete for me</button>
                        </div>
                    </div>
                :
                    <div className="deleteParent">
                        <img onClick={()=>{setState("cancel")}} src={cancelBtn} alt="" />
                        <button onClick={()=>{setState("for me")}}>Delete for me</button>
                    </div>
            }
        </div>
    )
}

export default DeleteDialogue
