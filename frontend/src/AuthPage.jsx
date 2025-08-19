// src/AuthPage.jsx
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
      navigate('/chatbot'); // Redirect to Chatbot after successful login
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
      navigate('/chatbot'); // Redirect to Chatbot after successful signup
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
    <div className="auth-container">
      <Tabs activeKey={activeTab} onChange={setActiveTab} centered>
        <TabPane tab="Login" key="login">
          <div className="auth-form">
            <Input
              placeholder="Email"
              value={loginEmail}
              onChange={(e) => setLoginEmail(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Password"
              value={loginPassword}
              onChange={(e) => setLoginPassword(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" block onClick={handleLogin} loading={loading}>
              Login
            </Button>
            <div className="social-login">
              <Button 
                onClick={handleGoogleSignIn} 
                style={{ marginTop: 16 }}
                block
              >
                Sign in with Google
              </Button>
            </div>
          </div>
        </TabPane>

        <TabPane tab="Sign Up" key="signup">
          <div className="auth-form">
            <Input
              placeholder="Email"
              value={signupEmail}
              onChange={(e) => setSignupEmail(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Password"
              value={signupPassword}
              onChange={(e) => setSignupPassword(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Input.Password
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              style={{ marginBottom: 16 }}
            />
            <Button type="primary" block onClick={handleSignup} loading={loading}>
              Sign Up
            </Button>
          </div>
        </TabPane>
      </Tabs>

      <style jsx>{`
        .auth-container {
          max-width: 400px;
          margin: 0 auto;
          padding: 24px;
        }
        .auth-form {
          padding: 24px;
        }
        .social-login {
          margin-top: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
      `}</style>
    </div>
  );
};

export default AuthPage;