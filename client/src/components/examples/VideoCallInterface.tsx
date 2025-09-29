import VideoCallInterface from '../VideoCallInterface';

export default function VideoCallInterfaceExample() {
  return (
    <VideoCallInterface 
      role="software-engineer"
      onEndCall={(duration) => console.log('Call ended after', duration, 'seconds')}
    />
  );
}