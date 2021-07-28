import {useLocation} from 'react-router'
import {useEffect} from 'react'

// console.log('analytics', window.analytics)

export function identify(user) {
    window.analytics.identify(user.sub, user)
}

export function useSegmentPages() {
    let location = useLocation()
    useEffect(() => {
        const path = location.pathname
        // console.log('useSegmentPages', path)
        // const page =
        window.analytics.page({path})
        // console.log('useSegmentPages.finish', page)
    }, [location])
}
