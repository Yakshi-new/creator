export default function PostsTable({ posts }: any) {

    return (

        <table className="w-full border">

            <thead>

                <tr className="bg-gray-100">

                    <th>Image</th>
                    <th>Content</th>
                    <th>Type</th>
                    <th>Likes</th>
                    <th>Comments</th>

                </tr>

            </thead>

            <tbody>

                {posts.map((post: any) => (

                    <tr key={post.id}>

                        <td>

                            {post.media?.[0] && (
                                <img src={post.media[0].url} width={60} />
                            )}

                        </td>

                        <td>{post.content}</td>
                        <td>{post.type}</td>
                        <td>{post._count.likes}</td>
                        <td>{post._count.comments}</td>

                    </tr>

                ))}

            </tbody>

        </table>
    );
}