import React, { useState } from 'react';
import { Tabs, Input, Button, message } from 'antd';
import { useNavigate } from 'react-router-dom';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  GoogleAuthProvider,
  signInWithPopup
} from 'firebase/auth';
import { FIREBASE_AUTH } from './firebaseConfig';

const { TabPane } = Tabs;

const AuthPage = () => {
  const [activeTab, setActiveTab] = useState('login');
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [signupEmail, setSignupEmail] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!loginEmail || !loginPassword) {
      message.error('Please enter both email and password');
      return;
    }
    setLoading(true);
    try {
      const userCredential = await signInWithEmailAndPassword(
        FIREBASE_AUTH,
        loginEmail,
        loginPassword
      );
      const user = userCredential.user;
      message.success('Logged in successfully!');
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        uid: user.uid
      }));
      navigate('/chatbot');
    } catch (error) {
      let errorMessage = 'Login failed';
      if (error.code === 'auth/invalid-credential') {
        errorMessage = 'Invalid email or password';
      } else if (error.code === 'auth/user-not-found') {
        errorMessage = 'User not found';
      } else if (error.code === 'auth/wrong-password') {
        errorMessage = 'Wrong password';
      }
      message.error(errorMessage);
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async () => {
    if (!signupEmail || !signupPassword) {
      message.error('Please enter both email and password');
      return;
    }
    if (signupPassword !== confirmPassword) {
      message.error("Passwords don't match");
      return;
    }
    setLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        FIREBASE_AUTH,
        signupEmail,
        signupPassword
      );
      const user = userCredential.user;
      message.success('Account created successfully!');
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        uid: user.uid
      }));
      navigate('/chatbot');
    } catch (error) {
      let errorMessage = 'Error creating account';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'Email already in use';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email format';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak';
      }
      message.error(errorMessage);
      console.error('Signup error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(FIREBASE_AUTH, provider);
      const user = result.user;
      message.success('Logged in with Google successfully!');
      localStorage.setItem('user', JSON.stringify({
        email: user.email,
        uid: user.uid,
        displayName: user.displayName
      }));
      navigate('/chatbot');
    } catch (error) {
      message.error('Google sign-in failed');
      console.error('Google sign-in error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: 400, width: '100%', margin: '2rem auto' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab} centered style={{ marginBottom: '2rem' }}>
          <TabPane tab="Login" key="login">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                placeholder="Email"
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                size="large"
              />
              <Input.Password
                placeholder="Password"
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                size="large"
              />
              <Button className="btn" block onClick={handleLogin} loading={loading} style={{ marginTop: '0.5rem' }}>
                Login
              </Button>
              <Button onClick={handleGoogleSignIn} block style={{ marginTop: '0.5rem', background: 'var(--color-accent2)', color: '#fff', fontWeight: 600 }}>
                Sign in with Google
              </Button>
            </div>
          </TabPane>
          <TabPane tab="Sign Up" key="signup">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <Input
                placeholder="Email"
                value={signupEmail}
                onChange={(e) => setSignupEmail(e.target.value)}
                size="large"
              />
              <Input.Password
                placeholder="Password"
                value={signupPassword}
                onChange={(e) => setSignupPassword(e.target.value)}
                size="large"
              />
              <Input.Password
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                size="large"
              />
              <Button className="btn" block onClick={handleSignup} loading={loading} style={{ marginTop: '0.5rem' }}>
                Sign Up
              </Button>
            </div>
          </TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default AuthPage; 