export default function log<T>(key: any) {
    return (obj: T) => {
        console.log(key, obj)
        return obj
    }
}
