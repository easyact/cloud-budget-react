export function identify(user) {
    const analytics = window.analytics
    // console.log('analytics', analytics)
    analytics.identify(user.sub, user)
}
