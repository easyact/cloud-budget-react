import './App.css'
import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom'
import {FaBug, FaCalendarAlt, FaSignOutAlt, FaSync, FaUserCircle} from 'react-icons/all'
import Budget from './components/Budget'
import {LandingPage} from './components/LandingPage'
import {useState} from 'react'
import LoginButton from './auth/LoginButton'

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
                        <div className="navbar-end"> {(true) ?
                            <div className="navbar-item field is-grouped is-grouped-multiline">
                                <p className="control">
                                    <LoginButton/>
                                </p>
                                <p className="control">
                                    <button className="button">
                                        注册
                                    </button>
                                </p>
                            </div>
                            : <div className="navbar-item has-dropdown is-hoverable">
                                <div className="navbar-link">
                                    {'user.username'}
                                </div>
                                <div className="navbar-dropdown">
                                    <Link to="/user" className="navbar-item">
                                        <div>
                                            <FaUserCircle className="is-small"/> 个人信息
                                        </div>
                                    </Link>
                                    <Link to="https://jinshuju.net/f/JXBXK2" className="navbar-item">
                                        <div>
                                            <FaBug className="is-small"/>
                                            上报bug
                                        </div>
                                    </Link>
                                    <button className="navbar-item" onClick={function logout() {
                                    }}>
                                        <div>
                                            <FaSignOutAlt className="is-small"/> 登出
                                        </div>
                                    </button>
                                </div>
                            </div>
                        }
                        </div>
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
