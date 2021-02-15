import './App.css'
import {BrowserRouter as Router, Link, Route, Routes} from 'react-router-dom'
import {FaCalendarAlt, FaDoorOpen} from 'react-icons/all'
import Budget from './components/Budget'
import {LandingPage} from './components/LandingPage'

function App() {
    return (
        <Router>
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
                            <div className="navbar-burger burger">
                                <span/>
                                <span/>
                                <span/>
                            </div>
                        </div>
                        <div className="navbar-menu">
                            <div className="navbar-start">
                                <Link to="budget" className="navbar-item">
                                    <FaCalendarAlt/>
                                    <span>预算</span>
                                </Link>
                                <Link to="target" className="navbar-item">
                                    <FaDoorOpen/>
                                    <span>目标</span>
                                </Link>
                            </div>
                        </div>
                    </nav>

                    {/*<UserPicker/>*/}
                </header>

                <Routes>
                    <Route path="" element={<LandingPage/>}/>
                    <Route path="budget" element={<Budget/>}/>
                    <Route path="target" element={<Budget/>}/>
                </Routes>
            </div>
        </Router>
        // <Budget></Budget>
    )
}

export default App
