import { useEffect } from 'react'
import logo from './logo.svg';
import './App.css';

import go from './tree.js'

function App() {

    useEffect(() => {
        go()
    }, [])

    return (
        <div className="App">
        </div>
    );
}

export default App;
