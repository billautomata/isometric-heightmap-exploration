import { useEffect } from 'react'
import './App.css';

import allSteps from './lib/allSteps'

function App() {

    useEffect(() => {
        allSteps()
    }, [])

    return (
        <div className="App">
            <div className='pixi-common pixi-step-1'/>
            <div className='three-displace-step'/>
            <div className='pixi-common pixi-step-2'/>
        </div>
    );
}

export default App;
