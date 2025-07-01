import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  Chip,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from '@mui/material';
import {
  AccountBalance,
  Schedule,
  LocalShipping,
  Payment,
  Support,
  Info,
  CheckCircle,
  Error,
  Warning,
} from '@mui/icons-material';
import axios from 'axios';

interface TaskResult {
  taskType: string;
  result: any;
  timestamp: string;
}

const Dashboard: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [recentResults, setRecentResults] = useState<TaskResult[]>([]);
  const [systemStatus, setSystemStatus] = useState<any>(null);

  useEffect(() => {
    fetchAvailableTasks();
    fetchSystemStatus();
  }, []);

  const fetchAvailableTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/tasks/list');
      setTasks(response.data.availableTasks);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const fetchSystemStatus = async () => {
    try {
      const response = await axios.get('http://localhost:3000/api/health/detailed');
      setSystemStatus(response.data);
    } catch (error) {
      console.error('Error fetching system status:', error);
    }
  };

  const executeTask = async (taskId: string) => {
    try {
      const response = await axios.post('http://localhost:3000/api/tasks/execute', {
        taskType: taskId,
        parameters: {}
      });
      
      const newResult: TaskResult = {
        taskType: taskId,
        result: response.data.result,
        timestamp: response.data.timestamp
      };
      
      setRecentResults(prev => [newResult, ...prev.slice(0, 4)]);
    } catch (error) {
      console.error('Error executing task:', error);
    }
  };

  const getTaskIcon = (taskId: string) => {
    switch (taskId) {
      case 'account_info': return <AccountBalance />;
      case 'schedule_appointment': return <Schedule />;
      case 'order_tracking': return <LocalShipping />;
      case 'bill_payment': return <Payment />;
      case 'technical_support': return <Support />;
      case 'product_info': return <Info />;
      default: return <Info />;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'OK': return <CheckCircle color="success" />;
      case 'ERROR': return <Error color="error" />;
      case 'DEGRADED': return <Warning color="warning" />;
      default: return <Warning color="warning" />;
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        GetHelp Demo Dashboard
      </Typography>
      
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* System Status */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            System Status
          </Typography>
          {systemStatus && (
            <Box>
              <Box display="flex" alignItems="center" mb={2}>
                {getStatusIcon(systemStatus.status)}
                <Typography variant="h6" sx={{ ml: 1 }}>
                  {systemStatus.status}
                </Typography>
              </Box>
              <List dense>
                {systemStatus.checks && Object.entries(systemStatus.checks).map(([service, check]: [string, any]) => (
                  <ListItem key={service}>
                    <ListItemIcon>
                      {getStatusIcon(check.status)}
                    </ListItemIcon>
                    <ListItemText
                      primary={service.charAt(0).toUpperCase() + service.slice(1)}
                      secondary={check.message}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </Paper>

        {/* Available Tasks */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Available Tasks
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
            {tasks.map((task) => (
              <Card key={task.id} variant="outlined" sx={{ minWidth: 250, maxWidth: 300 }}>
                <CardContent sx={{ pb: 1 }}>
                  <Box display="flex" alignItems="center" mb={1}>
                    {getTaskIcon(task.id)}
                    <Typography variant="subtitle2" sx={{ ml: 1 }}>
                      {task.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {task.description}
                  </Typography>
                </CardContent>
                <CardActions>
                  <Button
                    size="small"
                    onClick={() => executeTask(task.id)}
                    startIcon={getTaskIcon(task.id)}
                  >
                    Test
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        </Paper>

        {/* Recent Task Results */}
        <Paper sx={{ p: 3 }}>
          <Typography variant="h6" gutterBottom>
            Recent Task Results
          </Typography>
          {recentResults.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              No recent task executions. Click "Test" on any task above to see results.
            </Typography>
          ) : (
            <List>
              {recentResults.map((result, index) => (
                <Box key={index}>
                  <ListItem>
                    <ListItemIcon>
                      {getTaskIcon(result.taskType)}
                    </ListItemIcon>
                    <ListItemText
                      primary={
                        <Box display="flex" alignItems="center" gap={1}>
                          <Typography variant="subtitle1">
                            {tasks.find(t => t.id === result.taskType)?.name || result.taskType}
                          </Typography>
                          <Chip
                            label={result.result.success ? 'Success' : 'Failed'}
                            color={result.result.success ? 'success' : 'error'}
                            size="small"
                          />
                        </Box>
                      }
                      secondary={
                        <Box>
                          <Typography variant="body2" color="text.secondary">
                            {new Date(result.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body2" sx={{ mt: 1 }}>
                            {JSON.stringify(result.result.data, null, 2)}
                          </Typography>
                        </Box>
                      }
                    />
                  </ListItem>
                  {index < recentResults.length - 1 && <Divider />}
                </Box>
              ))}
            </List>
          )}
        </Paper>
      </Box>
    </Container>
  );
};

export default Dashboard;