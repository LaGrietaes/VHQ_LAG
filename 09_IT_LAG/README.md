# IT_LAG Agent

## Overview
IT_LAG is responsible for technical infrastructure management, system monitoring, and subscription services for LaGrieta.es.

## Core Responsibilities
- System monitoring and maintenance
- Backup management
- Subscription service monitoring (NoIP, GoDaddy, Cloudflare)
- Technical issue resolution
- Development environment management

## Features

### Current Features
- System resource monitoring (CPU, memory, disk)
- Automated backup management
- Basic subscription monitoring
- Development environment tooling

### Planned Features

#### NAS Integration and NoIP Management
This feature will be implemented once NAS access is restored.

**Requirements:**
1. NAS Configuration:
   - SSH access to NAS
   - Admin credentials
   - NoIP client installed on NAS
   - Port 22 accessible for SSH

2. Email Monitoring Setup:
   - IMAP email account access
   - App-specific password for email
   - Access to email receiving NoIP notifications

3. NoIP Configuration:
   - NoIP account credentials
   - List of managed hostnames
   - API access (if available)

**Configuration Template:**
```json
{
  "nas": {
    "host": "nas-ip-address",
    "port": 22,
    "username": "admin",
    "password": "nas-password"
  },
  "email": {
    "imap_server": "imap.gmail.com",
    "username": "your-email@gmail.com",
    "password": "app-specific-password"
  },
  "subscriptions": {
    "providers": {
      "noip": {
        "username": "noip-username",
        "password": "noip-password",
        "update_interval": 30,
        "hostnames": ["your-hostname.ddns.net"]
      }
    }
  }
}
```

**Features to be Implemented:**
1. Automated NoIP Status Monitoring
   - Regular checks of NoIP client status
   - Monitoring of hostname expiration
   - Email notification scanning
   - Automatic client reconfiguration when possible

2. NAS Connectivity Management
   - SSH connection handling
   - Status monitoring
   - Remote configuration capabilities
   - Log monitoring and analysis

3. Email Integration
   - IMAP email monitoring
   - NoIP confirmation email detection
   - Notification processing
   - Alert system for required actions

**Dependencies to be Added:**
```
paramiko>=2.12.0  # For SSH connectivity
```

## Current Setup

### Installation
```bash
pip install -r requirements.txt
```

### Configuration
1. Copy `config.json.example` to `config.json`
2. Update configuration values for your environment
3. Ensure all required API keys and credentials are set

### Usage
```bash
python start_agent.py
```

## Integration Points
- Reports to CEO_LAG agent
- Coordinates with MEDIA_LAG for backup management
- Interfaces with all agents for technical support

## Monitoring and Alerts
- System resource thresholds
- Service availability
- Subscription status
- Backup completion status

## Future Enhancements
1. NAS and NoIP integration (as detailed above)
2. Enhanced monitoring capabilities
3. Automated recovery procedures
4. Extended backup solutions
5. Improved notification system

## Troubleshooting
- Check logs in Agent_Logs directory
- Verify configuration settings
- Ensure all required services are accessible
- Confirm API credentials are valid

## Security Notes
- Store all credentials securely
- Use environment variables for sensitive data
- Regularly rotate API keys and passwords
- Implement proper access controls

## Contributing
Follow the project's development guidelines when making changes or additions to the agent.

## Support
For technical issues or questions, contact the development team or refer to the documentation in the CEO_LAG repository. 