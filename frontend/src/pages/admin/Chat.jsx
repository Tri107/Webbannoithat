import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { getChatConversations, getChatMessages } from "../../lib/api";

export default function AdminChat() {
  const socketRef = useRef(null);
  const [conversations, setConversations] = useState([]);
  const [activeConversation, setActiveConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messageToRecall, setMessageToRecall] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Khởi tạo connection và tải danh sách phòng chat
  useEffect(() => {
    socketRef.current = io("http://localhost:9999", {
      transports: ["websocket"],
    });

    const fetchConversations = async () => {
      try {
        const data = await getChatConversations();
        setConversations(data);
      } catch (err) {
        console.error("Lỗi khi tải danh sách phòng:", err);
      }
    };

    fetchConversations();

    // Lắng nghe sự kiện để cập nhật lại danh sách nếu có tin nhắn mới cho admin
    socketRef.current.emit("join_admin_room");
    socketRef.current.on("admin_new_message", (convoId) => {
      setConversations(prev => {
        let exists = false;
        const newList = prev.map(c => {
          if (c._id === convoId) {
            exists = true;
            return { ...c, hasAdminRead: false };
          }
          return c;
        });
        
        // Nếu không có trong list, tự fetch lại (đăng nhập user mới)
        if (!exists) {
          fetchConversations();
        }
        return newList;
      });
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  // Thay đổi phòng chat
  const handleSelectConversation = async (conv) => {
    // Rời phòng cũ nếu có
    if (activeConversation) {
      // (Option) Emitted leave_room nếu server có support, hiện tại chỉ quan tâm join
    }
    
    setActiveConversation(conv._id);
    
    if (!conv.hasAdminRead) {
      socketRef.current.emit("mark_as_read", conv._id);
      setConversations(prev => prev.map(c => c._id === conv._id ? { ...c, hasAdminRead: true } : c));
    }

    setMessages([]);

    try {
      // Lấy lịch sử chat
      const data = await getChatMessages(conv._id);
      setMessages(data);

      // Join phòng mới nhận realtime message
      socketRef.current.emit("join_room", conv._id);
    } catch (err) {
      console.error("Lỗi khi tải tin nhắn cho phòng:", err);
    }
  };

  // Lắng nghe tin nhắn mới
  useEffect(() => {
    if (!socketRef.current) return;

    const receiveMessageHandler = (data) => {
      // Xử lý cẩn thận để tin nhắn chỉ hiện khi đang ở đúng phòng chat, 
      // Nhưng do ta đã join room riêng biệt, nó thường chỉ lắng nghe room đó.
      setMessages(prev => {
        // Chống duplicate
        if (prev.some(msg => msg._id === data._id)) return prev;
        return [...prev, data];
      });
      
      // Nếu admin đang đọc live, và tin từ user thì đánh dấu đã đọc
      if (data.senderId !== "admin") {
         socketRef.current.emit("mark_as_read", data.conversationId);
         setConversations(prev => prev.map(c => c._id === data.conversationId ? { ...c, hasAdminRead: true } : c));
      }
    };

    socketRef.current.on("receive_message", receiveMessageHandler);

    const recallHandler = (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRecalled: true } : msg
      ));
    };
    socketRef.current.on("message_recalled", recallHandler);

    return () => {
      socketRef.current.off("receive_message", receiveMessageHandler);
      socketRef.current.off("message_recalled", recallHandler);
    };
  }, []);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ảnh quá lớn! Vui lòng chọn ảnh nhỏ hơn 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImage(reader.result);
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const cancelImage = () => {
    setImage(null);
    setImagePreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // Gửi tin nhắn từ phía Admin
  const sendMessage = () => {
    if ((!input.trim() && !image) || !activeConversation) return;

    const msg = {
      conversationId: activeConversation,
      senderId: "admin", 
      email: "Admin Support", 
      content: input.trim(),
      image: image,
    };

    socketRef.current.emit("send_message", msg);
    setInput("");
    cancelImage();
  };

  // Thu hồi tin nhắn
  const handleRecall = () => {
    if (messageToRecall) {
      socketRef.current.emit("recall_message", {
        messageId: messageToRecall,
        conversationId: activeConversation,
      });
      setMessageToRecall(null);
    }
  };

  return (
    <div className="w-full h-[calc(100vh-6rem)] bg-white shadow-md rounded-xl flex overflow-hidden border">
      
      {/* Sidebar - Danh sách các cuộc hội thoại */}
      <div className="w-1/3 border-r bg-gray-50 flex flex-col">
        <div className="p-4 border-b bg-white font-semibold text-lg flex items-center justify-between">
          <h2 className="text-gray-800">Khách hàng cần hỗ trợ</h2>
          <span className="text-sm bg-blue-100 text-blue-800 py-1 px-2 rounded-full">
            {conversations.length}
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-4 text-center text-gray-500 text-sm">Chưa có người dùng nào nhắn tin.</div>
          ) : (
            conversations.map((c) => (
              <div
                key={c._id}
                onClick={() => handleSelectConversation(c)}
                className={`p-4 border-b cursor-pointer transition-colors duration-200 hover:bg-gray-100 flex items-center gap-3
                  ${activeConversation === c._id ? "bg-blue-50 border-l-4 border-l-blue-500" : "border-l-4 border-l-transparent"}
                `}
              >
                <div className="w-10 h-10 rounded-full bg-slate-300 flex items-center justify-center text-slate-700 font-bold uppercase shrink-0">
                  {/* Có thể lấy username ngắn gọn */}
                  {c.userId?.substring(0, 1) || 'U'}
                </div>
                <div className="overflow-hidden">
                  <p className="font-semibold text-gray-800 text-sm truncate">{c.email || `User: ${c.userId?.substring(0, 8)}...`}</p>
                  <p className="text-xs text-gray-500 truncate mt-0.5">Hỗ trợ khách hàng</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Main Content - Cửa sổ Chat */}
      <div className="w-2/3 flex flex-col bg-white">
        {!activeConversation ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <svg className="w-20 h-20 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"></path></svg>
            <p className="text-lg font-medium text-gray-500">Chọn một cuộc trò chuyện để bắt đầu</p>
          </div>
        ) : (
          <>
            {/* Header chat */}
            <div className="p-4 border-b bg-white shadow-sm flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-700 font-bold uppercase shrink-0">
                  U
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">Chat đang chọn</h3>
                  <p className="text-xs text-gray-500">ID Phòng: {activeConversation}</p>
                </div>
            </div>

            {/* Nội dung tin nhắn */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
              {messages.length === 0 ? (
                <div className="text-center text-gray-400 mt-10">
                  Chưa có tin nhắn trong phòng này
                </div>
              ) : (
                messages.map((msg, i) => {
                  const isAdmin = msg.senderId === "admin";
                  return (
                    <div
                      key={msg._id || i}
                      className={`flex ${isAdmin ? "justify-end" : "justify-start"}`}
                    >
                      <div
                          className={`rounded-2xl max-w-[75%] shadow-sm overflow-hidden flex flex-col ${
                            isAdmin
                              ? "bg-blue-600 text-white rounded-tr-none"
                              : "bg-white text-gray-800 border border-gray-100 rounded-tl-none"
                          }`}
                        >
                          {/* HIỂN THỊ EMAIL CHO RÕ RÀNG */}
                          {!isAdmin && (
                            <div className="px-4 pt-2 pb-1 text-[10px] font-medium text-gray-400">
                              {msg.email}
                            </div>
                          )}
                          {msg.isRecalled ? (
                            <div className={`px-4 ${isAdmin ? 'py-2' : 'pb-2'} text-sm italic text-gray-400`}>
                              Tin nhắn đã bị thu hồi
                            </div>
                          ) : (
                            <div className="flex flex-col">
                              {msg.image && (
                                <a href={msg.image} target="_blank" rel="noopener noreferrer" className="block w-full">
                                  <img src={msg.image} alt="Sent" className="w-full h-auto object-cover max-h-[300px]" />
                                </a>
                              )}
                              {msg.content && (
                                <div className={`px-4 ${msg.image ? 'pt-2 pb-1' : (isAdmin ? 'py-2' : 'pb-2 pt-0')} text-sm`}>
                                  {msg.content}
                                </div>
                              )}
                            </div>
                          )}
                          <div className={`px-4 pb-2 pt-1 flex items-center gap-2 text-[10px] ${isAdmin ? "text-blue-200 justify-end" : "text-gray-400 justify-start"}`}>
                            <span>
                              {msg.createdAt 
                                ? `${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${new Date(msg.createdAt).toLocaleDateString('vi-VN')}` 
                                : `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`}
                            </span>
                            {isAdmin && !msg.isRecalled && msg._id && (
                              <button 
                                onClick={() => setMessageToRecall(msg._id)} 
                                className="hover:underline opacity-80 cursor-pointer"
                              >
                                Thu hồi
                              </button>
                            )}
                          </div>
                        </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Khung nhập tin nhắn */}
            {imagePreview && (
              <div className="px-4 py-2 bg-gray-50 border-t flex items-center relative">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-20 rounded-md object-cover border shadow-sm" />
                  <button
                    onClick={cancelImage}
                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-1 hover:bg-gray-900 shadow-xl flex items-center justify-center cursor-pointer"
                  >
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              </div>
            )}
            
            <div className="p-4 border-t bg-white flex items-center gap-3">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                className="text-gray-400 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0 cursor-pointer"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </button>
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                className="flex-1 bg-gray-100 text-gray-800 px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all border border-transparent"
                placeholder="Nhập phản hồi cho khách hàng..."
              />
              <button
                onClick={sendMessage}
                disabled={(!input.trim() && !image)}
                className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl transition cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-md w-14"
              >
                {/* Send Icon */}
                <svg className="w-5 h-5 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
              </button>
            </div>
          </>
        )}
      </div>

      {/* Popup Thu Hồi Xin Xác Nhận */}
      {messageToRecall && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="bg-white p-8 rounded-3xl shadow-2xl w-[340px] flex flex-col items-center transform transition-all scale-100">
            <div className="w-14 h-14 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-4">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-slate-800 mb-2">Thu hồi tin nhắn?</h3>
            <p className="text-sm text-slate-500 text-center mb-8">Tin nhắn này sẽ bị xóa khỏi cuộc trò chuyện.</p>
            <div className="flex w-full gap-4">
              <button 
                onClick={() => setMessageToRecall(null)}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold py-3 rounded-2xl transition cursor-pointer"
              >
                Hủy
              </button>
              <button 
                onClick={handleRecall}
                className="flex-1 bg-[#e60000] hover:bg-red-700 text-white font-semibold py-3 rounded-2xl transition cursor-pointer"
              >
                Thu hồi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
