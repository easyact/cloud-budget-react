const analytics = window.analytics
// console.log('analytics', analytics)
export function identify(user) {
    analytics.identify(user.sub, user)
}
