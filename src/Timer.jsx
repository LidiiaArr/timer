import React from 'react';
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import {PlayButton} from "./PlayButton";
import {PauseButton} from "./PauseButton";
import {SettingButton} from "./SettingButton";
import {useContext} from "react";
import SettingsContext from "./SettingsContext";
import {useState} from "react";
import {useEffect} from "react"
import {useRef} from "react"

const red = '#f54e4e'
const green = '#4aec8c'

export function Timer () {
    const settingsInfo = useContext(SettingsContext)

    const [isPaused, setPaused] = useState(true)
    const [mode, setMode] = useState('work') // work/break/null
    const [secondsLeft, setSecondsLeft] = useState(0)
    //храним количество секунд

    console.log(secondsLeft, 'secondsLeft')
    console.log(mode, 'mode')

    const secondsLeftRef = useRef(secondsLeft)//позволяет сохранить некоторый объект,
    // который можно можно изменять и который хранится в течение всей жизни компонента.
    //В качестве параметра функция useRef() принимает начальное значение хранимого объекта.
    // А возвращаемое значение - ссылка-объект, из свойства current которого можно получить хранимое значение.
    const isPausedRef = useRef(isPaused)
    const modeRef = useRef(mode)

    console.log(secondsLeftRef, 'secondsLeftRef')
    function tick() {
        secondsLeftRef.current--
        setSecondsLeft(secondsLeftRef.current);
    } //Функция "tick" уменьшает значение оставшихся секунд на 1 и обновляет состояние.

    useEffect(() => {
        function switchMode() {
            let nextMode
            if(modeRef.current === 'work') nextMode = 'break'
            if(modeRef.current === 'break') nextMode = 'work'

            setMode(nextMode);
            modeRef.current = nextMode;

            const nextSeconds = (nextMode === 'work' ? settingsInfo.workMinutes : settingsInfo.breakMinutes) * 60
            setSecondsLeft(nextSeconds)
            secondsLeftRef.current = nextSeconds
            setPaused(true)
            isPausedRef.current = true
            // const nextMode = modeRef.current === 'work' ? 'break' : 'work';
            // const nextSeconds = (nextMode === 'work' ? settingsInfo.workMinutes : settingsInfo.breakMinutes) * 60
            //
            // setMode(nextMode);
            // modeRef.current = nextMode;
            //
            // setSecondsLeft(nextSeconds);
            // secondsLeftRef.current = nextSeconds;
        }

        secondsLeftRef.current = settingsInfo.workMinutes * 60;
        setSecondsLeft(secondsLeftRef.current);
        //перезаписываем переменную secondsLeft с 0 там будет храниться количесво секунд из настроек

        const interval = setInterval(() => {
            if (isPausedRef.current) {
                return;
            }
            if (secondsLeftRef.current === 0) { //
                return switchMode();
            }
            tick();
        }, 1000);

        return () => clearInterval(interval)
    }, [settingsInfo])

    const totalSeconds = mode === 'work' ? settingsInfo.workMinutes * 60 : settingsInfo.breakMinutes * 60
    //получаем всего количество секунд
    const percentage = Math.round(secondsLeft / totalSeconds * 100)
    //Math.round округление до ближайщего целого

    const minutes = Math.floor(secondsLeft / 60)

    let seconds = secondsLeft % 60
    if(seconds < 10) seconds= '0' + seconds


    return (
        <div>
            <CircularProgressbar
                value={percentage}
                text={String(minutes) +':' + String(seconds)}
                styles={buildStyles({
                    textColor: '#fff',
                    pathColor: mode === 'work' ? red: green,
                    tailColor: 'rgba(255,255,255,.2)',
                })}/>
            <div style={{marginTop: '20px'}}>
                {isPaused
                    ? <PlayButton onClick={()=> {setPaused(false); isPausedRef.current = false }} />
                    : <PauseButton onClick={()=> {setPaused(true); isPausedRef.current = true }}/>}
            </div>
            <div style={{marginTop: '20px'}}>
                <SettingButton onClick={() => {settingsInfo.setShowSettings(true)
                }}/>
            </div>
        </div>
    );
};

