import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function useCreatorPosts() {

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {

        try {

            const res = await api.get('/posts/creator');
            const data = res.data as any[];
            setPosts(data as any);

        } catch (error) {
            console.error(error);
        }

        setLoading(false);
    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return { posts, loading, fetchPosts };
}