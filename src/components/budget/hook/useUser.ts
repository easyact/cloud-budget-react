import {useAuth0} from '@auth0/auth0-react'
import * as O from 'fp-ts/Option'
import {Option} from 'fp-ts/Option'
import {flow, pipe} from 'fp-ts/function'
import {migrateEventsToUser} from '../service/budgetEsService'
import * as RTE from 'fp-ts/ReaderTaskEither'
import {ReaderTaskEither} from 'fp-ts/ReaderTaskEither'
import * as E from 'fp-ts/Either'
import {EventStore} from '../../es/lib/eventStore'
import * as io from 'fp-ts/IO'
import {IO} from 'fp-ts/IO'
import {getItem, setItem} from 'fp-ts-local-storage'
import {useEffect, useState} from 'react'
import {sign_up} from '../service/analytics'

export const uidKey = 'user.id'
const loadUser = (): IO<Option<string>> => getItem(uidKey)
const saveUser = (user: string): IO<void> => setItem(uidKey, user)
const defaultUser = 'default'

const migrateEventsIf1stLogin = (loginUser: string) => O.fold(
    () => {
        sign_up()
        return migrateEventsToUser(loginUser)
    },
    RTE.right
)

const updateCache = (loginUser: string):
    (a: ReaderTaskEither<EventStore, string, any>) => ReaderTaskEither<EventStore, string, string> => flow(
    RTE.chain(() => RTE.fromIO(updateCacheIO(loginUser))),
    RTE.chain<EventStore, string, Option<string>, string>(RTE.fromOption(() => `读不到用户数据`))
)
const updateCacheIO = (loginUser: string): IO<Option<string>> => pipe(saveUser(loginUser), io.chain(loadUser))

const userStrategy = (loginUser: string | undefined, cacheUser: Option<string>): ReaderTaskEither<EventStore, string, string> => loginUser
    ? pipe(cacheUser, migrateEventsIf1stLogin(loginUser), updateCache(loginUser))
    : pipe(cacheUser, O.getOrElse(() => defaultUser), RTE.right)

export default function useUser(eventStore: EventStore) {
    const {user: {email} = {email: undefined}, isAuthenticated} =
        // {
        //     user: {email: 'zhaolei@easyact.cn'},
        //     isAuthenticated: true
        // }
        useAuth0()
    const [uid, setUid] = useState(email ?? defaultUser)
    const [isAuthOk, setAuthOk] = useState(false)
    const notifyAuthed = (s: string) => {
        gtag('set', {
            'user_id': s,
        })
        setUid(s)
        setAuthOk(true)
    }
    const [error, notifyError] = useState<string>()
    const task = userStrategy(email, loadUser()())
    useEffect(function execTask() {
        task(eventStore)().then(E.fold(
            notifyError,
            notifyAuthed)
        ).catch(notifyError)//.then(x => notifyError('test user error'))
    }, [task, eventStore])
    return {uid, error, isAuthenticated: isAuthenticated && isAuthOk}
}

// import {match, select} from 'ts-pattern'
// const userStrategy = (loginUser: string | null, cacheUser: Option<string>): ReaderTaskEither<EventStore, string, string> =>
//     match<[Option<string>, Option<string>], ReaderTaskEither<EventStore, string, string>>([O.fromNullable(loginUser), cacheUser])
//         .with([{_tag: 'None'}, {_tag: 'None'}], () => RTE.right(defaultUser))
//         .with([{_tag: 'None'}, {_tag: 'Some', value: select()}], RTE.right)
//         .with([{_tag: 'Some', value: select()}, {_tag: 'None'}],
//             login => pipe(migrateEventsToUser(login), updateCache(login)))
//         .with([{_tag: 'Some', value: select('login')}, {_tag: 'Some', value: select('cache')}],
//             ({login, cache}) => pipe(RTE.right(cache), updateCache(login)))
//         .exhaustive()
// const updateCache = (loginUser: string):
//     (a: ReaderTaskEither<EventStore, string, any>) => ReaderTaskEither<EventStore, string, string> => flow(
//     RTE.chain(() => RTE.fromOption(() => `读不到用户数据`)(updateCacheIO(loginUser)()))
// )
