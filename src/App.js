import { useEffect } from 'react'
import './App.css';

import step1 from './lib/pixi-heightmap-steepmap-to-texture-id';
import step2 from './lib/heightmap-displace-threejs'

import allSteps from './lib/allSteps'

function App() {

    useEffect(() => {
        allSteps()
        // step1
        // const app1 = step1(step2)
        // go(app1)
    }, [])

    return (
        <div className="App">
            <div className='pixi-step-1'/>
            <div className='three-displace-step'/>
            <div className='pixi-step-2'/>
        </div>
    );
}

export default App;
