import { createClient } from "./client";
import * as querystring from 'querystring'


const client = createClient('/auth')


interface ISignResponse {
    username: string
    access_token: string
    expire: string
}

function storeAccessToken(r: ISignResponse) {
    for (const [k, v] of Object.entries({
        username: r.username,
        access_token: r.access_token,
        access_token_expire: r.expire
    })) {
        localStorage.setItem(k, v)
    }
}

export const signup = async (username: string, password: string) => {
    const response = (await client.post<ISignResponse>(
        '/signup',
        querystring.stringify({username, password})
    )).data
    storeAccessToken(response)
}

export const signin = async (username: string, password: string) => {
    const response = (await client.post<ISignResponse>(
        '/signin',
        querystring.stringify({username, password})
    )).data
    storeAccessToken(response)
}

export const changePassword = async () => {

}