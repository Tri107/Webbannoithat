import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import { useLocation } from "react-router-dom";
import { MessageCircle, X } from "lucide-react";
import { createOrGetConversation, getChatMessages } from "../../lib/api";

export default function ChatBox() {
  const location = useLocation();
  const socketRef = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [messageToRecall, setMessageToRecall] = useState(null);
  const fileInputRef = useRef(null);
  const messagesEndRef = useRef(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);
  

  const [conversationId, setConversationId] = useState(null);

  // 🔥 LẤY USER TỪ LOCALSTORAGE
  const storedUser = localStorage.getItem("user");
  const user = storedUser ? JSON.parse(storedUser) : null;

  // 🔥 TẠO SOCKET VÀ EVENT LISTENER
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL || "http://localhost:9999", {
      transports: ["websocket"],
    });
    socketRef.current = socket;

    socket.on("receive_message", (data) => {
      setMessages(prev => {
        // 🔥 CHỐNG DUPLICATE
        const exists = prev.some(msg => msg._id === data._id);
        if (exists) return prev;
        return [...prev, data];
      });
    });

    socket.on("message_recalled", (messageId) => {
      setMessages(prev => prev.map(msg => 
        msg._id === messageId ? { ...msg, isRecalled: true } : msg
      ));
    });

    return () => {
      socket.off("receive_message");
      socket.off("message_recalled");
      socket.disconnect();
    };
  }, []);

  // 🔥 TẠO / LẤY CONVERSATION
  useEffect(() => {
    if (!user) return;

    createOrGetConversation({
      userId: user.id || user._id,
      email: user.email,
    })
      .then(data => {
        setConversationId(data._id);

        // 🔥 JOIN ROOM
        socketRef.current.emit("join_room", data._id);

        // 🔥 LOAD MESSAGE
        return getChatMessages(data._id);
      })
      .then(data => setMessages(data))
      .catch(err => console.error("Lỗi khi tải chat:", err));
  }, [user?.id, user?._id, user?.email]);

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

  // 🔥 GỬI TIN NHẮN
  const sendMessage = () => {
    if ((!input.trim() && !image) || !user || !conversationId) return;

    const msg = {
      conversationId,
      senderId: user.id || user._id,
      email: user.email,
      content: input.trim(),
      image: image,
    };

    socketRef.current.emit("send_message", msg);

    setInput("");
    cancelImage();
  };

  const handleRecall = () => {
    if (messageToRecall) {
      socketRef.current.emit("recall_message", {
        messageId: messageToRecall,
        conversationId,
      });
      setMessageToRecall(null);
    }
  };

  // Không render popup ở trang admin hoặc trang auth, hoặc nếu user là admin
  const hiddenRoutes = ["/admin", "/login", "/register", "/otp"];
  if (hiddenRoutes.some(route => location.pathname.startsWith(route)) || user?.role === "admin") {
    return null;
  }

  return (
    <>
      {/* Nút bật/tắt (Floating Icon) kèm lời chào */}
      {!isOpen && (
        <div className="flex flex-col items-end gap-3 z-50 group cursor-pointer" onClick={() => setIsOpen(true)}>
          {/* Tooltip bubble */}
          <div className="absolute right-full mr-4 opacity-0 invisible group-hover:opacity-100 group-hover:visible translate-y-2 group-hover:translate-y-0 bg-white p-4 rounded-2xl shadow-2xl w-[260px] border border-gray-100 transition-all duration-300">
            <div className="flex items-center gap-2 mb-2">
              <span className="font-semibold text-blue-600 text-sm">Trợ lý B2VT</span>
            </div>
            <p className="text-sm text-gray-600 leading-relaxed font-medium">
              Xin chào Anh/Chị! Em là trợ lý của B2VT. Cần hỗ trợ gì Anh/Chị cứ nhắn nhé!
            </p>
            {/* Mũi tên trỏ sang phải thay vì trỏ xuống do đã chuyển popup sang bên trái icon */}
            <div className="absolute top-1/2 -right-2 transform -translate-y-1/2 w-4 h-4 bg-white border-t border-r border-gray-100 rotate-45"></div>
          </div>

          <button
            className="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition transform group-hover:scale-110"
          >
            <MessageCircle size={28} />
          </button>
        </div>
      )}

      {/* Cửa sổ Chat Box */}
      {isOpen && (
        <div className="w-[350px] h-[500px] bg-white shadow-2xl rounded-2xl flex flex-col border border-gray-100 overflow-hidden transform transition-all duration-300">
          
          <div className="bg-blue-600 text-white p-4 flex items-center justify-between font-semibold">
            <div className="flex items-center gap-2">
              <MessageCircle size={20} />
              <span>Chat hỗ trợ {user?.email && `(${user.email})`}</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:bg-blue-500 rounded p-1 transition">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {messages.length === 0 && (
              <div className="text-center text-gray-400 mt-10">
                Chưa có tin nhắn
              </div>
            )}

            {messages.map((msg, i) => {
              const isMine = String(msg.senderId) === String(user?.id) || String(msg.senderId) === String(user?._id);
              return (
                <div
                  key={msg._id || i}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`rounded-2xl max-w-[75%] shadow-sm overflow-hidden flex flex-col ${
                      isMine
                        ? "bg-blue-500 text-white rounded-tr-none"
                        : "bg-white border text-gray-800 rounded-tl-none"
                    }`}
                  >
                    {!isMine && msg.email && (
                      <div className="px-4 pt-2 pb-1 text-[10px] opacity-70 font-medium text-gray-400">
                        {msg.email}
                      </div>
                    )}
                    {msg.isRecalled ? (
                      <div className={`px-4 ${isMine ? 'py-2' : 'pb-2'} text-sm italic text-gray-400`}>
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
                          <div className={`px-4 ${msg.image ? 'pt-2 pb-1' : (isMine ? 'py-2' : 'pb-2 pt-0')} text-sm`}>
                            {msg.content}
                          </div>
                        )}
                      </div>
                    )}
                    <div className={`px-4 pb-2 pt-1 flex items-center gap-2 text-[10px] ${isMine ? "text-blue-200 justify-end" : "text-gray-400 justify-start"}`}>
                      <span>
                        {msg.createdAt 
                          ? `${new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${new Date(msg.createdAt).toLocaleDateString('vi-VN')}` 
                          : `${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} ${new Date().toLocaleDateString('vi-VN')}`}
                      </span>
                      {isMine && !msg.isRecalled && msg._id && (
                        <button 
                          onClick={() => setMessageToRecall(msg._id)} 
                          className="hover:underline opacity-80"
                        >
                          Thu hồi
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>

            {imagePreview && (
              <div className="px-3 py-2 bg-gray-50 border-t flex items-center relative">
                <div className="relative inline-block">
                  <img src={imagePreview} alt="Preview" className="h-14 rounded-md object-cover border shadow-sm" />
                  <button
                    onClick={cancelImage}
                    className="absolute -top-2 -right-2 bg-gray-800 text-white rounded-full p-0.5 hover:bg-gray-900 shadow-xl"
                  >
                    <X size={12} />
                  </button>
                </div>
              </div>
            )}

            <div className="p-3 border-t bg-white flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                ref={fileInputRef}
                onChange={handleImageChange}
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={!user}
                className="text-gray-400 hover:text-blue-600 transition disabled:opacity-50 disabled:cursor-not-allowed flex-shrink-0"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
              </button>
              <input
                value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              disabled={!user}
              className="flex-1 border px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:bg-gray-100 disabled:cursor-not-allowed text-sm"
              placeholder={user ? "Nhập tin nhắn..." : "Đăng nhập để chat..."}
            />
            <button
              onClick={sendMessage}
              disabled={!user || (!input.trim() && !image)}
              className="bg-blue-600 text-white px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-blue-700 transition"
            >
              Gửi
            </button>
          </div>

          {/* Popup Thu Hồi Khu Vực Trực Tiếp Bên Trong Box */}
          {messageToRecall && (
            <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-[1px] rounded-2xl">
              <div className="bg-white p-6 rounded-[24px] shadow-2xl w-[85%] text-center transform scale-100 transition-all flex flex-col items-center">
                 <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center mb-3">
                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                   </svg>
                 </div>
                 <h3 className="text-[17px] font-bold text-slate-800 mb-1.5">Thu hồi tin nhắn?</h3>
                 <p className="text-[13px] text-slate-500 mb-6">Tin nhắn này sẽ bị xóa khỏi cuộc trò chuyện.</p>
                 <div className="flex gap-3 w-full">
                    <button 
                      onClick={() => setMessageToRecall(null)}
                      className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 py-2.5 rounded-2xl text-[14px] font-semibold transition"
                    >
                      Hủy
                    </button>
                    <button 
                      onClick={handleRecall}
                      className="flex-1 bg-[#e60000] hover:bg-red-700 text-white py-2.5 rounded-2xl text-[14px] font-semibold transition"
                    >
                      Thu hồi
                    </button>
                 </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
}