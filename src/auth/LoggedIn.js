import {useNavigate} from 'react-router'

export function LoggedIn() {
    const navigate = useNavigate()
    navigate('/budget')
    return <h1>欢迎回来!</h1>
}
