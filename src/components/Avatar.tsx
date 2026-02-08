import React from 'react';
import { View, Image, StyleSheet, ImageStyle } from 'react-native';

interface AvatarProps {
  uri: string;
  size?: number;
  style?: ImageStyle;
  borderColor?: string;
  borderWidth?: number;
}

export const Avatar: React.FC<AvatarProps> = ({
  uri,
  size = 50,
  style,
  borderColor = '#FFF',
  borderWidth = 2,
}) => {
  return (
    <Image
      source={{ uri }}
      style={[
        styles.avatar,
        {
          width: size,
          height: size,
          borderRadius: size / 2,
          borderColor,
          borderWidth,
        },
        style,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  avatar: {
    resizeMode: 'cover',
  },
});
