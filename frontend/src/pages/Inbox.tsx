import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { app, database } from "../config/firebase";
import { collection, onSnapshot, addDoc, query, where, orderBy, getDocs } from 'firebase/firestore';

export default function Inbox() {
    const { user_id, contact_id } = useParams();
    const [contacts, setContacts] = useState([]);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState(""); // State for the new message
    const [user, setUser] = useState(null);
    const navigate = useNavigate();
    const [contactMenu, setContactMenu] = useState({
        enabled: false,
        contactId: null
    });
    const [selectedContact, setSelectedContact] = useState(null);

    useEffect(() => {
        setUser(JSON.parse(localStorage.getItem('user')));
        if (user_id && contact_id) {
            const filteredContact = contacts.find((contact) => contact.id === contact_id);
            setSelectedContact(filteredContact);
            // fetchMessages(selectedContact.id);
        }

        const fetchContacts = async () => {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/contacts/user/${JSON.parse(localStorage.getItem('user')).id}`, {
                method: 'GET',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.ok) {
                const data = await response.json();
                setContacts(data);
                console.log(data);

                // Firebase collection reference
                const contactsRef = collection(database, "contacts");

                // // Add contacts to Firebase (same logic you had before)
                // for (const contact of data) {
                //     const q = query(contactsRef, where("id", "==", contact.id));
                //     const querySnapshot = await getDocs(q);

                //     if (querySnapshot.empty) {
                //         await addDoc(contactsRef, {
                //             id: contact.id,
                //             contact_user: contact.contact_user,
                //             contact_user_pfp: contact.contact_user_pfp
                //         });
                //     }
                // }

                setSelectedContact(data[0]);
            }
        };

        fetchContacts();
    }, [user_id, contact_id]);
    // Fetch messages from Firebase when contact is selected
    const fetchMessages = async (contactId) => {
        const messagesRef = collection(database, "messages");
        const q = query(messagesRef, where("contact_id", "==", contactId), orderBy("timestamp", "asc"));
        onSnapshot(q, (snapshot) => {
            const fetchedMessages = snapshot.docs.map((doc) => ({
                id: doc.id,
                ...doc.data()
            }));
            setMessages(fetchedMessages);
        });
    };
    const deleteContact = async (contactId) => {
        const choice = window.confirm("Are you sure you want to delete this contact?");
        if (choice) {
            const token = localStorage.getItem('token');
            const response = await fetch(`http://127.0.0.1:5000/contacts/${contactId}`, {
                method: 'DELETE',
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });
            if (response.ok) {
                const updatedContacts = contacts.filter((contact) => contact.id !== contactId);
                setContacts(updatedContacts);
            }
        }
        setContactMenu({
            enabled: false,
            contactId: null
        });
        // setSelectedContact(null);
    }


    // Send a new message
    const sendMessage = async () => {
        if (newMessage.trim() === "") return; // Don't send empty messages

        const messagesRef = collection(database, "messages");
        await addDoc(messagesRef, {
            contact_id: selectedContact.id,
            user_id: user.id,
            message: newMessage,
            timestamp: new Date(),
        });

        setNewMessage(""); // Clear the input after sending
        fetchMessages(selectedContact.id); // Fetch messages again to display the new message
    };

    return (
        <div className="h-screen w-full bg-gray-50 p-6 flex">
            {/* Contact List */}
            <div className="w-1/3 pr-4">
                <h1 className="text-3xl font-bold mb-6 text-gray-800">Inbox</h1>
                <div className="w-full max-w-xs">
                    {contacts.length === 0 ? (
                        <p className="text-center text-gray-500">No contacts available.</p>
                    ) : (
                        contacts.length>0&& contacts.map((contact) => (
                            <div 
                                key={contact.id} 
                                className={`bg-white w-full shadow-md rounded-lg mb-4 cursor-pointer ${selectedContact?.id === contact.id ? 'ring-2 ring-blue-400' : ''}`}
                                onClick={() => {
                                    navigate(`/inbox/${user.id}/${contact.id}`);
                                }}
                            >
                                <div className="flex items-center justify-between p-4">
                                    <div className="flex items-center">
                                        <img src={`${contact.receiver==user.full_name?contact.sender_pfp:contact.receiver_pfp}`} alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                        <div className="ml-4">
                                            <h1 className="font-semibold text-gray-800">{contact.receiver==user.full_name?contact.sender:contact.receiver}</h1>
                                        </div>
                                    </div>
                                    <div className="relative">
                                        <span className="text-gray-500 font-extrabold cursor-pointer tracking-wide" onClick={(e) => {
                                            e.stopPropagation(); // Prevent click on contact from opening menu
                                            setContactMenu({
                                                enabled: !contactMenu.enabled,
                                                contactId: contact.id
                                            });
                                        }}>
                                            ...
                                        </span>

                                        {contactMenu.enabled && contactMenu.contactId === contact.id && (
                                            <div className="absolute right-0 mt-2 w-24 bg-white border rounded-md shadow-lg z-10">
                                                <ul className="bg-white shadow-md rounded-md">
                                                    <li className="p-2 hover:bg-gray-100 text-red-500 cursor-pointer" onClick={() => {
                                                        deleteContact(contact.id);
                                                    }}>Delete</li>
                                                </ul>
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
                                    <img src={`${selectedContact.receiver==user.full_name?selectedContact.sender_pfp:selectedContact.receiver_pfp}`} alt="Author" className="w-10 h-10 rounded-full ring-2 ring-white object-cover" />
                                    <h1 className="font-semibold text-gray-800 ml-4">{selectedContact.receiver==user.full_name?selectedContact.sender:selectedContact.receiver}</h1>
                                </div>
                            </div>

                            {/* Display messages */}
                            <div className="flex flex-col space-y-4 p-6 h-96 overflow-y-auto">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`${
                                            msg.user_id === user.id ? "self-end bg-blue-500 text-white" : "self-start bg-gray-200"
                                        } p-3 rounded-md max-w-xs`}
                                    >
                                        <p>{msg.message}</p>
                                    </div>
                                ))}
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
