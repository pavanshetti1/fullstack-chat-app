import {create} from 'zustand';
import {axiosInstance} from '../lib/axios';
import toast from 'react-hot-toast';    
import { useAuthStore } from './useAuthStore';

export const useChatStore = create( (set, get) => ({
    messages: [],
    users: [],
    selectedUser: null,
    isUsersLoading: false,
    isMessageLoading: false,

    getUsers: async () =>{
        set({isUsersLoading: true});
        try {
            const resp = await axiosInstance.get("/messages/users");
            set({users: resp.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally{
            set({isUsersLoading: false});
        }
    },

    getMessages: async (userId) =>{
        set({isMessageLoading: true});
        try {
            const res = await axiosInstance.get(`/messages/${userId}`);
            set({messages: res.data});
        } catch (error) {
            toast.error(error.response.data.message);
        } finally {
            set({isMessageLoading: false});
        }
    },

    sendMessages: async (messageData) => {
        const {selectedUser, messages} = get();
        try {
            const res = await axiosInstance.post(`/messages/send/${selectedUser._id}`, messageData);
            set({messages: [...messages, res.data]});
        } catch (error) {
            toast.error(error.response.data.message);
        }
    },

    subscribeMessage: () =>{
        const {selectedUser} = get();

        if(!selectedUser) return;

        const socket = useAuthStore.getState().socket;

        socket.on("newMessage", (newMessage)=>{
            set({messages: [...get().messages, newMessage]})
        })
    },

    unSubscribeMessage: () =>{
        const socket = useAuthStore.getState().socket;
        socket.off("newMessage");
    },

    setSelectedUser: (user) => set({selectedUser: user})
}))