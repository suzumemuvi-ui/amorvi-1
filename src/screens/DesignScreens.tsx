import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, TextInput, Dimensions, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import LinearGradient from 'react-native-linear-gradient';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContextV2';
import { buildApiUrl } from '../config/api';
import { realtimeService } from '../services/realtimeService';

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

export function HomeDesignScreen() { const p=usePalette(); const [feed,setFeed]=useState('For You'); return <View style={[s.page,{backgroundColor:p.bg}]}><ScrollView contentContainerStyle={s.homeScroll}><View style={s.homeTop}><View style={{flexDirection:'row',alignItems:'center',gap:8}}><Text style={{fontSize:31,color:pink}}>♥</Text><Text style={[s.homeLogo,{color:p.text}]}>Amorvi</Text></View><View style={{flexDirection:'row',gap:17}}><TouchableOpacity onPress={()=>Alert.alert('Create post','Post creation will be available next.')}><Icon name="add-circle-outline" size={31} color={pink}/></TouchableOpacity><TouchableOpacity onPress={p.toggleTheme}><Icon name="notifications-outline" size={28} color={p.text}/></TouchableOpacity></View></View><View style={s.sectionHead}><Text style={[s.sectionTitle,{color:p.text}]}>Stories</Text><TouchableOpacity onPress={()=>Alert.alert('Stories','Stories are ready to browse.') }><Text style={s.pinkText}>View all ›</Text></TouchableOpacity></View><View style={s.homeStories}><TouchableOpacity onPress={()=>Alert.alert('Your story','Story creation will be available next.')} style={s.story}><View style={s.addStory}><Text style={s.addStoryText}>＋</Text></View><Text style={[s.storyName,{color:p.text}]}>Your Story</Text></TouchableOpacity><StoryRow/></View><View style={s.tabs}>{['For You','Nearby','Following'].map(x=><Pill key={x} label={x} active={feed===x} onPress={()=>setFeed(x)}/>)}</View><FeedCard p={p}/></ScrollView></View> }
function FeedCard({p}:any){const [liked,setLiked]=useState(false);const [saved,setSaved]=useState(false);return <View style={[s.feedCard,{borderBottomColor:p.line}]}><View style={s.feedHead}><Avatar uri={photos.emily} size={49}/><View style={{flex:1}}><Text style={[s.chatName,{color:p.text}]}>Emily, 24　<Text style={{color:pink}}>✿</Text></Text><Text style={[s.detail,{color:p.muted}]}>Skopje　•　1.4 km away</Text><Text style={[s.detail,{color:p.muted}]}>2m ago</Text></View><Icon name="ellipsis-horizontal" size={22} color={p.text}/></View><Image source={{uri:'https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=800&q=85'}} style={s.feedImage}/><Text style={[s.feedCaption,{color:p.text}]}>Sunset walks hit different 🌅</Text><View style={s.feedActions}><TouchableOpacity onPress={()=>setLiked(!liked)} style={{flexDirection:'row',gap:7}}><Icon name={liked?'heart':'heart-outline'} size={25} color={pink}/><Text style={[s.feedCount,{color:p.text}]}>{liked?'242':'241'}</Text></TouchableOpacity><TouchableOpacity onPress={()=>Alert.alert('Comments','Comments will open here.')} style={{flexDirection:'row',gap:7}}><Icon name="chatbubble-outline" size={23} color={p.text}/><Text style={[s.feedCount,{color:p.text}]}>18</Text></TouchableOpacity><TouchableOpacity onPress={()=>setSaved(!saved)} style={[s.interested,saved&&{backgroundColor:'#ffe5ef'}]}><Icon name={saved?'heart':'heart-outline'} size={18} color={pink}/><Text style={s.pinkText}>{saved?'Saved':'Interested'}</Text></TouchableOpacity></View></View>}

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
    const response = await fetch(buildApiUrl(`/messages/${user.id}`), {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!response.ok) return;
    const data = (await response.json()) as { messages?: Array<{ id: string; senderId: string; receiverId: string; content: string; createdAt?: string }> };
    setMessages(data.messages ?? []);
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
      realtimeService.sendMessage(user.id, text);
      setDraft('');
      await loadMessages();
    } finally {
      setLoading(false);
    }
  };

  return <View style={[s.page, { backgroundColor: p.bg }]}> 
    <View style={[s.conversationHeader, { borderBottomColor: p.line }]}> 
      <TouchableOpacity hitSlop={12} onPress={() => navigation.goBack()}><Icon name="chevron-back" size={28} color={p.text}/></TouchableOpacity>
      <Avatar uri={user?.images?.[0] ?? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85'} size={39} online/>
      <View style={{ flex: 1 }}><Text style={[s.chatName, { color: p.text }]}>{user?.name ?? 'Conversation'}</Text><Text style={[s.sub, { color: '#00a935', marginTop: 0 }]}>Online</Text></View>
      <TouchableOpacity hitSlop={12} onPress={() => Alert.alert('Calling', `Calling ${user?.name ?? 'them'}…`)}><Icon name="call-outline" size={24} color={pink}/></TouchableOpacity>
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

export function ProfileScreen({navigation}:any) { const p=usePalette(); return <View style={[s.page,{backgroundColor:p.bg}]}><ScrollView contentContainerStyle={s.profileScroll}><View style={s.profileTop}><Text style={[s.headerTitle,{color:p.text}]}>My profile</Text><TouchableOpacity onPress={p.toggleTheme}><Icon name="settings-outline" size={25} color={p.text}/></TouchableOpacity></View><Image source={{uri:photos.mohamed}} style={s.profileAvatar}/><Text style={[s.profileName,{color:p.text}]}>Mohamed, 27</Text><Text style={[s.sub,{color:p.muted}]}>Skopje, North Macedonia</Text><TouchableOpacity style={s.editButton} onPress={()=>navigation.navigate('EditProfile')}><Icon name="create-outline" color={pink} size={17}/><Text style={s.pinkText}>Edit profile</Text></TouchableOpacity><View style={[s.stats,{backgroundColor:p.surface}]}><TouchableOpacity><Text style={[s.statNumber,{color:p.text}]}>18</Text><Text style={[s.statLabel,{color:p.muted}]}>Matches</Text></TouchableOpacity><TouchableOpacity onPress={()=>navigation.navigate('Likes')}><Text style={[s.statNumber,{color:p.text}]}>42</Text><Text style={[s.statLabel,{color:p.muted}]}>Likes You</Text></TouchableOpacity><TouchableOpacity onPress={()=>navigation.navigate('Connections')}><Text style={[s.statNumber,{color:p.text}]}>11</Text><Text style={[s.statLabel,{color:p.muted}]}>Connections</Text></TouchableOpacity></View><ProfileDetails/><View style={s.sectionHead}><Text style={[s.sectionTitle,{color:p.text}]}>My photos</Text><Text style={s.pinkText}>Manage ›</Text></View><View style={s.photoGrid}>{[photos.mohamed,'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',photos.alex].map(uri=><Image key={uri} source={{uri}} style={s.gridImage}/>)}</View></ScrollView></View> }
function ProfileDetails(){const p=usePalette();return <View><Text style={[s.label,{color:p.text}]}>Dating intentions</Text><View style={[s.intention,{backgroundColor:p.dark?'#421332':'#ffe6f0'}]}><Text>💗</Text><Text style={s.pinkText}>Long-term relationship</Text></View><Text style={[s.label,{color:p.text}]}>About me</Text><Text style={[s.detail,{color:p.muted}]}>Architect. Coffee lover. Always planning{`\n`}my next trip — better with good company.</Text><Text style={[s.label,{color:p.text}]}>Interests</Text><View style={s.chips}>{['Travel','Photography','Coffee','Architecture','Music','Fitness'].map(x=><View key={x} style={[s.chip,{backgroundColor:p.dark?'#491334':'#ffe7f1'}]}><Text style={s.chipText}>{x}</Text></View>)}</View></View>}

export function LikesScreen({navigation}:any){ const p=usePalette(); const initial=[['Emily, 24',photos.emily,'1.4 km away'],['Sara, 23',photos.sara,'1.2 km away'],['Mia, 25',photos.mia,'2.8 km away'],['Lina, 26',photos.lina,'3.1 km away']]; const [likes,setLikes]=useState(initial); const [query,setQuery]=useState(''); const remove=(name:string,match:boolean)=>{setLikes(items=>items.filter(x=>x[0]!==name));if(match)Alert.alert('It’s a match!','You and '+name.split(',')[0]+' can now start chatting.');};const visible=likes.filter(x=>x[0].toLowerCase().includes(query.toLowerCase())); return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Likes You" back navigation={navigation}/><ScrollView contentContainerStyle={s.scroll}><Search placeholder="Search likes..." value={query} onChangeText={setQuery}/><View style={s.sectionHead}><View><Text style={[s.sectionTitle,{color:p.text}]}>Likes you · {likes.length}</Text><Text style={[s.sub,{color:p.muted}]}>They liked you. Like back to match.</Text></View><Pill label="Newest⌄"/></View><View style={s.likeGrid}>{visible.map(x=><View key={x[0]} style={s.likeCard}><TouchableOpacity onPress={()=>Alert.alert(x[0],`Lives ${x[2]} from you.`)}><Image source={{uri:x[1]}} style={s.likeImage}/><LinearGradient colors={['transparent','rgba(0,0,0,.9)']} style={s.likeCaption}><Text style={s.likeName}>{x[0]}</Text><Text style={s.likeDistance}>{x[2]}</Text></LinearGradient></TouchableOpacity><View style={s.likeActions}><TouchableOpacity onPress={()=>remove(x[0],false)} style={s.pass}><Icon name="close" size={22}/></TouchableOpacity><TouchableOpacity onPress={()=>remove(x[0],true)} style={s.likeBack}><Icon name="heart-outline" color="#fff"/><Text style={s.likeBackText}>Like back</Text></TouchableOpacity></View></View>)}</View>{visible.length===0?<Text style={[s.emptySearch,{color:p.muted}]}>No likes found</Text>:<Text style={[s.sub,{color:p.muted,textAlign:'center',marginTop:26}]}>Tap a photo to view their profile</Text>}</ScrollView></View> }

export function ConnectionsScreen({navigation}:any){const p=usePalette();const [tab,setTab]=useState('All'); const [query,setQuery]=useState(''); const data=[['Sara, 23','Coffee · Travel',photos.sara,'Dating'],['Alex, 27','Architecture · Coffee',photos.alex,'Friends'],['Lina, 26','Travel · Photography',photos.lina,'Dating'],['Marko, 28','Music · Fitness',photos.marko,'Friends'],['Derya, 25','Coffee · Music',photos.mia,'Dating'],['Can, 29','Travel · Fitness',photos.mohamed,'Friends']]; const visible=data.filter(x=>(tab==='All'||x[3]===tab)&&x[0].toLowerCase().includes(query.toLowerCase()));return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Connections" back navigation={navigation}/><ScrollView contentContainerStyle={s.scroll}><Search placeholder="Search connections" value={query} onChangeText={setQuery}/><Text style={[s.connectionsTitle,{color:p.text}]}>Your connections · {data.length}</Text><Text style={[s.sub,{color:p.muted}]}>People you’ve connected with.</Text><View style={s.tabs}>{['All','Dating','Friends'].map(x=><Pill key={x} label={x} active={tab===x} onPress={()=>setTab(x)}/>)}</View>{visible.map(x=><TouchableOpacity onPress={()=>Alert.alert(x[0],`${x[1]}\nOpen chat from the Chats tab.`)} key={x[0]} style={[s.connection,{borderBottomColor:p.line}]}><Avatar uri={x[2]} online/><View style={s.chatCopy}><Text style={[s.connectionName,{color:p.text}]}>{x[0]} <Text style={[s.typeTag,{backgroundColor:x[3]==='Friends'?'#ded1ff':'#ffe0eb',color:x[3]==='Friends'?'#5121aa':pink}]}>{x[3]}</Text></Text><Text style={[s.detail,{color:p.muted}]}>{x[1]}</Text></View><Icon name="chatbubble-outline" size={23} color={p.text}/><Icon name="chevron-forward" size={20} color={p.text}/></TouchableOpacity>)}{visible.length===0?<Text style={[s.emptySearch,{color:p.muted}]}>No connections found</Text>:null}</ScrollView></View>}

export function EditProfileScreen({navigation}:any){const p=usePalette();const { user, updateProfile }=useAuth();const [name,setName]=useState(user?.name||'Mohamed');const [bio,setBio]=useState(user?.bio||'Architect. Coffee lover. Always planning my next trip — better with good company.');const [interests,setInterests]=useState(user?.interests?.length?user.interests:['Travel','Photography','Coffee','Architecture','Music','Fitness']);const save=async()=>{try{await updateProfile({name,bio,interests});Alert.alert('Profile saved','Your changes have been saved.');navigation.goBack();}catch{Alert.alert('Could not save','Check that the backend is running, then try again.');}};const Row=({icon,label,value}:any)=><TouchableOpacity onPress={()=>Alert.alert(label,`Editing ${label.toLowerCase()} will be available next.`)} style={[s.editRow,{borderColor:p.line}]}><Icon name={icon} size={18} color={p.text}/><Text style={[s.rowLabel,{color:p.text}]}>{label}</Text><Text style={[s.rowValue,{color:p.muted}]}>{value}</Text><Icon name="chevron-forward" size={17} color={p.muted}/></TouchableOpacity>;return <View style={[s.page,{backgroundColor:p.bg}]}><View style={s.header}><TouchableOpacity onPress={()=>navigation.goBack()}><Icon name="chevron-back" size={28} color={p.text}/></TouchableOpacity><Text style={[s.headerTitle,{color:p.text}]}>Edit profile</Text><TouchableOpacity onPress={save}><Text style={s.pinkText}>Save</Text></TouchableOpacity></View><ScrollView contentContainerStyle={s.editScroll}><Text style={[s.sectionTitle,{color:p.text}]}>Photos</Text><Text style={[s.sub,{color:p.muted}]}>Drag to reorder. First photo is your main.</Text><View style={s.editPhotos}>{[photos.mohamed,'https://images.unsplash.com/photo-1548013146-72479768bada?auto=format&fit=crop&w=600&q=80',photos.alex].map(uri=><Image key={uri} source={{uri}} style={s.editPhoto}/>)}{[1,2,3].map(n=><TouchableOpacity onPress={()=>Alert.alert('Add photo','Photo selection will be available next.')} key={n} style={[s.addPhoto,{borderColor:p.muted}]}><Text style={s.addPlus}>＋</Text></TouchableOpacity>)}</View><Text style={[s.label,{color:p.text}]}>About me</Text><TextInput value={bio} multiline onChangeText={setBio} style={[s.bioInput,{borderColor:p.line,color:p.text}]}/><Text style={[s.label,{color:p.text}]}>Basic info</Text><View style={[s.nameInput,{borderColor:p.line}]}><Icon name="person-outline" size={18} color={p.text}/><TextInput value={name} onChangeText={setName} style={[s.nameTextInput,{color:p.text}]}/></View><Row icon="calendar-outline" label="Age" value={String(user?.age||27)}/><Row icon="location-outline" label="City" value="Skopje"/><Text style={[s.label,{color:p.text}]}>Dating intentions</Text><View style={s.intention}><Text>💗</Text><Text style={s.pinkText}>Long-term relationship</Text></View><Text style={[s.label,{color:p.text}]}>Interests</Text><View style={s.chips}>{interests.map(x=><TouchableOpacity onPress={()=>setInterests(items=>items.filter(item=>item!==x))} key={x} style={s.chip}><Text style={s.chipText}>{x} ×</Text></TouchableOpacity>)}</View><Text style={[s.sub,{color:p.muted}]}>Tap an interest to remove it.</Text><Text style={[s.label,{color:p.text}]}>Work & education</Text><Row icon="briefcase-outline" label="Job title" value="Architect"/><Row icon="school-outline" label="Education" value="Add education"/><Text style={[s.label,{color:p.text}]}>Lifestyle</Text><Row icon="barbell-outline" label="Exercise" value="Often"/><Row icon="bed-outline" label="Smoking" value="Non-smoker"/><TouchableOpacity onPress={save} style={s.preview}><Icon name="checkmark-circle-outline" color={pink}/><Text style={s.pinkText}>Save profile</Text></TouchableOpacity></ScrollView></View>}

export function AmorviScreen(){const p=usePalette();const [tab,setTab]=useState('Discover');const [index,setIndex]=useState(0);const [interested,setInterested]=useState<string[]>([]);const cards=[['Emily',24,photos.emily,'1.4 km away'],['Sara',23,photos.sara,'1.2 km away'],['Lina',26,photos.lina,'3.1 km away']];const current=cards[index%cards.length];const advance=(action:string)=>{if(action==='like')Alert.alert('Like sent',`You liked ${current[0]}. We’ll let you know if it’s a match.`);if(action==='interested')setInterested(items=>[...items,current[0] as string]);setIndex(i=>i+1);};const shown=tab==='Interested'&&interested.length===0?null:current;return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Amorvi"/><View style={s.scroll}><View style={s.tabs}>{['Discover','Interested','Likes You'].map(x=><Pill key={x} label={x} active={tab===x} onPress={()=>setTab(x)}/>)}</View>{tab==='Likes You'?<View style={s.emptyBlock}><Icon name="heart" size={38} color={pink}/><Text style={[s.sub,{color:p.muted}]}>People who like you appear here</Text></View>:shown?<><Text style={[s.label,{color:p.text}]}>{tab==='Interested'?'Your interested profiles':'Find your connection'}</Text><Image source={{uri:current[2] as string}} style={s.discoveryImage}/><LinearGradient colors={['transparent','rgba(0,0,0,.9)']} style={s.discoveryInfo}><Text style={s.discoveryName}>{current[0]}, {current[1]} 💗</Text><Text style={s.discoverySub}>Skopje · {current[3]}</Text><View style={s.discoveryChips}>{['Travel','Coffee','Photography'].map(x=><Text key={x} style={s.cardChip}>{x}</Text>)}</View></LinearGradient><View style={s.bigActions}><TouchableOpacity onPress={()=>advance('pass')} style={s.bigPass}><Icon name="close" size={38}/></TouchableOpacity><TouchableOpacity onPress={()=>advance('like')} style={s.bigLike}><Icon name="heart" size={38} color="#fff"/></TouchableOpacity><TouchableOpacity onPress={()=>advance('interested')} style={s.bigPass}><Icon name="bookmark" size={31} color={purple}/></TouchableOpacity></View></>:<View style={s.emptyBlock}><Icon name="bookmark-outline" size={38} color={pink}/><Text style={[s.sub,{color:p.muted}]}>Save someone from Discover to see them here.</Text></View>}</View></View>}

export function RadarScreen(){const p=usePalette();const [mode,setMode]=useState('Love');const [travel,setTravel]=useState(false);const [interest,setInterest]=useState('All interests');const [connected,setConnected]=useState(false);return <View style={[s.page,{backgroundColor:p.bg}]}><Header title="Radar"/><View style={s.scroll}><View style={s.radarTabs}>{[['heart','Love',pink],['people','Friends',purple],['star','Events','#f5ad12']].map(([icon,x,color]:any)=><TouchableOpacity key={x} onPress={()=>setMode(x)} style={[s.radarTab,{backgroundColor:mode===x?color:p.surface}]}><Icon name={icon} color={mode===x?'#fff':color} size={22}/><Text style={{color:mode===x?'#fff':p.text,fontWeight:'700'}}>{x}</Text></TouchableOpacity>)}</View><View style={s.location}><Icon name="location-outline" size={24} color={p.text}/><Text style={[s.locationText,{color:p.text}]}>{travel?'Travel destination':'Skopje'}　⌄</Text><TouchableOpacity onPress={()=>setTravel(value=>!value)} style={[s.travel,travel&&{backgroundColor:'#ffe4ef'}]}><Icon name="airplane" color={pink}/><Text style={s.pinkText}>{travel?'Traveling':'Travel mode'}</Text></TouchableOpacity></View><Text style={[s.label,{color:p.text}]}>{mode==='Events'?'Meet through shared interests':mode==='Friends'?'Find friends with shared interests':'People with shared interests'}</Text><View style={s.chips}>{['All interests','Coffee','Hiking','Music'].map(x=><TouchableOpacity onPress={()=>setInterest(x)} key={x} style={[s.mapChip,{backgroundColor:interest===x?(mode==='Friends'?purple:pink):p.surface}]}><Text style={{color:interest===x?'#fff':p.text}}>{x}</Text></TouchableOpacity>)}</View><View style={[s.fakeMap,{backgroundColor:p.dark?'#0b2630':'#dff0e4'}]}><Text style={[s.mapRoad,{color:p.dark?'#225066':'#a5d4ee'}]}>╱╱╱╱　〰〰　╲╲╲</Text><Text style={[s.mapCity,{color:p.text}]}>{travel?'Travel':'Skopje'}</Text>{[[70,80,photos.alex],[220,105,photos.sara],[115,195,photos.emily],[260,220,photos.marko]].map(([left,top,uri]:any)=><TouchableOpacity onPress={()=>Alert.alert('Shared interests',`${interest} and 3 other interests in common.`)} key={left} style={[s.mapPerson,{left,top}]}><Avatar uri={uri} size={61}/><Text style={s.shared}>3 shared</Text></TouchableOpacity>)}</View><View style={[s.radarCard,{backgroundColor:p.surface}]}><Avatar uri={mode==='Friends'?photos.alex:photos.sara} size={72}/><View style={s.chatCopy}><Text style={[s.connectionName,{color:p.text}]}>{mode==='Friends'?'Alex, 27':'Sara, 23'}</Text><Text style={[s.detail,{color:p.muted}]}>⌖ About 2 km away</Text><Text style={[s.detail,{color:p.muted}]}>♥ 3 shared interests</Text></View></View><View style={s.radarButtons}><TouchableOpacity onPress={()=>Alert.alert('Profile','Full profile view is coming next.')} style={s.outlineButton}><Text style={s.pinkText}>View profile</Text></TouchableOpacity><TouchableOpacity onPress={()=>setConnected(true)} style={[s.connectButton,connected&&{backgroundColor:'#00a935'}]}><Text style={{color:'#fff',fontWeight:'700'}}>{connected?'✓ Connected':'♙  Connect'}</Text></TouchableOpacity></View></View></View>}

const s=StyleSheet.create({page:{flex:1},scroll:{paddingHorizontal:16,paddingBottom:25},header:{height:64,paddingHorizontal:18,flexDirection:'row',alignItems:'center',justifyContent:'space-between'},headerTitle:{fontSize:25,fontWeight:'800'},search:{height:42,borderRadius:22,borderWidth:1,flexDirection:'row',alignItems:'center',paddingHorizontal:13,marginTop:5},searchInput:{flex:1,fontSize:15,marginLeft:8},sectionHead:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginTop:13},sectionTitle:{fontWeight:'800',fontSize:18},pinkText:{color:pink,fontWeight:'700'},stories:{flexDirection:'row',justifyContent:'space-between',marginVertical:11},story:{alignItems:'center',width:68},storyName:{fontWeight:'700',fontSize:12,marginTop:4},newBadge:{backgroundColor:pink,color:'#fff',fontSize:11,fontWeight:'800',paddingHorizontal:7,borderRadius:8,marginTop:-18,zIndex:1},online:{position:'absolute',width:15,height:15,borderRadius:8,backgroundColor:'#00bd39',borderWidth:1,borderColor:'#fff'},tabs:{flexDirection:'row',gap:7,marginVertical:7},pill:{flex:1,height:34,borderRadius:18,borderWidth:1,justifyContent:'center',alignItems:'center'},pillText:{fontWeight:'700',fontSize:14},chatRow:{minHeight:59,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1,paddingVertical:6},chatCopy:{flex:1},chatName:{fontWeight:'800',fontSize:16},chatMessage:{fontSize:14,marginTop:2},time:{fontSize:13,textAlign:'right'},unread:{backgroundColor:pink,color:'#fff',width:20,height:20,textAlign:'center',borderRadius:10,marginTop:4,overflow:'hidden',fontWeight:'700'},friendTag:{fontSize:11,paddingHorizontal:6,backgroundColor:'#e7eaf1',color:'#536078',borderRadius:8},sub:{fontSize:14,marginTop:3},emptyBlock:{alignItems:'center',paddingTop:45,gap:12},emptySearch:{textAlign:'center',marginTop:35,fontSize:15},outlineButton:{height:41,borderWidth:1.5,borderColor:pink,borderRadius:22,justifyContent:'center',alignItems:'center',paddingHorizontal:35},conversationHeader:{height:67,paddingHorizontal:16,flexDirection:'row',alignItems:'center',gap:10,borderBottomWidth:1},messageList:{padding:16,gap:12},messageRow:{maxWidth:'82%'},messageMine:{alignSelf:'flex-end',alignItems:'flex-end'},messageTheirs:{alignSelf:'flex-start'},messageBubble:{paddingHorizontal:14,paddingVertical:10,borderRadius:17},messageTime:{fontSize:11,marginTop:3},composer:{borderTopWidth:1,padding:10,flexDirection:'row',gap:8,alignItems:'center'},composerInput:{flex:1,height:42,borderRadius:22,paddingHorizontal:15},sendButton:{width:42,height:42,borderRadius:21,alignItems:'center',justifyContent:'center',backgroundColor:pink},profileScroll:{padding:16,paddingBottom:25},profileTop:{flexDirection:'row',justifyContent:'space-between',alignItems:'center'},profileAvatar:{width:128,height:128,borderRadius:64,borderWidth:2,borderColor:pink,alignSelf:'center',marginTop:4},profileName:{fontWeight:'800',fontSize:22,textAlign:'center',marginTop:5},editButton:{borderWidth:1.5,borderColor:pink,height:39,borderRadius:21,flexDirection:'row',justifyContent:'center',alignItems:'center',gap:7,marginTop:9},stats:{flexDirection:'row',justifyContent:'space-around',paddingVertical:12,borderRadius:14,backgroundColor:'#f5f7fa',marginTop:8},statNumber:{fontSize:17,fontWeight:'800',textAlign:'center'},statLabel:{fontSize:12,textAlign:'center'},label:{fontWeight:'800',fontSize:14,marginTop:11,marginBottom:5},intention:{height:39,borderRadius:12,backgroundColor:'#ffe6f0',paddingHorizontal:14,flexDirection:'row',alignItems:'center',gap:11},detail:{fontSize:13,lineHeight:18},chips:{flexDirection:'row',flexWrap:'wrap',gap:6},chip:{backgroundColor:'#ffe7f1',borderRadius:14,paddingVertical:5,paddingHorizontal:17,minWidth:'30%',alignItems:'center'},chipText:{fontSize:12,color:pink},photoGrid:{flexDirection:'row',gap:6},gridImage:{width:(width-44)/3,height:82,borderRadius:8},likeGrid:{flexDirection:'row',flexWrap:'wrap',gap:8,marginTop:10},likeCard:{width:(width-40)/2,height:215},likeImage:{width:'100%',height:160,borderRadius:11},likeCaption:{position:'absolute',top:104,left:0,right:0,height:56,padding:9,borderRadius:11},likeName:{color:'#fff',fontWeight:'800',fontSize:17},likeDistance:{color:'#fff',fontSize:12,fontWeight:'700'},likeActions:{height:45,flexDirection:'row',alignItems:'center',gap:7},pass:{width:42,height:39,borderRadius:21,backgroundColor:'#f0f3f6',justifyContent:'center',alignItems:'center'},likeBack:{flex:1,height:39,borderRadius:20,backgroundColor:pink,alignItems:'center',justifyContent:'center',flexDirection:'row',gap:4},likeBackText:{color:'#fff',fontWeight:'700'},connectionsTitle:{fontSize:20,fontWeight:'800',marginTop:12},connection:{height:74,flexDirection:'row',alignItems:'center',gap:11,borderBottomWidth:1},connectionName:{fontSize:19,fontWeight:'800'},typeTag:{fontSize:12,overflow:'hidden',paddingHorizontal:8,paddingVertical:3,borderRadius:10},editScroll:{padding:16,paddingTop:0},editPhotos:{flexDirection:'row',flexWrap:'wrap',gap:7,marginTop:7},editPhoto:{width:(width-46)/3,height:80,borderRadius:8},addPhoto:{width:(width-46)/3,height:54,borderRadius:8,borderWidth:1,borderStyle:'dashed',justifyContent:'center',alignItems:'center'},addPlus:{fontSize:30,color:pink},bioBox:{borderWidth:1,borderRadius:11,padding:10},bioInput:{borderWidth:1,borderRadius:11,padding:10,minHeight:62,textAlignVertical:'top',fontSize:13},nameInput:{height:40,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:10},nameTextInput:{flex:1,fontSize:13},editRow:{height:38,borderBottomWidth:1,flexDirection:'row',alignItems:'center',gap:12,paddingHorizontal:10},rowLabel:{fontSize:13,flex:1},rowValue:{fontSize:12},preview:{height:32,borderWidth:1.5,borderColor:pink,borderRadius:16,flexDirection:'row',gap:8,justifyContent:'center',alignItems:'center',marginTop:15},discoveryImage:{height:405,width:'100%',borderRadius:16,marginTop:4},discoveryInfo:{position:'absolute',top:422,left:16,right:16,height:125,justifyContent:'flex-end',padding:13,borderRadius:16},discoveryName:{fontSize:27,color:'#fff',fontWeight:'800'},discoverySub:{color:'#fff',fontSize:16},discoveryChips:{flexDirection:'row',gap:7,marginTop:10},cardChip:{color:pink,borderColor:pink,borderWidth:1,borderRadius:13,paddingHorizontal:13,paddingVertical:4,backgroundColor:'#16131a',fontSize:12},bigActions:{flexDirection:'row',justifyContent:'space-around',alignItems:'center',marginTop:27},bigPass:{width:65,height:65,borderRadius:34,justifyContent:'center',alignItems:'center',backgroundColor:'#f4f5f7'},bigLike:{width:82,height:82,borderRadius:42,backgroundColor:pink,justifyContent:'center',alignItems:'center'},radarTabs:{flexDirection:'row',gap:7,marginVertical:5},radarTab:{flex:1,height:39,borderRadius:20,justifyContent:'center',alignItems:'center',flexDirection:'row',gap:7},location:{height:45,flexDirection:'row',alignItems:'center',gap:8},locationText:{fontWeight:'700',fontSize:16,flex:1},travel:{borderWidth:1.3,borderColor:pink,borderRadius:18,padding:7,flexDirection:'row',gap:5},mapChip:{paddingHorizontal:17,paddingVertical:7,borderRadius:17},fakeMap:{height:305,marginHorizontal:-16,marginTop:8,overflow:'hidden',position:'relative'},mapRoad:{fontSize:52,position:'absolute',top:110,left:0,fontWeight:'800'},mapCity:{position:'absolute',top:180,left:'40%',fontSize:21,fontWeight:'800'},mapPerson:{position:'absolute',alignItems:'center'},shared:{backgroundColor:'#fff',borderRadius:11,paddingHorizontal:7,paddingVertical:2,fontSize:11,fontWeight:'700',marginTop:-3},radarCard:{marginTop:-2,borderRadius:15,padding:11,flexDirection:'row',gap:12},radarButtons:{flexDirection:'row',gap:8,marginTop:8},connectButton:{flex:1,backgroundColor:pink,borderRadius:21,alignItems:'center',justifyContent:'center'},homeScroll:{padding:16,paddingBottom:24},homeTop:{flexDirection:'row',alignItems:'center',justifyContent:'space-between',marginTop:5},homeLogo:{fontSize:27,fontWeight:'800'},homeStories:{flexDirection:'row',marginHorizontal:-5},addStory:{width:63,height:63,borderRadius:33,backgroundColor:'#fff1f6',borderWidth:1,borderColor:'#ffd5e4',justifyContent:'center',alignItems:'center'},addStoryText:{fontSize:35,color:pink,fontWeight:'200'},feedCard:{borderBottomWidth:1,paddingTop:9,paddingBottom:12},feedHead:{flexDirection:'row',alignItems:'center',gap:9},feedImage:{width:'100%',height:235,borderRadius:12,marginTop:9},feedCaption:{fontSize:14,fontWeight:'700',marginTop:7},feedActions:{flexDirection:'row',alignItems:'center',gap:23,marginTop:8},feedCount:{fontWeight:'700',fontSize:14},interested:{marginLeft:'auto',flexDirection:'row',borderWidth:1,borderColor:pink,borderRadius:18,paddingHorizontal:13,paddingVertical:7,gap:5}});
