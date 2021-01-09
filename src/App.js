import './App.css';
import Budget from "./components/Budget";
import {BrowserRouter as Router, Link, Route, Routes} from "react-router-dom";
import {FaCalendarAlt, FaDoorOpen} from "react-icons/all";

function App() {
    return (
        <Router>
            <div className="App">
                <header>
                    <nav>
                        <ul>
                            <li>
                                <Link to="budget" className="btn btn-header">
                                    <FaCalendarAlt/>
                                    <span>预算</span>
                                </Link>
                            </li>
                            <li>
                                <Link to="target" className="btn btn-header">
                                    <FaDoorOpen/>
                                    <span>目标</span>
                                </Link>
                            </li>
                        </ul>
                    </nav>

                    {/*<UserPicker/>*/}
                </header>

                <Routes>
                    <Route path="budget" element={<Budget/>}/>
                    <Route path="target" element={<Budget/>}/>
                </Routes>
            </div>
        </Router>
        // <Budget></Budget>
    );
}

export default App;
