import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const ChatMessagesScreen = () => {
    return (
        <View style={styles.container}>
            <Text style={styles.title}>Chat Messages</Text>
            <Text style={styles.placeholder}>This is where your chat messages will appear.</Text>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#FF6B9D',
        marginBottom: 10,
    },
    placeholder: {
        fontSize: 16,
        color: '#888',
        textAlign: 'center',
    },
});

export default ChatMessagesScreen;
