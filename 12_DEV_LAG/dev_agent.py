import os
import json
import logging
import subprocess
from typing import Dict, List, Optional
from pathlib import Path

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger('DEV_LAG')

class DevAgent:
    def __init__(self, config_path: str = "config.json"):
        self.logger = logger
        self.config = self._load_config(config_path)
        self.templates_path = Path(self.config.get('templates_path', './templates'))
        
    def _load_config(self, config_path: str) -> Dict:
        """Load agent configuration from JSON file"""
        try:
            with open(config_path, 'r') as f:
                return json.load(f)
        except Exception as e:
            self.logger.error(f"Error loading config: {e}")
            return {}

    def create_react_project(self, name: str, template: str = "default") -> Dict:
        """Create a new React project from template"""
        try:
            template_path = self.templates_path / f"react_{template}"
            if not template_path.exists():
                raise ValueError(f"Template {template} not found")
                
            # Create project using create-react-app
            subprocess.run(["npx", "create-react-app", name, "--template", "typescript"])
            
            # TODO: Apply template customizations
            
            return {"status": "success", "project_path": str(Path.cwd() / name)}
        except Exception as e:
            self.logger.error(f"Failed to create React project: {e}")
            return {"status": "error", "message": str(e)}

    def create_react_native_project(self, name: str, template: str = "default") -> Dict:
        """Create a new React Native project from template"""
        try:
            template_path = self.templates_path / f"react_native_{template}"
            if not template_path.exists():
                raise ValueError(f"Template {template} not found")
                
            # Create project using React Native CLI
            subprocess.run(["npx", "react-native", "init", name, "--template", "react-native-template-typescript"])
            
            # TODO: Apply template customizations
            
            return {"status": "success", "project_path": str(Path.cwd() / name)}
        except Exception as e:
            self.logger.error(f"Failed to create React Native project: {e}")
            return {"status": "error", "message": str(e)}

    def build_project(self, project_path: str, platform: str = "web") -> Dict:
        """Build project for specified platform"""
        try:
            os.chdir(project_path)
            if platform == "web":
                subprocess.run(["npm", "run", "build"])
            elif platform in ["android", "ios"]:
                subprocess.run(["npx", "react-native", "build", platform])
            else:
                raise ValueError(f"Unsupported platform: {platform}")
                
            return {"status": "success", "platform": platform}
        except Exception as e:
            self.logger.error(f"Build failed: {e}")
            return {"status": "error", "message": str(e)}

    def deploy_to_play_store(self, project_path: str, version: str) -> Dict:
        """Deploy Android app to Google Play Store"""
        try:
            # TODO: Implement Play Store deployment
            return {"status": "not_implemented"}
        except Exception as e:
            self.logger.error(f"Deployment failed: {e}")
            return {"status": "error", "message": str(e)}

    def handle_request(self, request: Dict) -> Dict:
        """Handle incoming requests from other agents"""
        try:
            action = request.get('action')
            if action == 'create_react':
                return self.create_react_project(
                    request.get('name', ''),
                    request.get('template', 'default')
                )
            elif action == 'create_react_native':
                return self.create_react_native_project(
                    request.get('name', ''),
                    request.get('template', 'default')
                )
            elif action == 'build':
                return self.build_project(
                    request.get('project_path', ''),
                    request.get('platform', 'web')
                )
            elif action == 'deploy':
                return self.deploy_to_play_store(
                    request.get('project_path', ''),
                    request.get('version', '')
                )
            else:
                return {"error": "Invalid action"}
        except Exception as e:
            self.logger.error(f"Error handling request: {e}")
            return {"error": str(e)}

if __name__ == "__main__":
    agent = DevAgent()
    logger.info("DEV_LAG Agent initialized and ready") 