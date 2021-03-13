export const log = <T>(key: any) => (obj: T) => {
    console.log(key, obj)
    return obj
}
