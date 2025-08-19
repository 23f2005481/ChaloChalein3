import React, { useState, useEffect } from 'react';
import { Card, Button, List, Typography, Tag, Spin, Alert, Divider } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, SyncOutlined } from '@ant-design/icons';
import { runAllTests } from '../utils/apiKeyTest';

const { Text } = Typography;

const ApiKeyTester = () => {
  const [testResults, setTestResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runTests = async () => {
    setLoading(true);
    setError(null);
    try {
      const results = await runAllTests();
      setTestResults(results);
    } catch (err) {
      setError(err.message || 'An error occurred during testing');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runTests();
  }, []);

  const getStatusTag = (success) => {
    if (success === undefined) return <Tag icon={<SyncOutlined spin />} color="processing">Testing...</Tag>;
    return success ? 
      <Tag icon={<CheckCircleOutlined />} color="success">Connected</Tag> : 
      <Tag icon={<CloseCircleOutlined />} color="error">Failed</Tag>;
  };

  return (
    <Card title="API Connection Test" style={{ maxWidth: 800, margin: '0 auto', marginTop: 20 }}>
      {error && (
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          style={{ marginBottom: 16 }}
        />
      )}
       
      {loading && !testResults && (
        <div style={{ textAlign: 'center', padding: 20 }}>
          <Spin size="large" />
          <div style={{ marginTop: 16 }}>Testing API connections...</div>
        </div>
      )}
      
      {testResults && (
        <>
          <List
            itemLayout="horizontal"
            dataSource={[
              {
                title: 'Firebase',
                result: testResults.firebase,
                description: testResults.firebase.message
              },
              {
                title: 'Weather API (Tomorrow.io)',
                result: testResults.weather,
                description: testResults.weather.message
              },
              {
                title: 'Foursquare API',
                result: testResults.foursquare,
                description: testResults.foursquare.message
              },
              {
                title: 'GROQ API',
                result: testResults.groq,
                description: testResults.groq.message
              }
            ]}
            renderItem={item => (
              <List.Item
                actions={[getStatusTag(item.result.success)]}
              >
                <List.Item.Meta
                  title={item.title}
                  description={item.description}
                />
              </List.Item>
            )}
          />
          
          <Divider />
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text>
              {Object.values(testResults).every(r => r.success) 
                ? 'All API connections are working correctly!' 
                : 'Some API connections have issues. Please check the details above.'}
            </Text>
            <Button type="primary" onClick={runTests} loading={loading}>
              Test Again
            </Button>
          </div>
        </>
      )}
    </Card>
  );
};

export default ApiKeyTester;
