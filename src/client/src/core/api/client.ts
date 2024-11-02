import axios from "axios";


export const BaseClient = axios.create({
    baseURL: '/api',
    headers: {}
})


export const createClient = (url: string) => {
    return axios.create({
        ...BaseClient.defaults,
        baseURL: `${BaseClient.defaults.baseURL}${url}`
    });
}
