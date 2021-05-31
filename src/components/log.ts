export default function log(key: any) {
    return <T>(obj: T): T => {
        console.log(key, obj)
        return obj
    }
}
