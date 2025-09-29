import UserRegistration from '../UserRegistration';

export default function UserRegistrationExample() {
  return (
    <UserRegistration 
      onComplete={(data) => console.log('Registration completed:', data)}
    />
  );
}