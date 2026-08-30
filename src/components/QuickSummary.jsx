import React from 'react'
import cancelBtn from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import "../Styles/QuickSummary.css"


const QuickSummary = ({prompt, result, state}) => {

    const setState = () =>{
        state(false)
    }
    return (
        <div className='summaryOverall'>
            <div className='summaryParent'>
                <img onClick={setState} src={cancelBtn} alt="" />   
                <div className="userQuery">
                    <p>{prompt}</p>
                </div>
                <div className="result">
                    <h5>{result}</h5>
                </div>
            </div>
        </div>
    )
}

export default QuickSummary
