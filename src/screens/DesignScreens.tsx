import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Dimensions, Alert, Modal, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContextV2';
import { buildApiUrl } from '../config/api';
import { realtimeService } from '../services/realtimeService';
import { apiRequest } from '../services/apiClient';
import { launchImageLibrary } from 'react-native-image-picker';
import { getDeviceLocation } from '../services/deviceLocation';

const { width } = Dimensions.get('window');
const pink = '#ff075b';
const purple = '#7938ff';
const photos = {
  emily: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85',
  sara: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85',
  mia: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=700&q=85',
  lina: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85',
  alex: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85',
  marko: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85',
  mohamed: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85',
};
const people = [
  ['Emily', 'New match! Say hello', '2m', photos.emily], ['Sara', 'Hey! How are you? 😊', '10m', photos.sara],
  ['Alex', "Let's grab coffee sometime ☕", '1h', photos.alex], ['Marko', 'See you at the event!', '3h', photos.marko],
  ['Lina', 'Sent you a photo  ▧', 'Yesterday', photos.lina], ['Derya', 'Sounds good!', 'Yesterday', photos.mia], ['Can', 'You: Thank you! ✓✓', '2d', photos.marko],
];

function usePalette() { const { dark, toggleTheme } = useTheme(); return { dark, toggleTheme, bg: dark ? '#07131d' : '#fff', surface: dark ? '#10202d' : '#f4f6f9', text: dark ? '#f8f9fc' : '#111318', muted: dark ? '#b4bdc8' : '#52627b', line: dark ? '#223342' : '#e7eaf0' }; }
function Header({ title, back, navigation, action = true }: any) { const p = usePalette(); return <View style={s.header}>{back ? <TouchableOpacity hitSlop={10} onPress={() => navigation.goBack()}><Icon name="chevron-back" size={28} color={p.text}/></TouchableOpacity> : <View style={{ width: 28 }}/>}<Text numberOfLines={1} style={[s.headerTitle,{color:p.text}]}>{title}</Text>{action ? <TouchableOpacity hitSlop={10} onPress={p.toggleTheme}><Icon name={p.dark ? 'sunny-outline' : 'moon-outline'} size={23} color={p.text}/></TouchableOpacity> : <View style={{width:28}}/>}</View> }
function Search({ placeholder, value, onChangeText }: {placeholder:string; value?: string; onChangeText?: (value:string)=>void}) { const p=usePalette(); return <View style={[s.search,{backgroundColor:p.surface,borderColor:p.line}]}><Icon name="search-outline" size={18} color={p.muted}/><TextInput value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={p.muted} style={[s.searchInput,{color:p.text}]}/>{value ? <TouchableOpacity onPress={()=>onChangeText?.('')}><Icon name="close-circle" size={17} color={p.muted}/></TouchableOpacity> : null}</View> }
function Avatar({ uri, size = 52, online = false }: any) { return <View><Image source={{uri}} style={{width:size,height:size,borderRadius:size/2,borderWidth:2,borderColor:pink}}/>{online && <View style={[s.online,{left:size-15,top:size-15}]}/>}</View> }
function Pill({label, active, onPress, color=pink}:any) { const p=usePalette(); return <TouchableOpacity onPress={onPress} style={[s.pill,{backgroundColor:active?color:p.surface,borderColor:active?color:p.line}]}><Text style={[s.pillText,{color:active?'#fff':p.text}]}>{label}</Text></TouchableOpacity> }
function StoryRow() { const p=usePalette(); return <View style={s.stories}>{[['Emily',photos.emily],['Sara',photos.sara],['Mia',photos.mia],['Lina',photos.lina]].map(([name,uri],i)=><View key={name} style={s.story}><Avatar uri={uri} size={63} online={i===1}/><Text style={[s.storyName,{color:p.text}]}>{name}</Text>{i===0&&<Text style={s.newBadge}>New</Text>}</View>)}</View> }

export function HomeDesignScreen({navigation}:any) {
  const p = usePalette();
  const { token, user } = useAuth();
  const [feed, setFeed] = useState('For You');
  const [posts, setPosts] = useState<any[]>([]);
  const [caption, setCaption] = useState('');
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stories, setStories] = useState<any[]>([]);
  const [viewingStory, setViewingStory] = useState<any | null>(null);

  const loadFeed = useCallback(async () => {
    if (!token) return;
    try {
      const result = await apiRequest<{posts?: any[]}>(token, '/feed');
      setPosts(current => {
        const mine = current.filter(post => post.userId === user?.id);
        const feedPosts = result.posts ?? [];
        const feedIds = new Set(feedPosts.map(post => post.id));
        return [...mine.filter(post => !feedIds.has(post.id)), ...feedPosts];
      });
    } catch (error: any) {
      Alert.alert('Feed unavailable', error?.message || 'Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, user?.id]);

  useEffect(() => { loadFeed(); }, [loadFeed]);

  const loadStories = useCallback(async () => {
    if (!token) return;
    try {
      const result = await apiRequest<{stories?:any[]}>(token, '/stories');
      setStories(result.stories ?? []);
    } catch (error: any) {
      console.warn('Could not load stories:', error?.message);
    }
  }, [token]);
  useEffect(() => { loadStories(); }, [loadStories]);

  const createStory = () => launchImageLibrary({mediaType:'photo',selectionLimit:1,includeBase64:true,maxWidth:900,maxHeight:900,quality:0.6}, async response => {
    if (response.didCancel) return;
    const asset = response.assets?.[0];
    if (response.errorCode || !asset?.base64) {
      Alert.alert('Could not add story', response.errorMessage || 'Please choose another photo.');
      return;
    }
    try {
      await apiRequest(token!, '/stories', {method:'POST',body:JSON.stringify({mediaUrl:`data:${asset.type||'image/jpeg'};base64,${asset.base64}`})});
      await loadStories();
    } catch (error: any) {
      Alert.alert('Could not add story', error?.message || 'Please try again.');
    }
  });

  const createPost = async () => {
    const text = caption.trim();
    if (!text || !token) return;
    setCreating(true);
    try {
      const result = await apiRequest<{post?:any}>(token, '/posts', { method: 'POST', body: JSON.stringify({ caption: text, images: [] }) });
      if (!result.post) throw new Error('The server did not return the created post.');
      setPosts(current => [
        {
          ...result.post,
          user,
          likes: 0,
          comments: 0,
          liked: false,
          interested: false,
        },
        ...current.filter(post => post.id !== result.post.id),
      ]);
      setCaption('');
      setShowCreate(false);
    } catch (error: any) {
      Alert.alert('Could not create post', error?.message || 'Please try again.');
    } finally {
      setCreating(false);
    }
  };

  return <View style={[s.page,{backgroundColor:p.bg}]}>
    <ScrollView contentContainerStyle={s.homeScroll}>
      <View style={s.homeTop}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{fontSize:31,color:pink}}>♥</Text><Text style={[s.homeLogo,{color:p.text}]}>Amorvi</Text></View><View style={{flexDirection:'row',gap:17}}><TouchableOpacity onPress={()=>setShowCreate(true)}><Icon name="add-circle-outline" size={31} color={pink}/></TouchableOpacity><TouchableOpacity onPress={()=>navigation.navigate('Notifications')}><Icon name="notifications-outline" size={28} color={p.text}/></TouchableOpacity></View></View>
      <View style={s.sectionHead}><Text style={[s.sectionTitle,{color:p.text}]}>Stories</Text><Text style={[s.sub,{color:p.muted}]}>Expires after 24 hours</Text></View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={[s.homeStories,{gap:10}]}><TouchableOpacity onPress={createStory} style={s.story}><View style={s.addStory}><Text style={s.addStoryText}>＋</Text></View><Text style={[s.storyName,{color:p.text}]}>Your Story</Text></TouchableOpacity>{[...new Map(stories.map(item=>[item.user?.id,item])).values()].map((item:any)=><TouchableOpacity key={item.user.id} onPress={()=>setViewingStory(item)} style={s.story}><Avatar uri={item.user.images?.[0]||photos.emily} size={63}/><Text numberOfLines={1} style={[s.storyName,{color:p.text}]}>{item.user.name}</Text></TouchableOpacity>)}</ScrollView>
      <View style={s.tabs}>{['For You','Nearby','Following'].map(x=><Pill key={x} label={x} active={feed===x} onPress={()=>setFeed(x)}/>)}</View>
      {loading ? <ActivityIndicator color={pink} style={{marginTop:30}}/> : posts.length ? posts.map(post=><FeedCard key={post.id} p={p} post={post} onChanged={loadFeed}/>) : <View style={s.emptyBlock}><Icon name="images-outline" size={38} color={pink}/><Text style={[s.sectionTitle,{color:p.text}]}>No posts yet</Text><Text style={[s.sub,{color:p.muted}]}>Create a text post to start the conversation.</Text></View>}
    </ScrollView>
    <Modal visible={showCreate} transparent animationType="fade" onRequestClose={()=>setShowCreate(false)}>
      <View style={s.modalBackdrop}><View style={[s.modalCard,{backgroundColor:p.surface}]}><Text style={[s.sectionTitle,{color:p.text}]}>Create a post</Text><TextInput value={caption} onChangeText={setCaption} multiline maxLength={500} placeholder="What would you like to share?" placeholderTextColor={p.muted} style={[s.postInput,{color:p.text,borderColor:p.line}]}/><View style={s.modalActions}><TouchableOpacity onPress={()=>setShowCreate(false)}><Text style={{color:p.muted}}>Cancel</Text></TouchableOpacity><TouchableOpacity disabled={creating || !caption.trim()} onPress={createPost} style={[s.connectButton,{paddingHorizontal:18,paddingVertical:10,opacity:creating || !caption.trim()?0.5:1}]}>{creating?<ActivityIndicator color="#fff"/>:<Text style={{color:'#fff',fontWeight:'700'}}>Post</Text>}</TouchableOpacity></View></View></View>
    </Modal>
    <Modal visible={Boolean(viewingStory)} transparent animationType="fade" onRequestClose={()=>setViewingStory(null)}>
      <View style={[s.storyViewer,{backgroundColor:'#000'}]}><TouchableOpacity onPress={()=>setViewingStory(null)} style={s.storyClose}><Icon name="close" size={28} color="#fff"/></TouchableOpacity>{viewingStory?<><Image source={{uri:viewingStory.mediaUrl}} style={s.storyMedia}/><Text style={s.storyAuthor}>{viewingStory.user?.name}</Text></>:null}</View>
    </Modal>
  </View>;
}

export function NotificationsDesignScreen({navigation}:any) {
  const p=usePalette(); const {token}=useAuth(); const [items,setItems]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{if(!token)return;try{const result=await apiRequest<{notifications?:any[]}>(token,'/notifications');setItems(result.notifications??[]);}catch(e:any){Alert.alert('Could not load notifications',e.message);}finally{setLoading(false);}},[token]);
  useEffect(()=>{load();},[load]);
  const readAll=async()=>{if(!token)return;try{await apiRequest(token,'/notifications/read-all',{method:'PATCH'});setItems(current=>current.map(item=>({...item,read:true})));}catch(e:any){Alert.alert('Could not update notifications',e.message);}};
  const openItem=async(item:any)=>{if(!item.read&&token){try{await apiRequest(token,`/notifications/${item.id}/read`,{method:'PATCH'});setItems(current=>current.map(value=>value.id===item.id?{...value,read:true}:value));}catch(e){console.warn('Could not mark notification as read',e);}}if(item.type==='message')navigation.getParent()?.navigate('Chats');};
  return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Notifications" back navigation={navigation} action={false}/><ScrollView contentContainerStyle={s.scroll}>{items.some(item=>!item.read)?<TouchableOpacity onPress={readAll} style={{alignSelf:'flex-end',paddingVertical:10}}><Text style={s.pinkText}>Mark all read</Text></TouchableOpacity>:null}{loading?<ActivityIndicator color={pink} style={{marginTop:30}}/>:items.map(item=><TouchableOpacity key={item.id} onPress={()=>openItem(item)} style={[s.notificationRow,{borderBottomColor:p.line,backgroundColor:item.read?'transparent':p.surface}]}><Icon name={item.type==='message'?'chatbubble':'heart'} size={23} color={pink}/><View style={{flex:1}}><Text style={[s.chatName,{color:p.text}]}>{item.title}</Text><Text style={[s.detail,{color:p.muted}]}>{item.body}</Text><Text style={[s.time,{color:p.muted,marginTop:4}]}>{new Date(item.createdAt).toLocaleString()}</Text></View>{!item.read?<View style={s.notificationDot}/>:null}</TouchableOpacity>)}{!loading&&!items.length?<Text style={[s.emptySearch,{color:p.muted}]}>You’re all caught up.</Text>:null}</ScrollView></View>;
}

function FeedCard({p, post, onChanged}:any) {
  const { token, user } = useAuth();
  const [liked,setLiked]=useState(Boolean(post.liked));
  const [likes,setLikes]=useState(Number(post.likes)||0);
  const [interested,setInterested]=useState(Boolean(post.interested));
  const [showComments,setShowComments]=useState(false);
  const [comments,setComments]=useState<any[]>([]);
  const [comment,setComment]=useState('');
  const [busy,setBusy]=useState(false);
  const author=post.user ?? {};
  const avatar=author.images?.[0] ?? photos.emily;
  const toggleLike=async()=>{if(!token)return;setBusy(true);try{const result=await apiRequest<{liked:boolean;likes:number}>(token,`/posts/${post.id}/like`,{method:'POST'});setLiked(result.liked);setLikes(result.likes);}catch(error:any){Alert.alert('Could not update like',error.message);}finally{setBusy(false);}};
  const toggleInterested=async()=>{if(!token || !author.id)return;setBusy(true);try{if(interested)await apiRequest(token,`/interested/${author.id}`,{method:'DELETE'});else await apiRequest(token,`/interested/${author.id}`,{method:'POST'});setInterested(!interested);onChanged?.();}catch(error:any){Alert.alert('Could not update',error.message);}finally{setBusy(false);}};
  const openComments=async()=>{if(!token)return;try{const result=await apiRequest<{comments?:any[]}>(token,`/posts/${post.id}/comments`);setComments(result.comments??[]);setShowComments(true);}catch(error:any){Alert.alert('Could not load comments',error.message);}};
  const sendComment=async()=>{if(!token||!comment.trim())return;try{await apiRequest(token,`/posts/${post.id}/comments`,{method:'POST',body:JSON.stringify({content:comment.trim()})});setComment('');await openComments();}catch(error:any){Alert.alert('Could not send comment',error.message);}};
  return <View style={[s.feedCard,{borderBottomColor:p.line}]}>
    <View style={s.feedHead}><Avatar uri={avatar} size={49}/><View style={{flex:1}}><Text style={[s.chatName,{color:p.text}]}>{author.name ?? 'Member'}{author.age ? `, ${author.age}` : ''}</Text><Text style={[s.detail,{color:p.muted}]}>{author.city ?? 'Amorvi member'}</Text><Text style={[s.detail,{color:p.muted}]}>{post.createdAt ? new Date(post.createdAt).toLocaleString() : ''}</Text></View></View>
    {post.images?.[0] ? <Image source={{uri:post.images[0]}} style={s.feedImage}/> : null}
    {post.caption ? <Text style={[s.feedCaption,{color:p.text}]}>{post.caption}</Text> : null}
    <View style={s.feedActions}><TouchableOpacity disabled={busy} onPress={toggleLike} style={{flexDirection:'row',gap:7}}><Icon name={liked?'heart':'heart-outline'} size={25} color={pink}/><Text style={[s.feedCount,{color:p.text}]}>{likes}</Text></TouchableOpacity><TouchableOpacity onPress={openComments} style={{flexDirection:'row',gap:7}}><Icon name="chatbubble-outline" size={23} color={p.text}/><Text style={[s.feedCount,{color:p.text}]}>{post.comments??0}</Text></TouchableOpacity>{author.id!==user?.id?<TouchableOpacity disabled={busy} onPress={toggleInterested} style={[s.interested,interested&&{backgroundColor:'#ffe5ef'}]}><Icon name={interested?'heart':'heart-outline'} size={18} color={pink}/><Text style={s.pinkText}>{interested?'Interested':'Interested'}</Text></TouchableOpacity>:null}</View>
    <Modal visible={showComments} transparent animationType="slide" onRequestClose={()=>setShowComments(false)}><View style={s.modalBackdrop}><View style={[s.modalCard,{backgroundColor:p.surface}]}><View style={{flexDirection:'row',justifyContent:'space-between',alignItems:'center'}}><Text style={[s.sectionTitle,{color:p.text}]}>Comments</Text><TouchableOpacity onPress={()=>setShowComments(false)}><Icon name="close" size={23} color={p.text}/></TouchableOpacity></View><ScrollView style={{maxHeight:280,marginVertical:8}}>{comments.map(item=><Text key={item.id} style={{color:p.text,marginVertical:5}}><Text style={{fontWeight:'700'}}>{item.user?.name ?? 'Member'}: </Text>{item.content}</Text>)}{!comments.length?<Text style={{color:p.muted,marginVertical:10}}>No comments yet.</Text>:null}</ScrollView><View style={s.commentComposer}><TextInput value={comment} onChangeText={setComment} placeholder="Write a comment..." placeholderTextColor={p.muted} style={[s.composerInput,{color:p.text,backgroundColor:p.bg}]}/><TouchableOpacity onPress={sendComment} style={s.sendButton}><Icon name="send" color="#fff" size={18}/></TouchableOpacity></View></View></View></Modal>
  </View>;
}
export function ChatsScreen({navigation}:any) { 
  const p=usePalette();
  const { token } = useAuth();
  const [tab,setTab]=useState('All');
  const [query,setQuery]=useState('');
  const [conversations,setConversations]=useState<any[]>([]);
  const [backendDown, setBackendDown] = useState(false);

  const loadConversations = useCallback(async () => {
    if (!token) return;
    try {
      setBackendDown(false);
      const response = await fetch(buildApiUrl('/conversations'), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }
      const data = (await response.json()) as {
        conversations?: Array<{
          user: { id: string; name: string; images?: string[] };
          latestMessage?: string;
          latestAt?: string | null;
          unread?: number;
        }>;
      };
      setConversations(data.conversations ?? []);
    } catch (error) {
      console.error('Failed to load conversations:', error);
      setConversations([]);
      setBackendDown(true);
    }
  }, [token]);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, [loadConversations]);

  const visible = conversations.filter((item: { user: { name?: string; id?: string }; latestMessage?: string; unread?: number }) => {
    const name = (item.user?.name ?? '').toLowerCase();
    const preview = (item.latestMessage ?? '').toLowerCase();
    const matchesQuery = !query || name.includes(query.toLowerCase()) || preview.includes(query.toLowerCase());
    return matchesQuery && (tab === 'All' || (tab === 'Unread' ? (item.unread ?? 0) > 0 : true));
  });

  let listContent: React.ReactNode = null;

  if (backendDown) {
    listContent = (
      <View style={s.emptyBlock}>
        <Icon name="cloud-offline-outline" size={40} color={pink} />
        <Text style={[s.sectionTitle,{color:p.text}]}>Chats are offline</Text>
        <Text style={[s.sub,{color:p.muted,textAlign:'center'}]}>The backend is currently unavailable. Check that the server is running, then refresh.</Text>
      </View>
    );
  } else if (visible.length === 0) {
    listContent = <Text style={[s.emptySearch,{color:p.muted}]}>No conversations found</Text>;
  } else {
    listContent = (
      <View>
        {visible.map((item: any)=><TouchableOpacity key={item.user.id} onPress={()=>navigation.navigate('Conversation',{ user: item.user, chatId: item.user.id })} style={[s.chatRow,{borderBottomColor:p.line}]}><Avatar uri={item.user.images?.[0] ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85'} online={true}/><View style={s.chatCopy}><Text style={[s.chatName,{color:p.text}]}>{item.user.name}</Text><Text numberOfLines={1} style={[s.chatMessage,{color:(item.unread ?? 0) > 0 ? pink : p.muted}]}>{item.latestMessage || 'Start a conversation'}</Text></View><View><Text style={[s.time,{color:p.muted}]}>{item.latestAt ? new Date(item.latestAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</Text>{(item.unread ?? 0) > 0 && <Text style={s.unread}>{item.unread}</Text>}</View></TouchableOpacity>)}
      </View>
    );
  }

  return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Chats"/><ScrollView contentContainerStyle={s.scroll}><Search placeholder="Search messages" value={query} onChangeText={setQuery}/><View style={s.sectionHead}><Text style={[s.sectionTitle,{color:p.text}]}>Recent conversations</Text><Text style={s.pinkText}>Live</Text></View><View style={s.tabs}>{['All','Unread'].map(x=><Pill key={x} label={x} active={tab===x} onPress={()=>setTab(x)}/>)}</View>{listContent}</ScrollView></View> }

export function ConversationScreen({navigation,route}:any) {
  const p = usePalette();
  const { user: currentUser, token } = useAuth();
  const { user, chatId } = route.params ?? {};
  const [draft, setDraft] = useState('');
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadMessages = useCallback(async () => {
    if (!token || !user?.id) return;
    try {
      const response = await fetch(buildApiUrl(`/messages/${user.id}`), {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) return;
      const data = (await response.json()) as { messages?: Array<{ id: string; senderId: string; receiverId: string; content: string; createdAt?: string }> };
      setMessages(data.messages ?? []);
    } catch (error) {
      console.warn('Could not refresh messages:', error);
    }
  }, [token, user]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  useEffect(() => {
    if (!token || !user?.id) return;

    const handleIncoming = (payload: { message: any }) => {
      const incoming = payload.message;
      if (incoming.senderId !== user.id && incoming.receiverId !== user.id) return;
      setMessages(prev => {
        const exists = prev.some(item => item.id === incoming.id);
        return exists ? prev : [...prev, incoming];
      });
    };

    realtimeService.onMessageReceived(handleIncoming);
    realtimeService.joinRoom(user.id);

    return () => {
      realtimeService.leaveRoom(user.id);
    };
  }, [token, user]);

  const send = async () => {
    const text = draft.trim();
    if (!text || !token || !user?.id) return;

    setLoading(true);
    try {
      const response = await fetch(buildApiUrl('/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ receiverId: user.id, content: text }),
      });
      const result = (await response.json().catch(() => ({}))) as { error?: string; message?: any };
      if (!response.ok) throw new Error(result?.error || 'Message could not be sent');
      if (!result.message) throw new Error('Server returned an invalid message response');
      setMessages(current => current.some(item => item.id === result.message.id) ? current : [...current, result.message]);
      setDraft('');
    } catch (error: any) {
      Alert.alert('Message not sent', error?.message || 'Check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return <View style={[s.page, { backgroundColor: p.bg }]}> 
    <View style={[s.conversationHeader, { borderBottomColor: p.line }]}> 
      <TouchableOpacity hitSlop={12} onPress={() => navigation.goBack()}><Icon name="chevron-back" size={28} color={p.text}/></TouchableOpacity>
      <Avatar uri={user?.images?.[0] ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85'} size={39} online/>
      <View style={{ flex: 1 }}><Text style={[s.chatName, { color: p.text }]}>{user?.name ?? 'Conversation'}</Text><Text style={[s.sub, { color: '#00a935', marginTop: 0 }]}>Online</Text></View>
      <TouchableOpacity hitSlop={12} onPress={() => Alert.alert('Voice calls unavailable', 'This app is not connected to a voice-calling service yet.')}><Icon name="call-outline" size={24} color={pink}/></TouchableOpacity>
    </View>
    <ScrollView style={{ flex: 1 }} contentContainerStyle={s.messageList}>
      {messages.map((message: any) => {
        const mine = message.senderId === currentUser?.id;
        return <View key={message.id} style={[s.messageRow, mine ? s.messageMine : s.messageTheirs]}>
          <View style={[s.messageBubble, { backgroundColor: mine ? pink : p.surface }]}>
            <Text style={{ color: mine ? '#fff' : p.text }}>{message.content}</Text>
          </View>
          <Text style={[s.messageTime, { color: p.muted }]}>{message.createdAt ? new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</Text>
        </View>;
      })}
    </ScrollView>
    <View style={[s.composer, { borderTopColor: p.line, backgroundColor: p.bg }]}><TextInput value={draft} onChangeText={setDraft} onSubmitEditing={send} placeholder="Message..." placeholderTextColor={p.muted} style={[s.composerInput, { color: p.text, backgroundColor: p.surface }]} /> <TouchableOpacity onPress={send} disabled={loading} style={s.sendButton}><Icon name="send" color="#fff" size={19}/></TouchableOpacity></View>
  </View>;
}

export function ProfileScreen({navigation}:any) {
  const p=usePalette(); const {user,token}=useAuth();
  const [counts,setCounts]=useState({matches:0,likes:0,connections:0});
  useEffect(()=>{if(!token)return;Promise.all([
    apiRequest<{matches?:any[]}>(token,'/matches'),apiRequest<{profiles?:any[]}>(token,'/likes/received'),apiRequest<{connections?:any[]}>(token,'/connections'),
  ]).then(([m,l,c])=>setCounts({matches:m.matches?.length??0,likes:l.profiles?.length??0,connections:c.connections?.length??0})).catch(e=>console.warn('Could not load profile counts',e));},[token]);
  return <View style={[s.page,{backgroundColor:p.bg}]}><ScrollView contentContainerStyle={s.profileScroll}><View style={s.profileTop}><Text style={[s.headerTitle,{color:p.text}]}>My profile</Text><TouchableOpacity onPress={()=>Alert.alert('Settings','Settings are not connected yet.')}><Icon name="settings-outline" size={25} color={p.text}/></TouchableOpacity></View><Image source={{uri:user?.images?.[0]||photos.mohamed}} style={s.profileAvatar}/><Text style={[s.profileName,{color:p.text}]}>{user?.name||'Your profile'}{user?.age?`, ${user.age}`:''}</Text><Text style={[s.sub,{color:p.muted}]}>{user?.city||'Add your city'}</Text><TouchableOpacity style={s.editButton} onPress={()=>navigation.navigate('EditProfile')}><Icon name="create-outline" color={pink} size={17}/><Text style={s.pinkText}>Edit profile</Text></TouchableOpacity><View style={[s.stats,{backgroundColor:p.surface}]}><TouchableOpacity><Text style={[s.statNumber,{color:p.text}]}>{counts.matches}</Text><Text style={[s.statLabel,{color:p.muted}]}>Matches</Text></TouchableOpacity><TouchableOpacity onPress={()=>navigation.navigate('Likes')}><Text style={[s.statNumber,{color:p.text}]}>{counts.likes}</Text><Text style={[s.statLabel,{color:p.muted}]}>Likes You</Text></TouchableOpacity><TouchableOpacity onPress={()=>navigation.navigate('Connections')}><Text style={[s.statNumber,{color:p.text}]}>{counts.connections}</Text><Text style={[s.statLabel,{color:p.muted}]}>Connections</Text></TouchableOpacity></View><ProfileDetails user={user}/><View style={s.sectionHead}><Text style={[s.sectionTitle,{color:p.text}]}>My photos</Text><TouchableOpacity onPress={()=>navigation.navigate('EditProfile')}><Text style={s.pinkText}>Manage ›</Text></TouchableOpacity></View><View style={s.photoGrid}>{(user?.images?.length?user.images:[photos.mohamed]).slice(0,3).map((uri:string)=><Image key={uri} source={{uri}} style={s.gridImage}/>)}</View></ScrollView></View>;
}
function ProfileDetails({user}:any){const p=usePalette();return <View><Text style={[s.label,{color:p.text}]}>Dating intentions</Text><View style={[s.intention,{backgroundColor:p.dark?'#421332':'#ffe6f0'}]}><Text>💗</Text><Text style={s.pinkText}>{user?.goals?.join(' · ')||'Add your dating intentions'}</Text></View><Text style={[s.label,{color:p.text}]}>About me</Text><Text style={[s.detail,{color:p.muted}]}>{user?.bio||'Add a short bio to your profile.'}</Text>{user?.jobTitle||user?.education?<Text style={[s.detail,{color:p.muted,marginTop:4}]}>{[user.jobTitle,user.education].filter(Boolean).join(' · ')}</Text>:null}<Text style={[s.label,{color:p.text}]}>Interests</Text><View style={s.chips}>{(user?.interests??[]).map((x:string)=><View key={x} style={[s.chip,{backgroundColor:p.dark?'#491334':'#ffe7f1'}]}><Text style={s.chipText}>{x}</Text></View>)}</View></View>}

export function LikesScreen({navigation}:any){
  const p=usePalette(); const {token}=useAuth(); const [likes,setLikes]=useState<any[]>([]); const [query,setQuery]=useState(''); const [loading,setLoading]=useState(true);
  const load=useCallback(async()=>{if(!token)return;try{const data=await apiRequest<{profiles?:any[]}>(token,'/likes/received');setLikes(data.profiles??[]);}catch(e:any){Alert.alert('Could not load likes',e.message);}finally{setLoading(false);}},[token]);
  useEffect(()=>{load();},[load]);
  const act=async(profile:any,likeBack:boolean)=>{if(!token)return;try{if(likeBack){const result=await apiRequest<{match:any}>(token,`/likes/${profile.id}`,{method:'POST'});if(result.match)Alert.alert('It’s a match!',`You and ${profile.name} can start chatting.`);}else await apiRequest(token,`/likes/${profile.id}`,{method:'DELETE'});await load();}catch(e:any){Alert.alert('Could not update like',e.message);}};
  const visible=likes.filter(x=>(x.name??'').toLowerCase().includes(query.toLowerCase()));
  return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Likes You" back navigation={navigation}/><ScrollView contentContainerStyle={s.scroll}><Search placeholder="Search likes..." value={query} onChangeText={setQuery}/><View style={s.sectionHead}><View><Text style={[s.sectionTitle,{color:p.text}]}>Likes you · {likes.length}</Text><Text style={[s.sub,{color:p.muted}]}>They liked you. Like back to match.</Text></View></View>{loading?<ActivityIndicator color={pink} style={{marginTop:28}}/>:<View style={s.likeGrid}>{visible.map(profile=><View key={profile.id} style={s.likeCard}><TouchableOpacity onPress={()=>Alert.alert(profile.name,profile.bio||'')}><Image source={{uri:profile.images?.[0]||photos.emily}} style={s.likeImage}/><LinearGradient colors={['transparent','rgba(0,0,0,.9)']} style={s.likeCaption}><Text style={s.likeName}>{profile.name}{profile.age?`, ${profile.age}`:''}</Text><Text style={s.likeDistance}>{profile.city||''}</Text></LinearGradient></TouchableOpacity><View style={s.likeActions}><TouchableOpacity onPress={()=>act(profile,false)} style={s.pass}><Icon name="close" size={22}/></TouchableOpacity><TouchableOpacity onPress={()=>act(profile,true)} style={s.likeBack}><Icon name="heart-outline" color="#fff"/><Text style={s.likeBackText}>Like back</Text></TouchableOpacity></View></View>)}</View>}{!loading&&visible.length===0?<Text style={[s.emptySearch,{color:p.muted}]}>No likes to show</Text>:null}</ScrollView></View>;
}

export function ConnectionsScreen({navigation}:any){
  const p=usePalette(); const {token}=useAuth(); const [tab,setTab]=useState('All'); const [query,setQuery]=useState(''); const [data,setData]=useState<any[]>([]); const [loading,setLoading]=useState(true);
  useEffect(()=>{if(!token)return;apiRequest<{connections?:any[]}>(token,'/connections').then(result=>setData(result.connections??[])).catch((e:any)=>Alert.alert('Could not load connections',e.message)).finally(()=>setLoading(false));},[token]);
  const visible=data.filter(item=>{const user=item.user??{};const friends=(user.goals??[]).some((x:string)=>x.toLowerCase().includes('friend'));return (tab==='All'||(tab==='Friends'?friends:!friends))&&(user.name??'').toLowerCase().includes(query.toLowerCase());});
  return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Connections" back navigation={navigation}/><ScrollView contentContainerStyle={s.scroll}><Search placeholder="Search connections" value={query} onChangeText={setQuery}/><Text style={[s.connectionsTitle,{color:p.text}]}>Your connections · {data.length}</Text><Text style={[s.sub,{color:p.muted}]}>People you’ve connected with.</Text><View style={s.tabs}>{['All','Dating','Friends'].map(x=><Pill key={x} label={x} active={tab===x} onPress={()=>setTab(x)}/>)}</View>{loading?<ActivityIndicator color={pink}/>:visible.map(item=>{const person=item.user;return <TouchableOpacity onPress={()=>navigation.getParent()?.navigate('Chats',{screen:'Conversation',params:{user:person,chatId:person.id}})} key={item.id} style={[s.connection,{borderBottomColor:p.line}]}><Avatar uri={person.images?.[0]||photos.sara} online/><View style={s.chatCopy}><Text style={[s.connectionName,{color:p.text}]}>{person.name}{person.age?`, ${person.age}`:''}</Text><Text style={[s.detail,{color:p.muted}]}>{person.city||person.interests?.slice(0,2).join(' · ')}</Text></View><Icon name="chatbubble-outline" size={23} color={p.text}/><Icon name="chevron-forward" size={20} color={p.text}/></TouchableOpacity>;})}{!loading&&visible.length===0?<Text style={[s.emptySearch,{color:p.muted}]}>No connections found</Text>:null}</ScrollView></View>;
}

export function EditProfileScreen({navigation}:any){
  const p=usePalette(); const {user,updateProfile}=useAuth();
  const [name,setName]=useState(user?.name||''); const [age,setAge]=useState(String(user?.age??'')); const [bio,setBio]=useState(user?.bio||''); const [city,setCity]=useState(user?.city||''); const [job,setJob]=useState(user?.jobTitle||''); const [education,setEducation]=useState(user?.education||''); const [routine,setRoutine]=useState(user?.dailyRoutine||''); const [additional,setAdditional]=useState(user?.additionalInfo||''); const [goals,setGoals]=useState(user?.goals??[]); const [interests,setInterests]=useState(user?.interests??[]); const [newInterest,setNewInterest]=useState(''); const [images,setImages]=useState(user?.images??[]); const [saving,setSaving]=useState(false);
  const save=async()=>{const parsedAge=Number(age);if(!name.trim()){Alert.alert('Name required','Enter your name to save the profile.');return;}if(!Number.isInteger(parsedAge)||parsedAge<18||parsedAge>100){Alert.alert('Invalid age','Enter an age from 18 to 100.');return;}setSaving(true);try{await updateProfile({name:name.trim(),age:parsedAge,bio,city,jobTitle:job,education,dailyRoutine:routine,additionalInfo:additional,goals,interests,images});Alert.alert('Profile saved','Your changes have been saved.');navigation.goBack();}catch(e:any){Alert.alert('Could not save',e?.message||'Please try again.');}finally{setSaving(false);}};
  const choosePhoto=()=>launchImageLibrary({mediaType:'photo',selectionLimit:1,includeBase64:true,maxWidth:720,maxHeight:720,quality:0.5},response=>{if(response.didCancel||response.errorCode)return;const asset=response.assets?.[0];if(!asset?.base64){Alert.alert('Could not add photo','Please choose another image.');return;}const dataUri=`data:${asset.type||'image/jpeg'};base64,${asset.base64}`;setImages(items=>items.length>=6?items:[...items,dataUri]);});
  const Input=({label,value,onChangeText,multiline=false}:any)=><><Text style={[s.label,{color:p.text}]}>{label}</Text><TextInput value={value} onChangeText={onChangeText} multiline={multiline} placeholder={label} placeholderTextColor={p.muted} style={[multiline?s.bioInput:s.nameTextInput,{color:p.text,borderColor:p.line,backgroundColor:p.surface,paddingHorizontal:10,borderWidth:multiline?1:0,minHeight:multiline?58:40,borderRadius:multiline?10:0}]}/></>;
  return <View style={[s.page,{backgroundColor:p.bg}]}><View style={s.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Icon name="chevron-back" size={28} color={p.text}/></TouchableOpacity><Text style={[s.headerTitle,{color:p.text}]}>Edit profile</Text><TouchableOpacity disabled={saving} onPress={save}><Text style={s.pinkText}>{saving?'Saving…':'Save'}</Text></TouchableOpacity></View><ScrollView contentContainerStyle={s.editScroll}><Text style={[s.sectionTitle,{color:p.text}]}>Photos</Text><Text style={[s.sub,{color:p.muted}]}>Photos are saved with your profile (up to 6).</Text><View style={s.editPhotos}>{images.map((uri,index)=><TouchableOpacity key={`${index}-${uri.slice(0,30)}`} onPress={()=>Alert.alert('Remove photo?','', [{text:'Cancel',style:'cancel'},{text:'Remove',style:'destructive',onPress:()=>setImages(items=>items.filter((_,i)=>i!==index))}])}><Image source={{uri}} style={s.editPhoto}/><Text style={{color:pink,textAlign:'center'}}>Remove</Text></TouchableOpacity>)}{images.length<6?<TouchableOpacity onPress={choosePhoto} style={[s.addPhoto,{borderColor:p.muted}]}><Text style={s.addPlus}>＋</Text></TouchableOpacity>:null}</View>
    <Input label="About me" value={bio} onChangeText={setBio} multiline/><Text style={[s.label,{color:p.text}]}>Basic info</Text><View style={[s.nameInput,{borderColor:p.line}]}><Icon name="person-outline" size={18} color={p.text}/><TextInput value={name} onChangeText={setName} placeholder="Name" placeholderTextColor={p.muted} style={[s.nameTextInput,{color:p.text}]}/></View><Input label="Age" value={age} onChangeText={setAge}/><Input label="City" value={city} onChangeText={setCity}/><Text style={[s.label,{color:p.text}]}>Dating intentions</Text><View style={s.chips}>{['Long-term relationship','Something casual','Friendship'].map(goal=><TouchableOpacity key={goal} onPress={()=>setGoals(items=>items.includes(goal)?items.filter(item=>item!==goal):[...items,goal])} style={[s.chip,goals.includes(goal)&&{backgroundColor:'#ffd8e6'}]}><Text style={s.chipText}>{goals.includes(goal)?'✓ ':''}{goal}</Text></TouchableOpacity>)}</View><Text style={[s.label,{color:p.text}]}>Interests</Text><View style={s.chips}>{interests.map(x=><TouchableOpacity onPress={()=>setInterests(items=>items.filter(item=>item!==x))} key={x} style={s.chip}><Text style={s.chipText}>{x} ×</Text></TouchableOpacity>)}</View><View style={s.commentComposer}><TextInput value={newInterest} onChangeText={setNewInterest} onSubmitEditing={()=>{const v=newInterest.trim();if(v&&!interests.includes(v))setInterests(items=>[...items,v]);setNewInterest('');}} placeholder="Add an interest" placeholderTextColor={p.muted} style={[s.composerInput,{color:p.text,backgroundColor:p.surface}]}/><TouchableOpacity onPress={()=>{const v=newInterest.trim();if(v&&!interests.includes(v))setInterests(items=>[...items,v]);setNewInterest('');}} style={s.sendButton}><Icon name="add" color="#fff" size={22}/></TouchableOpacity></View><Text style={[s.sub,{color:p.muted}]}>Tap an interest to remove it.</Text><Text style={[s.label,{color:p.text}]}>Work & education</Text><Input label="Job title" value={job} onChangeText={setJob}/><Input label="Education" value={education} onChangeText={setEducation}/><Text style={[s.label,{color:p.text}]}>Lifestyle</Text><Input label="Daily routine" value={routine} onChangeText={setRoutine}/><Input label="Additional info" value={additional} onChangeText={setAdditional}/><TouchableOpacity disabled={saving} onPress={save} style={s.preview}><Icon name="checkmark-circle-outline" color={pink}/><Text style={s.pinkText}>{saving?'Saving…':'Save profile'}</Text></TouchableOpacity>
  </ScrollView></View>;
}

export function AmorviScreen(){
  const p=usePalette(); const {token,updateLocation}=useAuth(); const [tab,setTab]=useState('Discover'); const [profiles,setProfiles]=useState<any[]>([]); const [index,setIndex]=useState(0); const [loading,setLoading]=useState(false); const [loadError,setLoadError]=useState('');
  const load=useCallback(async()=>{if(!token)return;setLoading(true);setLoadError('');try{const path=tab==='Discover'?'/users/nearby':tab==='Interested'?'/interested':'/likes/received';const result=await apiRequest<any>(token,path);const items=tab==='Discover'?result.users??[]:result.profiles??[];setProfiles(items);setIndex(0);}catch(e:any){setProfiles([]);setLoadError(e.message||'Could not load profiles.');}finally{setLoading(false);}},[token,tab]);
  useEffect(()=>{load();},[load]); const current=profiles[index];
  const setNearbyLocation=async()=>{try{const point=await getDeviceLocation();await updateLocation(point.latitude,point.longitude);await load();}catch(e:any){Alert.alert('Location unavailable',e.message);}};
  const act=async(action:string)=>{if(!token||!current)return;try{if(tab==='Likes You'){if(action==='like'){const result=await apiRequest<any>(token,`/likes/${current.id}`,{method:'POST'});if(result.match)Alert.alert('It’s a match!',`You and ${current.name} can start chatting.`);}else await apiRequest(token,`/likes/${current.id}`,{method:'DELETE'});}else if(tab==='Interested'){if(action==='remove')await apiRequest(token,`/interested/${current.id}`,{method:'DELETE'});else await apiRequest(token,`/likes/${current.id}`,{method:'POST'});}else if(action==='like'){const result=await apiRequest<any>(token,`/likes/${current.id}`,{method:'POST'});if(result.match)Alert.alert('It’s a match!',`You and ${current.name} can start chatting.`);}else if(action==='interested')await apiRequest(token,`/interested/${current.id}`,{method:'POST'});else await apiRequest(token,`/passes/${current.id}`,{method:'POST'});setProfiles(items=>items.filter((_,i)=>i!==index));setIndex(0);}catch(e:any){Alert.alert('Could not update profile',e.message);}};
  const profileCard=current?<><Text style={[s.label,{color:p.text}]}>{tab==='Discover'?'Find your connection':tab==='Interested'?'Your interested profiles':'People who liked you'}</Text><Image source={{uri:current.images?.[0]||photos.emily}} style={s.discoveryImage}/><LinearGradient colors={['transparent','rgba(0,0,0,.9)']} style={s.discoveryInfo}><Text style={s.discoveryName}>{current.name}{current.age?`, ${current.age}`:''} 💗</Text><Text style={s.discoverySub}>{current.city||'Nearby'}{current.distance!=null?` · ${(current.distance/1000).toFixed(1)} km away`:''}</Text><View style={s.discoveryChips}>{(current.interests??[]).slice(0,3).map((x:string)=><Text key={x} style={s.cardChip}>{x}</Text>)}</View></LinearGradient><View style={s.bigActions}>{tab==='Discover'?<><TouchableOpacity onPress={()=>act('pass')} style={s.bigPass}><Icon name="close" size={38}/></TouchableOpacity><TouchableOpacity onPress={()=>act('like')} style={s.bigLike}><Icon name="heart" size={38} color="#fff"/></TouchableOpacity><TouchableOpacity onPress={()=>act('interested')} style={s.bigPass}><Icon name="bookmark" size={31} color={purple}/></TouchableOpacity></>:<><TouchableOpacity onPress={()=>act(tab==='Interested'?'remove':'pass')} style={s.bigPass}><Icon name="close" size={32}/></TouchableOpacity><TouchableOpacity onPress={()=>act('like')} style={s.bigLike}><Icon name="heart" size={34} color="#fff"/></TouchableOpacity></>}</View></>:null;
  return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Amorvi"/><View style={s.scroll}><View style={s.tabs}>{['Discover','Interested','Likes You'].map(x=><Pill key={x} label={x} active={tab===x} onPress={()=>setTab(x)}/>)}</View>{loading?<ActivityIndicator color={pink} style={{marginTop:30}}/>:profileCard??<View style={s.emptyBlock}><Icon name={loadError?'location-outline':'heart-outline'} size={38} color={pink}/><Text style={[s.sub,{color:p.muted,textAlign:'center'}]}>{loadError|| (tab==='Discover'?'No nearby profiles yet. Set your location and try again.':tab==='Interested'?'Profiles you save will appear here.':'No one has liked you yet.')}</Text>{loadError?<TouchableOpacity onPress={loadError.toLowerCase().includes('location')?setNearbyLocation:load} style={s.outlineButton}><Text style={s.pinkText}>{loadError.toLowerCase().includes('location')?'Use my location':'Try again'}</Text></TouchableOpacity>:null}</View>}</View></View>;
}

export function RadarScreen(){
  const p=usePalette(); const {token,updateLocation}=useAuth(); const [mode,setMode]=useState('Love'); const [interest,setInterest]=useState('All interests'); const [profiles,setProfiles]=useState<any[]>([]); const [index,setIndex]=useState(0); const [loading,setLoading]=useState(false); const [error,setError]=useState(''); const current=profiles[index];
  const load=useCallback(async()=>{if(!token)return;setLoading(true);setError('');try{const result=await apiRequest<{users?:any[]}>(token,'/users/nearby');setProfiles(result.users??[]);setIndex(0);}catch(e:any){setProfiles([]);setError(e.message||'Could not load nearby profiles.');}finally{setLoading(false);}},[token]);
  useEffect(()=>{load();},[load]);
  const setNearbyLocation=async()=>{try{const point=await getDeviceLocation();await updateLocation(point.latitude,point.longitude);await load();}catch(e:any){Alert.alert('Location unavailable',e.message);}};
  const act=async(action:'connect'|'pass'|'like')=>{if(!token||!current)return;try{if(action==='connect')await apiRequest(token,`/connections/${current.id}`,{method:'POST'});else if(action==='like'){const result=await apiRequest<any>(token,`/likes/${current.id}`,{method:'POST'});if(result.match)Alert.alert('It’s a match!',`You and ${current.name} can start chatting.`);}else await apiRequest(token,`/passes/${current.id}`,{method:'POST'});setProfiles(items=>items.filter((_,i)=>i!==index));setIndex(0);}catch(e:any){Alert.alert('Could not update profile',e.message);}};
  return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Radar"/><ScrollView contentContainerStyle={s.scroll}><View style={s.radarTabs}>{[['heart','Love',pink],['people','Friends',purple],['star','Events','#f5ad12']].map(([icon,x,color]:any)=><TouchableOpacity key={x} onPress={()=>setMode(x)} style={[s.radarTab,{backgroundColor:mode===x?color:p.surface}]}><Icon name={icon} color={mode===x?'#fff':color} size={22}/><Text style={{color:mode===x?'#fff':p.text,fontWeight:'700'}}>{x}</Text></TouchableOpacity>)}</View><View style={s.location}><Icon name="location-outline" size={24} color={p.text}/><Text style={[s.locationText,{color:p.text}]}>{current?.city||'Nearby people'}</Text><TouchableOpacity onPress={setNearbyLocation} style={s.travel}><Icon name="refresh" color={pink}/><Text style={s.pinkText}>Use my location</Text></TouchableOpacity></View><Text style={[s.label,{color:p.text}]}>{mode==='Events'?'Explore people with shared interests':mode==='Friends'?'Find friends nearby':'People nearby'}</Text><View style={s.chips}>{['All interests','Coffee','Hiking','Music'].map(x=><TouchableOpacity onPress={()=>setInterest(x)} key={x} style={[s.mapChip,{backgroundColor:interest===x?pink:p.surface}]}><Text style={{color:interest===x?'#fff':p.text}}>{x}</Text></TouchableOpacity>)}</View>{loading?<ActivityIndicator color={pink} style={{marginTop:30}}/>:current?<><TouchableOpacity onPress={()=>Alert.alert(`${current.name}${current.age?`, ${current.age}`:''}`,[current.bio,current.city,current.jobTitle,current.interests?.join(' · ')].filter(Boolean).join('\n\n')||'No extra profile details.')} style={[s.radarCard,{backgroundColor:p.surface,marginTop:14}]}><Avatar uri={current.images?.[0]||photos.sara} size={72}/><View style={s.chatCopy}><Text style={[s.connectionName,{color:p.text}]}>{current.name}{current.age?`, ${current.age}`:''}</Text><Text style={[s.detail,{color:p.muted}]}>{current.city||'Nearby'} · {current.distance!=null?`${(current.distance/1000).toFixed(1)} km away`:''}</Text><Text style={[s.detail,{color:p.muted}]}>{(current.interests??[]).filter((x:string)=>interest==='All interests'||x.toLowerCase()===interest.toLowerCase()).join(' · ')||'Shared interests'}</Text></View></TouchableOpacity><View style={s.radarButtons}><TouchableOpacity onPress={()=>Alert.alert(`${current.name}${current.age?`, ${current.age}`:''}`,[current.bio,current.city,current.jobTitle,current.education,current.dailyRoutine,current.additionalInfo,current.interests?.join(' · ')].filter(Boolean).join('\n\n')||'No extra profile details.')} style={s.outlineButton}><Text style={s.pinkText}>View profile</Text></TouchableOpacity><TouchableOpacity onPress={()=>act(mode==='Friends'?'connect':'like')} style={s.connectButton}><Text style={{color:'#fff',fontWeight:'700'}}>{mode==='Friends'?'♙  Connect':'♥  Like'}</Text></TouchableOpacity></View></>:<View style={s.emptyBlock}><Icon name="location-outline" size={38} color={pink}/><Text style={[s.sub,{color:p.muted,textAlign:'center'}]}>{error||'No nearby profiles. Set your location and try again.'}</Text><TouchableOpacity onPress={error.toLowerCase().includes('location')?setNearbyLocation:load} style={s.outlineButton}><Text style={s.pinkText}>{error.toLowerCase().includes('location')?'Use my location':'Refresh'}</Text></TouchableOpacity></View>}</ScrollView></View>;
}

const s=StyleSheet.create({page:{flex:1},scroll:{paddingHorizontal:16,paddingBottom:25},header:{height:64,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerTitle:{fontSize:25,fontWeight:'800'},search:{height:42,borderRadius:22,borderWidth:1,flexDirection:'row',alignItems:'center',paddingHorizontal:13,marginTop:5},searchInput:{flex:1,fontSize:15,marginLeft:8},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:13},sectionTitle:{fontWeight:'800',fontSize:18},pinkText:{color:pink,fontWeight:'700'},stories:{flexDirection:'row',justifyContent:'space-between',marginVertical:11},story:{alignItems:'center',width:68},storyName:{fontWeight:'700',fontSize:12,marginTop:4},newBadge:{backgroundColor:pink,color:'#fff',fontSize:11,fontWeight:'800',paddingHorizontal:7,borderRadius:8,marginTop:-18,zIndex:1},online:{position:'absolute',width:15,height:15,borderRadius:8,backgroundColor:'#00bd39',borderWidth:1,borderColor:'#fff'},tabs:{flexDirection:'row',gap:7,marginVertical:7},pill:{flex:1,height:34,borderRadius:18,borderWidth:1,justifyContent:'center',alignItems:'center'},pillText:{fontWeight:'700',fontSize:14},chatRow:{minHeight:59,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,paddingVertical:6},chatCopy:{flex:1},chatName:{fontWeight:'800',fontSize:16},chatMessage:{fontSize:14,marginTop:2},time:{fontSize:13,textAlign:'right'},unread:{backgroundColor:pink,color:'#fff',width:20,height:20,textAlign:'center',borderRadius:10,marginTop:4,overflow:'hidden',fontWeight:'700'},friendTag:{fontSize:11,paddingHorizontal:6,backgroundColor:'#e7eaf1',color:'#536078',borderRadius:8},sub:{fontSize:14,marginTop:3},emptyBlock:{alignItems:'center',paddingTop:45,gap:12},emptySearch:{textAlign:'center',marginTop:35,fontSize:15},outlineButton:{height:41,borderWidth:1.5,borderColor:pink,borderRadius:22,justifyContent:'center',alignItems:'center',paddingHorizontal:35},conversationHeader:{height:67,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1},messageList:{padding:16,gap:12},messageRow:{maxWidth:'82%'},messageMine:{alignSelf:'flex-end',alignItems:'flex-end'},messageTheirs:{alignSelf:'flex-start'},messageBubble:{paddingHorizontal:14,paddingVertical:10,borderRadius:17},messageTime:{fontSize:11,marginTop:3},composer:{borderTopWidth:1,padding:10,flexDirection:'row',gap:8,alignItems:'center'},composerInput:{flex:1,height:42,borderRadius:22,paddingHorizontal:15},sendButton:{width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center',backgroundColor:pink},profileScroll:{padding:16,paddingBottom:25},profileTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},profileAvatar:{width:128,height:128,borderRadius:64,borderWidth:2,borderColor:pink,alignSelf:'center',marginTop:4},profileName:{fontWeight:'800',fontSize:22,textAlign:'center',marginTop:5},editButton:{borderWidth:1.5,borderColor:pink,height:39,borderRadius:21,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:7,marginTop:9},stats:{flexDirection:'row',justifyContent:'space-around',paddingVertical:12,borderRadius:14,backgroundColor:'#f5f7fa',marginTop:8},statNumber:{fontSize:17,fontWeight:'800',textAlign:'center'},statLabel:{fontSize:12,textAlign:'center'},label:{fontWeight:'800',fontSize:14,marginTop:11,marginBottom:5},intention:{height:39,borderRadius:12,backgroundColor:'#ffe6f0',paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:11},detail:{fontSize:13,lineHeight:18},chips:{flexDirection:'row',flexWrap:'wrap',gap:6},chip:{backgroundColor:'#ffe7f1',borderRadius:14,paddingVertical:5,paddingHorizontal:17,minWidth:'30%',alignItems:'center'},chipText:{fontSize:12,color:pink},photoGrid:{flexDirection:'row',gap:6},gridImage:{width:(width-44)/3,height:82,borderRadius:8},likeGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:10},likeCard:{width:(width-40)/2,height:215},likeImage:{width:'100%',height:160,borderRadius:11},likeCaption:{position:'absolute',top:104,left:0,right:0,height:56,padding:9,borderRadius:11},likeName:{color:'#fff',fontWeight:'800',fontSize:17},likeDistance:{color:'#fff',fontSize:12,fontWeight:'700'},likeActions:{height:45,flexDirection:'row',alignItems:'center',gap:7},pass:{width:42,height:39,borderRadius:21,backgroundColor:'#f0f3f6',justifyContent:'center',alignItems:'center'},likeBack:{flex:1,height:39,borderRadius:20,backgroundColor:pink,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:4},likeBackText:{color:'#fff',fontWeight:'700'},connectionsTitle:{fontSize:20,fontWeight:'800',marginTop:12},connection:{height:74,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1},connectionName:{fontSize:19,fontWeight:'800'},typeTag:{fontSize:12,overflow:'hidden',paddingHorizontal:8,paddingVertical:3,borderRadius:10},editScroll:{padding:16,paddingTop:0},editPhotos:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:7},editPhoto:{width:(width-46)/3,height:80,borderRadius:8},addPhoto:{width:(width-46)/3,height:54,borderRadius:8,borderWidth:1,borderStyle:'dashed',justifyContent:'center',alignItems:'center'},addPlus:{fontSize:30,color:pink},bioBox:{borderWidth:1,borderRadius:11,padding:10},bioInput:{borderWidth:1,borderRadius:11,padding:10,minHeight:62,textAlignVertical:'top',fontSize:13},nameInput:{height:40,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:10},nameTextInput:{flex:1,fontSize:13},editRow:{height:38,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:10},rowLabel:{fontSize:13,flex:1},rowValue:{fontSize:12},preview:{height:32,borderWidth:1.5,borderColor:pink,borderRadius:16,flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center',marginTop:15},discoveryImage:{height:405,width:'100%',borderRadius:16,marginTop:4},discoveryInfo:{position:'absolute',top:422,left:16,right:16,height:125,justifyContent:'flex-end',padding:13,borderRadius:16},discoveryName:{fontSize:27,color:'#fff',fontWeight:'800'},discoverySub:{color:'#fff',fontSize:16},discoveryChips:{flexDirection:'row',gap:7,marginTop:10},cardChip:{color:pink,borderColor:pink,borderWidth:1,borderRadius:13,paddingHorizontal:13,paddingVertical:4,backgroundColor:'#16131a',fontSize:12},bigActions:{flexDirection:'row',justifyContent:'space-around',alignItems:'center',marginTop:27},bigPass:{width:65,height:65,borderRadius:34,justifyContent:'center',alignItems:'center',backgroundColor:'#f4f5f7'},bigLike:{width:82,height:82,borderRadius:42,backgroundColor:pink,justifyContent:'center',alignItems:'center'},radarTabs:{flexDirection:'row',gap:7,marginVertical:5},radarTab:{flex:1,height:39,borderRadius:20,justifyContent:'center',alignItems:'center',flexDirection:'row',gap:7},location:{height:45,flexDirection:'row',alignItems:'center',gap:8},locationText:{fontWeight:'700',fontSize:16,flex:1},travel:{borderWidth:1.3,borderColor:pink,borderRadius:18,padding:7,flexDirection:'row',gap:5},mapChip:{paddingHorizontal:17,paddingVertical:7,borderRadius:17},fakeMap:{height:305,marginHorizontal:-16,marginTop:8,overflow:'hidden',position:'relative'},mapRoad:{fontSize:52,position:'absolute',top:110,left:0,fontWeight:'800'},mapCity:{position:'absolute',top:180,left:'40%',fontSize:21,fontWeight:'800'},mapPerson:{position:'absolute',alignItems:'center'},shared:{backgroundColor:'#fff',borderRadius:11,paddingHorizontal:7,paddingVertical:2,fontSize:11,fontWeight:'700',marginTop:-3},radarCard:{marginTop:-2,borderRadius:15,padding:11,flexDirection:'row',gap:12},radarButtons:{flexDirection:'row',gap:8,marginTop:8},connectButton:{flex:1,backgroundColor:pink,borderRadius:21,alignItems:'center',justifyContent:'center'},homeScroll:{padding:16,paddingBottom:24},homeTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:5},homeLogo:{fontSize:27,fontWeight:'800'},homeStories:{flexDirection:'row',marginHorizontal:-5},addStory:{width:63,height:63,borderRadius:33,backgroundColor:'#fff1f6',borderWidth:1,borderColor:'#ffd5e4',justifyContent:'center',alignItems:'center'},addStoryText:{fontSize:35,color:pink,fontWeight:'200'},feedCard:{borderBottomWidth:1,paddingTop:9,paddingBottom:12},feedHead:{flexDirection:'row',alignItems:'center',gap:9},feedImage:{width:'100%',height:235,borderRadius:12,marginTop:9},feedCaption:{fontSize:14,fontWeight:'700',marginTop:7},feedActions:{flexDirection:'row',alignItems:'center',gap:23,marginTop:8},feedCount:{fontWeight:'700',fontSize:14},interested:{marginLeft:'auto',flexDirection:'row',borderWidth:1,borderColor:pink,borderRadius:18,paddingHorizontal:13,paddingVertical:7,gap:5},modalBackdrop:{flex:1,backgroundColor:'rgba(0,0,0,.55)',justifyContent:'center',padding:22},modalCard:{borderRadius:16,padding:18,gap:10},postInput:{minHeight:120,borderWidth:1,borderRadius:12,padding:12,textAlignVertical:'top'},modalActions:{flexDirection:'row',justifyContent:'flex-end',alignItems:'center',gap:20,marginTop:5},commentComposer:{flexDirection:'row',gap:8,alignItems:'center'},notificationRow:{minHeight:76,flexDirection:'row',alignItems:'center',gap:12,padding:12,borderBottomWidth:1,borderRadius:10},notificationDot:{width:9,height:9,borderRadius:5,backgroundColor:pink},storyViewer:{flex:1,justifyContent:'center'},storyClose:{position:'absolute',top:46,right:18,zIndex:2,padding:8},storyMedia:{width:'100%',height:'84%',resizeMode:'contain'},storyAuthor:{position:'absolute',top:50,left:18,color:'#fff',fontSize:17,fontWeight:'700'}});
