import React from 'react'
import "../Styles/EditDialogue.css"

const EditDialogue = ({prompt, setEditPrompt, returnState}) => {
    const saveEdit = () =>{
        returnState(true)
    }
    const cancelEdit = () =>{
        returnState(false)
    }
    return (
        <div className='editDialogue'>
            <div className="editParent">
                <textarea autoFocus onChange={(e)=>{setEditPrompt(e.target.value)}} name="" value={prompt} id=""></textarea>
                <div className="buttonParent">
                    <button onClick={cancelEdit}>Cancel</button>
                    <button onClick={saveEdit}>Save</button>
                </div>
            </div>
        </div>
    )
}

export default EditDialogue
