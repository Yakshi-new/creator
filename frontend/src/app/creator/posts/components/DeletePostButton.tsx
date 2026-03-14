import api from '@/lib/api';

export default function DeletePostButton({ postId, refresh }: any) {

    const handleDelete = async () => {

        await api.patch(`/posts/${postId}/delete`);

        refresh();
    };

    return (
        <button
            onClick={handleDelete}
            className="text-red-500 text-sm mt-2"
        >
            Delete
        </button>
    );
}