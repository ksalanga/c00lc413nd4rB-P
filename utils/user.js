import useSWR from 'swr'

const fetcher = (url) => fetch(url).then(res => res.json())

export default function Profile() {
    const { data, error } = useSWR('/api/users/user', fetcher)
  
    if (error) return null
    if (!data) return <div>loading...</div>
    return data.user ? <div>hello {data.user}!</div> : null
}