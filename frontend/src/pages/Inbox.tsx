import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { database } from "../config/firebase";
import { collection, onSnapshot, addDoc, query, where, orderBy, getDocs, serverTimestamp, doc, deleteDoc } from "firebase/firestore";

export default function Inbox() {
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const navigate = useNavigate();
    const [selectedContact, setSelectedContact] = useState(null);
    const [showContactMenu, setShowContactMenu] = useState({
        enabled: false,
        contactId: null
    });

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));

        const fetchContactsFromServer = async () => {
            const response = await fetch(`http://127.0.0.1:5000/contacts/user/${user.id}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${localStorage.getItem('token')}`,
                    "Content-Type": "application/json"
                }
            });
            const data = await response.json();
            if (response.ok) {
                const ref = collection(database, "contacts");
                data.forEach(async (contact) => {
                    const q = query(
                        ref,
                        where("receiver", "==", contact.receiver),
                        where("sender", "==", contact.sender)
                    );
                    const querySnapshot = await getDocs(q);
                    if (querySnapshot.empty) {
                        await addDoc(ref, {
                            userId: user.id,
                            sender: contact.sender,
                            receiver: contact.receiver,
                            receiver_pfp: contact.receiver_pfp,
                            sender_pfp: contact.sender_pfp,
                            receiver_id: contact.receiver_id,
                            sender_id: contact.sender_id
                        });
                    }
                });
            }
        }
        fetchContactsFromServer();
    }, []);

    const deleteContact = async (contactId) => {
        const contactRef = collection(database, "contacts");
        await deleteDoc(doc(contactRef, contactId)).then(() => {
            console.log("Document successfully deleted!");
            setContacts(contacts.filter(contact => contact.id !== contactId));
            setSelectedContact(null);
        }
        );
    }

    const deleteMessage = async (messageId) => {
        const messageRef = collection(database, "messages");
        await deleteDoc(doc(messageRef, messageId)).then(() => {
            console.log("Document successfully deleted!");
            setMessages(messages.filter(message => message.id !== messageId));
        }
        );
    }


    useEffect(() => {
        const fetchContacts = async () => {
            const contactsRef = collection(database, "contacts");

            const receiverQuery = query(contactsRef, where("receiver_id", "==", user.id));
            const senderQuery = query(contactsRef, where("sender_id", "==", user.id));

            const [receiverSnapshot, senderSnapshot] = await Promise.all([
                getDocs(receiverQuery),
                getDocs(senderQuery)
            ]);

            const contacts = [
                ...receiverSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })),
                ...senderSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
            ];

            const uniqueContacts = Array.from(new Map(contacts.map(contact => [contact.id, contact])).values());

            setContacts(uniqueContacts);
        };
        fetchContacts();
    }, [user.id]);




    const sendMessage = async () => {
        if (newMessage.trim() === "") return;

        const messagesRef = collection(database, "messages");
        await addDoc(messagesRef, {
            chatId: `${selectedContact.id}`,
            message: newMessage,
            senderId: user.id.toString(), // Convert senderId to string
            receiverId: selectedContact.receiver_id.toString(), // Convert receiverId to string
            timestamp: serverTimestamp()
        });

        setNewMessage("");
    };
    useEffect(() => {
        console.log(selectedContact);
        if (selectedContact) {
            const messagesRef = collection(database, "messages");
            const chatId = `${selectedContact.id}`;

            // Debugging: Log the generated chatId and selected contact's ID to ensure they match what you expect.
            console.log("Generated chatId:", chatId);
            console.log("Selected Contact ID:", selectedContact.id);

            const q = query(
                messagesRef,
                where("chatId", "==", chatId), // Filter messages by chatId
                orderBy("timestamp", "asc") // Order messages chronologically by timestamp
            );

            // Set up a real-time listener using onSnapshot
            const unsubscribe = onSnapshot(q, (snapshot) => {
                if (snapshot.empty) {
                    // Debugging: Log if no messages are found for the given chatId
                    console.log("No messages found for chatId:", chatId);
                } else {
                    const messagesData = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    }));

                    // Debugging: Log the retrieved messages for the chatId
                    console.log("Messages for chatId:", chatId, messagesData);

                    setMessages(messagesData); // Update the state with the new messages
                }
            });

            // Clean up the listener when component unmounts or contact changes
            return () => unsubscribe();
        }
    }, [selectedContact, user.id]);


    return (
        <div className="h-screen w-full bg-gray-50 p-6 flex">
            {/* Contact List */}
            <div className="w-1/3 pr-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Inbox</h1>
                <div className="w-full max-w-xs">
                    {contacts.length === 0 ? (
                        <p className="text-center text-gray-500">No contacts available.</p>
                    ) : (
                        contacts.map((contact) => (
                            <div
                                key={contact.id}
                                className={`bg-white w-full shadow-md rounded-lg mb-4 cursor-pointer ${selectedContact?.id === contact.id ? 'ring-2 ring-blue-400' : ''}`}
                                onClick={() => setSelectedContact(contact)}
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center">
                                        <img
                                            src={user.full_name === contact.sender ? contact.receiver_pfp : contact.sender_pfp}
                                            alt="Author"
                                            className="w-10 h-10 rounded-full ring-2 ring-white object-cover"
                                        />

                                        <div className="ml-4">
                                            <h1 className="font-semibold text-gray-800">
                                                {user.full_name === contact.sender ? contact.receiver : contact.sender}
                                            </h1>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span
                                            className="font-extrabold text-gray-500 cursor-pointer"
                                            onClick={() => {
                                                setShowContactMenu({
                                                    enabled: !showContactMenu.enabled,
                                                    contactId: contact.id
                                                });
                                            }}
                                        >
                                            ...
                                        </span>
                                        {showContactMenu.enabled && showContactMenu.contactId === contact.id && (
                                            <div className="absolute right-0 top-8 bg-white shadow-lg rounded-md py-2 z-10">
                                                <button className="block text-red-500 px-4 py-1 hover:bg-gray-200 w-full text-left"
                                                    onClick={() => deleteContact(contact.id)}
                                                >Delete</button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>

            {/* Conversation Section */}
            <div className="w-full bg-white shadow-md rounded-lg flex flex-col justify-between">
                {selectedContact ? (
                    <>
                        <div>
                            <div className="text-2xl font-bold mb-4 bg-gray-100 px-4 py-6">
                                <div className="flex items-center">
                                    <img src={user.id === selectedContact.sender_id ? selectedContact.receiver_pfp : selectedContact.sender_pfp} alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                    <h1 className="font-semibold text-gray-800 ml-4">{user.id === selectedContact.sender_id ? selectedContact.receiver : selectedContact.sender}</h1>
                                </div>
                            </div>

                            {/* Display messages */}
                            <div className="flex flex-col space-y-4 p-6 h-96 overflow-y-auto">
                                <div className="flex flex-col space-y-4 p-6 h-96 overflow-y-auto">
                                    {messages.length === 0 ? (
                                        <p className="text-center text-gray-500">No messages yet.</p>
                                    ) : (
                                        messages.map((msg) => (
                                            <div
                                                key={msg.id}
                                                className={`${msg.senderId == user.id ? "self-end bg-blue-500 text-white" : "self-start bg-gray-200"} p-3 rounded-md max-w-xs`}
                                            >
                                                <div>
                                                    <div className="flex justify-between items-center">
                                                    <p>{msg.message}</p>
                                                        {msg.senderId == user.id && (
                                                            <span
                                                                className="font-extralight text-white cursor-pointer text-xs"
                                                                onClick={() => deleteMessage(msg.id)}
                                                            >
                                                                Delete
                                                            </span>
                                                        )}
                                                        </div>  
                                                </div>
                                                <span className="text-xs text-white">{new Date(msg.timestamp?.toDate()).toLocaleString()}</span>
                                            </div>
                                        ))
                                    )}
                                </div>

                            </div>
                        </div>

                        {/* Textarea for sending message */}
                        <div className="flex mt-6 p-4">
                            <textarea
                                className="flex-1 p-2 border rounded"
                                placeholder="Type a message..."
                                value={newMessage}
                                onChange={(e) => setNewMessage(e.target.value)}
                            />
                            <button
                                className="bg-blue-500 text-white px-4 py-2 rounded ml-2"
                                onClick={sendMessage}
                            >
                                Send
                            </button>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-500 text-center py-4">Select a contact to view the conversation.</p>
                )}
            </div>
        </div>
    );
}
