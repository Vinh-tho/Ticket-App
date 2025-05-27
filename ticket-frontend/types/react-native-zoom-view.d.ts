declare module 'react-native-zoom-view' {
  import { Component } from 'react';
  import { ViewProps } from 'react-native';

  interface ZoomViewProps extends ViewProps {
    minScale?: number;
    maxScale?: number;
    initialScale?: number;
  }

  export default class ZoomView extends Component<ZoomViewProps> {}
} 