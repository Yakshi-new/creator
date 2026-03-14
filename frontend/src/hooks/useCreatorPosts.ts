'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/api';

export default function useCreatorPosts() {

    const [posts, setPosts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchPosts = async () => {

        try {

            const res = await api.get('/posts/creator');
            const data = res.data as any[];
            setPosts(data);

        } catch (error) {

            console.error('Error fetching posts', error);

        } finally {

            setLoading(false);

        }

    };

    useEffect(() => {
        fetchPosts();
    }, []);

    return { posts, loading, fetchPosts };
}