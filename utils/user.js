import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function loggedInUser() {
    const { data, error } = useSWR('/api/users/userAuth', fetcher)
    return {
        user: data,
        isLoading: !error && !data,
        isError: error
    }
}

export async function logOutUser() {
    return await fetch('/api/users/logout', {method: 'GET'})
}