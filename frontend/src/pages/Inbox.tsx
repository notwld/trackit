
export default function Inbox() {
    return (
        <div className="h-screen w-100">
            <div className="flex justify-between">
                <div className="flex flex-col">
                    <h1 className="text-3xl font-bold mt-10 mx-2">
                        Inbox
                    </h1>
                    <div className="mt-5 text-center">
                        <div className="bg-slate-100">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center">
                                    <img src="https://randomuser.me/api/portraits" alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                    <div className="ml-4">
                                        <h1 className="font-bold">John Doe</h1>
                                        <p className="text-gray-500">Hello, how are you?</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                        <div className="bg-slate-100">
                            <div className="flex items-center justify-between p-4">
                                <div className="flex items-center">
                                    <img src="https://randomuser.me/api/portraits" alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                    <div className="ml-4">
                                        <h1 className="font-bold">John Doe</h1>
                                        <p className="text-gray-500">Hello, how are you?</p>
                                    </div>

                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
