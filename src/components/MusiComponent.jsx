import React, { useEffect, useRef, useState } from 'react'
import "../Styles/MusiComponent.css"
import searchIcon from "../images/icon-search.svg"
import axios from 'axios'
import closeIcon from "../images/ad6f8ce5-b6ba-4bde-b4af-a6d0b3db434c.png"
import playImg from "../images/play-button-arrowhead.png"
import pauseImg from "../images/pause.png"
import previousImg from "../images/previous.png"
import nextImg from "../images/next-button.png"
import playListIcon from "../images/list.png"
import YouTube from 'react-youtube'
import musicIcon from "../images/record.png"
import loader from "../images/loader.png"

const MusiComponent = ({ setMusicActive }) => {
  const [songSearch, setSongSearch] = useState("")
  const [songArray, setSongArray] = useState([])
  const [onPlaying, setOnplaying] = useState(false)
  const offsetX = useRef(0)
  const offsetY = useRef(0)
  const translateX = useRef(0)
  const translateY = useRef(0)
  const isDragging = useRef(false)
  const [songImg, setSongImg] = useState()
  const [songName, setSongName] = useState()
  const [songArtist, setSongArtist] = useState()
  const videoId = useRef()
  const [playState, setPlayState] = useState(true)
  const playerRef = useRef()
  const [loading, setLoading] = useState(false)
  const musicPlayerRef = useRef(null);
  const currentIndex = useRef(null)
  const onPlayerReady = (event) => {
    musicPlayerRef.current = event.target;
    setLoading(false)
  };

  const playVideo = () => {
    musicPlayerRef.current?.playVideo();
  };

  const pauseVideo = () => {
    musicPlayerRef.current?.pauseVideo();
  };
  const search = () => {
    axios.post("https://tilchat-music-backend.onrender.com/getSong", { song: songSearch })
      .then((songs) => {
        console.log(songs);
        setSongArray(songs?.data?.message)
      })
      .catch((error) => {
        console.log(error);
      })
  }
  const closeMusic = () => {
    setMusicActive(false)
  }
  const startCapture = (e) => {
    e.preventDefault()
    isDragging.current = true
    playerRef.current.style.cursor = "grabbing"
    const rect = playerRef.current.getBoundingClientRect();
    console.log("rect", playerRef.current);

    offsetX.current = e.clientX - rect.left
    offsetY.current = e.clientY - rect.top
    console.log(offsetX.current, offsetY.current);

  }
  const dragMusic = (e) => {
    if (!isDragging.current) {
      return
    }
    translateX.current = e.clientX - offsetX.current
    translateY.current = e.clientY - offsetY.current
    requestAnimationFrame(() => {
      playerRef.current.style.transform = `translate(${translateX.current}px, ${translateY.current}px)`
    })
  }
  const stopCapture = () => {
    isDragging.current = false
    playerRef.current.style.cursor = "grab"
  }

  const playMusic = (output, index) => {
    console.log(output);
    setOnplaying(true)
    setSongName(output?.name)
    setSongImg(output?.thumbnails[0]?.url)
    setSongArtist(output?.artist?.name)
    videoId.current = output?.videoId
    setPlayState(true)
    setLoading(true)
    currentIndex.current = index
  }

  const nextSong = () => {
    currentIndex.current = currentIndex.current + 1
    if (songArray[currentIndex.current]) {
      playMusic(songArray[currentIndex.current], currentIndex.current)
      musicPlayerRef.current = null
    }
  }

  const previousSong = () => {
    currentIndex.current = currentIndex.current - 1
    if (songArray[currentIndex.current]) {
      playMusic(songArray[currentIndex.current], currentIndex.current)
      musicPlayerRef.current = null
    }
  }

  useEffect(() => {
    if (onPlaying && !playerRef.current.style.transform) {
      playerRef.current.style.transform = `translate(${window.innerWidth - 310}px, 0px)`
    }
  }, [onPlaying])

  const showPLayList = () => {
    playerRef.current.style.transform = ``
    setOnplaying(false)
  }

  const handleMusicState = () => {
    if (playState) {
      pauseVideo()
    }
    else {
      playVideo()
    }
    setPlayState(!playState)
  }
  return (
    <div>
      {onPlaying ?
        <YouTube
        style={{display: "none"}}
         videoId={videoId.current}
          onReady={onPlayerReady}
          opts={{
          playerVars: {
            autoplay: 1,
          mute: 0,
          controls: 1,
        }}}
        />
        : null}
      {
        !onPlaying ? (
          <div className='music-overall'>
            <div className='input-parent'>
              <input type="text" value={songSearch} onChange={(e) => { setSongSearch(e.target.value) }} />
              <img src={searchIcon} onClick={search} alt="" className='searcIcon' />
              <img src={closeIcon} alt="" onClick={closeMusic} className='closeIcon' />
            </div>
            <div className="song-parent">
              {
                songArray.map((output, index) => {
                  if (output?.type == "SONG" || output?.type == "VIDEO") {
                    return (
                      <div className="song" onClick={() => { playMusic(output, index) }}>
                        <img src={output?.thumbnails[0]?.url || musicIcon} alt="" />
                        <p>{output?.name}</p>
                      </div>
                    )
                  }
                })
              }
            </div>
          </div>
        )
          : (
            <div className='player-parent' ref={playerRef} onMouseDown={(e) => { startCapture(e) }} onMouseMove={(e) => { dragMusic(e) }} onMouseUp={stopCapture} onMouseLeave={stopCapture}>
              <img src={songImg} alt="" className="songIcon" />
              <div className='others'>
                <div>
                  <p>{songName}</p>
                  <h6>{songArtist}</h6>
                </div>
                <div className="controlImg">
                  <img src={previousImg} onClick={previousSong} alt="" />
                  {
                    loading ?
                      <img src={loader} alt="" className="roller" />
                      :
                      <img src={playState ? pauseImg : playImg} onClick={handleMusicState} alt="" />
                  }
                  <img src={nextImg} onClick={nextSong} alt="" />
                  <img src={playListIcon} className='playListIcon' onClick={showPLayList} alt="" />
                </div>
              </div>
            </div>
          )
      }
    </div>
  )
}

export default MusiComponent
