import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

interface ActionButtonProps {
  icon: string;
  onPress: () => void;
  size?: number;
  color?: string;
  gradient?: boolean;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  icon,
  onPress,
  size = 28,
  color = '#FFF',
  gradient = false,
}) => {
  return (
    <TouchableOpacity style={styles.button} onPress={onPress}>
      <Icon name={icon} size={size} color={color} />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    padding: 8,
  },
});
