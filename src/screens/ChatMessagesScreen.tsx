import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  SafeAreaView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { getMatchedProfiles, MatchedProfile } from '../data/amorviRelationshipState';

interface Message {
  id: string;
  sender: 'me' | 'them';
  text: string;
  timestamp?: string;
}

const ChatMessagesScreen = () => {
  const matches = useMemo(() => getMatchedProfiles(), []);
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', sender: 'them', text: 'Hey! I was hoping you would message me!' },
    { id: '2', sender: 'me', text: 'Hey! I\'m glad we matched 😊' },
    { id: '3', sender: 'them', text: 'Me too! Want to grab coffee this week?' },
    { id: '4', sender: 'me', text: 'Me too! Want to grab coffee later?' },
    { id: '5', sender: 'them', text: 'That sounds perfect, I\'m free this week.' },
  ]);

  const selectedChat = matches.find(match => match.id === selectedChatId);

  const handleSelectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const handleBackToList = () => {
    setSelectedChatId(null);
    setMessageInput('');
  };

  const handleSendMessage = () => {
    if (!messageInput.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: 'me',
      text: messageInput.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages([...messages, newMessage]);
    setMessageInput('');
  };

  // Show conversation if a chat is selected
  if (selectedChat && selectedChatId) {
    return (
      <SafeAreaView style={styles.container}>
        {/* Conversation Header */}
        <View style={styles.conversationHeader}>
          <TouchableOpacity onPress={handleBackToList}>
            <Icon name="chevron-back" size={28} color="#fff" />
          </TouchableOpacity>
          
          <View style={styles.headerLeft}>
            <Image source={{ uri: selectedChat.image }} style={styles.headerAvatar} />
            <View style={styles.headerInfo}>
              <Text style={styles.headerName}>{selectedChat.name}</Text>
              <View style={styles.statusContainer}>
                <View style={styles.onlineIndicator} />
                <Text style={styles.headerStatus}>Online</Text>
              </View>
            </View>
          </View>

          <TouchableOpacity style={styles.headerCall}>
            <Icon name="call" size={20} color="#FF4D8D" />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          style={styles.messagesContainer}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(msg => (
            <View
              key={msg.id}
              style={[
                styles.messageBubble,
                msg.sender === 'me' ? styles.messageBubbleMine : styles.messageBubbleTheirs,
              ]}
            >
              <View
                style={[
                  styles.bubbleContent,
                  msg.sender === 'me' ? styles.bubbleMine : styles.bubbleTheirs,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    msg.sender === 'me' && styles.messageTextMine,
                  ]}
                >
                  {msg.text}
                </Text>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Bar */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            placeholder="Write a message..."
            placeholderTextColor="#999"
            value={messageInput}
            onChangeText={setMessageInput}
            multiline
          />
          <TouchableOpacity
            style={styles.sendButtonIcon}
            onPress={handleSendMessage}
          >
            <Icon name="send" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Show chat list by default
  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Chats</Text>
        <TouchableOpacity style={styles.newChatButton}>
          <Icon name="create-outline" size={22} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Chat List */}
      <ScrollView style={styles.listContainer} showsVerticalScrollIndicator={false}>
        {matches.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyTitle}>No chats yet</Text>
            <Text style={styles.emptyText}>Match with someone in Amorvi to start chatting</Text>
          </View>
        ) : (
          matches.map((match: MatchedProfile) => (
            <TouchableOpacity
              key={match.id}
              style={styles.chatItem}
              onPress={() => handleSelectChat(match.id)}
            >
              <Image source={{ uri: match.image }} style={styles.chatAvatar} />
              <View style={styles.chatItemMeta}>
                <Text style={styles.chatItemName}>{match.name}</Text>
                <Text style={styles.chatItemPreview} numberOfLines={1}>
                  {match.lastMessage}
                </Text>
              </View>
              <Text style={styles.chatTime}>Now</Text>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0E0E12',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: '900',
    color: '#fff',
  },
  newChatButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FF4D8D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mainContent: {
    flex: 1,
    flexDirection: 'column',
  },
  listPanel: {
    flex: 1,
    backgroundColor: '#1a1d23',
  },
  listContainer: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  chatItemActive: {
    backgroundColor: 'rgba(255, 77, 141, 0.1)',
    borderLeftWidth: 3,
    borderLeftColor: '#FF4D8D',
    paddingLeft: 9,
  },
  chatAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  chatItemMeta: {
    flex: 1,
  },
  chatItemName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  chatItemPreview: {
    fontSize: 12,
    color: '#999',
  },
  chatTime: {
    fontSize: 11,
    color: '#666',
    marginLeft: 8,
  },
  conversationPanel: {
    flex: 1,
    backgroundColor: '#0E0E12',
    flexDirection: 'column',
  },
  conversationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  headerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    marginRight: 12,
  },
  headerInfo: {
    flex: 1,
  },
  headerName: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#4ade80',
    marginRight: 6,
  },
  headerStatus: {
    fontSize: 12,
    color: '#7BF1B5',
  },
  headerCall: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4D8D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    gap: 10,
  },
  messageBubble: {
    marginVertical: 6,
  },
  messageBubbleMine: {
    alignItems: 'flex-end',
  },
  messageBubbleTheirs: {
    alignItems: 'flex-start',
  },
  bubbleContent: {
    maxWidth: '70%',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 18,
  },
  bubbleMine: {
    backgroundColor: '#FF4D8D',
    borderBottomRightRadius: 4,
  },
  bubbleTheirs: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderBottomLeftRadius: 4,
  },
  messageText: {
    fontSize: 14,
    color: '#e5e5e5',
    lineHeight: 20,
  },
  messageTextMine: {
    color: '#fff',
    fontWeight: '500',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1d23',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
    gap: 10,
  },
  textInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#fff',
    fontSize: 14,
    maxHeight: 100,
  },
  sendButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FF4D8D',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyState: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 13,
    color: '#999',
  },
  emptyConversation: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyConversationText: {
    fontSize: 14,
    color: '#999',
  },
});

export default ChatMessagesScreen;
