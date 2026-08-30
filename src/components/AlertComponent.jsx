import React from 'react'
import "../Styles/AlertComponent.css"

const AlertComponent = ({query, prompt, returnState}) => {
    const currentState = (state) =>{
        returnState(state)
    }
    return (
        <div className='alertComponent'>
        {
            (()=>{
                if (!query) {
                    return(
                        <div className="alertParent">
                            <p>{prompt}</p>
                            <button onClick={()=>{currentState("Done")}}>Continue</button>
                        </div>
                    )
                }
                else if (query) {
                    return(
                        <div className='alertParent'>
                            <p>{prompt}</p>
                            <div className="btnParent">
                                <button>No</button> 
                                <button>Yes</button>
                            </div>
                        </div>
                    )
                }
            })()
        }
        </div>
    )
}

export default AlertComponent
