import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function loggedInUser() {
    const { data, error } = useSWR('/api/users/userAuth', fetcher)
  
    if (error) return null
    return data?.user
}