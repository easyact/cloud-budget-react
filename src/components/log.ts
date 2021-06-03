export default function log(key: any, fn = console.log) {
    return <T>(obj: T): T => {
        fn(key, obj)
        return obj
    }
}
