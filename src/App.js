import './App.css'
import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom'
import {FaCalendarAlt, FaSync} from 'react-icons/all'
import Budget from './components/Budget'
import {LandingPage} from './components/LandingPage'
import {useState} from 'react'
import Profile from './auth/Profile'

function App() {
    const [active, setActive] = useState(false)
    return <Router>
        <div className="App">
            <header>
                <nav className="navbar has-shadow is-primary">
                    <div className="navbar-brand">
                        <Link className="navbar-item" to="/">
                            <img alt="EasyAct" src={'logo.png'}/>
                        </Link>
                        <div className="navbar-item">
                            <small>云预算: 从996到财务自由</small>
                        </div>
                        <div onClick={() => setActive(!active)}
                             className={`navbar-burger burger ${active ? 'is-active' : null}`}>
                            <span/>
                            <span/>
                            <span/>
                        </div>
                    </div>
                    <div className={`navbar-menu ${active ? 'is-active' : null}`}>
                        <div className="navbar-start">
                            <Link to="budget" className="navbar-item">
                                <FaCalendarAlt/>
                                <span>预算</span>
                            </Link>
                            {/*<Link to="target" className="navbar-item">*/}
                            {/*    <FaDoorOpen/>*/}
                            {/*    <span>目标</span>*/}
                            {/*</Link>*/}
                            <Link to="sync" className="navbar-item">
                                <FaSync/>
                                <span>同步至云端</span>
                            </Link>
                        </div>
                        <div className="navbar-end"><Profile/></div>
                    </div>
                </nav>

                {/*<UserPicker/>*/}
            </header>

            <Routes>
                <Route path="" element={<LandingPage/>}/>
                <Route path="budget" element={<Budget/>}/>
                <Route path="target" element={<Budget/>}/>
                {/*<Route path="sync" element={<Login/>}/>*/}
            </Routes>
        </div>
    </Router>
}

export default App
