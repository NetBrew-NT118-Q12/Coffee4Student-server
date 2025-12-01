module.exports = {
  apps: [
    {
      name: 'netbrew-backend',
      script: './back-end/server.js',
      cwd: '/home/vantai/projects/Coffee4Student-server',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000
      }
    },
    {
      name: 'netbrew-ai',
      script: './ai-recommendation/start.sh',
      cwd: '/home/vantai/projects/Coffee4Student-server',
      interpreter: 'bash',
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: '500M',
      env: {
        FLASK_PORT: 5001,
        FLASK_DEBUG: 'False'
      }
    }
  ]
};
